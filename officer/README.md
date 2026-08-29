# DOMINEXUS

## Offline General Meeting Attendance Management System
### For Student Organizations of St. Dominic College of Asia

---

## About the System

DOMINEXUS is an attendance management system designed for
student organizations of St. Dominic College of Asia.

The system helps organizations manage student attendance,
student information, meetings, and attendance records through
separate access portals.

---

## System Access

DOMINEXUS has three main access levels:

### 1. Student Access

Students can:

- Create an account
- Log in to their account
- View their dashboard
- View their personal QR Code
- View attendance records
- View meetings
- Submit requests
- Manage their profile
- Manage account settings

### 2. Officer Access

Officers can:

- Log in to the Officer Portal
- View registered members
- Search and filter members
- View member information
- Record attendance
- Manage meetings
- View attendance records
- Process student requests
- Generate attendance reports

### 3. Moderator Access

Moderators can:

- Monitor organization activities
- Manage officers and members
- Monitor attendance
- Manage meetings
- Review records
- Generate reports
- Manage system settings

---

## Project Structure

The project is organized into separate folders
for easier development and maintenance.

```text
DOMINEXUS/
│
├── README.md
│
├── front-page/
│
├── students/
│   ├── student-login.html
│   ├── student-login.css
│   ├── student-login.js
│   │
│   ├── student-signup.html
│   ├── student-signup.css
│   ├── student-signup.js
│   │
│   ├── student-dashboard.html
│   ├── student-dashboard.css
│   ├── student-dashboard.js
│   │
│   ├── student-qr.html
│   ├── student-qr.css
│   ├── student-qr.js
│   │
│   ├── student-attendance.html
│   ├── student-attendance.css
│   ├── student-attendance.js
│   │
│   ├── student-profile.html
│   ├── student-profile.css
│   ├── student-profile.js
│   │
│   ├── student-meetings.html
│   ├── student-meetings.css
│   ├── student-meetings.js
│   │
│   ├── student-requests.html
│   ├── student-requests.css
│   ├── student-requests.js
│   │
│   ├── student-settings.html
│   ├── student-settings.css
│   └── student-settings.js
│
├── officers/
│   ├── officer-login.html
│   ├── officer-login.css
│   ├── officer-login.js
│   │
│   ├── officer-dashboard.html
│   ├── officer-dashboard.css
│   ├── officer-dashboard.js
│   │
│   ├── officer-members.html
│   ├── officer-members.css
│   ├── officer-members.js
│   │
│   ├── officer-attendance.html
│   ├── officer-attendance.css
│   ├── officer-attendance.js
│   │
│   ├── officer-meetings.html
│   ├── officer-meetings.css
│   ├── officer-meetings.js
│   │
│   ├── officer-requests.html
│   ├── officer-requests.css
│   ├── officer-requests.js
│   │
│   ├── officer-reports.html
│   ├── officer-reports.css
│   ├── officer-reports.js
│   │
│   ├── officer-settings.html
│   ├── officer-settings.css
│   └── officer-settings.js
│
├── moderators/
│   ├── moderator-login.html
│   ├── moderator-login.css
│   ├── moderator-login.js
│   │
│   ├── moderator-dashboard.html
│   ├── moderator-dashboard.css
│   ├── moderator-dashboard.js
│   │
│   ├── moderator-members.html
│   ├── moderator-members.css
│   ├── moderator-members.js
│   │
│   ├── moderator-attendance.html
│   ├── moderator-attendance.css
│   ├── moderator-attendance.js
│   │
│   ├── moderator-meetings.html
│   ├── moderator-meetings.css
│   ├── moderator-meetings.js
│   │
│   ├── moderator-reports.html
│   ├── moderator-reports.css
│   ├── moderator-reports.js
│   │
│   └── moderator-settings.html
│
└── assets/
    ├── images/
    ├── icons/
    └── logos/
