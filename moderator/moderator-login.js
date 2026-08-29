/* =========================================================
   DOMINEXUS MODERATOR LOGIN
========================================================= */


const moderatorLoginForm =
    document.getElementById(
        "moderatorLoginForm"
    );


const moderatorIdInput =
    document.getElementById(
        "moderatorId"
    );


const moderatorPasswordInput =
    document.getElementById(
        "moderatorPassword"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );


/* =========================================================
   DEFAULT MODERATOR ACCOUNT
=========================================================

   This is temporary while we build the
   Moderator system.

   We will later replace this with the
   proper moderator account management.
========================================================= */

const DEFAULT_MODERATOR = {

    id:
        "MOD-0001",

    password:
        "moderator123",

    name:
        "System Moderator"

};


/* =========================================================
   LOGIN
========================================================= */

moderatorLoginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const moderatorId =
            moderatorIdInput
                .value
                .trim();


        const password =
            moderatorPasswordInput
                .value;


        /* -----------------------------------------
           CLEAR MESSAGE
        ----------------------------------------- */

        loginMessage.textContent =
            "";

        loginMessage.style.color =
            "";


        /* -----------------------------------------
           VALIDATE
        ----------------------------------------- */

        if (
            !moderatorId ||
            !password
        ) {

            showMessage(
                "Please enter your Moderator ID and password.",
                false
            );

            return;

        }


        /* -----------------------------------------
           CHECK ACCOUNT
        ----------------------------------------- */

        if (
            moderatorId.toUpperCase() ===
            DEFAULT_MODERATOR.id &&
            password ===
            DEFAULT_MODERATOR.password
        ) {

            /* -------------------------------------
               SAVE LOGIN SESSION
            ------------------------------------- */

            sessionStorage.setItem(
                "moderatorLoggedIn",
                "true"
            );


            sessionStorage.setItem(
                "moderatorId",
                DEFAULT_MODERATOR.id
            );


            sessionStorage.setItem(
                "moderatorName",
                DEFAULT_MODERATOR.name
            );


            /* -------------------------------------
               GO TO DASHBOARD
            ------------------------------------- */

            window.location.href =
                "moderator-dashboard.html";


            return;

        }


        /* -----------------------------------------
           INVALID LOGIN
        ----------------------------------------- */

        showMessage(
            "Invalid Moderator ID or password.",
            false
        );

    }
);


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    success
) {

    loginMessage.textContent =
        message;


    loginMessage.style.color =
        success
            ? "#198754"
            : "#f4eded";

}