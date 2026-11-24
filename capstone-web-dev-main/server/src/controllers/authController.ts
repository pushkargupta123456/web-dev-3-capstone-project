import { Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Student from '../models/Student';
import Faculty from '../models/Faculty';
import RefreshToken from '../models/RefreshToken';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { sendSuccess, sendError } from '../utils/response';
import { createAuditLog } from '../utils/auditLogger';
import eventBus from '../utils/eventBus';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    role,
    phone,
    department,
    registrationNumber,
    employeeId,
    semester,
  } = req.body;

  // 1. Strict Security: Block public ADMIN signup
  if (!role || (role !== 'STUDENT' && role !== 'FACULTY')) {
    return sendError(res, 'Public registration is only permitted for Student and Faculty roles', 400);
  }

  // 2. Basic required fields validation
  if (!name || !email || !password) {
    return sendError(res, 'Name, email, and password are required', 400);
  }

  if (password.length < 6) {
    return sendError(res, 'Password must be at least 6 characters long', 400);
  }

  if (confirmPassword && password !== confirmPassword) {
    return sendError(res, 'Passwords do not match', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 3. Check duplicate email in User
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return sendError(res, 'An account with this email address already exists', 409);
  }

  // 4. Role-specific validation & uniqueness
  if (role === 'STUDENT') {
    if (!registrationNumber || !department) {
      return sendError(res, 'Registration number and department are required for student accounts', 400);
    }

    const regUpper = registrationNumber.trim().toUpperCase();
    const existingStudent = await Student.findOne({ registrationNumber: regUpper });
    if (existingStudent) {
      return sendError(res, 'A student with this registration number is already registered', 409);
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'STUDENT',
      phone: phone?.trim(),
      accountStatus: 'ACTIVE',
      isActive: true,
      isEmailVerified: true,
    });

    const parsedSemester = Number(semester) || 1;
    await Student.create({
      userId: newUser._id,
      registrationNumber: regUpper,
      department: department.trim(),
      semester: Math.min(Math.max(parsedSemester, 1), 10),
      academicYear: '2024-2025',
      phone: phone?.trim(),
      isActive: true,
    });

    await createAuditLog({
      userId: newUser._id.toString(),
      action: 'REGISTER_STUDENT',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const accessToken = generateAccessToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });
    const refreshToken = await generateRefreshToken(newUser._id.toString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Emit application event
    eventBus.emit('USER_REGISTERED', { user: newUser, role: 'STUDENT' });

    return sendSuccess(
      res,
      {
        accessToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          registrationNumber: regUpper,
          department: department.trim(),
          semester: parsedSemester,
        },
      },
      'Student account registered successfully',
      201
    );
  }

  if (role === 'FACULTY') {
    if (!employeeId || !department) {
      return sendError(res, 'Employee ID and department are required for faculty accounts', 400);
    }

    const empUpper = employeeId.trim().toUpperCase();
    const existingFaculty = await Faculty.findOne({ employeeId: empUpper });
    if (existingFaculty) {
      return sendError(res, 'A faculty member with this Employee ID is already registered', 409);
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'FACULTY',
      phone: phone?.trim(),
      accountStatus: 'ACTIVE',
      isActive: true,
      isEmailVerified: true,
    });

    await Faculty.create({
      userId: newUser._id,
      employeeId: empUpper,
      department: department.trim(),
      designation: 'Assistant Professor',
      phone: phone?.trim(),
      joiningDate: new Date(),
      isActive: true,
    });

    await createAuditLog({
      userId: newUser._id.toString(),
      action: 'REGISTER_FACULTY',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const accessToken = generateAccessToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });
    const refreshToken = await generateRefreshToken(newUser._id.toString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Emit application event
    eventBus.emit('USER_REGISTERED', { user: newUser, role: 'FACULTY' });

    return sendSuccess(
      res,
      {
        accessToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          employeeId: empUpper,
          department: department.trim(),
        },
      },
      'Faculty account registered successfully',
      201
    );
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.isActive) {
    return sendError(res, 'Invalid credentials or inactive account', 401);
  }

  if (user.accountStatus === 'SUSPENDED') {
    return sendError(res, 'Your account has been suspended. Please contact campus administration.', 403);
  }

  if (user.accountStatus === 'PENDING') {
    return sendError(res, 'Your registration is currently pending administrative verification.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid institutional email or password', 401);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const refreshToken = await generateRefreshToken(user._id.toString());

  await createAuditLog({
    userId: user._id.toString(),
    action: 'LOGIN',
    resource: 'auth',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: cookieMaxAge,
  });

  let extraData: any = {};
  if (user.role === 'STUDENT') {
    const student = await Student.findOne({ userId: user._id });
    if (student) {
      extraData = {
        registrationNumber: student.registrationNumber,
        department: student.department,
        semester: student.semester,
      };
    }
  } else if (user.role === 'FACULTY') {
    const faculty = await Faculty.findOne({ userId: user._id });
    if (faculty) {
      extraData = {
        employeeId: faculty.employeeId,
        department: faculty.department,
        designation: faculty.designation,
      };
    }
  }

  sendSuccess(
    res,
    {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...extraData,
      },
    },
    'Login successful'
  );
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshTokenVal = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshTokenVal) {
    await RefreshToken.deleteOne({ token: refreshTokenVal });
  }

  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out successfully');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return sendError(res, 'Refresh token required', 401);
  }

  const storedToken = await RefreshToken.findOne({ token });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }

  const user = await User.findById(storedToken.userId);
  if (!user || !user.isActive) {
    return sendError(res, 'User not found or inactive', 401);
  }

  await RefreshToken.deleteOne({ token });
  const newRefreshToken = await generateRefreshToken(user._id.toString());

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { accessToken }, 'Token refreshed');
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id).select('-password');
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  let extraData: any = {};
  if (user.role === 'STUDENT') {
    const student = await Student.findOne({ userId: user._id });
    if (student) {
      extraData = {
        studentId: student._id,
        registrationNumber: student.registrationNumber,
        department: student.department,
        semester: student.semester,
        academicYear: student.academicYear,
      };
    }
  } else if (user.role === 'FACULTY') {
    const faculty = await Faculty.findOne({ userId: user._id });
    if (faculty) {
      extraData = {
        facultyId: faculty._id,
        employeeId: faculty.employeeId,
        department: faculty.department,
        designation: faculty.designation,
      };
    }
  }

  sendSuccess(res, { ...user.toObject(), ...extraData }, 'Profile fetched');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, 'Institutional email is required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // If SMTP host is configured, we could send real mail; otherwise provide simulated reset link in dev
    console.log(`🔐 Password reset token generated for ${user.email}: ${resetToken}`);
  }

  // Consistent message to prevent email enumeration
  sendSuccess(
    res,
    null,
    'If an account with that email exists, password reset instructions have been dispatched.'
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return sendError(res, 'Reset token and new password are required', 400);
  }

  if (newPassword.length < 6) {
    return sendError(res, 'New password must be at least 6 characters long', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return sendError(res, 'Password reset token is invalid or has expired', 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await createAuditLog({
    userId: user._id.toString(),
    action: 'RESET_PASSWORD',
    resource: 'auth',
    ipAddress: req.ip,
  });

  sendSuccess(res, null, 'Password has been reset successfully. You may now log in.');
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?.id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return sendError(res, 'Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  await createAuditLog({
    userId: user._id.toString(),
    action: 'CHANGE_PASSWORD',
    resource: 'auth',
    ipAddress: req.ip,
  });

  sendSuccess(res, null, 'Password changed successfully');
});
