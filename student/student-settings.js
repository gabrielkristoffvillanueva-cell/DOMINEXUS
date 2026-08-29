/* =========================================
   DOMINEXUS STUDENT SETTINGS
   FRONT-END ONLY
========================================= */


/* =========================================
   SAMPLE STUDENT
========================================= */

const settingsStudent = {

    fullName: "Jaerist Kholean J. Orbita",

    studentId: "SDCA-001"

};


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStudentInformation();

        setupNavigation();

        setupTheme();

        setupNotifications();

        setupLogout();

    }
);


/* =========================================
   STUDENT INFORMATION
========================================= */

function loadStudentInformation() {

    const name =
        settingsStudent.fullName;


    const studentId =
        settingsStudent.studentId;


    document.getElementById(
        "topStudentName"
    ).textContent =
        name;


    document.querySelector(
        ".top-profile-info span"
    ).textContent =
        studentId;


    document.getElementById(
        "topAvatar"
    ).textContent =
        getInitials(name);

}


/* =========================================
   THEME
========================================= */

function setupTheme() {

    const themeSelect =
        document.getElementById(
            "themeSelect"
        );


    themeSelect.addEventListener(
        "change",
        function () {

            if (
                this.value === "dark"
            ) {

                document.body.classList.add(
                    "dark-mode"
                );

                document.getElementById(
                    "themeDescription"
                ).textContent =
                    "Dark mode is currently selected.";

            } else {

                document.body.classList.remove(
                    "dark-mode"
                );

                document.getElementById(
                    "themeDescription"
                ).textContent =
                    "Choose between light and dark mode.";

            }

        }
    );

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


    meeting.addEventListener(
        "change",
        function () {

            showSettingMessage(
                "Meeting reminder preference changed."
            );

        }
    );


    attendance.addEventListener(
        "change",
        function () {

            showSettingMessage(
                "Attendance notification preference changed."
            );

        }
    );


    requests.addEventListener(
        "change",
        function () {

            showSettingMessage(
                "Request notification preference changed."
            );

        }
    );

}


/* =========================================
   TEMPORARY MESSAGE
========================================= */

function showSettingMessage(message) {

    /*
       Front-end only.

       Later this can save the preference
       to the user's account in the database.
    */

    console.log(message);

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

            closeSidebar();

        }
    );


    document.querySelectorAll(
        ".nav-item"
    ).forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                closeSidebar();

            }
        );

    });


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


    sidebarLogout.addEventListener(
        "click",
        logout
    );


    settingsLogout.addEventListener(
        "click",
        logout
    );


    function logout() {

        const confirmed =
            confirm(
                "Are you sure you want to log out?"
            );


        if (!confirmed) {
            return;
        }


        /*
           TEMPORARY FRONT-END LOGOUT.

           Backend authentication will be
           connected later.
        */


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