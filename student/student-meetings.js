/* =========================================
   DOMINEXUS — STUDENT MEETINGS
   Laravel / MySQL Connected
========================================= */

const API_URL = "http://127.0.0.1:8000/api";

let currentStudent = null;


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", async function () {

    if (!checkStudentLogin()) {
        return;
    }

    setupNavigation();
    setupLogout();

    await loadStudentInformation();
    await loadMeetings();

});


/* =========================================
   LOGIN CHECK
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
   LOAD STUDENT INFORMATION
========================================= */

async function loadStudentInformation() {

    const studentId =
        sessionStorage.getItem("studentId");

    if (!studentId) {

        window.location.href =
            "student-login.html";

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/students/by-student-id/${encodeURIComponent(studentId)}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load student information."
            );
        }


        currentStudent =
            data.student ||
            data.data ||
            data;


        const name =
            currentStudent.name ||
            "Student";


        const actualStudentId =
            currentStudent.student_id ||
            studentId;


        /* =====================================
           UPDATE TOPBAR
        ===================================== */

        const nameElement =
            document.getElementById("topStudentName");


        const idElement =
            document.getElementById("topStudentId");


        const avatarElement =
            document.getElementById("topAvatar");


        if (nameElement) {

            nameElement.textContent =
                name;

        }


        if (idElement) {

            idElement.textContent =
                actualStudentId;

        }


        if (avatarElement) {

            avatarElement.textContent =
                getInitials(name);

        }


        /* =====================================
           SAVE STUDENT DATA
        ===================================== */

        sessionStorage.setItem(
            "studentName",
            name
        );


        sessionStorage.setItem(
            "studentId",
            actualStudentId
        );


        if (
            currentStudent.organization_id !== null &&
            currentStudent.organization_id !== undefined
        ) {

            sessionStorage.setItem(
                "studentOrganizationId",
                currentStudent.organization_id
            );

        }


        if (currentStudent.section) {

            sessionStorage.setItem(
                "studentSection",
                currentStudent.section
            );

        }


        if (currentStudent.unique_id) {

            sessionStorage.setItem(
                "studentUniqueId",
                currentStudent.unique_id
            );

        }


        if (currentStudent.club_role) {

            sessionStorage.setItem(
                "studentClubRole",
                currentStudent.club_role
            );

        }


        console.log(
            "Current student:",
            currentStudent
        );


        console.log(
            "Student organization ID:",
            currentStudent.organization_id
        );


    } catch (error) {

        console.error(
            "Student information error:",
            error
        );


        showPageError(
            "Unable to load your student information."
        );

    }

}


/* =========================================
   LOAD MEETINGS
========================================= */

async function loadMeetings() {

    try {

        const response = await fetch(
            `${API_URL}/meetings`,
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
                "Failed to load meetings."
            );

        }


        const meetings =
            Array.isArray(data)
                ? data
                : data.data ||
                  data.meetings ||
                  [];


        console.log(
            "All meetings:",
            meetings
        );


        /*
         * Get the student's organization.
         * Prefer the value directly loaded
         * from Laravel.
         */

        const studentOrganizationId =
            currentStudent
                ? currentStudent.organization_id
                : sessionStorage.getItem(
                    "studentOrganizationId"
                );


        console.log(
            "Filtering meetings for organization:",
            studentOrganizationId
        );


        /*
         * Filter meetings by organization.
         */

        let organizationMeetings =
            meetings;


        if (
            studentOrganizationId !== null &&
            studentOrganizationId !== undefined &&
            studentOrganizationId !== ""
        ) {

            organizationMeetings =
                meetings.filter(
                    function (meeting) {

                        return String(
                            meeting.organization_id
                        ) === String(
                            studentOrganizationId
                        );

                    }
                );

        }


        console.log(
            "Student organization meetings:",
            organizationMeetings
        );


        /* =====================================
           SEPARATE UPCOMING / PREVIOUS
        ===================================== */

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
                    getMeetingDate(
                        meeting
                    );


                if (!meetingDate) {
                    return;
                }


                const comparisonDate =
                    new Date(
                        meetingDate.getTime()
                    );


                comparisonDate.setHours(
                    0,
                    0,
                    0,
                    0
                );


                const status =
                    String(
                        meeting.status ||
                        ""
                    ).toLowerCase();


                /*
                 * Upcoming meetings
                 */

                if (
                    comparisonDate >= today &&
                    status !== "cancelled"
                ) {

                    upcoming.push(
                        meeting
                    );

                }

                /*
                 * Previous meetings
                 */

                else {

                    previous.push(
                        meeting
                    );

                }

            }
        );


        /*
         * Upcoming:
         * earliest first
         */

        upcoming.sort(
            function (a, b) {

                return (
                    getMeetingDate(a) -
                    getMeetingDate(b)
                );

            }
        );


        /*
         * Previous:
         * newest first
         */

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
   GET MEETING DATE
========================================= */

function getMeetingDate(meeting) {

    if (
        !meeting ||
        !meeting.date
    ) {

        return null;

    }


    /*
     * Laravel returns dates like:
     *
     * 2026-09-01T00:00:00.000000Z
     *
     * JavaScript can parse this directly.
     */

    const date =
        new Date(
            meeting.date
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

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


    if (
        !container ||
        !emptyState
    ) {

        return;

    }


    container.innerHTML = "";


    if (
        !Array.isArray(meetings) ||
        meetings.length === 0
    ) {

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
        getMeetingDate(
            meeting
        );


    const dateInfo =
        formatDateParts(
            date
        );


    const meetingName =
        meeting.title ||
        "Organization Meeting";


    let organization =
        "Student Organization";


    if (
        meeting.organization &&
        typeof meeting.organization === "object"
    ) {

        organization =
            meeting.organization.name ||
            "Student Organization";

    }


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


    let attendanceText =
        "";


    if (
        type === "previous"
    ) {

        attendanceText =
            "Previous meeting";

    }


    card.innerHTML = `

        <div class="date-box">

            <span class="month">
                ${escapeHTML(
                    dateInfo.month
                )}
            </span>

            <span class="day">
                ${escapeHTML(
                    dateInfo.day
                )}
            </span>

            <span class="year">
                ${escapeHTML(
                    dateInfo.year
                )}
            </span>

        </div>


        <div class="meeting-info">

            <h4>
                ${escapeHTML(
                    meetingName
                )}
            </h4>


            <p>
                ${escapeHTML(
                    organization
                )}
            </p>


            <div class="meeting-meta">

                <span>
                    🕐
                    ${escapeHTML(
                        startTime
                    )}

                    ${
                        endTime
                            ? " - " +
                              escapeHTML(
                                  endTime
                              )
                            : ""
                    }

                </span>


                <span>
                    📍
                    ${escapeHTML(
                        location
                    )}
                </span>

            </div>

        </div>


        <div class="meeting-status">

            <span
                class="status-badge ${getStatusClass(
                    meeting.status
                )}">

                ${escapeHTML(
                    status
                )}

            </span>


            ${
                attendanceText
                    ? `
                        <span
                            class="attendance-status">

                            ${escapeHTML(
                                attendanceText
                            )}

                        </span>
                    `
                    : ""
            }

        </div>

    `;


    return card;

}


/* =========================================
   DATE FORMAT
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
   TIME FORMAT
========================================= */

function formatTime(time) {

    if (!time) {

        return "";

    }


    const parts =
        String(
            time
        ).split(":");


    if (
        parts.length < 2
    ) {

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
   STATUS
========================================= */

function formatStatus(status) {

    if (!status) {

        return "Upcoming";

    }


    return (
        status.charAt(0).toUpperCase() +
        status.slice(1)
    );

}


function getStatusClass(status) {

    const normalized =
        String(
            status || ""
        ).toLowerCase();


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
   PAGE ERROR
========================================= */

function showPageError(message) {

    const upcomingEmpty =
        document.getElementById(
            "upcomingEmpty"
        );


    if (!upcomingEmpty) {
        return;
    }


    upcomingEmpty.style.display =
        "block";


    const text =
        upcomingEmpty.querySelector(
            "p"
        );


    if (text) {

        text.textContent =
            message;

    }

}


/* =========================================
   MEETING ERROR
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


    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

        overlay.classList.remove(
            "show"
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

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

            logoutStudent();

        }
    );

}


function logoutStudent() {

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


/* =========================================
   INITIALS
========================================= */

function getInitials(name) {

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