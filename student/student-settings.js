/* =========================================
   DOMINEXUS STUDENT SETTINGS
   DARK MODE + STUDENT SESSION
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    if (!isLoggedIn()) return;

    loadStudentInformation();
    setupNavigation();
    setupTheme();
    setupNotifications();
    setupLogout();

});


/* =========================================
   LOGIN CHECK
========================================= */

function isLoggedIn() {

    if (
        sessionStorage.getItem("studentLoggedIn") !== "true"
    ) {

        window.location.href =
            "student-login.html";

        return false;

    }

    return true;

}


/* =========================================
   STUDENT INFORMATION
========================================= */

function loadStudentInformation() {

    const name =
        sessionStorage.getItem("studentName") ||
        "Student";


    const studentId =
        sessionStorage.getItem("studentId") ||
        "Student ID";


    document.getElementById(
        "topStudentName"
    ).textContent = name;


    document.querySelector(
        ".top-profile-info span"
    ).textContent = studentId;


    document.getElementById(
        "topAvatar"
    ).textContent =
        getInitials(name);

}

/* =========================================
   NOTIFICATIONS
========================================= */

function setupNotifications() {

    const meeting =
        document.getElementById(
            "meetingNotifications"
        );


    const attendance =
        document.getElementById(
            "attendanceNotifications"
        );


    const requests =
        document.getElementById(
            "requestNotifications"
        );


    if (meeting) {

        meeting.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "dominexus_meeting_notifications",
                    this.checked
                );

            }
        );

    }


    if (attendance) {

        attendance.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "dominexus_attendance_notifications",
                    this.checked
                );

            }
        );

    }


    if (requests) {

        requests.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "dominexus_request_notifications",
                    this.checked
                );

            }
        );

    }


    /*
     * Restore notification preferences.
     */

    const savedMeeting =
        localStorage.getItem(
            "dominexus_meeting_notifications"
        );


    const savedAttendance =
        localStorage.getItem(
            "dominexus_attendance_notifications"
        );


    const savedRequests =
        localStorage.getItem(
            "dominexus_request_notifications"
        );


    if (
        meeting &&
        savedMeeting !== null
    ) {

        meeting.checked =
            savedMeeting === "true";

    }


    if (
        attendance &&
        savedAttendance !== null
    ) {

        attendance.checked =
            savedAttendance === "true";

    }


    if (
        requests &&
        savedRequests !== null
    ) {

        requests.checked =
            savedRequests === "true";

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


    document.querySelectorAll(
        ".nav-item"
    ).forEach(
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

    const sidebarLogout =
        document.getElementById(
            "logoutButton"
        );


    const settingsLogout =
        document.getElementById(
            "logoutSettingsButton"
        );


    if (sidebarLogout) {

        sidebarLogout.addEventListener(
            "click",
            logout
        );

    }


    if (settingsLogout) {

        settingsLogout.addEventListener(
            "click",
            logout
        );

    }


    function logout() {

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

}


/* =========================================
   INITIALS
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