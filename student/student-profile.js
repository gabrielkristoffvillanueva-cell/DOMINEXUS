/* =========================================================
   DOMINEXUS — STUDENT PROFILE
   LARAVEL / MYSQL CONNECTED
========================================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


/* =========================================================
   AUTH CHECK
========================================================= */

if (
    sessionStorage.getItem(
        "studentLoggedIn"
    ) !== "true"
) {

    window.location.href =
        "student-login.html";

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupNavigation();

        setupLogout();

        await loadProfile();

    }
);


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile() {

    const studentId =
        sessionStorage.getItem(
            "studentId"
        );


    if (!studentId) {

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


        const data =
            await response.json();


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


        console.log(
            "Student profile:",
            student
        );


        displayProfile(
            student
        );


        /*
         * Keep the session data synchronized
         * with the database.
         */

        saveStudentSession(
            student
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        showProfileError(
            error.message
        );

    }

}


/* =========================================================
   DISPLAY PROFILE
========================================================= */

function displayProfile(
    student
) {

    const name =
        student.name ||
        "Student";


    const studentId =
        student.student_id ||
        "—";


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
     * Organization
     */

    let organization =
        "—";


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
     * Fallback to organization ID.
     */

    if (
        organization === "—" &&
        student.organization_id !== null &&
        student.organization_id !== undefined
    ) {

        organization =
            `Organization #${student.organization_id}`;

    }


    /*
     * Account status
     */

    const accountStatus =
        student.status ||
        "Active";


    /* =====================================================
       TOPBAR
    ===================================================== */

    setText(
        "topStudentName",
        name
    );


    setText(
        "topStudentId",
        studentId
    );


    setText(
        "topAvatar",
        getInitials(name)
    );


    /* =====================================================
       PROFILE HEADER
    ===================================================== */

    setText(
        "profileAvatar",
        getInitials(name)
    );


    setText(
        "profileName",
        name
    );


    setText(
        "profileRole",
        clubRole
    );


    setText(
        "profileUniqueId",
        uniqueId
    );


    /* =====================================================
       PERSONAL INFORMATION
    ===================================================== */

    setText(
        "fullName",
        name
    );


    setText(
        "studentId",
        studentId
    );


    setText(
        "uniqueId",
        uniqueId
    );


    setText(
        "section",
        section
    );


    setText(
        "organization",
        organization
    );


    setText(
        "clubRole",
        clubRole
    );


    /* =====================================================
       ACCOUNT INFORMATION
    ===================================================== */

    setText(
        "accountType",
        accountType
    );


    /*
     * Update the account status if the HTML
     * contains elements for it.
     */

    updateAccountStatus(
        accountStatus
    );


    console.log(
        "Student profile loaded successfully."
    );

}


/* =========================================================
   SAVE STUDENT SESSION
========================================================= */

function saveStudentSession(
    student
) {

    if (!student) {
        return;
    }


    if (student.name) {

        sessionStorage.setItem(
            "studentName",
            student.name
        );

    }


    if (student.student_id) {

        sessionStorage.setItem(
            "studentId",
            student.student_id
        );

    }


    if (
        student.organization_id !== null &&
        student.organization_id !== undefined
    ) {

        sessionStorage.setItem(
            "studentOrganizationId",
            student.organization_id
        );

    }


    if (student.section) {

        sessionStorage.setItem(
            "studentSection",
            student.section
        );

    }


    if (student.unique_id) {

        sessionStorage.setItem(
            "studentUniqueId",
            student.unique_id
        );

    }


    if (student.club_role) {

        sessionStorage.setItem(
            "studentClubRole",
            student.club_role
        );

    }

}


/* =========================================================
   SET TEXT SAFELY
========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        value ?? "—";

}


/* =========================================================
   ACCOUNT STATUS
========================================================= */

function updateAccountStatus(
    status
) {

    const normalized =
        String(
            status || "Active"
        ).toLowerCase();


    const active =
        normalized === "active";


    /*
     * Find the account status elements
     * without changing the existing HTML.
     */

    const accountRows =
        document.querySelectorAll(
            ".account-row"
        );


    if (
        accountRows.length === 0
    ) {

        return;

    }


    const statusRow =
        accountRows[0];


    const strong =
        statusRow.querySelector(
            "strong"
        );


    const badge =
        statusRow.querySelector(
            ".account-badge"
        );


    if (strong) {

        strong.textContent =
            capitalize(status);

    }


    if (badge) {

        badge.textContent =
            capitalize(status);


        badge.classList.toggle(
            "inactive",
            !active
        );

    }

}


/* =========================================================
   PROFILE ERROR
========================================================= */

function showProfileError(
    message
) {

    console.error(
        "Profile error:",
        message
    );


    /*
     * Keep the page visible instead of
     * redirecting immediately.
     */

    setText(
        "profileName",
        "Unable to load profile"
    );


    setText(
        "profileRole",
        "Please refresh the page"
    );


    setText(
        "profileUniqueId",
        "—"
    );

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
    );

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

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


/* =========================================================
   CAPITALIZE
========================================================= */

function capitalize(
    value
) {

    if (!value) {

        return "";

    }


    const text =
        String(value);


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}