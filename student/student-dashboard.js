/* =========================================
   DOMINEXUS STUDENT DASHBOARD
========================================= */


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
    sessionStorage.getItem("studentId") ||
    "2026-0001";


const students =
    JSON.parse(
        localStorage.getItem("dominexus_students") || "[]"
    );


const registeredStudent =
    students.find(student =>

        student.studentId &&
        student.studentId.toLowerCase() ===
        currentStudentId.toLowerCase()

    );


const currentStudent =
    registeredStudent || {

        studentId: currentStudentId,

        fullName:
            sessionStorage.getItem("studentName") ||
            "Juan Dela Cruz",

        section:
            "Demo Section",

        organization:
            "DOMINEXUS",

        clubRole:
            "Student",

        uniqueId:
            sessionStorage.getItem("studentUniqueId") ||
            "SDCA-DEMO",

        attendanceHistory:
            []

    };


const studentId =
    currentStudent.studentId;


const studentName =
    currentStudent.fullName;


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
   DISPLAY STUDENT INFORMATION
========================================= */

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


/* =========================================
   CREATE INITIALS
========================================= */

const initials =
    getInitials(studentName);


if (topAvatar) {

    topAvatar.textContent =
        initials;

}


/* =========================================
   FUNCTIONS
========================================= */

function getFirstName(name) {

    if (!name) {
        return "Student";
    }

    return name.trim().split(/\s+/)[0];

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
   ATTENDANCE DATA
========================================= */

const attendanceRecords =
    Array.isArray(
        currentStudent.attendanceHistory
    )
        ? currentStudent.attendanceHistory
        : [];


/* =========================================
   DISPLAY ATTENDANCE
========================================= */

function displayAttendance() {

    if (!attendanceTable) {
        return;
    }


    attendanceTable.innerHTML = "";


    if (
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


        /* =========================
           MEETING
        ========================= */

        const meetingCell =
            document.createElement("td");


        meetingCell.textContent =
            record.meeting ||
            record.meetingName ||
            "Organization Meeting";


        /* =========================
           DATE
        ========================= */

        const dateCell =
            document.createElement("td");


        dateCell.textContent =
            record.date ||
            "--";


        /* =========================
           TIME
        ========================= */

        const timeCell =
            document.createElement("td");


        timeCell.textContent =
            record.time ||
            record.timeIn ||
            "--";


        /* =========================
           STATUS
        ========================= */

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


        if (
            normalizedStatus === "present"
        ) {

            status.className =
                "attendance-status status-present";

        }

        else if (
            normalizedStatus === "late"
        ) {

            status.className =
                "attendance-status status-late";

        }

        else if (
            normalizedStatus === "excused"
        ) {

            status.className =
                "attendance-status status-excused";

        }

        else {

            status.className =
                "attendance-status status-absent";

        }


        statusCell.appendChild(status);


        /* =========================
           ADD ROW
        ========================= */

        row.appendChild(meetingCell);

        row.appendChild(dateCell);

        row.appendChild(timeCell);

        row.appendChild(statusCell);


        attendanceTable.appendChild(row);

    });


    /* =================================
       UPDATE STATISTICS
    ================================= */

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


            sessionStorage.removeItem(
                "studentLoggedIn"
            );


            sessionStorage.removeItem(
                "studentId"
            );


            sessionStorage.removeItem(
                "studentName"
            );


            sessionStorage.removeItem(
                "studentUniqueId"
            );


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

            sidebar.classList.add(
                "open"
            );


            sidebarOverlay.classList.add(
                "show"
            );

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

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "show"
        );

    }

}


/* =========================================
   CLOSE MOBILE MENU WHEN LINK IS CLICKED
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
   INITIALIZE DASHBOARD
========================================= */

displayAttendance();