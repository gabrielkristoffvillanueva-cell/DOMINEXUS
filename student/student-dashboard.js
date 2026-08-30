/* =========================================
   DOMINEXUS STUDENT DASHBOARD
   Laravel Connected
========================================= */

const API_URL =
    "http://127.0.0.1:8000/api";


/* =========================================
   CHECK LOGIN
========================================= */

const studentLoggedIn =
    sessionStorage.getItem(
        "studentLoggedIn"
    );

const studentMustChangePassword =
    sessionStorage.getItem(
        "studentMustChangePassword"
    );


/*
 * Student must be logged in.
 */

if (
    studentLoggedIn !== "true"
) {

    window.location.href =
        "student-login.html";

}


/*
 * Student with a temporary password
 * must change it before accessing
 * the dashboard.
 */

if (
    studentMustChangePassword === "true"
) {

    window.location.href =
        "student-change-password.html";

}


/* =========================================
   CURRENT STUDENT
========================================= */

const currentStudentId =
    sessionStorage.getItem(
        "studentId"
    );


/* =========================================
   ELEMENTS
========================================= */

const welcomeName =
    document.getElementById(
        "welcomeName"
    );


const topStudentName =
    document.getElementById(
        "topStudentName"
    );


const topStudentId =
    document.getElementById(
        "topStudentId"
    );


const topAvatar =
    document.getElementById(
        "topAvatar"
    );


const attendanceTable =
    document.getElementById(
        "attendanceTable"
    );


const noAttendance =
    document.getElementById(
        "noAttendance"
    );


const recordCount =
    document.getElementById(
        "recordCount"
    );


const totalAttendance =
    document.getElementById(
        "totalAttendance"
    );


const attendanceRate =
    document.getElementById(
        "attendanceRate"
    );


const meetingsAttended =
    document.getElementById(
        "meetingsAttended"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const menuButton =
    document.getElementById(
        "menuButton"
    );


const sidebar =
    document.getElementById(
        "sidebar"
    );


const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


/* =========================================
   START DASHBOARD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!currentStudentId) {

            window.location.href =
                "student-login.html";

            return;

        }


        loadStudent();

        loadAttendance();

        setupLogout();

        setupMobileMenu();

    }
);


/* =========================================
   LOAD STUDENT FROM LARAVEL
========================================= */

async function loadStudent() {

    try {

        const response =
            await fetch(
                `${API_URL}/students/by-student-id/${encodeURIComponent(currentStudentId)}`,
                {
                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load student information."
            );

        }


        const student =
            data.student ||
            data.data ||
            data;


        displayStudent(
            student
        );


    } catch (error) {

        console.error(
            "Student loading error:",
            error
        );


        /*
         * If the API temporarily fails,
         * use the Student ID from session.
         */

        if (topStudentId) {

            topStudentId.textContent =
                currentStudentId;

        }

    }

}


/* =========================================
   DISPLAY STUDENT
========================================= */

function displayStudent(
    student
) {

    const name =
        student.name ||
        "Student";


    const studentId =
        student.student_id ||
        currentStudentId;


    if (welcomeName) {

        welcomeName.textContent =
            getFirstName(
                name
            );

    }


    if (topStudentName) {

        topStudentName.textContent =
            name;

    }


    if (topStudentId) {

        topStudentId.textContent =
            studentId;

    }


    if (topAvatar) {

        topAvatar.textContent =
            getInitials(
                name
            );

    }


    /*
     * Keep only useful session information
     * for the other Student Access pages.
     */

    sessionStorage.setItem(
        "studentName",
        name
    );


    sessionStorage.setItem(
        "studentId",
        studentId
    );


    if (student.section) {

        sessionStorage.setItem(
            "studentSection",
            student.section
        );

    }


    if (student.unique_id) {

        sessionStorage.setItem(
            "studentUniqueId",
            student.unique_id
        );

    }


    if (student.club_role) {

        sessionStorage.setItem(
            "studentClubRole",
            student.club_role
        );

    }

}


/* =========================================
   LOAD ATTENDANCE FROM LARAVEL
========================================= */

async function loadAttendance() {

    if (!currentStudentId) {

        displayAttendance([]);

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/attendances?student_id=${encodeURIComponent(currentStudentId)}`,
                {
                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load attendance."
            );

        }


        const records =
            Array.isArray(data)
                ? data
                : data.data ||
                  data.attendances ||
                  [];


        console.log(
            "Dashboard attendance:",
            records
        );


        displayAttendance(
            records
        );


    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );


        displayAttendance([]);

    }

}


/* =========================================
   DISPLAY ATTENDANCE
========================================= */

function displayAttendance(
    attendanceRecords
) {

    if (!attendanceTable) {

        return;

    }


    attendanceTable.innerHTML =
        "";


    if (
        !Array.isArray(
            attendanceRecords
        ) ||
        attendanceRecords.length === 0
    ) {

        if (noAttendance) {

            noAttendance.style.display =
                "block";

        }


        updateAttendanceSummary(
            []
        );


        return;

    }


    if (noAttendance) {

        noAttendance.style.display =
            "none";

    }


    /*
     * Sort newest first.
     */

    const sortedRecords =
        [...attendanceRecords].sort(
            function (a, b) {

                return (
                    getRecordDate(b) -
                    getRecordDate(a)
                );

            }
        );


    /*
     * Show only recent records
     * on the dashboard.
     */

    const recentRecords =
        sortedRecords.slice(
            0,
            5
        );


    recentRecords.forEach(
        function (record) {

            const row =
                document.createElement(
                    "tr"
                );


            const meeting =
                record.meeting;


            const meetingName =
                meeting
                    ? meeting.title
                    : record.meeting_name ||
                      record.meetingName ||
                      "Organization Meeting";


            const date =
                meeting
                    ? meeting.date
                    : record.date ||
                      record.scanned_at;


            const time =
                record.scanned_at
                    ? formatTime(
                        record.scanned_at
                    )
                    : record.time ||
                      record.timeIn ||
                      "--";


            const status =
                formatStatus(
                    record.status
                );


            /*
             * Meeting
             */

            const meetingCell =
                document.createElement(
                    "td"
                );


            meetingCell.textContent =
                meetingName;


            /*
             * Date
             */

            const dateCell =
                document.createElement(
                    "td"
                );


            dateCell.textContent =
                formatDate(
                    date
                );


            /*
             * Time
             */

            const timeCell =
                document.createElement(
                    "td"
                );


            timeCell.textContent =
                time;


            /*
             * Status
             */

            const statusCell =
                document.createElement(
                    "td"
                );


            const statusBadge =
                document.createElement(
                    "span"
                );


            statusBadge.textContent =
                status;


            statusBadge.className =
                "attendance-status " +
                getStatusClass(
                    status
                );


            statusCell.appendChild(
                statusBadge
            );


            row.appendChild(
                meetingCell
            );


            row.appendChild(
                dateCell
            );


            row.appendChild(
                timeCell
            );


            row.appendChild(
                statusCell
            );


            attendanceTable.appendChild(
                row
            );

        }
    );


    updateAttendanceSummary(
        sortedRecords
    );

}


/* =========================================
   ATTENDANCE SUMMARY
========================================= */

function updateAttendanceSummary(
    records
) {

    const total =
        records.length;


    const attended =
        records.filter(
            function (record) {

                const status =
                    String(
                        record.status ||
                        "present"
                    ).toLowerCase();


                return (
                    status === "present" ||
                    status === "late"
                );

            }
        ).length;


    const rate =
        total > 0
            ? Math.round(
                (attended / total) * 100
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
            attended;

    }


    if (attendanceRate) {

        attendanceRate.textContent =
            rate + "%";

    }

}


/* =========================================
   STATUS HELPERS
========================================= */

function formatStatus(
    status
) {

    if (!status) {

        return "Present";

    }


    return (
        status.charAt(0).toUpperCase() +
        status.slice(1)
    );

}


function getStatusClass(
    status
) {

    switch (
        String(status).toLowerCase()
    ) {

        case "present":

            return "status-present";


        case "late":

            return "status-late";


        case "excused":

            return "status-excused";


        case "absent":

            return "status-absent";


        default:

            return "status-present";

    }

}


/* =========================================
   DATE HELPERS
========================================= */

function getRecordDate(
    record
) {

    if (record.scanned_at) {

        return new Date(
            record.scanned_at
        );

    }


    if (
        record.meeting &&
        record.meeting.date
    ) {

        return new Date(
            record.meeting.date +
            "T00:00:00"
        );

    }


    if (record.date) {

        return new Date(
            record.date
        );

    }


    return new Date(0);

}


function formatDate(
    value
) {

    if (!value) {

        return "--";

    }


    const date =
        new Date(
            value
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric"
        }
    );

}


function formatTime(
    value
) {

    if (!value) {

        return "--";

    }


    const date =
        new Date(
            value
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "--";

    }


    return date.toLocaleTimeString(
        "en-US",
        {
            hour:
                "numeric",

            minute:
                "2-digit"
        }
    );

}


/* =========================================
   NAME HELPERS
========================================= */

function getFirstName(
    name
) {

    if (!name) {

        return "Student";

    }


    return name
        .trim()
        .split(/\s+/)[0];

}


function getInitials(
    name
) {

    if (!name) {

        return "ST";

    }


    const parts =
        name
            .trim()
            .split(/\s+/);


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[
            parts.length - 1
        ].charAt(0)
    ).toUpperCase();

}


/* =========================================
   LOGOUT
========================================= */

function setupLogout() {

    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmed) {

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

function setupMobileMenu() {

    if (
        !menuButton ||
        !sidebar ||
        !sidebarOverlay
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        function () {

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


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );

}


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