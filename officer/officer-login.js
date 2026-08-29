/* =========================================
   DOMINEXUS OFFICER LOGIN
========================================= */


/* =========================================
   DEMO OFFICER ACCOUNT
========================================= */

const DEMO_OFFICER = {
    officerId: "OFF-0001",
    password: "officer123",
    name: "Demo Officer",
    organization: "DOMINEXUS"
};


/* =========================================
   ELEMENTS
========================================= */

const loginForm =
    document.getElementById("officerLoginForm");


const officerIdInput =
    document.getElementById("officerId");


const passwordInput =
    document.getElementById("officerPassword");


const togglePassword =
    document.getElementById("togglePassword");


const rememberOfficer =
    document.getElementById("rememberOfficer");


const loginMessage =
    document.getElementById("loginMessage");


const forgotPassword =
    document.getElementById("forgotPassword");


/* =========================================
   LOAD REMEMBERED OFFICER ID
========================================= */

const rememberedOfficerId =
    localStorage.getItem(
        "dominexus_remembered_officer"
    );


if (rememberedOfficerId) {

    officerIdInput.value =
        rememberedOfficerId;

    rememberOfficer.checked =
        true;

}


/* =========================================
   SHOW / HIDE PASSWORD
========================================= */

togglePassword.addEventListener(
    "click",
    () => {

        if (
            passwordInput.type ===
            "password"
        ) {

            passwordInput.type =
                "text";

            togglePassword.textContent =
                "Hide";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        }

        else {

            passwordInput.type =
                "password";

            togglePassword.textContent =
                "Show";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    }
);


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const officerId =
            officerIdInput.value
                .trim();


        const password =
            passwordInput.value;


        /* Clear previous message */

        loginMessage.textContent =
            "";


        /* =================================
           VALIDATION
        ================================= */

        if (!officerId || !password) {

            loginMessage.textContent =
                "Please enter your Officer ID and password.";

            return;

        }


        /* =================================
           CHECK DEMO ACCOUNT
        ================================= */

        if (
            officerId.toLowerCase() ===
            DEMO_OFFICER.officerId.toLowerCase()
            &&
            password ===
            DEMO_OFFICER.password
        ) {

            /* =============================
               REMEMBER OFFICER ID
            ============================= */

            if (rememberOfficer.checked) {

                localStorage.setItem(
                    "dominexus_remembered_officer",
                    officerId
                );

            }

            else {

                localStorage.removeItem(
                    "dominexus_remembered_officer"
                );

            }


            /* =============================
               CREATE LOGIN SESSION
            ============================= */

            sessionStorage.setItem(
                "officerLoggedIn",
                "true"
            );


            sessionStorage.setItem(
                "officerId",
                DEMO_OFFICER.officerId
            );


            sessionStorage.setItem(
                "officerName",
                DEMO_OFFICER.name
            );


            sessionStorage.setItem(
                "officerOrganization",
                DEMO_OFFICER.organization
            );


            /* =============================
               REDIRECT
            ============================= */

            window.location.href =
                "officer-dashboard.html";

        }

        else {

            loginMessage.textContent =
                "Invalid Officer ID or password.";

            passwordInput.value = "";

            passwordInput.focus();

        }

    }
);


/* =========================================
   FORGOT PASSWORD
========================================= */

forgotPassword.addEventListener(
    "click",
    (event) => {

        event.preventDefault();


        alert(
            "Password recovery will be connected to the backend later."
        );

    }
);