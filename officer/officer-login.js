/* =========================================
   DOMINEXUS — OFFICER LOGIN
   Laravel / MySQL Connected
========================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


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

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

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

            } else {

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

}


/* =========================================
   OFFICER LOGIN
========================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const officerId =
                officerIdInput.value.trim();


            const password =
                passwordInput.value;


            loginMessage.textContent =
                "";


            /* =================================
               VALIDATION
            ================================= */

            if (
                !officerId ||
                !password
            ) {

                loginMessage.textContent =
                    "Please enter your Officer ID and password.";

                return;

            }


            /* =================================
               DISABLE BUTTON
            ================================= */

            const loginButton =
                loginForm.querySelector(
                    ".login-button"
                );


            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Logging in...";

            }


            try {

                /* =============================
                   SEND TO LARAVEL
                ============================= */

                const response =
                    await fetch(
                        `${API_BASE}/officer-login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                officer_id:
                                    officerId,

                                password:
                                    password

                            })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Officer login response:",
                    data
                );


                /* =============================
                   HANDLE ERROR
                ============================= */

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
                        "Invalid Officer ID or password."
                    );

                }


                /* =============================
                   GET USER
                ============================= */

                const officer =
                    data.user ||
                    data.officer;


                if (!officer) {

                    throw new Error(
                        "Login succeeded but officer information was not returned."
                    );

                }


                /* =============================
                   VERIFY ROLE
                ============================= */

                if (
                    String(
                        officer.role
                    ).toLowerCase() !==
                    "officer"
                ) {

                    throw new Error(
                        "This account does not have Officer access."
                    );

                }


                /* =============================
                   VERIFY STATUS
                ============================= */

                if (
                    officer.status &&
                    String(
                        officer.status
                    ).toLowerCase() !==
                    "active"
                ) {

                    throw new Error(
                        "This Officer account is not active."
                    );

                }


                /* =============================
                   REMEMBER OFFICER ID
                ============================= */

                if (
                    rememberOfficer &&
                    rememberOfficer.checked
                ) {

                    localStorage.setItem(
                        "dominexus_remembered_officer",
                        officerId
                    );

                } else {

                    localStorage.removeItem(
                        "dominexus_remembered_officer"
                    );

                }


                /* =============================
                   CREATE OFFICER SESSION
                ============================= */

                sessionStorage.setItem(
                    "officerLoggedIn",
                    "true"
                );


                sessionStorage.setItem(
                    "officerId",
                    officer.student_id ||
                    officer.unique_id ||
                    officerId
                );


                sessionStorage.setItem(
                    "officerName",
                    officer.name ||
                    "Officer"
                );


                sessionStorage.setItem(
                    "officerRole",
                    officer.role ||
                    "officer"
                );


                sessionStorage.setItem(
                    "officerStatus",
                    officer.status ||
                    "Active"
                );


                if (
                    officer.organization_id !==
                    null &&
                    officer.organization_id !==
                    undefined
                ) {

                    sessionStorage.setItem(
                        "officerOrganizationId",
                        officer.organization_id
                    );

                }


                /* =============================
                   ORGANIZATION
                ============================= */

                if (
                    officer.organization
                ) {

                    const organization =
                        officer.organization;


                    if (
                        organization.name
                    ) {

                        sessionStorage.setItem(
                            "officerOrganization",
                            organization.name
                        );

                    }

                }


                /* =============================
                   CLUB ROLE
                ============================= */

                if (
                    officer.club_role
                ) {

                    sessionStorage.setItem(
                        "officerClubRole",
                        officer.club_role
                    );

                }


                /* =============================
                   SUCCESS
                ============================= */

                loginMessage.style.color =
                    "#198754";


                loginMessage.textContent =
                    "Login successful. Redirecting...";


                /* =============================
                   REDIRECT
                ============================= */

                setTimeout(
                    function () {

                        window.location.href =
                            "officer-dashboard.html";

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Officer login error:",
                    error
                );


                loginMessage.style.color =
                    "#d93025";


                loginMessage.textContent =
                    error.message ||
                    "Unable to log in.";


                passwordInput.value =
                    "";


                passwordInput.focus();


            } finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Login";

                }

            }

        }
    );

}


/* =========================================
   FORGOT PASSWORD
========================================= */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            alert(
                "Password recovery is not available yet. Please contact your organization administrator."
            );

        }
    );

}