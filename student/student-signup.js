/* =========================================================
   DOMINEXUS — STUDENT SIGN UP
   Front-End Prototype
========================================================= */


/* =========================================================
   FORM
========================================================= */

const signupForm = document.getElementById("signupForm");


/* =========================================================
   INPUTS
========================================================= */

const fullNameInput =
    document.getElementById("fullName");

const studentIdInput =
    document.getElementById("studentId");

const sectionInput =
    document.getElementById("section");

const organizationInput =
    document.getElementById("organization");

const clubRoleInput =
    document.getElementById("clubRole");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const digitalSignatureInput =
    document.getElementById("digitalSignature");

const privacyAgreement =
    document.getElementById("privacyAgreement");

const termsAgreement =
    document.getElementById("termsAgreement");


/* =========================================================
   SIGNATURE PREVIEW
========================================================= */

const signaturePreview =
    document.getElementById("signaturePreview");

const signaturePreviewImage =
    document.getElementById("signaturePreviewImage");

const signatureFileName =
    document.getElementById("signatureFileName");


/* =========================================================
   SUCCESS BOX
========================================================= */

const successBox =
    document.getElementById("successBox");

const generatedUniqueId =
    document.getElementById("generatedUniqueId");

const signupButton =
    document.getElementById("signupButton");


/* =========================================================
   LOCAL STORAGE
========================================================= */

function getStudents() {

    return JSON.parse(
        localStorage.getItem("dominexus_students") || "[]"
    );

}


function saveStudents(students) {

    localStorage.setItem(
        "dominexus_students",
        JSON.stringify(students)
    );

}


/* =========================================================
   GENERATE UNIQUE ID
========================================================= */

function generateUniqueId() {

    const students = getStudents();

    let uniqueId;

    do {

        const randomNumber =
            Math.floor(
                100000 +
                Math.random() * 900000
            );

        uniqueId =
            "SDCA-" + randomNumber;

    } while (
        students.some(
            student =>
                student.uniqueId === uniqueId
        )
    );

    return uniqueId;

}


/* =========================================================
   ERROR HANDLING
========================================================= */

function showError(
    inputId,
    errorId,
    message
) {

    const input =
        document.getElementById(inputId);

    const error =
        document.getElementById(errorId);


    if (input) {

        input.classList.add(
            "input-error"
        );

    }


    if (error) {

        error.textContent =
            message;

    }

}


function clearError(
    inputId,
    errorId
) {

    const input =
        document.getElementById(inputId);

    const error =
        document.getElementById(errorId);


    if (input) {

        input.classList.remove(
            "input-error"
        );

    }


    if (error) {

        error.textContent = "";

    }

}


function clearAllErrors() {

    document
        .querySelectorAll(".error-message")
        .forEach(
            error => {
                error.textContent = "";
            }
        );


    document
        .querySelectorAll(".input-error")
        .forEach(
            input => {
                input.classList.remove(
                    "input-error"
                );
            }
        );

}


/* =========================================================
   DIGITAL SIGNATURE
========================================================= */

if (digitalSignatureInput) {

    digitalSignatureInput.addEventListener(
        "change",
        function () {

            clearError(
                "digitalSignature",
                "digitalSignatureError"
            );


            const file =
                this.files[0];


            if (!file) {

                if (signaturePreview) {

                    signaturePreview.hidden =
                        true;

                }

                return;

            }


            /* ---------------------------------------------
               CHECK PNG
            --------------------------------------------- */

            const isPNG =
                file.type === "image/png" ||
                file.name
                    .toLowerCase()
                    .endsWith(".png");


            if (!isPNG) {

                showError(
                    "digitalSignature",
                    "digitalSignatureError",
                    "Only PNG files are accepted."
                );

                this.value = "";


                if (signaturePreview) {

                    signaturePreview.hidden =
                        true;

                }

                return;

            }


            /* ---------------------------------------------
               CHECK FILE SIZE
            --------------------------------------------- */

            const maxSize =
                2 * 1024 * 1024;


            if (file.size > maxSize) {

                showError(
                    "digitalSignature",
                    "digitalSignatureError",
                    "The digital signature must be 2 MB or smaller."
                );

                this.value = "";


                if (signaturePreview) {

                    signaturePreview.hidden =
                        true;

                }

                return;

            }


            /* ---------------------------------------------
               PREVIEW IMAGE
            --------------------------------------------- */

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    if (signaturePreviewImage) {

                        signaturePreviewImage.src =
                            event.target.result;

                    }


                    if (signatureFileName) {

                        signatureFileName.textContent =
                            file.name;

                    }


                    if (signaturePreview) {

                        signaturePreview.hidden =
                            false;

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

document
    .querySelectorAll(".password-toggle")
    .forEach(
        button => {

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

                        this.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        input.type =
                            "password";

                        this.textContent =
                            "Show";

                        this.setAttribute(
                            "aria-label",
                            "Show password"
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   CONFIRM PASSWORD
========================================================= */

if (confirmPasswordInput) {

    confirmPasswordInput.addEventListener(
        "input",
        function () {

            if (
                this.value &&
                this.value !==
                passwordInput.value
            ) {

                showError(
                    "confirmPassword",
                    "confirmPasswordError",
                    "Passwords do not match."
                );

            } else {

                clearError(
                    "confirmPassword",
                    "confirmPasswordError"
                );

            }

        }
    );

}


/* =========================================================
   REAL-TIME FIELD VALIDATION
========================================================= */

if (fullNameInput) {

    fullNameInput.addEventListener(
        "input",
        () => {

            if (
                fullNameInput.value.trim()
            ) {

                clearError(
                    "fullName",
                    "fullNameError"
                );

            }

        }
    );

}


if (studentIdInput) {

    studentIdInput.addEventListener(
        "input",
        () => {

            if (
                studentIdInput.value.trim()
            ) {

                clearError(
                    "studentId",
                    "studentIdError"
                );

            }

        }
    );

}


if (sectionInput) {

    sectionInput.addEventListener(
        "input",
        () => {

            if (
                sectionInput.value.trim()
            ) {

                clearError(
                    "section",
                    "sectionError"
                );

            }

        }
    );

}


if (organizationInput) {

    organizationInput.addEventListener(
        "input",
        () => {

            if (
                organizationInput.value.trim()
            ) {

                clearError(
                    "organization",
                    "organizationError"
                );

            }

        }
    );

}


if (clubRoleInput) {

    clubRoleInput.addEventListener(
        "change",
        () => {

            if (
                clubRoleInput.value
            ) {

                clearError(
                    "clubRole",
                    "clubRoleError"
                );

            }

        }
    );

}


/* =========================================================
   AGREEMENT VALIDATION
========================================================= */

if (privacyAgreement) {

    privacyAgreement.addEventListener(
        "change",
        function () {

            if (this.checked) {

                clearError(
                    "privacyAgreement",
                    "privacyAgreementError"
                );

            }

        }
    );

}


if (termsAgreement) {

    termsAgreement.addEventListener(
        "change",
        function () {

            if (this.checked) {

                clearError(
                    "termsAgreement",
                    "termsAgreementError"
                );

            }

        }
    );

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            clearAllErrors();


            let isValid = true;


            /* ---------------------------------------------
               GET VALUES
            --------------------------------------------- */

            const fullName =
                fullNameInput.value.trim();

            const studentId =
                studentIdInput.value.trim();

            const section =
                sectionInput.value.trim();

            const organization =
                organizationInput.value.trim();

            const clubRole =
                clubRoleInput.value;

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;

            const signatureFile =
                digitalSignatureInput.files[0];

            const privacyAccepted =
                privacyAgreement.checked;

            const termsAccepted =
                termsAgreement.checked;


            /* ---------------------------------------------
               FULL NAME
            --------------------------------------------- */

            if (!fullName) {

                showError(
                    "fullName",
                    "fullNameError",
                    "Please enter your full name."
                );

                isValid = false;

            }


            /* ---------------------------------------------
               STUDENT ID
            --------------------------------------------- */

            if (!studentId) {

                showError(
                    "studentId",
                    "studentIdError",
                    "Please enter your Student ID."
                );

                isValid = false;

            }


            /* ---------------------------------------------
               SECTION
            --------------------------------------------- */

            if (!section) {

                showError(
                    "section",
                    "sectionError",
                    "Please enter your section."
                );

                isValid = false;

            }


            /* ---------------------------------------------
               ORGANIZATION
            --------------------------------------------- */

            if (!organization) {

                showError(
                    "organization",
                    "organizationError",
                    "Please enter your organization."
                );

                isValid = false;

            }


            /* ---------------------------------------------
               CLUB ROLE
            --------------------------------------------- */

            if (!clubRole) {

                showError(
                    "clubRole",
                    "clubRoleError",
                    "Please select your club role."
                );

                isValid = false;

            }


            /* ---------------------------------------------
               PASSWORD
            --------------------------------------------- */

            if (!password) {

                showError(
                    "password",
                    "passwordError",
                    "Please create a password."
                );

                isValid = false;

            } else if (
                password.length < 6
            ) {

                showError(
                    "password",
                    "passwordError",
                    "Password must be at least 6 characters."
                );

                isValid = false;

            }


            /* ---------------------------------------------
               CONFIRM PASSWORD
            --------------------------------------------- */

            if (!confirmPassword) {

                showError(
                    "confirmPassword",
                    "confirmPasswordError",
                    "Please confirm your password."
                );

                isValid = false;

            } else if (
                password !== confirmPassword
            ) {

                showError(
                    "confirmPassword",
                    "confirmPasswordError",
                    "Passwords do not match."
                );

                isValid = false;

            }


            /* ---------------------------------------------
               DIGITAL SIGNATURE
            --------------------------------------------- */

            if (!signatureFile) {

                showError(
                    "digitalSignature",
                    "digitalSignatureError",
                    "Please upload your digital signature."
                );

                isValid = false;

            } else {

                const isPNG =
                    signatureFile.type === "image/png" ||
                    signatureFile.name
                        .toLowerCase()
                        .endsWith(".png");


                if (!isPNG) {

                    showError(
                        "digitalSignature",
                        "digitalSignatureError",
                        "Only PNG files are accepted."
                    );

                    isValid = false;

                }


                if (
                    signatureFile.size >
                    2 * 1024 * 1024
                ) {

                    showError(
                        "digitalSignature",
                        "digitalSignatureError",
                        "The digital signature must be 2 MB or smaller."
                    );

                    isValid = false;

                }

            }


            /* ---------------------------------------------
               DATA PRIVACY
            --------------------------------------------- */

            if (!privacyAccepted) {

                showError(
                    "privacyAgreement",
                    "privacyAgreementError",
                    "You must accept the Data Privacy Agreement."
                );

                isValid = false;

            }


            /* ---------------------------------------------
               TERMS
            --------------------------------------------- */

            if (!termsAccepted) {

                showError(
                    "termsAgreement",
                    "termsAgreementError",
                    "You must accept the Terms and Conditions."
                );

                isValid = false;

            }


            /* ---------------------------------------------
               STOP IF INVALID
            --------------------------------------------- */

            if (!isValid) {

                return;

            }


            /* ---------------------------------------------
               GET STUDENTS
            --------------------------------------------- */

            const students =
                getStudents();


            /* ---------------------------------------------
               DUPLICATE STUDENT ID
            --------------------------------------------- */

            const duplicateStudent =
                students.find(
                    student =>
                        String(
                            student.studentId
                        ).toLowerCase() ===
                        studentId.toLowerCase()
                );


            if (duplicateStudent) {

                showError(
                    "studentId",
                    "studentIdError",
                    "This Student ID is already registered."
                );

                return;

            }


            /* ---------------------------------------------
               READ SIGNATURE
            --------------------------------------------- */

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const uniqueId =
                        generateUniqueId();


                    /* -------------------------------------
                       STUDENT OBJECT
                    ------------------------------------- */

                    const newStudent = {

                        id:
                            Date.now(),

                        fullName:
                            fullName,

                        studentId:
                            studentId,

                        section:
                            section,

                        organization:
                            organization,

                        clubRole:
                            clubRole,

                        password:
                            password,

                        uniqueId:
                            uniqueId,

                        digitalSignature:
                            event.target.result,

                        digitalSignatureFileName:
                            signatureFile.name,

                        privacyAgreementAccepted:
                            true,

                        termsAccepted:
                            true,

                        attendancePercentage:
                            0,

                        meetingsAttended:
                            0,

                        participationStatus:
                            "NEW",

                        attendanceHistory:
                            [],

                        status:
                            "Active",

                        createdAt:
                            new Date().toISOString()

                    };


                    /* -------------------------------------
                       SAVE
                    ------------------------------------- */

                    students.push(
                        newStudent
                    );


                    saveStudents(
                        students
                    );


                    /* -------------------------------------
                       SESSION
                    ------------------------------------- */

                    sessionStorage.setItem(
                        "studentId",
                        studentId
                    );


                    sessionStorage.setItem(
                        "studentName",
                        fullName
                    );


                    sessionStorage.setItem(
                        "studentUniqueId",
                        uniqueId
                    );


                    /* -------------------------------------
                       SUCCESS SCREEN
                    ------------------------------------- */

                    if (generatedUniqueId) {

                        generatedUniqueId.textContent =
                            uniqueId;

                    }


                    signupForm.style.display =
                        "none";


                    if (successBox) {

                        successBox.hidden =
                            false;

                    }


                    /* -------------------------------------
                       DO NOT REDIRECT IMMEDIATELY
                    ------------------------------------- */

                };


            reader.onerror =
                function () {

                    showError(
                        "digitalSignature",
                        "digitalSignatureError",
                        "The signature could not be processed. Please try again."
                    );

                };


            reader.readAsDataURL(
                signatureFile
            );

        }
    );

}