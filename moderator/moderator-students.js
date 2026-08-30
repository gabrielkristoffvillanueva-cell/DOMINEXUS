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

                moderatorNameElement.textContent =
                    data.moderator.name;


                moderatorAvatar.textContent =
                    getInitials(
                        data.moderator.name
                    );


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


    const confirmed =
        confirm(
            `Reset the password for ${studentName}?\n\nA new temporary password will be generated.`
        );


    if (!confirmed) {

        return;

    }


    try {

        /*
         * Disable buttons temporarily.
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


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to reset student password."
            );

        }


        /*
         * Show temporary password.
         *
         * It is returned only from
         * this reset request.
         */

        alert(

            "Password reset successfully.\n\n" +

            "Student: " +
            (
                data.student?.name ||
                studentName
            ) +

            "\n\nTemporary Password:\n" +

            (
                data.temporary_password ||
                "Unavailable"
            ) +

            "\n\nGive this temporary password to the student."

        );


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
         * Restore button.
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
   SHOW STUDENT
========================================================= */

function showStudent(
    student
) {

    document.getElementById(
        "detailName"
    ).textContent =
        student.name ||
        "—";


    document.getElementById(
        "detailStudentId"
    ).textContent =
        student.student_id ||
        "—";


    document.getElementById(
        "detailUniqueId"
    ).textContent =
        student.unique_id ||
        "—";


    document.getElementById(
        "detailSection"
    ).textContent =
        student.section ||
        "—";


    document.getElementById(
        "detailRole"
    ).textContent =
        student.club_role ||
        student.role ||
        "—";


    document.getElementById(
        "detailOrganization"
    ).textContent =
        getOrganizationName(
            student.organization
        );


    /*
     * DIGITAL SIGNATURE
     */

    const signatureImage =
        document.getElementById(
            "detailSignature"
        );


    const signatureUnavailable =
        document.getElementById(
            "signatureUnavailable"
        );


    const signature =
        student.digital_signature ||
        "";


    if (
        signature &&
        signatureImage
    ) {

        signatureImage.src =
            signature;


        signatureImage.style.display =
            "block";


        if (
            signatureUnavailable
        ) {

            signatureUnavailable.style.display =
                "none";

        }

    } else {

        if (
            signatureImage
        ) {

            signatureImage.removeAttribute(
                "src"
            );


            signatureImage.style.display =
                "none";

        }


        if (
            signatureUnavailable
        ) {

            signatureUnavailable.style.display =
                "inline";

        }

    }


    modal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

closeModal.addEventListener(
    "click",
    function() {

        modal.classList.add(
            "hidden"
        );

    }
);


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

            modal.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    totalStudents.textContent =
        students.length;


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


    totalOrganizations.textContent =
        organizations.size;


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


    activeStudents.textContent =
        active.length;

}


/* =========================================================
   LOGOUT
========================================================= */

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