/* =========================================================
   DOMINEXUS — STUDENT SETTINGS
   Laravel / MySQL Connected
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

        setupPasswordChange();

        setupPasswordVisibility();

        setupNotifications();

        await loadStudentInformation();

    }
);


/* =========================================================
   LOAD STUDENT
========================================================= */

async function loadStudentInformation() {

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
                "Unable to load student information."
            );

        }


        const student =
            data.student ||
            data.data ||
            data;


        const name =
            student.name ||
            "Student";


        const actualStudentId =
            student.student_id ||
            studentId;


        /* =====================================
           TOPBAR
        ===================================== */

        const nameElement =
            document.getElementById(
                "topStudentName"
            );


        const idElement =
            document.querySelector(
                ".top-profile-info span"
            );


        const avatarElement =
            document.getElementById(
                "topAvatar"
            );


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
           KEEP SESSION UPDATED
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


        console.log(
            "Settings student:",
            student
        );


    } catch (error) {

        console.error(
            "Student information error:",
            error
        );

    }

}


/* =========================================================
   PASSWORD CHANGE
========================================================= */

function setupPasswordChange() {

    const openButton =
        document.getElementById(
            "changePasswordButton"
        );


    const modal =
        document.getElementById(
            "passwordModal"
        );


    const closeButton =
        document.getElementById(
            "closePasswordModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelPasswordButton"
        );


    const overlay =
        document.getElementById(
            "passwordModalOverlay"
        );


    const form =
        document.getElementById(
            "changePasswordForm"
        );


    if (
        !openButton ||
        !modal ||
        !form
    ) {

        return;

    }


    openButton.addEventListener(
        "click",
        function () {

            openPasswordModal();

        }
    );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePasswordModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closePasswordModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closePasswordModal
        );

    }


    form.addEventListener(
        "submit",
        changePassword
    );

}


/* =========================================================
   OPEN PASSWORD MODAL
========================================================= */

function openPasswordModal() {

    const modal =
        document.getElementById(
            "passwordModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );


    const currentPassword =
        document.getElementById(
            "currentPassword"
        );


    if (currentPassword) {

        setTimeout(
            function () {

                currentPassword.focus();

            },
            100
        );

    }

}


/* =========================================================
   CLOSE PASSWORD MODAL
========================================================= */

function closePasswordModal() {

    const modal =
        document.getElementById(
            "passwordModal"
        );


    const form =
        document.getElementById(
            "changePasswordForm"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );


    if (form) {

        form.reset();

    }


    showPasswordMessage(
        "",
        ""
    );

}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

async function changePassword(
    event
) {

    event.preventDefault();


    const studentId =
        sessionStorage.getItem(
            "studentId"
        );


    const currentPassword =
        document.getElementById(
            "currentPassword"
        )?.value;


    const newPassword =
        document.getElementById(
            "newPassword"
        )?.value;


    const confirmPassword =
        document.getElementById(
            "confirmNewPassword"
        )?.value;


    const saveButton =
        document.getElementById(
            "savePasswordButton"
        );


    /* =====================================
       VALIDATION
    ===================================== */

    if (!studentId) {

        showPasswordMessage(
            "Your student session has expired. Please log in again.",
            "error"
        );

        return;

    }


    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        showPasswordMessage(
            "Please complete all password fields.",
            "error"
        );

        return;

    }


    if (
        newPassword.length < 6
    ) {

        showPasswordMessage(
            "New password must be at least 6 characters.",
            "error"
        );

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showPasswordMessage(
            "New passwords do not match.",
            "error"
        );

        return;

    }


    if (
        currentPassword ===
        newPassword
    ) {

        showPasswordMessage(
            "Your new password must be different from your current password.",
            "error"
        );

        return;

    }


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Changing...";

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/change-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({

                        student_id:
                            studentId,

                        current_password:
                            currentPassword,

                        new_password:
                            newPassword

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (
                data.errors
            ) {

                const messages =
                    Object.values(
                        data.errors
                    )
                    .flat()
                    .join("\n");


                throw new Error(
                    messages
                );

            }


            throw new Error(
                data.message ||
                "Unable to change password."
            );

        }


        showPasswordMessage(
            "Password changed successfully.",
            "success"
        );


        /*
         * Close after a short delay so the
         * student can see the success message.
         */

        setTimeout(
            function () {

                closePasswordModal();

            },
            1200
        );


    } catch (error) {

        console.error(
            "Password change error:",
            error
        );


        showPasswordMessage(
            error.message ||
            "Unable to change password.",
            "error"
        );

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Change Password";

        }

    }

}


/* =========================================================
   PASSWORD MESSAGE
========================================================= */

function showPasswordMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "passwordMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "password-message";


    if (type === "success") {

        element.classList.add(
            "success"
        );

    }


    if (type === "error") {

        element.classList.add(
            "error"
        );

    }

}


/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

function setupPasswordVisibility() {

    document
        .querySelectorAll(
            ".password-show-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const targetId =
                            this.dataset.target;


                        const input =
                            document.getElementById(
                                targetId
                            );


                        if (!input) {
                            return;
                        }


                        if (
                            input.type ===
                            "password"
                        ) {

                            input.type =
                                "text";

                            this.textContent =
                                "Hide";

                        } else {

                            input.type =
                                "password";

                            this.textContent =
                                "Show";

                        }

                    }
                );

            }
        );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function setupNotifications() {

    const notificationIds = [

        "meetingNotifications",

        "attendanceNotifications",

        "requestNotifications"

    ];


    notificationIds.forEach(
        function (id) {

            const checkbox =
                document.getElementById(
                    id
                );


            if (!checkbox) {
                return;
            }


            checkbox.addEventListener(
                "change",
                function () {

                    console.log(
                        id +
                        " changed:",
                        this.checked
                    );

                }
            );

        }
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

    const logoutButtons = [

        document.getElementById(
            "logoutButton"
        ),

        document.getElementById(
            "logoutSettingsButton"
        )

    ];


    logoutButtons.forEach(
        function (button) {

            if (!button) {
                return;
            }


            button.addEventListener(
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