/* =========================================================
   DOMINEXUS — STUDENT SIGN UP
   Connected to Laravel API
========================================================= */

const API_URL = "http://127.0.0.1:8000/api";

const signupForm = document.getElementById("signupForm");

const fullNameInput = document.getElementById("fullName");
const studentIdInput = document.getElementById("studentId");
const sectionInput = document.getElementById("section");
const organizationInput = document.getElementById("organization");
const clubRoleInput = document.getElementById("clubRole");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const digitalSignatureInput = document.getElementById("digitalSignature");

const privacyAgreement = document.getElementById("privacyAgreement");
const termsAgreement = document.getElementById("termsAgreement");

const signaturePreview = document.getElementById("signaturePreview");
const signaturePreviewImage =
    document.getElementById("signaturePreviewImage");
const signatureFileName =
    document.getElementById("signatureFileName");

const successBox = document.getElementById("successBox");
const generatedUniqueId =
    document.getElementById("generatedUniqueId");
const signupButton =
    document.getElementById("signupButton");


/* =========================================================
   ERROR HANDLING
========================================================= */

function showError(inputId, errorId, message) {

    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input) {
        input.classList.add("input-error");
    }

    if (error) {
        error.textContent = message;
    }
}


function clearError(inputId, errorId) {

    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input) {
        input.classList.remove("input-error");
    }

    if (error) {
        error.textContent = "";
    }
}


function clearAllErrors() {

    document
        .querySelectorAll(".error-message")
        .forEach(error => {
            error.textContent = "";
        });

    document
        .querySelectorAll(".input-error")
        .forEach(input => {
            input.classList.remove("input-error");
        });
}


/* =========================================================
   LOAD ORGANIZATIONS FROM LARAVEL
========================================================= */

async function loadOrganizations() {

    if (!organizationInput) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/organizations`
        );

        if (!response.ok) {
            throw new Error("Failed to load organizations.");
        }

        const organizations = await response.json();

        organizationInput.innerHTML = `
            <option value="" selected disabled>
                Select your organization
            </option>
        `;

        organizations.forEach(organization => {

            const option = document.createElement("option");

            option.value = organization.id;
            option.textContent = organization.name;

            organizationInput.appendChild(option);
        });

    } catch (error) {

        console.error(error);

        showError(
            "organization",
            "organizationError",
            "Unable to load organizations. Please make sure the Laravel server is running."
        );
    }
}


/* =========================================================
   DIGITAL SIGNATURE PREVIEW
========================================================= */

if (digitalSignatureInput) {

    digitalSignatureInput.addEventListener(
        "change",
        function () {

            clearError(
                "digitalSignature",
                "digitalSignatureError"
            );

            const file = this.files[0];

            if (!file) {

                if (signaturePreview) {
                    signaturePreview.hidden = true;
                }

                return;
            }

            const isPNG =
                file.type === "image/png" ||
                file.name.toLowerCase().endsWith(".png");

            if (!isPNG) {

                showError(
                    "digitalSignature",
                    "digitalSignatureError",
                    "Only PNG files are accepted."
                );

                this.value = "";

                if (signaturePreview) {
                    signaturePreview.hidden = true;
                }

                return;
            }

            if (file.size > 2 * 1024 * 1024) {

                showError(
                    "digitalSignature",
                    "digitalSignatureError",
                    "The digital signature must be 2 MB or smaller."
                );

                this.value = "";

                if (signaturePreview) {
                    signaturePreview.hidden = true;
                }

                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {

                if (signaturePreviewImage) {
                    signaturePreviewImage.src =
                        event.target.result;
                }

                if (signatureFileName) {
                    signatureFileName.textContent =
                        file.name;
                }

                if (signaturePreview) {
                    signaturePreview.hidden = false;
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
    .forEach(button => {

        button.addEventListener("click", function () {

            const targetId = this.dataset.target;

            const input =
                document.getElementById(targetId);

            if (!input) {
                return;
            }

            if (input.type === "password") {

                input.type = "text";
                this.textContent = "Hide";
                this.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type = "password";
                this.textContent = "Show";
                this.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }
        });
    });


/* =========================================================
   FORM SUBMISSION
========================================================= */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearAllErrors();

            let isValid = true;

            const fullName =
                fullNameInput.value.trim();

            const studentId =
                studentIdInput.value.trim();

            const section =
                sectionInput.value.trim();

            const organizationId =
                organizationInput.value;

            const clubRole =
                clubRoleInput.value;

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;

            const signatureFile =
                digitalSignatureInput.files[0];

            /* -----------------------------------------
               BASIC VALIDATION
            ----------------------------------------- */

            if (!fullName) {

                showError(
                    "fullName",
                    "fullNameError",
                    "Please enter your full name."
                );

                isValid = false;
            }

            if (!studentId) {

                showError(
                    "studentId",
                    "studentIdError",
                    "Please enter your Student ID."
                );

                isValid = false;
            }

            if (!section) {

                showError(
                    "section",
                    "sectionError",
                    "Please enter your section."
                );

                isValid = false;
            }

            if (!organizationId) {

                showError(
                    "organization",
                    "organizationError",
                    "Please select your organization."
                );

                isValid = false;
            }

            if (!clubRole) {

                showError(
                    "clubRole",
                    "clubRoleError",
                    "Please select your club role."
                );

                isValid = false;
            }

            if (!password) {

                showError(
                    "password",
                    "passwordError",
                    "Please create a password."
                );

                isValid = false;

            } else if (password.length < 8) {

                showError(
                    "password",
                    "passwordError",
                    "Password must be at least 8 characters."
                );

                isValid = false;
            }

            if (!confirmPassword) {

                showError(
                    "confirmPassword",
                    "confirmPasswordError",
                    "Please confirm your password."
                );

                isValid = false;

            } else if (password !== confirmPassword) {

                showError(
                    "confirmPassword",
                    "confirmPasswordError",
                    "Passwords do not match."
                );

                isValid = false;
            }

            if (!signatureFile) {

                showError(
                    "digitalSignature",
                    "digitalSignatureError",
                    "Please upload your digital signature."
                );

                isValid = false;
            }

            if (!privacyAgreement.checked) {

                showError(
                    "privacyAgreement",
                    "privacyAgreementError",
                    "You must accept the Data Privacy Agreement."
                );

                isValid = false;
            }

            if (!termsAgreement.checked) {

                showError(
                    "termsAgreement",
                    "termsAgreementError",
                    "You must accept the Terms and Conditions."
                );

                isValid = false;
            }

            if (!isValid) {
                return;
            }


            /* -----------------------------------------
               READ SIGNATURE
            ----------------------------------------- */

            const reader = new FileReader();

            reader.onload = async function (event) {

                const digitalSignature =
                    event.target.result;

                try {

                    signupButton.disabled = true;
                    signupButton.textContent =
                        "Creating Account...";


                    /* ---------------------------------
                       SEND TO LARAVEL
                    --------------------------------- */

                    const response = await fetch(
                        `${API_URL}/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: fullName,

                                student_id: studentId,

                                section: section,

                                club_role: clubRole,

                                password: password,

                                organization_id:
                                    Number(organizationId),

                                digital_signature:
                                    digitalSignature

                            })
                        }
                    );


                    const data =
                        await response.json();


                    /* ---------------------------------
                       VALIDATION ERROR
                    --------------------------------- */

                    if (!response.ok) {

                        if (data.errors) {

                            Object.entries(
                                data.errors
                            ).forEach(
                                ([field, messages]) => {

                                    const fieldMap = {
                                        name: [
                                            "fullName",
                                            "fullNameError"
                                        ],

                                        student_id: [
                                            "studentId",
                                            "studentIdError"
                                        ],

                                        section: [
                                            "section",
                                            "sectionError"
                                        ],

                                        organization_id: [
                                            "organization",
                                            "organizationError"
                                        ],

                                        club_role: [
                                            "clubRole",
                                            "clubRoleError"
                                        ],

                                        password: [
                                            "password",
                                            "passwordError"
                                        ],

                                        digital_signature: [
                                            "digitalSignature",
                                            "digitalSignatureError"
                                        ]
                                    };

                                    if (
                                        fieldMap[field]
                                    ) {

                                        showError(
                                            fieldMap[field][0],
                                            fieldMap[field][1],
                                            messages[0]
                                        );
                                    }
                                }
                            );

                        } else {

                            alert(
                                data.message ||
                                "Registration failed."
                            );
                        }

                        return;
                    }


                    /* ---------------------------------
                       SUCCESS
                    --------------------------------- */

                    const user = data.user;

                    sessionStorage.setItem(
                        "studentId",
                        user.student_id
                    );

                    sessionStorage.setItem(
                        "studentName",
                        user.name
                    );

                    sessionStorage.setItem(
                        "studentUniqueId",
                        user.unique_id
                    );


                    if (generatedUniqueId) {

                        generatedUniqueId.textContent =
                            user.unique_id;
                    }

                    signupForm.style.display =
                        "none";

                    if (successBox) {
                        successBox.hidden = false;
                    }

                } catch (error) {

                    console.error(error);

                    alert(
                        "Cannot connect to the DOMINEXUS server. Make sure Laravel is running."
                    );

                } finally {

                    signupButton.disabled = false;

                    signupButton.textContent =
                        "Create Student Account";
                }
            };

            reader.readAsDataURL(signatureFile);
        }
    );
}


/* =========================================================
   REAL-TIME VALIDATION
========================================================= */

if (fullNameInput) {
    fullNameInput.addEventListener(
        "input",
        () => {
            if (fullNameInput.value.trim()) {
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
            if (studentIdInput.value.trim()) {
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
            if (sectionInput.value.trim()) {
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
        "change",
        () => {
            if (organizationInput.value) {
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
            if (clubRoleInput.value) {
                clearError(
                    "clubRole",
                    "clubRoleError"
                );
            }
        }
    );
}

if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener(
        "input",
        function () {

            if (
                this.value &&
                this.value !== passwordInput.value
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
   START
========================================================= */

loadOrganizations();