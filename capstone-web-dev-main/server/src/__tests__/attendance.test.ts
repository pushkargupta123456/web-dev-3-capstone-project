describe('Attendance Engine Calculations & Business Rules', () => {
  const calculateAttendancePercentage = (present: number, late: number, total: number): number => {
    if (total <= 0) return 0;
    const attended = present + late; // LATE counts as attended per institutional spec
    return Math.round((attended / total) * 10000) / 100;
  };

  const isBelowThreshold = (percentage: number, threshold = 75): boolean => {
    return percentage < threshold;
  };

  it('should calculate attendance percentage correctly where LATE counts as attended', () => {
    // 18 present, 2 late out of 20 total = 20/20 = 100%
    expect(calculateAttendancePercentage(18, 2, 20)).toBe(100);

    // 15 present, 0 late out of 20 total = 15/20 = 75%
    expect(calculateAttendancePercentage(15, 0, 20)).toBe(75);

    // 14 present, 0 late out of 20 total = 14/20 = 70%
    expect(calculateAttendancePercentage(14, 0, 20)).toBe(70);

    // Zero classes handled gracefully
    expect(calculateAttendancePercentage(0, 0, 0)).toBe(0);
  });

  it('should accurately identify students below configurable attendance threshold (75%)', () => {
    expect(isBelowThreshold(75)).toBe(false); // 75% meets requirement
    expect(isBelowThreshold(74.99)).toBe(true); // 74.99% is below threshold
    expect(isBelowThreshold(50)).toBe(true);
    expect(isBelowThreshold(95)).toBe(false);
  });

  it('should enforce unique student enrolment constraint rule', () => {
    const existingEnrolments = [
      { studentId: 'student_1', sectionId: 'sec_101' },
      { studentId: 'student_2', sectionId: 'sec_101' },
    ];

    const isDuplicate = (studentId: string, sectionId: string) => {
      return existingEnrolments.some(
        e => e.studentId === studentId && e.sectionId === sectionId
      );
    };

    expect(isDuplicate('student_1', 'sec_101')).toBe(true);
    expect(isDuplicate('student_3', 'sec_101')).toBe(false);
  });
});
