/* =========================================
   DOMINEXUS STUDENT MEETINGS

   ========================================= */


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
   GET CURRENT STUDENT
========================================= */

function getCurrentStudent() {

    const studentId =
        sessionStorage.getItem(
            "studentId"
        );


    const students =
        JSON.parse(
            localStorage.getItem(
                "dominexus_students"
            ) || "[]"
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
            sessionStorage.getItem(
                "studentId"
            );


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
   LOAD MEETINGS
========================================= */

function loadMeetings() {

    const meetings =
        JSON.parse(
            localStorage.getItem(
                "dominexus_meetings"
            ) || "[]"
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


    meetings.forEach(function (meeting) {

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


        if (meetingDate >= today) {

            upcoming.push(meeting);

        } else {

            previous.push(meeting);

        }

    });


    /* Newest/soonest first */

    upcoming.sort(function (a, b) {

        return (
            getMeetingDate(a) -
            getMeetingDate(b)
        );

    });


    previous.sort(function (a, b) {

        return (
            getMeetingDate(b) -
            getMeetingDate(a)
        );

    });


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


    meetings.forEach(function (meeting) {

        const card =
            createMeetingCard(
                meeting,
                type
            );


        container.appendChild(card);

    });

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
        meeting.meetingName ||
        meeting.name ||
        "Organization Meeting";


    const organization =
        meeting.organization ||
        "Student Organization";


    const location =
        meeting.location ||
        meeting.venue ||
        "TBA";


    const startTime =
        meeting.startTime ||
        meeting.time ||
        meeting.timeIn ||
        "TBA";


    const endTime =
        meeting.endTime ||
        "";


    const status =
        meeting.status ||
        (
            type === "upcoming"
                ? "Upcoming"
                : "Completed"
        );


    const attendance =
        getStudentAttendance(
            meeting
        );


    let attendanceText = "";


    if (type === "previous") {

        if (attendance) {

            attendanceText =
                "Your attendance: " +
                attendance;

        } else {

            attendanceText =
                "Attendance: No record";

        }

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
                    ${endTime
            ? " - " + escapeHTML(endTime)
            : ""}
                </span>

                <span>
                    📍 ${escapeHTML(location)}
                </span>

            </div>

        </div>


        <div class="meeting-status">

            <span class="status-badge ${getStatusClass(status)}">
                ${escapeHTML(status)}
            </span>

            ${attendanceText
            ? `<span class="attendance-status">
                        ${escapeHTML(attendanceText)}
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

    const value =
        meeting.date ||
        meeting.meetingDate ||
        meeting.startDate;


    if (!value) {
        return null;
    }


    const date =
        new Date(value);


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
   GET STUDENT ATTENDANCE
========================================= */

function getStudentAttendance(meeting) {

    const student =
        getCurrentStudent();


    if (!student) {
        return null;
    }


    const attendance =
        JSON.parse(
            localStorage.getItem(
                "dominexus_attendance"
            ) || "[]"
        );


    const meetingId =
        meeting.id ||
        meeting.meetingId;


    const record =
        attendance.find(
            function (item) {

                const sameStudent =
                    (
                        item.studentId ===
                        student.studentId
                    )
                    ||
                    (
                        item.uniqueId ===
                        student.uniqueId
                    );


                const sameMeeting =
                    (
                        meetingId &&
                        (
                            item.meetingId ===
                            meetingId
                        )
                    )
                    ||
                    (
                        item.meetingName ===
                        (
                            meeting.title ||
                            meeting.meetingName ||
                            meeting.name
                        )
                    );


                return (
                    sameStudent &&
                    sameMeeting
                );

            }
        );


    return record
        ? record.status || "Recorded"
        : null;

}


/* =========================================
   STATUS CLASS
========================================= */

function getStatusClass(status) {

    const normalized =
        String(status)
            .toLowerCase();


    if (
        normalized.includes("cancel")
    ) {

        return "status-cancelled";

    }


    if (
        normalized.includes("complete") ||
        normalized.includes("finished")
    ) {

        return "status-completed";

    }


    return "status-upcoming";

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