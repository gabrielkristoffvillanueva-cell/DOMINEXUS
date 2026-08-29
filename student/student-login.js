/* =========================================================
   DOMINEXUS — STUDENT LOGIN
========================================================= */


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

        } else {

            passwordInput.type = "password";

            togglePassword.textContent = "Show";

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /* ---------------------------------------------
           GET INPUT
        --------------------------------------------- */

        const enteredStudentId =
            studentIdInput.value
                .trim()
                .toLowerCase();

        const enteredPassword =
            passwordInput.value;


        loginMessage.textContent = "";


        /* ---------------------------------------------
           EMPTY CHECK
        --------------------------------------------- */

        if (
            !enteredStudentId ||
            !enteredPassword
        ) {

            showMessage(
                "Please enter your Student ID and password.",
                "error"
            );

            return;

        }


        /* ---------------------------------------------
           LOAD STUDENTS
        --------------------------------------------- */

        let students = [];

        try {

            students =
                JSON.parse(
                    localStorage.getItem(
                        "dominexus_students"
                    ) || "[]"
                );

        } catch (error) {

            console.error(
                "Student storage error:",
                error
            );

            showMessage(
                "Unable to load student accounts.",
                "error"
            );

            return;

        }


        /* ---------------------------------------------
           DEBUG
        --------------------------------------------- */

        console.log(
            "Entered Student ID:",
            enteredStudentId
        );

        console.log(
            "Registered Student IDs:",
            students.map(
                student =>
                    String(
                        student.studentId || ""
                    )
                    .trim()
                    .toLowerCase()
            )
        );


        /* ---------------------------------------------
           FIND STUDENT
        --------------------------------------------- */

        const student =
            students.find(
                function (account) {

                    const savedStudentId =
                        String(
                            account.studentId || ""
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        savedStudentId ===
                        enteredStudentId
                    );

                }
            );


        /* ---------------------------------------------
           STUDENT ID CHECK
        --------------------------------------------- */

        if (!student) {

            showMessage(
                "Student ID is not registered.",
                "error"
            );

            return;

        }


        /* ---------------------------------------------
           PASSWORD CHECK
        --------------------------------------------- */

        const savedPassword =
            String(
                student.password || ""
            );


        if (
            savedPassword !==
            String(enteredPassword)
        ) {

            showMessage(
                "Incorrect password.",
                "error"
            );

            return;

        }


        /* =================================================
           SUCCESSFUL LOGIN
        ================================================= */


        sessionStorage.setItem(
            "studentLoggedIn",
            "true"
        );


        sessionStorage.setItem(
            "studentId",
            student.studentId
        );


        sessionStorage.setItem(
            "studentUniqueId",
            student.uniqueId || ""
        );


        /* ---------------------------------------------
           SUPPORT BOTH fullName AND fullname
        --------------------------------------------- */

        sessionStorage.setItem(
            "studentName",
            student.fullName ||
            student.fullname ||
            "Student"
        );


        sessionStorage.setItem(
            "studentSection",
            student.section || ""
        );


        sessionStorage.setItem(
            "studentOrganization",
            student.organization || ""
        );


        sessionStorage.setItem(
            "studentClubRole",
            student.clubRole || ""
        );


        /* ---------------------------------------------
           REMEMBER ME
        --------------------------------------------- */

        if (rememberMe.checked) {

            localStorage.setItem(
                "rememberedStudentId",
                student.studentId
            );

        } else {

            localStorage.removeItem(
                "rememberedStudentId"
            );

        }


        /* ---------------------------------------------
           SUCCESS MESSAGE
        --------------------------------------------- */

        showMessage(
            "Login successful! Redirecting...",
            "success"
        );


        /* ---------------------------------------------
           REDIRECT
        --------------------------------------------- */

        setTimeout(
            function () {

                window.location.href =
                    "student-dashboard.html";

            },
            700
        );

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

forgotPassword.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        alert(
            "Please contact your organization moderator or administrator to reset your password."
        );

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