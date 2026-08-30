/* =========================================================
   DOMINEXUS — STUDENT LOGIN
   Laravel API Connected
========================================================= */

const API_URL = "http://127.0.0.1:8000/api";


/* =========================================================
   ELEMENTS
========================================================= */

const loginForm =
    document.getElementById("studentLoginForm");

const studentIdInput =
    document.getElementById("studentId");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const rememberMe =
    document.getElementById("rememberMe");

const loginMessage =
    document.getElementById("loginMessage");

const forgotPassword =
    document.getElementById("forgotPassword");

const registerLink =
    document.getElementById("registerLink");


/* =========================================================
   LOAD REMEMBERED STUDENT ID
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const savedId =
        localStorage.getItem("rememberedStudentId");

    if (savedId) {

        studentIdInput.value = savedId;

        rememberMe.checked = true;

    }

});


/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

togglePassword.addEventListener(
    "click",
    function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.textContent = "Hide";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            passwordInput.type = "password";

            togglePassword.textContent = "Show";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const enteredStudentId =
            studentIdInput.value.trim();

        const enteredPassword =
            passwordInput.value;

        loginMessage.textContent = "";


        /* ---------------------------------------------
           EMPTY CHECK
        --------------------------------------------- */

        if (!enteredStudentId || !enteredPassword) {

            showMessage(
                "Please enter your Student ID and password.",
                "error"
            );

            return;
        }


        /* ---------------------------------------------
           DISABLE BUTTON
        --------------------------------------------- */

        const loginButton =
            loginForm.querySelector(
                'button[type="submit"]'
            );

        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";
        }


        /* ---------------------------------------------
           SEND LOGIN REQUEST TO LARAVEL
        --------------------------------------------- */

        try {

            const response = await fetch(
                `${API_URL}/login`,
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
                            enteredStudentId,

                        password:
                            enteredPassword

                    })
                }
            );


            const data =
                await response.json();


            /* -----------------------------------------
               LOGIN FAILED
            ----------------------------------------- */

            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Invalid Student ID or password.",
                    "error"
                );

                return;
            }


            /* -----------------------------------------
               LOGIN SUCCESS
            ----------------------------------------- */

            const student =
                data.user;


            sessionStorage.setItem(
                "studentLoggedIn",
                "true"
            );

            sessionStorage.setItem(
                "studentId",
                student.student_id || ""
            );

            sessionStorage.setItem(
                "studentUniqueId",
                student.unique_id || ""
            );

            sessionStorage.setItem(
                "studentName",
                student.name || "Student"
            );

            sessionStorage.setItem(
                "studentSection",
                student.section || ""
            );

            sessionStorage.setItem(
                "studentOrganization",
                student.organization
                    ? student.organization.name
                    : ""
            );

            sessionStorage.setItem(
                "studentOrganizationId",
                student.organization_id || ""
            );

            sessionStorage.setItem(
                "studentClubRole",
                student.club_role || ""
            );

            sessionStorage.setItem(
                "studentRole",
                student.role || ""
            );

            sessionStorage.setItem(
                "studentStatus",
                student.status || ""
            );


            /* -----------------------------------------
               REMEMBER ME
            ----------------------------------------- */

            if (rememberMe.checked) {

                localStorage.setItem(
                    "rememberedStudentId",
                    student.student_id
                );

            } else {

                localStorage.removeItem(
                    "rememberedStudentId"
                );

            }


            /* -----------------------------------------
               SUCCESS MESSAGE
            ----------------------------------------- */

            showMessage(
                "Login successful! Redirecting...",
                "success"
            );


            /* -----------------------------------------
               REDIRECT
            ----------------------------------------- */

            setTimeout(
                function () {

                    window.location.href =
                        "student-dashboard.html";

                },
                700
            );


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            showMessage(
                "Unable to connect to the server. Make sure Laravel is running.",
                "error"
            );

        } finally {

            if (loginButton) {

                loginButton.disabled = false;

                loginButton.textContent = "Log In";

            }

        }

    }
);


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    loginMessage.textContent =
        message;

    if (type === "success") {

        loginMessage.style.color =
            "#198754";

    } else {

        loginMessage.style.color =
            "#dc3545";

    }

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

const forgotPasswordLink =
    document.getElementById(
        "forgotPasswordLink"
    );

const forgotPasswordModal =
    document.getElementById(
        "forgotPasswordModal"
    );

const closeForgotPassword =
    document.getElementById(
        "closeForgotPassword"
    );

const forgotPasswordOkay =
    document.getElementById(
        "forgotPasswordOkay"
    );


function openForgotPasswordModal() {

    forgotPasswordModal.classList.remove(
        "hidden"
    );

}


function closeForgotPasswordModal() {

    forgotPasswordModal.classList.add(
        "hidden"
    );

}


if (
    forgotPasswordLink
) {

    forgotPasswordLink.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            openForgotPasswordModal();

        }
    );

}


if (
    closeForgotPassword
) {

    closeForgotPassword.addEventListener(
        "click",
        closeForgotPasswordModal
    );

}


if (
    forgotPasswordOkay
) {

    forgotPasswordOkay.addEventListener(
        "click",
        closeForgotPasswordModal
    );

}


if (
    forgotPasswordModal
) {

    forgotPasswordModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                forgotPasswordModal
            ) {

                closeForgotPasswordModal();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            forgotPasswordModal &&
            !forgotPasswordModal.classList.contains(
                "hidden"
            )
        ) {

            closeForgotPasswordModal();

        }

    }
);

/* =========================================================
   REGISTER
========================================================= */

registerLink.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        window.location.href =
            "student-signup.html";

    }
);
