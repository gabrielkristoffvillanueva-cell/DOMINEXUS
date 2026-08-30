/* =========================================================
   DOMINEXUS
   MODERATOR — STUDENT RECORDS
   Laravel / MySQL Connected
   Organization-Isolated
========================================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


/* =========================================================
   AUTHENTICATION
========================================================= */

if (
    sessionStorage.getItem(
        "moderatorLoggedIn"
    ) !== "true"
) {

    window.location.href =
        "moderator-login.html";

}


const moderatorId =
    sessionStorage.getItem(
        "moderatorId"
    );


if (!moderatorId) {

    alert(
        "Moderator session not found. Please log in again."
    );

    window.location.href =
        "moderator-login.html";

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const studentTableBody =
    document.getElementById(
        "studentTableBody"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const recordCount =
    document.getElementById(
        "recordCount"
    );

const totalStudents =
    document.getElementById(
        "totalStudents"
    );

const totalOrganizations =
    document.getElementById(
        "totalOrganizations"
    );

const activeStudents =
    document.getElementById(
        "activeStudents"
    );

const modal =
    document.getElementById(
        "studentModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const moderatorNameElement =
    document.getElementById(
        "moderatorName"
    );

const moderatorAvatar =
    document.getElementById(
        "moderatorAvatar"
    );


/* =========================================================
   RESET PASSWORD MODAL ELEMENTS
========================================================= */

const resetPasswordModal =
    document.getElementById(
        "resetPasswordModal"
    );

const resetStudentName =
    document.getElementById(
        "resetStudentName"
    );

const temporaryPasswordElement =
    document.getElementById(
        "temporaryPassword"
    );

const closeResetPasswordModal =
    document.getElementById(
        "closeResetPasswordModal"
    );

const doneResetPassword =
    document.getElementById(
        "doneResetPassword"
    );

const copyTemporaryPassword =
    document.getElementById(
        "copyTemporaryPassword"
    );

const copyPasswordMessage =
    document.getElementById(
        "copyPasswordMessage"
    );


/* =========================================================
   DATA
========================================================= */

let students = [];

let filteredStudents = [];


/* =========================================================
   MODERATOR INFORMATION
========================================================= */

const savedModeratorName =
    sessionStorage.getItem(
        "moderatorName"
    ) ||
    "Moderator";


if (
    moderatorNameElement
) {

    moderatorNameElement.textContent =
        savedModeratorName;

}


if (
    moderatorAvatar
) {

    moderatorAvatar.textContent =
        getInitials(
            savedModeratorName
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

loadStudents();


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    showLoading();


    try {

        const response =
            await fetch(
                `${API_BASE}/moderator-students?moderator_id=${encodeURIComponent(
                    moderatorId
                )}`,
                {
                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "MODERATOR STUDENTS RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load student records."
            );

        }


        students =
            Array.isArray(
                data.students
            )
                ? data.students
                : [];


        /*
         * Update moderator name
         * directly from backend.
         */

        if (
            data.moderator
        ) {

            if (
                data.moderator.name
            ) {

                if (
                    moderatorNameElement
                ) {

                    moderatorNameElement.textContent =
                        data.moderator.name;

                }


                if (
                    moderatorAvatar
                ) {

                    moderatorAvatar.textContent =
                        getInitials(
                            data.moderator.name
                        );

                }


                sessionStorage.setItem(
                    "moderatorName",
                    data.moderator.name
                );

            }


            if (
                data.moderator.organization_id
                !== undefined
            ) {

                sessionStorage.setItem(
                    "moderatorOrganizationId",
                    data.moderator.organization_id
                );

            }

        }


        filteredStudents =
            [...students];


        updateSummary();


        renderStudents(
            filteredStudents
        );


    } catch (error) {

        console.error(
            "STUDENT RECORD ERROR:",
            error
        );


        students =
            [];


        filteredStudents =
            [];


        updateSummary();


        studentTableBody.innerHTML =
            "";


        emptyState.classList.remove(
            "hidden"
        );


        emptyState.textContent =
            error.message ||
            "Unable to load student records.";

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    studentTableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                style="text-align:center;"
            >

                Loading student records...

            </td>

        </tr>

    `;


    emptyState.classList.add(
        "hidden"
    );

}


/* =========================================================
   SEARCH
========================================================= */

if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        function() {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!query) {

                filteredStudents =
                    [...students];


                renderStudents(
                    filteredStudents
                );


                return;

            }


            filteredStudents =
                students.filter(
                    function(student) {

                        const organization =
                            getOrganizationName(
                                student.organization
                            );


                        const values = [

                            student.name,

                            student.student_id,

                            student.unique_id,

                            student.section,

                            student.club_role,

                            student.role,

                            organization

                        ];


                        return values.some(
                            function(value) {

                                return String(
                                    value ||
                                    ""
                                )
                                .toLowerCase()
                                .includes(
                                    query
                                );

                            }
                        );

                    }
                );


            renderStudents(
                filteredStudents
            );

        }
    );

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents(
    list
) {

    studentTableBody.innerHTML =
        "";


    recordCount.textContent =
        list.length;


    if (
        list.length === 0
    ) {

        emptyState.classList.remove(
            "hidden"
        );


        emptyState.textContent =
            searchInput.value.trim()
                ? "No student records match your search."
                : "No student records found.";


        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    list.forEach(
        function(student) {

            const row =
                document.createElement(
                    "tr"
                );


            const name =
                student.name ||
                "Unknown Student";


            const studentId =
                student.student_id ||
                "—";


            const uniqueId =
                student.unique_id ||
                "—";


            const section =
                student.section ||
                "—";


            const role =
                student.club_role ||
                student.role ||
                "—";


            const organization =
                getOrganizationName(
                    student.organization
                );


            row.innerHTML = `

                <td>

                    <div class="student-name">

                        ${escapeHtml(
                            name
                        )}

                    </div>

                    <div class="student-section">

                        ${escapeHtml(
                            section
                        )}

                    </div>

                </td>


                <td>

                    ${escapeHtml(
                        studentId
                    )}

                </td>


                <td>

                    <span class="unique-id">

                        ${escapeHtml(
                            uniqueId
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHtml(
                        section
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        role
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        organization
                    )}

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="view-button"
                            data-action="view"
                            data-id="${escapeHtml(
                                student.id
                            )}"
                        >

                            View

                        </button>


                        <button
                            type="button"
                            class="reset-button"
                            data-action="reset-password"
                            data-id="${escapeHtml(
                                student.id
                            )}"
                        >

                            Reset Password

                        </button>

                    </div>

                </td>

            `;


            studentTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   TABLE ACTIONS
========================================================= */

studentTableBody.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;


        const id =
            button.dataset.id;


        const student =
            students.find(
                function(item) {

                    return (
                        String(
                            item.id
                        ) ===
                        String(
                            id
                        )
                    );

                }
            );


        if (!student) {

            alert(
                "Student record could not be found."
            );

            return;

        }


        /*
         * VIEW
         */

        if (
            action === "view"
        ) {

            showStudent(
                student
            );

            return;

        }


        /*
         * RESET PASSWORD
         */

        if (
            action ===
            "reset-password"
        ) {

            resetStudentPassword(
                student
            );

        }

    }
);


/* =========================================================
   RESET STUDENT PASSWORD
========================================================= */

async function resetStudentPassword(
    student
) {

    const studentName =
        student.name ||
        "this student";


    const studentId =
        student.student_id;


    if (!studentId) {

        alert(
            "This student does not have a valid Student ID."
        );

        return;

    }


    try {

        /*
         * Disable the reset button temporarily.
         */

        const buttons =
            document.querySelectorAll(
                `[data-id="${CSS.escape(
                    String(
                        student.id
                    )
                )}"]`
            );


        buttons.forEach(
            function(button) {

                if (
                    button.dataset.action ===
                    "reset-password"
                ) {

                    button.disabled =
                        true;

                    button.textContent =
                        "Resetting...";

                }

            }
        );


        /*
         * SEND RESET REQUEST
         */

        const response =
            await fetch(
                `${API_BASE}/moderator/reset-student-password`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            moderator_id:
                                moderatorId,

                            student_id:
                                studentId

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "RESET PASSWORD RESPONSE:",
            data
        );


        /*
         * HANDLE ERROR
         */

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to reset student password."
            );

        }


        /*
         * SHOW CUSTOM SUCCESS MODAL
         */

        if (
            resetStudentName
        ) {

            resetStudentName.textContent =
                data.student?.name ||
                studentName;

        }


        if (
            temporaryPasswordElement
        ) {

            temporaryPasswordElement.textContent =
                data.temporary_password ||
                "Unavailable";

        }


        if (
            copyPasswordMessage
        ) {

            copyPasswordMessage.textContent =
                "";

        }


        if (
            resetPasswordModal
        ) {

            resetPasswordModal.classList.remove(
                "hidden"
            );

        }


    } catch (error) {

        console.error(
            "PASSWORD RESET ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to reset student password."
        );


    } finally {

        /*
         * Restore reset button.
         */

        const buttons =
            document.querySelectorAll(
                `[data-id="${CSS.escape(
                    String(
                        student.id
                    )
                )}"]`
            );


        buttons.forEach(
            function(button) {

                if (
                    button.dataset.action ===
                    "reset-password"
                ) {

                    button.disabled =
                        false;

                    button.textContent =
                        "Reset Password";

                }

            }
        );

    }

}


/* =========================================================
   CLOSE STUDENT MODAL
========================================================= */

if (
    closeModal
) {

    closeModal.addEventListener(
        "click",
        function() {

            modal.classList.add(
                "hidden"
            );

        }
    );

}


if (
    modal
) {

    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                modal
            ) {

                modal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   RESET PASSWORD MODAL CONTROLS
========================================================= */

function closeResetModal() {

    if (
        resetPasswordModal
    ) {

        resetPasswordModal.classList.add(
            "hidden"
        );

    }


    if (
        copyPasswordMessage
    ) {

        copyPasswordMessage.textContent =
            "";

    }

}


if (
    closeResetPasswordModal
) {

    closeResetPasswordModal.addEventListener(
        "click",
        closeResetModal
    );

}


if (
    doneResetPassword
) {

    doneResetPassword.addEventListener(
        "click",
        closeResetModal
    );

}


if (
    resetPasswordModal
) {

    resetPasswordModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                resetPasswordModal
            ) {

                closeResetModal();

            }

        }
    );

}


/* =========================================================
   COPY TEMPORARY PASSWORD
========================================================= */

if (
    copyTemporaryPassword
) {

    copyTemporaryPassword.addEventListener(
        "click",
        async function() {

            const password =
                temporaryPasswordElement
                    ?.textContent
                    ?.trim();


            if (
                !password ||
                password === "—" ||
                password === "Unavailable"
            ) {

                return;

            }


            try {

                await navigator.clipboard.writeText(
                    password
                );


                if (
                    copyPasswordMessage
                ) {

                    copyPasswordMessage.textContent =
                        "Temporary password copied.";

                }


                copyTemporaryPassword.textContent =
                    "Copied!";


                setTimeout(
                    function() {

                        copyTemporaryPassword.textContent =
                            "Copy";

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "COPY PASSWORD ERROR:",
                    error
                );


                if (
                    copyPasswordMessage
                ) {

                    copyPasswordMessage.textContent =
                        "Unable to copy password.";

                }

            }

        }
    );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            if (
                resetPasswordModal &&
                !resetPasswordModal.classList.contains(
                    "hidden"
                )
            ) {

                closeResetModal();

                return;

            }


            if (
                modal &&
                !modal.classList.contains(
                    "hidden"
                )
            ) {

                modal.classList.add(
                    "hidden"
                );

            }

        }

    }
);


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    if (
        totalStudents
    ) {

        totalStudents.textContent =
            students.length;

    }


    const organizations =
        new Set();


    students.forEach(
        function(student) {

            const organization =
                getOrganizationName(
                    student.organization
                );


            if (
                organization &&
                organization !==
                "Unknown Organization"
            ) {

                organizations.add(
                    organization
                );

            }

        }
    );


    if (
        totalOrganizations
    ) {

        totalOrganizations.textContent =
            organizations.size;

    }


    const active =
        students.filter(
            function(student) {

                return (
                    String(
                        student.status ||
                        ""
                    )
                    .toLowerCase() ===
                    "active"
                );

            }
        );


    if (
        activeStudents
    ) {

        activeStudents.textContent =
            active.length;

    }

}


/* =========================================================
   LOGOUT
========================================================= */

if (
    logoutButton
) {

    logoutButton.addEventListener(
        "click",
        function() {

            const confirmed =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmed) {

                return;

            }


            sessionStorage.removeItem(
                "moderatorLoggedIn"
            );


            sessionStorage.removeItem(
                "moderatorId"
            );


            sessionStorage.removeItem(
                "moderatorName"
            );


            sessionStorage.removeItem(
                "moderatorRole"
            );


            sessionStorage.removeItem(
                "moderatorStatus"
            );


            sessionStorage.removeItem(
                "moderatorOrganizationId"
            );


            sessionStorage.removeItem(
                "moderatorOrganization"
            );


            window.location.href =
                "moderator-login.html";

        }
    );

}


/* =========================================================
   HELPERS
========================================================= */

function getOrganizationName(
    organization
) {

    if (!organization) {

        return "Unknown Organization";

    }


    if (
        typeof organization ===
        "object"
    ) {

        return (
            organization.name ||
            organization.title ||
            "Unknown Organization"
        );

    }


    return String(
        organization
    );

}


function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ??
            ""
        );


    return div.innerHTML;

}


function getInitials(
    name
) {

    if (!name) {

        return "MO";

    }


    const parts =
        String(
            name
        )
        .trim()
        .split(/\s+/);


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[
            parts.length - 1
        ].charAt(0)
    ).toUpperCase();

}