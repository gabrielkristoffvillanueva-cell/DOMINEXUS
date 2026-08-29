/* =========================================================
   DOMINEXUS — STUDENT ATTENDANCE
   LARAVEL / MYSQL VERSION
========================================================= */

const API_BASE = "http://127.0.0.1:8000/api";

let allAttendanceRecords = [];


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkStudentLogin()) {
            return;
        }

        loadStudentInformation();

        loadAttendanceRecords();

        setupNavigation();

        setupLogout();

        setupFilter();

    }
);


/* =========================================================
   CHECK LOGIN
========================================================= */

function checkStudentLogin() {

    const loggedIn =
        sessionStorage.getItem(
            "studentLoggedIn"
        );


    if (loggedIn !== "true") {

        window.location.href =
            "student-login.html";

        return false;

    }


    return true;

}


/* =========================================================
   LOAD STUDENT INFORMATION
========================================================= */

async function loadStudentInformation() {

    const studentId =
        sessionStorage.getItem(
            "studentId"
        );


    if (!studentId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/students/by-student-id/${encodeURIComponent(studentId)}`,
                {
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
                "Unable to load student."
            );
        }


        const student =
            data.student ||
            data.data ||
            data;


        const name =
            student.name ||
            "Student";


        const actualStudentId =
            student.student_id ||
            studentId;


        document.getElementById(
            "topStudentName"
        ).textContent =
            name;


        document.getElementById(
            "topStudentId"
        ).textContent =
            actualStudentId;


        document.getElementById(
            "topAvatar"
        ).textContent =
            getInitials(name);


    } catch (error) {

        console.error(
            "Student information error:",
            error
        );


        /*
         * We can still show the Student ID
         * stored during login.
         */

        document.getElementById(
            "topStudentId"
        ).textContent =
            studentId;

    }

}


/* =========================================================
   LOAD ATTENDANCE FROM LARAVEL
========================================================= */

async function loadAttendanceRecords() {

    const studentId =
        sessionStorage.getItem(
            "studentId"
        );


    if (!studentId) {

        displayAttendance([]);

        return;

    }


    try {

        /*
         * Get attendance records belonging
         * to the currently logged-in student.
         */

        const response =
            await fetch(
                `${API_BASE}/attendances?student_id=${encodeURIComponent(studentId)}`,
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


        allAttendanceRecords =
            Array.isArray(data)
                ? data
                : data.data || data.attendances || [];


        console.log(
            "Student attendance:",
            allAttendanceRecords
        );


        displayAttendance(
            allAttendanceRecords
        );


    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );


        allAttendanceRecords = [];


        displayAttendance([]);


        const message =
            document.querySelector(
                "#statusMessage"
            );


        if (message) {

            message.textContent =
                "Unable to load attendance records. Please make sure the Laravel server is running.";

        }

    }

}


/* =========================================================
   DISPLAY ATTENDANCE
========================================================= */

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


    if (
        !records ||
        records.length === 0
    ) {

        emptyState.style.display =
            "block";

        updateSummary([]);

        return;

    }


    emptyState.style.display =
        "none";


    /*
     * Newest attendance first.
     */

    const sortedRecords =
        [...records].sort(
            function (a, b) {

                return (
                    getAttendanceDate(b) -
                    getAttendanceDate(a)
                );

            }
        );


    sortedRecords.forEach(
        function (record) {

            const row =
                document.createElement(
                    "tr"
                );


            const meeting =
                record.meeting;


            const date =
                meeting
                    ? meeting.date
                    : record.scanned_at;


            const meetingName =
                meeting
                    ? meeting.title
                    : "Organization Meeting";


            const timeIn =
                record.scanned_at
                    ? formatTime(
                        record.scanned_at
                    )
                    : "--";


            const timeOut =
                "--";


            const status =
                formatStatus(
                    record.status
                );


            const remarks =
                getRemarks(record);


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        formatDate(date)
                    )}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(
                            meetingName
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        timeIn
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        timeOut
                    )}
                </td>

                <td>

                    <span
                        class="attendance-badge
                        ${getBadgeClass(status)}">

                        ${escapeHTML(status)}

                    </span>

                </td>

                <td>
                    ${escapeHTML(remarks)}
                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    updateSummary(
        sortedRecords
    );

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary(records) {

    const total =
        records.length;


    const attended =
        records.filter(
            function (record) {

                return (
                    record.status === "present" ||
                    record.status === "late"
                );

            }
        ).length;


    const missed =
        records.filter(
            function (record) {

                return (
                    record.status === "absent"
                );

            }
        ).length;


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


/* =========================================================
   ATTENDANCE STATUS
========================================================= */

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


/* =========================================================
   FILTER
========================================================= */

function setupFilter() {

    const filter =
        document.getElementById(
            "attendanceFilter"
        );


    if (!filter) {
        return;
    }


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

    if (status === "all") {

        displayAttendance(
            allAttendanceRecords
        );

        return;

    }


    const filtered =
        allAttendanceRecords.filter(
            function (record) {

                return (
                    formatStatus(
                        record.status
                    ) === status
                );

            }
        );


    displayAttendance(
        filtered
    );

}


/* =========================================================
   DATE HELPERS
========================================================= */

function getAttendanceDate(record) {

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


    return new Date(0);

}


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


function formatTime(dateString) {

    if (!dateString) {
        return "--";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return "--";
    }


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   STATUS
========================================================= */

function formatStatus(status) {

    if (!status) {
        return "Present";
    }


    return (
        status.charAt(0).toUpperCase() +
        status.slice(1)
    );

}


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


function getRemarks(record) {

    if (record.status === "present") {
        return "Attendance recorded";
    }


    if (record.status === "late") {
        return "Marked late";
    }


    if (record.status === "absent") {
        return "Absent";
    }


    if (record.status === "excused") {
        return "Excused absence";
    }


    return "--";

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

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


    if (
        !menuButton ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


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


    document
        .querySelectorAll(".nav-item")
        .forEach(
            function (link) {

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

            }
        );

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function () {

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


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {
        return "ST";
    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[
            parts.length - 1
        ].charAt(0)
    ).toUpperCase();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}