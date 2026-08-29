/* =========================================================
   DOMINEXUS — STUDENT PROFILE
   LARAVEL / MYSQL VERSION
========================================================= */

const API_BASE = "http://127.0.0.1:8000/api";


/* =========================================================
   AUTH CHECK
========================================================= */

if (
    sessionStorage.getItem("studentLoggedIn") !== "true"
) {
    window.location.href = "student-login.html";
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfile();

        setupNavigation();

        setupLogout();

    }
);


/* =========================================================
   LOAD PROFILE FROM LARAVEL
========================================================= */

async function loadProfile() {

    const studentId =
        sessionStorage.getItem("studentId");


    if (!studentId) {

        alert(
            "Student session is missing. Please log in again."
        );

        sessionStorage.clear();

        window.location.href =
            "student-login.html";

        return;

    }


    try {

        console.log(
            "Loading student profile:",
            studentId
        );


        const response =
            await fetch(
                `${API_BASE}/students/by-student-id/${encodeURIComponent(studentId)}`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        let data = {};


        try {

            data =
                await response.json();

        } catch (error) {

            console.warn(
                "Server did not return JSON."
            );

        }


        console.log(
            "Profile API response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load your profile."
            );

        }


        const student =
            data.student ||
            data.data ||
            data;


        /* =================================================
           STUDENT DATA
        ================================================= */

        const name =
            student.name ||
            "Student";


        const actualStudentId =
            student.student_id ||
            studentId;


        const uniqueId =
            student.unique_id ||
            "—";


        const section =
            student.section ||
            "—";


        const clubRole =
            student.club_role ||
            student.role ||
            "Member";


        const accountType =
            "Student";


        /*
         * Organization can be returned as:
         *
         * student.organization.name
         *
         * or organization_id
         */

        let organization = "—";


        if (
            student.organization &&
            typeof student.organization === "object"
        ) {

            organization =
                student.organization.name ||
                student.organization.organization_name ||
                "—";

        }


        /*
         * Fallback if backend only returns organization_id.
         */

        if (
            organization === "—" &&
            student.organization_id
        ) {

            organization =
                `Organization #${student.organization_id}`;

        }


        /* =================================================
           TOPBAR
        ================================================= */

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


        if (topStudentName) {

            topStudentName.textContent =
                name;

        }


        if (topStudentId) {

            topStudentId.textContent =
                actualStudentId;

        }


        if (topAvatar) {

            topAvatar.textContent =
                getInitials(name);

        }


        /* =================================================
           PROFILE HEADER
        ================================================= */

        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );


        const profileName =
            document.getElementById(
                "profileName"
            );


        const profileRole =
            document.getElementById(
                "profileRole"
            );


        const profileUniqueId =
            document.getElementById(
                "profileUniqueId"
            );


        if (profileAvatar) {

            profileAvatar.textContent =
                getInitials(name);

        }


        if (profileName) {

            profileName.textContent =
                name;

        }


        if (profileRole) {

            profileRole.textContent =
                clubRole;

        }


        if (profileUniqueId) {

            profileUniqueId.textContent =
                uniqueId;

        }


        /* =================================================
           PERSONAL INFORMATION
        ================================================= */

        const fullNameElement =
            document.getElementById(
                "fullName"
            );


        const studentIdElement =
            document.getElementById(
                "studentId"
            );


        const uniqueIdElement =
            document.getElementById(
                "uniqueId"
            );


        const sectionElement =
            document.getElementById(
                "section"
            );


        const organizationElement =
            document.getElementById(
                "organization"
            );


        const clubRoleElement =
            document.getElementById(
                "clubRole"
            );


        if (fullNameElement) {

            fullNameElement.textContent =
                name;

        }


        if (studentIdElement) {

            studentIdElement.textContent =
                actualStudentId;

        }


        if (uniqueIdElement) {

            uniqueIdElement.textContent =
                uniqueId;

        }


        if (sectionElement) {

            sectionElement.textContent =
                section;

        }


        if (organizationElement) {

            organizationElement.textContent =
                organization;

        }


        if (clubRoleElement) {

            clubRoleElement.textContent =
                clubRole;

        }


        /* =================================================
           ACCOUNT INFORMATION
        ================================================= */

        const accountTypeElement =
            document.getElementById(
                "accountType"
            );


        if (accountTypeElement) {

            accountTypeElement.textContent =
                accountType;

        }


        console.log(
            "Student profile loaded successfully."
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        alert(
            "Unable to load your profile.\n\n" +
            error.message
        );

    }

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
        closeSidebar
    );


    document
        .querySelectorAll(".nav-item")
        .forEach(function (link) {

            link.addEventListener(
                "click",
                closeSidebar
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