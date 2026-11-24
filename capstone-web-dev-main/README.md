# K.R. Mangalam University – Campus Management System

A production-grade, full-stack enterprise university administration, ERP, and authentication platform built with the **MERN** stack (MongoDB, Express, React, Node.js + TypeScript).

Engineered specifically with **K.R. Mangalam University** branding, official color system, authentic campus photographs, and a modern split-screen authentication architecture.

---

## 🎨 Brand Identity & Design System

* **Institution:** K.R. Mangalam University — *The Complete World*
* **Motto:** *Dream • Learn • Achieve*
* **Primary Navy:** `#082B5C`
* **Deep Navy:** `#061F45`
* **Primary Blue:** `#1261D5`
* **Light Blue Accent:** `#EAF2FF`
* **Card & Text Background:** `#F5F8FD`
* **Dark Typography:** `#102B52`
* **Muted Typography:** `#72819A`

---

## 🚀 Key Modules & Architecture

### 1. Authentication System
* **Split-Screen Login (`/login`)**:
  * Left: High-resolution KRMU campus building photograph with official emblem, tagline, and three university pillar highlights (*Academic Excellence*, *Holistic Growth*, *Global Network*).
  * Right: Floating white authentication card with institutional email, password toggle, remember me, forgot password modal, and one-click demo access for evaluators.
  * Google & Microsoft SSO integration interfaces.
* **Split-Screen Registration (`/signup`)**:
  * Left: Deep navy curved brand banner with official KRMU crest, bulleted campus service benefits, and campus entrance imagery.
  * Right: Responsive multi-role signup form (Student & Faculty).
  * **Security Enforcement:** Public administrator signup is strictly blocked at both frontend and backend API layers. Admin accounts are provisioned exclusively by Campus IT.
  * Real-time duplicate verification (email, student registration number, faculty employee ID).

### 2. Role-Based Dashboards
* **Admin Dashboard (`/admin`)**: Institutional overview, live enrollment trends, department distributions, student/faculty directories, course/section assignments, announcements, audit ledger.
* **Faculty Dashboard (`/faculty`)**: Assigned classes, sections, real-time attendance marking engine (Present / Absent / Late), attendance correction history, course announcements.
* **Student Dashboard (`/student`)**: Subject-wise attendance threshold tracker (<75% warning), enrolled courses, class schedules, campus alerts, grade cards.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose ODM, MongoDB, Socket.IO, JWT, bcryptjs |
| **Security** | Helmet, CORS, Rate Limiting, Mongo Sanitize, HTTP-only Cookie Refresh Token Rotation, Role-based Middleware |
| **Database** | MongoDB Atlas (Cloud) with seamless automatic embedded local MongoMemoryServer fallback |

---

## 📡 API Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register Student or Faculty (Blocks Admin role) |
| `POST` | `/api/auth/login` | Authenticate user, issue access & refresh tokens |
| `POST` | `/api/auth/logout` | Server-side refresh token revocation & cookie clearing |
| `POST` | `/api/auth/refresh` | Issue new access token using valid refresh token |
| `GET` | `/api/auth/me` | Retrieve authenticated profile with linked student/faculty data |
| `POST` | `/api/auth/forgot-password` | Generate crypto reset token and dispatch instructions |
| `POST` | `/api/auth/reset-password` | Validate reset token and update password |
| `POST` | `/api/auth/change-password` | Authenticated current password change |

---

## 🔑 Pre-Configured Demo Accounts

Open **[http://localhost:5173/login](http://localhost:5173/login)** and sign in with any of the following accounts or use the one-click demo pills:

| Role | Email | Password | Access Portal |
|---|---|---|---|
| 👑 **Administrator** | `admin@university.edu` | `Admin@123456` | `/admin` |
| 👨‍🏫 **Faculty** | `james.wilson@university.edu` | `Faculty@123` | `/faculty` |
| 👨‍🎓 **Student** | `student01@university.edu` | `Student@123` | `/student` |

*(Additional students: `student02@university.edu` through `student30@university.edu`, password `Student@123`)*

---

## 🧪 Testing & Verification

* **Unit & Integration Tests**: 9/9 passing tests in Jest (`attendance.test.ts`, `auth.test.ts`).
* **Frontend Build**: Zero errors (`npm run build` in `client` compiles in < 3s).
* **Backend Build**: Clean TypeScript compilation (`npm run build` in `server`).
