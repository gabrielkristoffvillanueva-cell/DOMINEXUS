/* =========================================
   DOMINEXUS OFFICER SETTINGS
========================================= */


/* =========================================
   CHECK LOGIN
========================================= */

const loggedIn =
    sessionStorage.getItem("officerLoggedIn");

if (loggedIn !== "true") {

    window.location.href =
        "officer-login.html";

}


/* =========================================
   GET OFFICER DATA
========================================= */

const officerId =
    sessionStorage.getItem("officerId")
    || "OFF-0001";

const savedOfficerName =
    sessionStorage.getItem("officerName")
    || "Demo Officer";

const savedOrganization =
    sessionStorage.getItem(
        "officerOrganization"
    )
    || "DOMINEXUS";


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
   DISPLAY OFFICER
========================================= */

function displayOfficer() {

    topOfficerName.textContent =
        savedOfficerName;

    topOfficerId.textContent =
        officerId;

    profileName.textContent =
        savedOfficerName;

    profileId.textContent =
        officerId;

    officerNameInput.value =
        savedOfficerName;

    officerIdInput.value =
        officerId;

    organizationInput.value =
        savedOrganization;


    const initials =
        getInitials(
            savedOfficerName
        );

    topAvatar.textContent =
        initials;

    profileAvatar.textContent =
        initials;

}


/* =========================================
   SAVE PROFILE
========================================= */

saveProfileButton.addEventListener(
    "click",
    () => {

        const newName =
            officerNameInput.value.trim();

        const newOrganization =
            organizationInput.value.trim();


        if (!newName) {

            alert(
                "Please enter your full name."
            );

            return;

        }


        if (!newOrganization) {

            alert(
                "Please enter your organization."
            );

            return;

        }


        sessionStorage.setItem(
            "officerName",
            newName
        );

        sessionStorage.setItem(
            "officerOrganization",
            newOrganization
        );


        /*
           Save a simple profile copy
           for the front-end version.
        */

        localStorage.setItem(
            "dominexus_officer_profile",
            JSON.stringify({

                officerId: officerId,

                officerName: newName,

                organization:
                    newOrganization

            })
        );


        topOfficerName.textContent =
            newName;

        profileName.textContent =
            newName;

        topAvatar.textContent =
            getInitials(newName);

        profileAvatar.textContent =
            getInitials(newName);


        showToast(
            "Profile updated successfully."
        );

    }
);


/* =========================================
   CHANGE PASSWORD
========================================= */

changePasswordButton.addEventListener(
    "click",
    () => {

        const current =
            currentPassword.value;

        const newPass =
            newPassword.value;

        const confirmPass =
            confirmPassword.value;


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


        if (newPass.length < 6) {

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


        /*
           Front-end demo only.

           The actual password should
           eventually be handled by
           the backend/database.
        */

        localStorage.setItem(
            "dominexus_officer_password",
            newPass
        );


        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";


        showToast(
            "Password changed successfully."
        );

    }
);


/* =========================================
   SAVE PREFERENCES
========================================= */

notificationToggle.addEventListener(
    "change",
    savePreferences
);

logoutConfirmToggle.addEventListener(
    "change",
    savePreferences
);


function savePreferences() {

    const preferences = {

        notifications:
            notificationToggle.checked,

        logoutConfirmation:
            logoutConfirmToggle.checked

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

    const saved =
        JSON.parse(
            localStorage.getItem(
                "dominexus_officer_preferences"
            ) || "null"
        );


    if (!saved) {
        return;
    }


    if (
        typeof saved.notifications ===
        "boolean"
    ) {

        notificationToggle.checked =
            saved.notifications;

    }


    if (
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

logoutButton.addEventListener(
    "click",
    handleLogout
);

logoutAllButton.addEventListener(
    "click",
    handleLogout
);


function handleLogout() {

    if (
        logoutConfirmToggle.checked
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


function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "show"
    );

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

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

function getInitials(name) {

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


/* =========================================
   INITIALIZE
========================================= */

displayOfficer();

loadPreferences();