/* =========================================
   DOMINEXUS — OFFICER DASHBOARD
   Laravel / MySQL Connected
========================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


/* =========================================
   CHECK LOGIN
========================================= */

const loggedIn =
    sessionStorage.getItem(
        "officerLoggedIn"
    );


if (loggedIn !== "true") {

    window.location.href =
        "officer-login.html";

}


/* =========================================
   OFFICER SESSION
========================================= */

const officerId =
    sessionStorage.getItem(
        "officerId"
    );


const officerName =
    sessionStorage.getItem(
        "officerName"
    ) || "Officer";


/* =========================================
   ELEMENTS
========================================= */

const welcomeName =
    document.getElementById(
        "welcomeName"
    );


const topOfficerName =
    document.getElementById(
        "topOfficerName"
    );


const topOfficerId =
    document.getElementById(
        "topOfficerId"
    );


const topAvatar =
    document.getElementById(
        "topAvatar"
    );


const totalMeetings =
    document.getElementById(
        "totalMeetings"
    );


const totalMembers =
    document.getElementById(
        "totalMembers"
    );


const attendanceRate =
    document.getElementById(
        "attendanceRate"
    );


const upcomingMeeting =
    document.getElementById(
        "upcomingMeeting"
    );


const meetingsTable =
    document.getElementById(
        "meetingsTable"
    );


const noMeetings =
    document.getElementById(
        "noMeetings"
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
   DISPLAY OFFICER
========================================= */

if (welcomeName) {

    welcomeName.textContent =
        getFirstName(
            officerName
        );

}


if (topOfficerName) {

    topOfficerName.textContent =
        officerName;

}


if (topOfficerId) {

    topOfficerId.textContent =
        officerId ||
        "Officer ID";

}


if (topAvatar) {

    topAvatar.textContent =
        getInitials(
            officerName
        );

}


/* =========================================
   LOAD DASHBOARD
========================================= */

async function loadDashboard() {

    if (!officerId) {

        showDashboardError(
            "Officer session information is missing. Please log in again."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/officer-dashboard?officer_id=${encodeURIComponent(officerId)}`,
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


        console.log(
            "Officer dashboard response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load Officer Dashboard."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE OFFICER INFORMATION
        |--------------------------------------------------------------------------
        */

        if (data.officer) {

            updateOfficerInformation(
                data.officer
            );

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE STATISTICS
        |--------------------------------------------------------------------------
        */

        updateStatistics(
            data.statistics
        );


        /*
        |--------------------------------------------------------------------------
        | UPDATE UPCOMING MEETING
        |--------------------------------------------------------------------------
        */

        displayUpcomingMeeting(
            data.upcoming_meeting
        );


        /*
        |--------------------------------------------------------------------------
        | UPDATE RECENT MEETINGS
        |--------------------------------------------------------------------------
        */

        displayMeetings(
            data.meetings
        );


    } catch (error) {

        console.error(
            "Officer dashboard error:",
            error
        );


        showDashboardError(
            error.message ||
            "Unable to connect to the Laravel server."
        );

    }

}


/* =========================================
   UPDATE OFFICER INFORMATION
========================================= */

function updateOfficerInformation(
    officer
) {

    const name =
        officer.name ||
        officerName;


    const id =
        officer.id ||
        officerId;


    if (welcomeName) {

        welcomeName.textContent =
            getFirstName(name);

    }


    if (topOfficerName) {

        topOfficerName.textContent =
            name;

    }


    if (topOfficerId) {

        topOfficerId.textContent =
            id;

    }


    if (topAvatar) {

        topAvatar.textContent =
            getInitials(name);

    }


    /*
     * Keep the latest organization
     * information in the session.
     */

    if (
        officer.organization_id !==
        undefined &&
        officer.organization_id !==
        null
    ) {

        sessionStorage.setItem(
            "officerOrganizationId",
            officer.organization_id
        );

    }


    if (
        officer.organization &&
        officer.organization.name
    ) {

        sessionStorage.setItem(
            "officerOrganization",
            officer.organization.name
        );

    }


    if (officer.club_role) {

        sessionStorage.setItem(
            "officerClubRole",
            officer.club_role
        );

    }

}


/* =========================================
   UPDATE STATISTICS
========================================= */

function updateStatistics(
    statistics
) {

    if (!statistics) {

        return;

    }


    const meetings =
        Number(
            statistics.total_meetings ||
            0
        );


    const members =
        Number(
            statistics.total_members ||
            0
        );


    const rate =
        Number(
            statistics.attendance_rate ||
            0
        );


    if (totalMeetings) {

        totalMeetings.textContent =
            meetings;

    }


    if (totalMembers) {

        totalMembers.textContent =
            members;

    }


    if (attendanceRate) {

        attendanceRate.textContent =
            rate + "%";

    }

}


/* =========================================
   UPCOMING MEETING
========================================= */

function displayUpcomingMeeting(
    meeting
) {

    if (!upcomingMeeting) {

        return;

    }


    if (!meeting) {

        upcomingMeeting.innerHTML = `

            <div class="meeting-icon">
                ▦
            </div>

            <div class="meeting-info">

                <strong>
                    No upcoming meeting
                </strong>

                <span>
                    Create a meeting to see it here.
                </span>

            </div>

        `;

        return;

    }


    const title =
        meeting.title ||
        "Organization Meeting";


    const date =
        formatDate(
            meeting.date
        );


    const startTime =
        formatTime(
            meeting.start_time
        );


    const endTime =
        formatTime(
            meeting.end_time
        );


    let timeText =
        startTime;


    if (endTime) {

        timeText +=
            " - " +
            endTime;

    }


    const location =
        meeting.location ||
        "Location not specified";


    upcomingMeeting.innerHTML = `

        <div class="meeting-icon">
            ▦
        </div>


        <div class="meeting-info">

            <strong>
                ${escapeHtml(title)}
            </strong>


            <span>
                ${escapeHtml(date)}
                ·
                ${escapeHtml(timeText)}
            </span>


            <span>
                ${escapeHtml(location)}
            </span>

        </div>

    `;

}


/* =========================================
   DISPLAY RECENT MEETINGS
========================================= */

function displayMeetings(
    meetings
) {

    if (!meetingsTable) {

        return;

    }


    meetingsTable.innerHTML =
        "";


    if (
        !Array.isArray(meetings) ||
        meetings.length === 0
    ) {

        if (noMeetings) {

            noMeetings.style.display =
                "block";

        }

        return;

    }


    if (noMeetings) {

        noMeetings.style.display =
            "none";

    }


    /*
     * Sort newest first.
     */

    const sortedMeetings =
        [...meetings].sort(
            function (a, b) {

                const dateA =
                    new Date(
                        buildDateTime(
                            a
                        )
                    );


                const dateB =
                    new Date(
                        buildDateTime(
                            b
                        )
                    );


                return dateB - dateA;

            }
        );


    sortedMeetings
        .slice(0, 5)
        .forEach(
            function (meeting) {

                const row =
                    document.createElement(
                        "tr"
                    );


                /*
                 * MEETING
                 */

                const meetingCell =
                    document.createElement(
                        "td"
                    );


                meetingCell.textContent =
                    meeting.title ||
                    "Organization Meeting";


                /*
                 * DATE
                 */

                const dateCell =
                    document.createElement(
                        "td"
                    );


                dateCell.textContent =
                    formatDate(
                        meeting.date
                    );


                /*
                 * TIME
                 */

                const timeCell =
                    document.createElement(
                        "td"
                    );


                const startTime =
                    formatTime(
                        meeting.start_time
                    );


                const endTime =
                    formatTime(
                        meeting.end_time
                    );


                if (endTime) {

                    timeCell.textContent =
                        `${startTime} - ${endTime}`;

                } else {

                    timeCell.textContent =
                        startTime || "--";

                }


                /*
                 * STATUS
                 */

                const statusCell =
                    document.createElement(
                        "td"
                    );


                const status =
                    document.createElement(
                        "span"
                    );


                const meetingStatus =
                    meeting.status ||
                    "upcoming";


                status.textContent =
                    capitalizeStatus(
                        meetingStatus
                    );


                const normalizedStatus =
                    String(
                        meetingStatus
                    ).toLowerCase();


                if (
                    normalizedStatus ===
                    "completed"
                ) {

                    status.className =
                        "meeting-status status-completed";

                }

                else if (
                    normalizedStatus ===
                    "cancelled"
                ) {

                    status.className =
                        "meeting-status status-cancelled";

                }

                else if (
                    normalizedStatus ===
                    "ongoing"
                ) {

                    status.className =
                        "meeting-status status-upcoming";

                }

                else {

                    status.className =
                        "meeting-status status-upcoming";

                }


                statusCell.appendChild(
                    status
                );


                /*
                 * ADD ROW
                 */

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


                meetingsTable.appendChild(
                    row
                );

            }
        );

}


/* =========================================
   BUILD DATE + TIME
========================================= */

function buildDateTime(
    meeting
) {

    if (!meeting) {

        return "";

    }


    const date =
        meeting.date ||
        "";


    const time =
        meeting.start_time ||
        "00:00:00";


    return `${date}T${time}`;

}


/* =========================================
   FORMAT DATE
========================================= */

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
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

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
   FORMAT TIME
========================================= */

function formatTime(
    value
) {

    if (!value) {

        return "";

    }


    const parts =
        String(
            value
        ).split(":");


    if (
        parts.length < 2
    ) {

        return value;

    }


    let hour =
        parseInt(
            parts[0],
            10
        );


    const minute =
        parts[1];


    if (
        Number.isNaN(hour)
    ) {

        return value;

    }


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {

        hour = 12;

    }


    return `${hour}:${minute} ${suffix}`;

}


/* =========================================
   CAPITALIZE STATUS
========================================= */

function capitalizeStatus(
    status
) {

    if (!status) {

        return "";

    }


    const text =
        String(
            status
        );


    return text.charAt(0).toUpperCase() +
        text.slice(1);

}


/* =========================================
   DASHBOARD ERROR
========================================= */

function showDashboardError(
    message
) {

    console.error(
        message
    );


    if (totalMeetings) {

        totalMeetings.textContent =
            "--";

    }


    if (totalMembers) {

        totalMembers.textContent =
            "--";

    }


    if (attendanceRate) {

        attendanceRate.textContent =
            "--";

    }


    if (upcomingMeeting) {

        upcomingMeeting.innerHTML = `

            <div class="meeting-icon">
                !
            </div>

            <div class="meeting-info">

                <strong>
                    Unable to load dashboard
                </strong>

                <span>
                    ${escapeHtml(message)}
                </span>

            </div>

        `;

    }


    if (meetingsTable) {

        meetingsTable.innerHTML = "";

    }


    if (noMeetings) {

        noMeetings.style.display =
            "block";

        noMeetings.textContent =
            "Unable to load meetings.";

    }

}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

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


            sessionStorage.removeItem(
                "officerLoggedIn"
            );


            sessionStorage.removeItem(
                "officerId"
            );


            sessionStorage.removeItem(
                "officerName"
            );


            sessionStorage.removeItem(
                "officerRole"
            );


            sessionStorage.removeItem(
                "officerStatus"
            );


            sessionStorage.removeItem(
                "officerOrganizationId"
            );


            sessionStorage.removeItem(
                "officerOrganization"
            );


            sessionStorage.removeItem(
                "officerClubRole"
            );


            window.location.href =
                "officer-login.html";

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
   NAVIGATION
========================================= */

const navigationLinks =
    document.querySelectorAll(
        ".nav-item"
    );


navigationLinks.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function () {

                closeSidebar();

            }
        );

    }
);


/* =========================================
   HELPERS
========================================= */

function getFirstName(
    name
) {

    if (!name) {

        return "Officer";

    }


    return String(
        name
    )
    .trim()
    .split(/\s+/)[0];

}


function getInitials(
    name
) {

    if (!name) {

        return "OF";

    }


    const parts =
        String(
            name
        )
        .trim()
        .split(/\s+/);


    if (
        parts.length === 1
    ) {

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


function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}


/* =========================================
   START
========================================= */

loadDashboard();