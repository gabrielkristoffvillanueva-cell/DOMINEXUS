/* =========================================================
   DOMINEXUS — MODERATOR LOGIN
   Laravel / MySQL Connected
========================================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


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
   LOGIN
========================================================= */

moderatorLoginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const moderatorId =
            moderatorIdInput.value.trim();


        const password =
            moderatorPasswordInput.value;


        loginMessage.textContent = "";
        loginMessage.style.color = "";


        if (!moderatorId || !password) {

            showMessage(
                "Please enter your Moderator ID and password.",
                false
            );

            return;

        }


        const loginButton =
            moderatorLoginForm.querySelector(
                ".login-button"
            );


        if (loginButton) {

            loginButton.disabled = true;
            loginButton.textContent = "Signing In...";

        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/moderator-login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body: JSON.stringify({

                            moderator_id:
                                moderatorId,

                            password:
                                password

                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "Moderator login response:",
                data
            );


            if (!response.ok) {

                if (data.errors) {

                    const errors =
                        Object.values(
                            data.errors
                        )
                        .flat()
                        .join(" ");

                    throw new Error(errors);

                }


                throw new Error(
                    data.message ||
                    "Invalid Moderator ID or password."
                );

            }


            const moderator =
                data.user ||
                data.moderator;


            if (!moderator) {

                throw new Error(
                    "Moderator information was not returned."
                );

            }


            /* =====================================
               ROLE CHECK
            ===================================== */

            if (
                String(
                    moderator.role
                ).toLowerCase() !==
                "moderator"
            ) {

                throw new Error(
                    "This account does not have Moderator access."
                );

            }


            /* =====================================
               STATUS CHECK
            ===================================== */

            if (
                moderator.status &&
                String(
                    moderator.status
                ).toLowerCase() !==
                "active"
            ) {

                throw new Error(
                    "This Moderator account is not active."
                );

            }


            /* =====================================
               SAVE SESSION
            ===================================== */

            sessionStorage.setItem(
                "moderatorLoggedIn",
                "true"
            );


            sessionStorage.setItem(
                "moderatorId",
                moderator.student_id ||
                moderator.unique_id ||
                moderatorId
            );


            sessionStorage.setItem(
                "moderatorName",
                moderator.name ||
                "System Moderator"
            );


            sessionStorage.setItem(
                "moderatorRole",
                moderator.role ||
                "moderator"
            );


            sessionStorage.setItem(
                "moderatorStatus",
                moderator.status ||
                "Active"
            );


            if (
                moderator.organization_id !==
                null &&
                moderator.organization_id !==
                undefined
            ) {

                sessionStorage.setItem(
                    "moderatorOrganizationId",
                    moderator.organization_id
                );

            }


            if (
                moderator.organization
            ) {

                sessionStorage.setItem(
                    "moderatorOrganization",
                    moderator.organization.name ||
                    ""
                );

            }


            /* =====================================
               SUCCESS
            ===================================== */

            showMessage(
                "Login successful. Redirecting...",
                true
            );


            setTimeout(
                function () {

                    window.location.href =
                        "moderator-dashboard.html";

                },
                500
            );


        } catch (error) {

            console.error(
                "Moderator login error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to log in.",
                false
            );


            moderatorPasswordInput.value = "";


            moderatorPasswordInput.focus();


        } finally {

            if (loginButton) {

                loginButton.disabled = false;
                loginButton.textContent = "Sign In";

            }

        }

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