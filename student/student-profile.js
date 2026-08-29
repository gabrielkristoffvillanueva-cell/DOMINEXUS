/* =========================================
   DOMINEXUS STUDENT PROFILE
   FRONT-END VERSION
========================================= */


/* =========================================
   SAMPLE STUDENT DATA
========================================= */

const profileStudent = {

    fullName: "Juan Dela Cruz",

    studentId: "SDCA-0001",

    uniqueId: "SDCA-0001",

    section: "11 TVL CP",

    organization: "Student Organization",

    clubRole: "Member",

    accountType: "Student"

};


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfile();

        setupNavigation();

        setupLogout();

    }
);


/* =========================================
   LOAD PROFILE
========================================= */

function loadProfile() {

    const student =
        getStudentData();


    const name =
        student.fullName ||
        "Student Name";


    const studentId =
        student.studentId ||
        "—";


    const uniqueId =
        student.uniqueId ||
        studentId;


    const section =
        student.section ||
        "—";


    const organization =
        student.organization ||
        "—";


    const role =
        student.clubRole ||
        student.role ||
        "Member";


    const accountType =
        student.accountType ||
        "Student";


    /* TOPBAR */

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


    /* PROFILE HEADER */

    document.getElementById(
        "profileAvatar"
    ).textContent =
        getInitials(name);


    document.getElementById(
        "profileName"
    ).textContent =
        name;


    document.getElementById(
        "profileRole"
    ).textContent =
        role;


    document.getElementById(
        "profileUniqueId"
    ).textContent =
        uniqueId;


    /* PERSONAL INFORMATION */

    document.getElementById(
        "fullName"
    ).textContent =
        name;


    document.getElementById(
        "studentId"
    ).textContent =
        studentId;


    document.getElementById(
        "uniqueId"
    ).textContent =
        uniqueId;


    document.getElementById(
        "section"
    ).textContent =
        section;


    document.getElementById(
        "organization"
    ).textContent =
        organization;


    document.getElementById(
        "clubRole"
    ).textContent =
        role;


    /* ACCOUNT */

    document.getElementById(
        "accountType"
    ).textContent =
        accountType;

}


/* =========================================
   FRONT-END STUDENT DATA
========================================= */

function getStudentData() {

    /*
       FRONT-END ONLY

       For now, this uses sample data.

       Later, this can be replaced with
       database information.
    */


    return profileStudent;

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


    if (!menuButton) {
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


            /*
               TEMPORARY FRONT-END LOGOUT

               This does not handle the backend.
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
    );

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