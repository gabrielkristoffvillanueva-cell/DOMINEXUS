/* =========================================
   DOMINEXUS OFFICER DASHBOARD
========================================= */


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
   OFFICER INFORMATION
========================================= */

const officerId =
    sessionStorage.getItem(
        "officerId"
    ) || "OFF-0001";


const officerName =
    sessionStorage.getItem(
        "officerName"
    ) || "Demo Officer";


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
        getFirstName(officerName);

}


if (topOfficerName) {

    topOfficerName.textContent =
        officerName;

}


if (topOfficerId) {

    topOfficerId.textContent =
        officerId;

}


if (topAvatar) {

    topAvatar.textContent =
        getInitials(officerName);

}


/* =========================================
   GET DATA
========================================= */

const meetings =
    JSON.parse(
        localStorage.getItem(
            "dominexus_meetings"
        ) || "[]"
    );


const members =
    JSON.parse(
        localStorage.getItem(
            "dominexus_students"
        ) || "[]"
    );


const attendance =
    JSON.parse(
        localStorage.getItem(
            "dominexus_attendance"
        ) || "[]"
    );


/* =========================================
   UPDATE SUMMARY
========================================= */

function updateSummary() {

    if (totalMeetings) {

        totalMeetings.textContent =
            meetings.length;

    }


    if (totalMembers) {

        totalMembers.textContent =
            members.length;

    }


    let rate = 0;


    if (attendance.length > 0) {

        const present =
            attendance.filter(record => {

                const status =
                    (
                        record.status ||
                        ""
                    ).toLowerCase();


                return (
                    status === "present" ||
                    status === "late"
                );

            }).length;


        rate =
            Math.round(
                (present /
                attendance.length) *
                100
            );

    }


    if (attendanceRate) {

        attendanceRate.textContent =
            rate + "%";

    }

}


/* =========================================
   DISPLAY RECENT MEETINGS
========================================= */

function displayMeetings() {

    if (!meetingsTable) {
        return;
    }


    meetingsTable.innerHTML = "";


    if (meetings.length === 0) {

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


    const sortedMeetings =
        [...meetings].sort(
            (a, b) => {

                return new Date(
                    b.date || 0
                ) -
                new Date(
                    a.date || 0
                );

            }
        );


    sortedMeetings
        .slice(0, 5)
        .forEach(meeting => {

            const row =
                document.createElement(
                    "tr"
                );


            const meetingCell =
                document.createElement(
                    "td"
                );


            meetingCell.textContent =
                meeting.title ||
                meeting.meetingName ||
                meeting.name ||
                "Organization Meeting";


            const dateCell =
                document.createElement(
                    "td"
                );


            dateCell.textContent =
                meeting.date ||
                "--";


            const timeCell =
                document.createElement(
                    "td"
                );


            timeCell.textContent =
                meeting.time ||
                "--";


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
                "Upcoming";


            status.textContent =
                meetingStatus;


            const normalizedStatus =
                meetingStatus.toLowerCase();


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

            else {

                status.className =
                    "meeting-status status-upcoming";

            }


            statusCell.appendChild(
                status
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


            meetingsTable.appendChild(
                row
            );

        });

}


/* =========================================
   INITIALIZE
========================================= */

updateSummary();

displayMeetings();


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
                "officerLoggedIn"
            );


            sessionStorage.removeItem(
                "officerId"
            );


            sessionStorage.removeItem(
                "officerName"
            );


            sessionStorage.removeItem(
                "officerOrganization"
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
   NAVIGATION
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
   HELPERS
========================================= */

function getFirstName(name) {

    if (!name) {
        return "Officer";
    }


    return name
        .trim()
        .split(/\s+/)[0];

}


function getInitials(name) {

    if (!name) {
        return "OF";
    }


    const parts =
        name
            .trim()
            .split(/\s+/);


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