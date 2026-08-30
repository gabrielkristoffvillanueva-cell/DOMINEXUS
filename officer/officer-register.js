/* =========================================================
   DOMINEXUS — OFFICER REGISTRATION
   Laravel / MySQL Connected
========================================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


const form =
    document.getElementById(
        "officerRegisterForm"
    );


const nameInput =
    document.getElementById(
        "name"
    );


const officerIdInput =
    document.getElementById(
        "officerId"
    );


const sectionInput =
    document.getElementById(
        "section"
    );


const organizationInput =
    document.getElementById(
        "organization"
    );


const clubRoleInput =
    document.getElementById(
        "clubRole"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const confirmPasswordInput =
    document.getElementById(
        "confirmPassword"
    );


const registerButton =
    document.getElementById(
        "registerButton"
    );


const registerMessage =
    document.getElementById(
        "registerMessage"
    );


const successBox =
    document.getElementById(
        "successBox"
    );


/* =========================================================
   LOAD ORGANIZATIONS
========================================================= */

async function loadOrganizations() {

    try {

        const response =
            await fetch(
                `${API_BASE}/organizations`,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load organizations."
            );

        }


        const organizations =
            Array.isArray(data)
                ? data
                : data.data ||
                  data.organizations ||
                  [];


        organizationInput.innerHTML = `
            <option
                value=""
                selected
                disabled>

                Select your organization

            </option>
        `;


        organizations.forEach(
            organization => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    organization.id;


                option.textContent =
                    organization.name;


                organizationInput.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Organization loading error:",
            error
        );


        showMessage(
            "Unable to load organizations. Make sure Laravel is running.",
            "error"
        );

    }

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        clearErrors();


        const name =
            nameInput.value.trim();


        const officerId =
            officerIdInput.value.trim();


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


        let valid = true;


        /* =====================================
           VALIDATION
        ===================================== */

        if (!name) {

            showError(
                "name",
                "Full name is required."
            );

            valid = false;

        }


        if (!officerId) {

            showError(
                "officerId",
                "Officer ID is required."
            );

            valid = false;

        }


        if (!section) {

            showError(
                "section",
                "Section is required."
            );

            valid = false;

        }


        if (!organizationId) {

            showError(
                "organization",
                "Please select your organization."
            );

            valid = false;

        }


        if (!clubRole) {

            showError(
                "clubRole",
                "Please select your officer position."
            );

            valid = false;

        }


        if (
            !password ||
            password.length < 8
        ) {

            showError(
                "password",
                "Password must be at least 8 characters."
            );

            valid = false;

        }


        if (
            !confirmPassword ||
            password !== confirmPassword
        ) {

            showError(
                "confirmPassword",
                "Passwords do not match."
            );

            valid = false;

        }


        if (!valid) {

            return;

        }


        registerButton.disabled =
            true;


        registerButton.textContent =
            "Submitting...";


        showMessage(
            "",
            ""
        );


        try {

            const response =
                await fetch(
                    `${API_BASE}/officer-register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name:

                                name,

                            officer_id:

                                officerId,

                            section:

                                section,

                            organization_id:

                                Number(
                                    organizationId
                                ),

                            club_role:

                                clubRole,

                            password:

                                password

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                if (
                    data.errors
                ) {

                    Object.entries(
                        data.errors
                    ).forEach(
                        (
                            [field, messages]
                        ) => {

                            const map = {

                                name:
                                    "name",

                                officer_id:
                                    "officerId",

                                section:
                                    "section",

                                organization_id:
                                    "organization",

                                club_role:
                                    "clubRole",

                                password:
                                    "password"

                            };


                            if (
                                map[field]
                            ) {

                                showError(
                                    map[field],
                                    messages[0]
                                );

                            }

                        }
                    );

                    return;

                }


                throw new Error(
                    data.message ||
                    "Registration failed."
                );

            }


            /* =================================
               SUCCESS
            ================================= */

            form.hidden =
                true;


            successBox.hidden =
                false;


            console.log(
                "Officer application:",
                data.officer
            );


        } catch (error) {

            console.error(
                "Officer registration error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to submit application.",
                "error"
            );

        } finally {

            registerButton.disabled =
                false;


            registerButton.textContent =
                "Submit Officer Application";

        }

    }
);


/* =========================================================
   HELPERS
========================================================= */

function showError(
    field,
    message
) {

    const input =
        document.getElementById(
            field
        );


    const error =
        document.getElementById(
            `${field}Error`
        );


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


function clearErrors() {

    document
        .querySelectorAll(
            ".error"
        )
        .forEach(
            error => {

                error.textContent =
                    "";

            }
        );


    document
        .querySelectorAll(
            ".input-error"
        )
        .forEach(
            input => {

                input.classList.remove(
                    "input-error"
                );

            }
        );

}


function showMessage(
    message,
    type
) {

    if (!registerMessage) {
        return;
    }


    registerMessage.textContent =
        message;


    registerMessage.className =
        "message";


    if (type) {

        registerMessage.classList.add(
            type
        );

    }

}


/* =========================================================
   START
========================================================= */

loadOrganizations();