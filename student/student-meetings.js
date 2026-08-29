/* =========================================
   DOMINEXUS STUDENT MEETINGS
   Laravel API Connected
========================================= */

const API_URL = "http://127.0.0.1:8000/api";


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkStudentLogin()) {
            return;
        }

        loadStudentInformation();

        loadMeetings();

        setupNavigation();

        setupLogout();

    }
);


/* =========================================
   CHECK LOGIN
========================================= */

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


/* =========================================
   LOAD STUDENT INFORMATION
========================================= */

function loadStudentInformation() {

    const name =
        sessionStorage.getItem(
            "studentName"
        ) || "Student";


    const studentId =
        sessionStorage.getItem(
            "studentId"
        ) || "Student ID";


    document.getElementById(
        "topStudentName"
    ).textContent =
        name;


    document.getElementById(
        "topStudentId"
    ).textContent =
        studentId;


    document.getElementById(
        "topAvatar"
    ).textContent =
        getInitials(name);

}


/* =========================================
   LOAD MEETINGS FROM LARAVEL
========================================= */

async function loadMeetings() {

    try {

        const response =
            await fetch(
                `${API_URL}/meetings`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load meetings."
            );

        }


        const meetings =
            await response.json();


        const studentOrganizationId =
            sessionStorage.getItem(
                "studentOrganizationId"
            );


        /*
         * Only show meetings belonging
         * to the student's organization.
         */

        const organizationMeetings =
            meetings.filter(
                function (meeting) {

                    return String(
                        meeting.organization_id
                    ) === String(
                        studentOrganizationId
                    );

                }
            );


        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        const upcoming = [];

        const previous = [];


        organizationMeetings.forEach(
            function (meeting) {

                const meetingDate =
                    getMeetingDate(meeting);


                if (!meetingDate) {
                    return;
                }


                meetingDate.setHours(
                    0,
                    0,
                    0,
                    0
                );


                if (
                    meetingDate >= today
                    &&
                    meeting.status !== "cancelled"
                ) {

                    upcoming.push(
                        meeting
                    );

                } else {

                    previous.push(
                        meeting
                    );

                }

            }
        );


        upcoming.sort(
            function (a, b) {

                return (
                    getMeetingDate(a) -
                    getMeetingDate(b)
                );

            }
        );


        previous.sort(
            function (a, b) {

                return (
                    getMeetingDate(b) -
                    getMeetingDate(a)
                );

            }
        );


        displayMeetings(
            upcoming,
            "upcomingMeetings",
            "upcomingEmpty",
            "upcoming"
        );


        displayMeetings(
            previous,
            "previousMeetings",
            "previousEmpty",
            "previous"
        );


    } catch (error) {

        console.error(
            "Meeting loading error:",
            error
        );


        showMeetingError();

    }

}


/* =========================================
   DISPLAY MEETINGS
========================================= */

function displayMeetings(
    meetings,
    containerId,
    emptyId,
    type
) {

    const container =
        document.getElementById(
            containerId
        );


    const emptyState =
        document.getElementById(
            emptyId
        );


    container.innerHTML = "";


    if (!meetings.length) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    meetings.forEach(
        function (meeting) {

            const card =
                createMeetingCard(
                    meeting,
                    type
                );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================
   CREATE MEETING CARD
========================================= */

function createMeetingCard(
    meeting,
    type
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "meeting-card";


    const date =
        getMeetingDate(meeting);


    const dateInfo =
        formatDateParts(date);


    const meetingName =
        meeting.title ||
        "Organization Meeting";


    const organization =
        meeting.organization
            ? meeting.organization.name
            : "Student Organization";


    const location =
        meeting.location ||
        "TBA";


    const startTime =
        formatTime(
            meeting.start_time
        );


    const endTime =
        formatTime(
            meeting.end_time
        );


    const status =
        formatStatus(
            meeting.status
        );


    let attendanceText = "";


    if (type === "previous") {

        attendanceText =
            "Attendance will be connected next.";

    }


    card.innerHTML = `

        <div class="date-box">

            <span class="month">
                ${dateInfo.month}
            </span>

            <span class="day">
                ${dateInfo.day}
            </span>

            <span class="year">
                ${dateInfo.year}
            </span>

        </div>


        <div class="meeting-info">

            <h4>
                ${escapeHTML(meetingName)}
            </h4>

            <p>
                ${escapeHTML(organization)}
            </p>


            <div class="meeting-meta">

                <span>
                    🕐 ${escapeHTML(startTime)}
                    ${
                        endTime
                            ? " - " +
                              escapeHTML(endTime)
                            : ""
                    }
                </span>


                <span>
                    📍 ${escapeHTML(location)}
                </span>

            </div>

        </div>


        <div class="meeting-status">

            <span class="status-badge ${getStatusClass(meeting.status)}">
                ${escapeHTML(status)}
            </span>

            ${
                attendanceText
                    ? `<span class="attendance-status">
                            ${escapeHTML(
                                attendanceText
                            )}
                       </span>`
                    : ""
            }

        </div>

    `;


    return card;

}


/* =========================================
   GET MEETING DATE
========================================= */

function getMeetingDate(meeting) {

    if (!meeting.date) {
        return null;
    }


    const date =
        new Date(
            meeting.date + "T00:00:00"
        );


    if (isNaN(date.getTime())) {
        return null;
    }


    return date;

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDateParts(date) {

    if (!date) {

        return {
            month: "---",
            day: "--",
            year: "----"
        };

    }


    return {

        month:
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short"
                }
            ),

        day:
            date.toLocaleDateString(
                "en-US",
                {
                    day: "numeric"
                }
            ),

        year:
            date.toLocaleDateString(
                "en-US",
                {
                    year: "numeric"
                }
            )

    };

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(time) {

    if (!time) {
        return "";
    }


    const parts =
        time.split(":");


    if (parts.length < 2) {
        return time;
    }


    let hour =
        parseInt(
            parts[0],
            10
        );


    const minute =
        parts[1];


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${period}`;

}


/* =========================================
   FORMAT STATUS
========================================= */

function formatStatus(status) {

    if (!status) {
        return "Upcoming";
    }


    return status
        .charAt(0)
        .toUpperCase() +
        status.slice(1);

}


/* =========================================
   STATUS CLASS
========================================= */

function getStatusClass(status) {

    const normalized =
        String(status)
            .toLowerCase();


    if (
        normalized.includes(
            "cancel"
        )
    ) {

        return "status-cancelled";

    }


    if (
        normalized.includes(
            "complete"
        )
    ) {

        return "status-completed";

    }


    return "status-upcoming";

}


/* =========================================
   SHOW API ERROR
========================================= */

function showMeetingError() {

    const upcomingEmpty =
        document.getElementById(
            "upcomingEmpty"
        );


    const previousEmpty =
        document.getElementById(
            "previousEmpty"
        );


    if (upcomingEmpty) {

        upcomingEmpty.style.display =
            "block";

        const text =
            upcomingEmpty.querySelector(
                "p"
            );

        if (text) {

            text.textContent =
                "Unable to load meetings. Please make sure the Laravel server is running.";

        }

    }


    if (previousEmpty) {

        previousEmpty.style.display =
            "none";

    }

}


/* =========================================
   MOBILE NAVIGATION
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


    const navLinks =
        document.querySelectorAll(
            ".nav-item"
        );


    navLinks.forEach(
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


    sessionStorage.clear();


    window.location.href =
        "student-login.html";

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
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}