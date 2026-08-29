/* =========================================
   DOMINEXUS STUDENT DASHBOARD
   Laravel Connected
========================================= */

const API_URL = "http://127.0.0.1:8000/api";


/* =========================================
   CHECK LOGIN
========================================= */

const loggedIn =
    sessionStorage.getItem("studentLoggedIn");

if (loggedIn !== "true") {

    window.location.href =
        "student-login.html";

}


/* =========================================
   GET CURRENT STUDENT
========================================= */

const currentStudentId =
    sessionStorage.getItem("studentId");


/* =========================================
   ELEMENTS
========================================= */

const welcomeName =
    document.getElementById("welcomeName");

const topStudentName =
    document.getElementById("topStudentName");

const topStudentId =
    document.getElementById("topStudentId");

const topAvatar =
    document.getElementById("topAvatar");

const attendanceTable =
    document.getElementById("attendanceTable");

const noAttendance =
    document.getElementById("noAttendance");

const recordCount =
    document.getElementById("recordCount");

const totalAttendance =
    document.getElementById("totalAttendance");

const attendanceRate =
    document.getElementById("attendanceRate");

const meetingsAttended =
    document.getElementById("meetingsAttended");

const logoutButton =
    document.getElementById("logoutButton");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* =========================================
   LOAD STUDENT FROM LARAVEL
========================================= */

async function loadStudent() {

    if (!currentStudentId) {
        window.location.href = "student-login.html";
        return;
    }

    try {

        /*
         * For now we use the login information
         * stored in sessionStorage.
         *
         * The login response already contains:
         * name
         * student_id
         * section
         * organization
         * club_role
         * unique_id
         * role
         * status
         */

        const student = {

            student_id:
                sessionStorage.getItem("studentId") || "",

            name:
                sessionStorage.getItem("studentName") ||
                "Student",

            section:
                sessionStorage.getItem("studentSection") ||
                "",

            organization:
                sessionStorage.getItem(
                    "studentOrganization"
                ) || "",

            club_role:
                sessionStorage.getItem(
                    "studentClubRole"
                ) || "",

            unique_id:
                sessionStorage.getItem(
                    "studentUniqueId"
                ) || "",

            role:
                sessionStorage.getItem(
                    "studentRole"
                ) || "student",

            status:
                sessionStorage.getItem(
                    "studentStatus"
                ) || "Active"

        };


        displayStudent(student);

        /*
         * Attendance will be connected to Laravel
         * after the attendance API is created.
         */

        displayAttendance([]);

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


/* =========================================
   DISPLAY STUDENT INFORMATION
========================================= */

function displayStudent(student) {

    const studentName =
        student.name || "Student";

    const studentId =
        student.student_id || "Student ID";


    if (welcomeName) {

        welcomeName.textContent =
            getFirstName(studentName);

    }


    if (topStudentName) {

        topStudentName.textContent =
            studentName;

    }


    if (topStudentId) {

        topStudentId.textContent =
            studentId;

    }


    if (topAvatar) {

        topAvatar.textContent =
            getInitials(studentName);

    }


    /*
     * Save current information locally
     * for other frontend pages to use.
     */

    sessionStorage.setItem(
        "studentId",
        studentId
    );

    sessionStorage.setItem(
        "studentName",
        studentName
    );

    sessionStorage.setItem(
        "studentSection",
        student.section || ""
    );

    sessionStorage.setItem(
        "studentOrganization",
        student.organization || ""
    );

    sessionStorage.setItem(
        "studentClubRole",
        student.club_role || ""
    );

    sessionStorage.setItem(
        "studentUniqueId",
        student.unique_id || ""
    );

}


/* =========================================
   CREATE INITIALS
========================================= */

function getFirstName(name) {

    if (!name) {
        return "Student";
    }

    return name
        .trim()
        .split(/\s+/)[0];

}


function getInitials(name) {

    if (!name) {
        return "ST";
    }

    const parts =
        name.trim().split(/\s+/);

    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();

}


/* =========================================
   ATTENDANCE
========================================= */

function displayAttendance(
    attendanceRecords
) {

    if (!attendanceTable) {
        return;
    }


    attendanceTable.innerHTML = "";


    if (
        !Array.isArray(attendanceRecords) ||
        attendanceRecords.length === 0
    ) {

        if (noAttendance) {

            noAttendance.style.display =
                "block";

        }

        if (recordCount) {

            recordCount.textContent =
                "0";

        }

        if (totalAttendance) {

            totalAttendance.textContent =
                "0";

        }

        if (meetingsAttended) {

            meetingsAttended.textContent =
                "0";

        }

        if (attendanceRate) {

            attendanceRate.textContent =
                "0%";

        }

        return;
    }


    if (noAttendance) {

        noAttendance.style.display =
            "none";

    }


    attendanceRecords.forEach(record => {

        const row =
            document.createElement("tr");


        const meetingCell =
            document.createElement("td");

        meetingCell.textContent =
            record.meeting ||
            record.meetingName ||
            "Organization Meeting";


        const dateCell =
            document.createElement("td");

        dateCell.textContent =
            record.date || "--";


        const timeCell =
            document.createElement("td");

        timeCell.textContent =
            record.time ||
            record.timeIn ||
            "--";


        const statusCell =
            document.createElement("td");


        const status =
            document.createElement("span");


        const recordStatus =
            record.status ||
            "Present";


        status.textContent =
            recordStatus;


        const normalizedStatus =
            recordStatus.toLowerCase();


        if (normalizedStatus === "present") {

            status.className =
                "attendance-status status-present";

        } else if (
            normalizedStatus === "late"
        ) {

            status.className =
                "attendance-status status-late";

        } else if (
            normalizedStatus === "excused"
        ) {

            status.className =
                "attendance-status status-excused";

        } else {

            status.className =
                "attendance-status status-absent";

        }


        statusCell.appendChild(status);


        row.appendChild(meetingCell);
        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(statusCell);


        attendanceTable.appendChild(row);

    });


    const total =
        attendanceRecords.length;


    const present =
        attendanceRecords.filter(record => {

            const status =
                (record.status || "")
                    .toLowerCase();

            return (
                status === "present" ||
                status === "late"
            );

        }).length;


    const rate =
        total > 0
            ? Math.round(
                (present / total) * 100
            )
            : 0;


    if (recordCount) {

        recordCount.textContent =
            total;

    }


    if (totalAttendance) {

        totalAttendance.textContent =
            total;

    }


    if (meetingsAttended) {

        meetingsAttended.textContent =
            present;

    }


    if (attendanceRate) {

        attendanceRate.textContent =
            rate + "%";

    }

}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmLogout) {
                return;
            }


            sessionStorage.clear();


            window.location.href =
                "student-login.html";

        }
    );

}


/* =========================================
   MOBILE MENU
========================================= */

if (
    menuButton &&
    sidebar &&
    sidebarOverlay
) {

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.add("open");

            sidebarOverlay.classList.add("show");

        }
    );


    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


/* =========================================
   CLOSE SIDEBAR
========================================= */

function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove("open");

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.remove("show");

    }

}


/* =========================================
   CLOSE MOBILE MENU
========================================= */

const navigationLinks =
    document.querySelectorAll(
        ".nav-item"
    );


navigationLinks.forEach(link => {

    link.addEventListener(
        "click",
        () => {

            closeSidebar();

        }
    );

});


/* =========================================
   START DASHBOARD
========================================= */

loadStudent();