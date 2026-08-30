/* =========================================
   DOMINEXUS OFFICER SETTINGS
   Laravel / MySQL Connected
========================================= */


/* =========================================
   API
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
   OFFICER ID
========================================= */

const officerId =
    sessionStorage.getItem(
        "officerId"
    );


if (!officerId) {

    alert(
        "Officer session not found. Please log in again."
    );

    window.location.href =
        "officer-login.html";

}


/* =========================================
   ELEMENTS
========================================= */

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


const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );

const profileName =
    document.getElementById(
        "profileName"
    );

const profileId =
    document.getElementById(
        "profileId"
    );


const officerNameInput =
    document.getElementById(
        "officerNameInput"
    );

const officerIdInput =
    document.getElementById(
        "officerIdInput"
    );

const organizationInput =
    document.getElementById(
        "organizationInput"
    );


const saveProfileButton =
    document.getElementById(
        "saveProfileButton"
    );


const currentPassword =
    document.getElementById(
        "currentPassword"
    );

const newPassword =
    document.getElementById(
        "newPassword"
    );

const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );


const changePasswordButton =
    document.getElementById(
        "changePasswordButton"
    );


const notificationToggle =
    document.getElementById(
        "notificationToggle"
    );

const logoutConfirmToggle =
    document.getElementById(
        "logoutConfirmToggle"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const logoutAllButton =
    document.getElementById(
        "logoutAllButton"
    );


const toast =
    document.getElementById(
        "toast"
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
   OFFICER DATA
========================================= */

let officerData = null;


/* =========================================
   LOAD OFFICER FROM DATABASE
========================================= */

async function loadOfficer() {

    try {

        const response =
            await fetch(
                `${API_BASE}/officer-dashboard?officer_id=${encodeURIComponent(
                    officerId
                )}`,
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
            "DOMINEXUS OFFICER SETTINGS:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load officer information."
            );

        }


        officerData =
            data.officer;


        if (!officerData) {

            throw new Error(
                "Officer information was not returned."
            );

        }


        displayOfficer(
            officerData
        );


    } catch (error) {

        console.error(
            "OFFICER SETTINGS LOAD ERROR:",
            error
        );


        /*
         * Use session data only as a temporary
         * display fallback if the API fails.
         */

        displayOfficer({

            id:
                officerId,

            name:
                sessionStorage.getItem(
                    "officerName"
                ) || "Officer",

            organization:
                sessionStorage.getItem(
                    "officerOrganization"
                ) || ""

        });


        showToast(
            error.message ||
            "Unable to load officer information."
        );

    }

}


/* =========================================
   DISPLAY OFFICER
========================================= */

function displayOfficer(
    officer
) {

    const name =
        officer.name ||
        "Officer";


    const id =
        officer.id ||
        officerId;


    let organization = "";


    if (
        officer.organization
    ) {

        if (
            typeof officer.organization ===
            "object"
        ) {

            organization =
                officer.organization.name ||
                officer.organization.title ||
                "";

        } else {

            organization =
                officer.organization;

        }

    }


    if (
        !organization &&
        officer.organization_name
    ) {

        organization =
            officer.organization_name;

    }


    if (
        !organization
    ) {

        organization =
            sessionStorage.getItem(
                "officerOrganization"
            ) || "";

    }


    /* -----------------------------------------
       TOPBAR
    ----------------------------------------- */

    if (topOfficerName) {

        topOfficerName.textContent =
            name;

    }


    if (topOfficerId) {

        topOfficerId.textContent =
            id;

    }


    /* -----------------------------------------
       PROFILE
    ----------------------------------------- */

    if (profileName) {

        profileName.textContent =
            name;

    }


    if (profileId) {

        profileId.textContent =
            id;

    }


    if (officerNameInput) {

        officerNameInput.value =
            name;

    }


    if (officerIdInput) {

        officerIdInput.value =
            id;

        /*
         * Officer ID comes from database
         * and should not be editable.
         */

        officerIdInput.readOnly =
            true;

    }


    if (organizationInput) {

        organizationInput.value =
            organization;

        /*
         * Officer cannot change
         * organization from Settings.
         */

        organizationInput.readOnly =
            true;

    }


    /* -----------------------------------------
       AVATAR
    ----------------------------------------- */

    const initials =
        getInitials(
            name
        );


    if (topAvatar) {

        topAvatar.textContent =
            initials;

    }


    if (profileAvatar) {

        profileAvatar.textContent =
            initials;

    }

}


/* =========================================
   SAVE PROFILE
========================================= */

if (saveProfileButton) {

    saveProfileButton.addEventListener(
        "click",
        saveProfile
    );

}


async function saveProfile() {

    const newName =
        officerNameInput
            ? officerNameInput.value.trim()
            : "";


    if (!newName) {

        alert(
            "Please enter your full name."
        );

        return;

    }


    saveProfileButton.disabled =
        true;


    saveProfileButton.textContent =
        "Saving...";


    try {

        const response =
            await fetch(
                `${API_BASE}/officer-profile`,
                {
                    method: "PUT",

                    headers: {

                        "Accept":
                            "application/json",

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            officer_id:
                                officerId,

                            name:
                                newName

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "PROFILE UPDATE RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update profile."
            );

        }


        /*
         * Update the current session
         * so other pages immediately
         * show the new officer name.
         */

        sessionStorage.setItem(
            "officerName",
            newName
        );


        if (data.officer) {

            officerData =
                data.officer;

            displayOfficer(
                data.officer
            );

        } else {

            displayOfficer({

                id:
                    officerId,

                name:
                    newName,

                organization:
                    organizationInput
                        ? organizationInput.value
                        : ""

            });

        }


        showToast(
            data.message ||
            "Profile updated successfully."
        );


    } catch (error) {

        console.error(
            "PROFILE UPDATE ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to update profile."
        );


    } finally {

        saveProfileButton.disabled =
            false;

        saveProfileButton.textContent =
            "Save Changes";

    }

}


/* =========================================
   CHANGE PASSWORD
========================================= */

if (changePasswordButton) {

    changePasswordButton.addEventListener(
        "click",
        changeOfficerPassword
    );

}


async function changeOfficerPassword() {

    const current =
        currentPassword
            ? currentPassword.value
            : "";


    const newPass =
        newPassword
            ? newPassword.value
            : "";


    const confirmPass =
        confirmPassword
            ? confirmPassword.value
            : "";


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (
        !current ||
        !newPass ||
        !confirmPass
    ) {

        alert(
            "Please complete all password fields."
        );

        return;

    }


    if (
        newPass.length < 6
    ) {

        alert(
            "New password must be at least 6 characters."
        );

        return;

    }


    if (
        newPass !== confirmPass
    ) {

        alert(
            "New passwords do not match."
        );

        return;

    }


    changePasswordButton.disabled =
        true;


    changePasswordButton.textContent =
        "Changing...";


    try {

        const response =
            await fetch(
                `${API_BASE}/officer-password`,
                {
                    method: "PUT",

                    headers: {

                        "Accept":
                            "application/json",

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            officer_id:
                                officerId,

                            current_password:
                                current,

                            new_password:
                                newPass

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "PASSWORD UPDATE RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to change password."
            );

        }


        /* -----------------------------------------
           CLEAR PASSWORD FIELDS
        ----------------------------------------- */

        if (currentPassword) {

            currentPassword.value =
                "";

        }


        if (newPassword) {

            newPassword.value =
                "";

        }


        if (confirmPassword) {

            confirmPassword.value =
                "";

        }


        showToast(
            data.message ||
            "Password changed successfully."
        );


    } catch (error) {

        console.error(
            "PASSWORD UPDATE ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to change password."
        );


    } finally {

        changePasswordButton.disabled =
            false;

        changePasswordButton.textContent =
            "Change Password";

    }

}


/* =========================================
   SAVE PREFERENCES
========================================= */

if (notificationToggle) {

    notificationToggle.addEventListener(
        "change",
        savePreferences
    );

}


if (logoutConfirmToggle) {

    logoutConfirmToggle.addEventListener(
        "change",
        savePreferences
    );

}


function savePreferences() {

    const preferences = {

        notifications:
            notificationToggle
                ? notificationToggle.checked
                : true,

        logoutConfirmation:
            logoutConfirmToggle
                ? logoutConfirmToggle.checked
                : true

    };


    localStorage.setItem(
        "dominexus_officer_preferences",
        JSON.stringify(
            preferences
        )
    );

}


/* =========================================
   LOAD PREFERENCES
========================================= */

function loadPreferences() {

    let saved = null;


    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    "dominexus_officer_preferences"
                ) || "null"
            );

    } catch (error) {

        console.error(
            "Preferences error:",
            error
        );

    }


    if (!saved) {

        return;

    }


    if (
        notificationToggle &&
        typeof saved.notifications ===
        "boolean"
    ) {

        notificationToggle.checked =
            saved.notifications;

    }


    if (
        logoutConfirmToggle &&
        typeof saved.logoutConfirmation ===
        "boolean"
    ) {

        logoutConfirmToggle.checked =
            saved.logoutConfirmation;

    }

}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        handleLogout
    );

}


if (logoutAllButton) {

    logoutAllButton.addEventListener(
        "click",
        handleLogout
    );

}


function handleLogout() {

    const requiresConfirmation =
        logoutConfirmToggle
            ? logoutConfirmToggle.checked
            : true;


    if (
        requiresConfirmation
    ) {

        const confirmed =
            confirm(
                "Are you sure you want to log out?"
            );


        if (!confirmed) {

            return;

        }

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
        function() {

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


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function(link) {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );

}


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
   TOAST
========================================= */

function showToast(
    message
) {

    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function() {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =========================================
   INITIALS
========================================= */

function getInitials(
    name
) {

    if (!name) {

        return "OF";

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


/* =========================================
   INITIALIZE
========================================= */

loadPreferences();

loadOfficer();