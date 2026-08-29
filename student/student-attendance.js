/* =========================================
   DOMINEXUS STUDENT ATTENDANCE
========================================= */


/* =========================================
   PAGE INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    checkStudentLogin();

    loadStudentInformation();

    loadAttendanceRecords();

    setupNavigation();

    setupLogout();

    setupFilter();

});


/* =========================================
   CHECK LOGIN
========================================= */

function checkStudentLogin() {

    const loggedIn =
        sessionStorage.getItem("studentLoggedIn");


    if (loggedIn !== "true") {

        window.location.href =
            "student-login.html";

        return false;

    }


    return true;

}


/* =========================================
   GET CURRENT STUDENT
========================================= */

function getCurrentStudent() {

    const studentId =
        sessionStorage.getItem("studentId");


    const students =
        JSON.parse(
            localStorage.getItem("dominexus_students") || "[]"
        );


    const student =
        students.find(function (item) {

            return (
                item.studentId &&
                studentId &&
                item.studentId.toLowerCase() ===
                studentId.toLowerCase()
            );

        });


    return student || null;

}


/* =========================================
   LOAD STUDENT INFORMATION
========================================= */

function loadStudentInformation() {

    const student =
        getCurrentStudent();


    if (!student) {

        const studentId =
            sessionStorage.getItem("studentId");

        document.getElementById(
            "topStudentId"
        ).textContent =
            studentId || "Student ID";

        return;

    }


    const name =
        student.fullName ||
        student.name ||
        "Student";


    const studentId =
        student.studentId ||
        "---";


    document.getElementById(
        "topStudentName"
    ).textContent = name;


    document.getElementById(
        "topStudentId"
    ).textContent = studentId;


    document.getElementById(
        "topAvatar"
    ).textContent =
        getInitials(name);

}


/* =========================================
   LOAD ATTENDANCE
========================================= */

function loadAttendanceRecords() {

    const student =
        getCurrentStudent();


    if (!student) {

        displayAttendance([]);

        return;

    }


    /*
        The system will look for attendance
        records belonging to this student's
        permanent Unique ID or Student ID.
    */

    const allAttendance =
        JSON.parse(
            localStorage.getItem(
                "dominexus_attendance"
            ) || "[]"
        );


    const studentAttendance =
        allAttendance.filter(function (record) {

            return (

                record.studentId ===
                    student.studentId

                ||

                record.uniqueId ===
                    student.uniqueId

            );

        });


    displayAttendance(studentAttendance);

}


/* =========================================
   DISPLAY ATTENDANCE
========================================= */

function displayAttendance(records) {

    const tableBody =
        document.getElementById(
            "attendanceTableBody"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    tableBody.innerHTML = "";


    /* ================================
       NO RECORDS
    ================================= */

    if (!records || records.length === 0) {

        emptyState.style.display =
            "block";

        updateSummary([]);

        return;

    }


    emptyState.style.display =
        "none";


    /* ================================
       SORT BY DATE
    ================================= */

    records.sort(function (a, b) {

        return new Date(
            b.date || 0
        ) - new Date(
            a.date || 0
        );

    });


    /* ================================
       CREATE TABLE ROWS
    ================================= */

    records.forEach(function (record) {

        const row =
            document.createElement("tr");


        const date =
            formatDate(record.date);


        const meeting =
            record.meetingName ||
            record.meeting ||
            "Organization Meeting";


        const timeIn =
            record.timeIn ||
            "--";


        const timeOut =
            record.timeOut ||
            "--";


        const status =
            record.status ||
            "Present";


        const remarks =
            record.remarks ||
            "--";


        const badgeClass =
            getBadgeClass(status);


        row.innerHTML = `

            <td>
                ${date}
            </td>

            <td>
                <strong>
                    ${escapeHTML(meeting)}
                </strong>
            </td>

            <td>
                ${escapeHTML(timeIn)}
            </td>

            <td>
                ${escapeHTML(timeOut)}
            </td>

            <td>

                <span class="attendance-badge ${badgeClass}">
                    ${escapeHTML(status)}
                </span>

            </td>

            <td>
                ${escapeHTML(remarks)}
            </td>

        `;


        tableBody.appendChild(row);

    });


    updateSummary(records);

}


/* =========================================
   UPDATE SUMMARY
========================================= */

function updateSummary(records) {

    const total =
        records.length;


    const attended =
        records.filter(function (record) {

            return (
                record.status === "Present" ||
                record.status === "Late"
            );

        }).length;


    const missed =
        records.filter(function (record) {

            return record.status === "Absent";

        }).length;


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (attended / total) * 100
            );

    }


    document.getElementById(
        "attendancePercentage"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "meetingsAttended"
    ).textContent =
        attended;


    document.getElementById(
        "meetingsMissed"
    ).textContent =
        missed;


    document.getElementById(
        "totalMeetings"
    ).textContent =
        total;


    updateStatus(
        percentage,
        total
    );

}


/* =========================================
   UPDATE ATTENDANCE STATUS
========================================= */

function updateStatus(
    percentage,
    total
) {

    const status =
        document.getElementById(
            "attendanceStatus"
        );


    const message =
        document.getElementById(
            "statusMessage"
        );


    const indicator =
        document.getElementById(
            "statusIndicator"
        );


    if (total === 0) {

        status.textContent =
            "No Records Yet";

        message.textContent =
            "Your attendance records will appear here once meetings have been recorded.";

        indicator.style.background =
            "#999";

        return;

    }


    if (percentage >= 80) {

        status.textContent =
            "Good Attendance";

        message.textContent =
            "You are maintaining a good attendance record.";

        indicator.style.background =
            "#198754";

    }

    else if (percentage >= 60) {

        status.textContent =
            "Needs Improvement";

        message.textContent =
            "Try to attend upcoming meetings regularly.";

        indicator.style.background =
            "#d4af37";

    }

    else {

        status.textContent =
            "Low Attendance";

        message.textContent =
            "Your attendance is currently below the recommended level.";

        indicator.style.background =
            "#b02a37";

    }

}


/* =========================================
   FILTER
========================================= */

function setupFilter() {

    const filter =
        document.getElementById(
            "attendanceFilter"
        );


    filter.addEventListener(
        "change",
        function () {

            filterAttendance(
                this.value
            );

        }
    );

}


function filterAttendance(status) {

    const student =
        getCurrentStudent();


    if (!student) {

        displayAttendance([]);

        return;

    }


    const allAttendance =
        JSON.parse(
            localStorage.getItem(
                "dominexus_attendance"
            ) || "[]"
        );


    let records =
        allAttendance.filter(function (record) {

            return (

                record.studentId ===
                    student.studentId

                ||

                record.uniqueId ===
                    student.uniqueId

            );

        });


    if (status !== "all") {

        records =
            records.filter(function (record) {

                return record.status === status;

            });

    }


    displayAttendance(records);

}


/* =========================================
   NAVIGATION
========================================= */

function setupNavigation() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.add(
                "open"
            );

            overlay.classList.add(
                "show"
            );

        }
    );


    overlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove(
                "open"
            );

            overlay.classList.remove(
                "show"
            );

        }
    );


    /* Close mobile menu after clicking a page */

    const navLinks =
        document.querySelectorAll(
            ".nav-item"
        );


    navLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                sidebar.classList.remove(
                    "open"
                );

                overlay.classList.remove(
                    "show"
                );

            }
        );

    });

}


/* =========================================
   LOGOUT
========================================= */

function setupLogout() {

    document.getElementById(
        "logoutButton"
    ).addEventListener(
        "click",
        logoutStudent
    );

}


function logoutStudent() {

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


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "--";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================
   BADGE CLASS
========================================= */

function getBadgeClass(status) {

    switch (status) {

        case "Present":
            return "badge-present";

        case "Late":
            return "badge-late";

        case "Absent":
            return "badge-absent";

        case "Excused":
            return "badge-excused";

        default:
            return "badge-present";

    }

}


/* =========================================
   GET INITIALS
========================================= */

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
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}