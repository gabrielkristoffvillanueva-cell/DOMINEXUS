/* =========================================================
   DOMINEXUS
   MODERATOR - STUDENT RECORDS
========================================================= */


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


/* =========================================================
   STORAGE
========================================================= */

const STUDENTS_KEY =
    "dominexus_students";


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


/* =========================================================
   MODERATOR INFORMATION
========================================================= */

const moderatorName =
    sessionStorage.getItem(
        "moderatorName"
    ) ||
    "System Moderator";


document.getElementById(
    "moderatorName"
).textContent =
    moderatorName;


document.getElementById(
    "moderatorAvatar"
).textContent =
    getInitials(
        moderatorName
    );


/* =========================================================
   STUDENT DATA
========================================================= */

let students =
    getStudents();


/* =========================================================
   INITIALIZE
========================================================= */

updateSummary();

renderStudents(
    students
);


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    function () {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!query) {

            renderStudents(
                students
            );

            return;

        }


        const filtered =
            students.filter(
                function (student) {

                    const values = [

                        student.fullName,

                        student.name,

                        student.studentId,

                        student.uniqueId,

                        student.section,

                        student.clubRole,

                        student.role,

                        student.organization

                    ];


                    return values.some(
                        function (value) {

                            return String(
                                value || ""
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
            filtered
        );

    }
);


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

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    list.forEach(
        function (student) {

            const row =
                document.createElement(
                    "tr"
                );


            const name =
                student.fullName ||
                student.name ||
                "Unknown Student";


            const studentId =
                student.studentId ||
                "—";


            const uniqueId =
                student.uniqueId ||
                "—";


            const section =
                student.section ||
                "—";


            const role =
                student.clubRole ||
                student.role ||
                "—";


            const organization =
                student.organization ||
                "—";


            row.innerHTML = `

                <td>

                    <div class="student-name">
                        ${escapeHtml(name)}
                    </div>

                    <div class="student-section">
                        ${escapeHtml(section)}
                    </div>

                </td>


                <td>
                    ${escapeHtml(studentId)}
                </td>


                <td>

                    <span class="unique-id">
                        ${escapeHtml(uniqueId)}
                    </span>

                </td>


                <td>
                    ${escapeHtml(section)}
                </td>


                <td>
                    ${escapeHtml(role)}
                </td>


                <td>
                    ${escapeHtml(organization)}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="view-button"
                            data-action="view"
                            data-unique-id="${escapeHtml(uniqueId)}"
                        >
                            View
                        </button>


                        <button
                            type="button"
                            class="delete-button"
                            data-action="delete"
                            data-unique-id="${escapeHtml(uniqueId)}"
                        >
                            Delete
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
    function (event) {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;


        const uniqueId =
            button.dataset.uniqueId;


        if (!uniqueId) {

            return;

        }


        /* =========================================
           VIEW
        ========================================= */

        if (
            action === "view"
        ) {

            const student =
                students.find(
                    function (item) {

                        return (
                            String(
                                item.uniqueId ||
                                ""
                            ).trim() ===
                            String(
                                uniqueId
                            ).trim()
                        );

                    }
                );


            if (!student) {

                alert(
                    "Student record could not be found."
                );

                return;

            }


            showStudent(
                student
            );


            return;

        }


        /* =========================================
           DELETE
        ========================================= */

        if (
            action === "delete"
        ) {

            deleteStudent(
                uniqueId
            );

        }

    }
);


/* =========================================================
   DELETE STUDENT
========================================================= */

function deleteStudent(
    uniqueId
) {

    const student =
        students.find(
            function (item) {

                return (
                    String(
                        item.uniqueId ||
                        ""
                    ).trim() ===
                    String(
                        uniqueId
                    ).trim()
                );

            }
        );


    if (!student) {

        alert(
            "Student record could not be found."
        );

        return;

    }


    const name =
        student.fullName ||
        student.name ||
        "this student";


    const confirmed =
        confirm(
            "Are you sure you want to delete the student record for " +
            name +
            "?\n\nThis will permanently remove the student's registered account data from this browser."
        );


    if (!confirmed) {

        return;

    }


    /*
     * Remove the selected student
     * from the local array.
     */

    students =
        students.filter(
            function (item) {

                return (
                    String(
                        item.uniqueId ||
                        ""
                    ).trim() !==
                    String(
                        uniqueId
                    ).trim()
                );

            }
        );


    /*
     * Save the updated records.
     */

    saveStudents(
        students
    );


    /*
     * Close the modal if it is open.
     */

    modal.classList.add(
        "hidden"
    );


    /*
     * Update the page.
     */

    updateSummary();


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (query) {

        const filtered =
            students.filter(
                function (student) {

                    const values = [

                        student.fullName,

                        student.name,

                        student.studentId,

                        student.uniqueId,

                        student.section,

                        student.clubRole,

                        student.role,

                        student.organization

                    ];


                    return values.some(
                        function (value) {

                            return String(
                                value || ""
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
            filtered
        );

    } else {

        renderStudents(
            students
        );

    }


    alert(
        "Student record deleted successfully."
    );

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
        student.fullName ||
        student.name ||
        "—";


    document.getElementById(
        "detailStudentId"
    ).textContent =
        student.studentId ||
        "—";


    document.getElementById(
        "detailUniqueId"
    ).textContent =
        student.uniqueId ||
        "—";


    document.getElementById(
        "detailSection"
    ).textContent =
        student.section ||
        "—";


    document.getElementById(
        "detailRole"
    ).textContent =
        student.clubRole ||
        student.role ||
        "—";


    document.getElementById(
        "detailOrganization"
    ).textContent =
        student.organization ||
        "—";


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
        student.digitalSignature ||
        student.signature ||
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
    function () {

        modal.classList.add(
            "hidden"
        );

    }
);


modal.addEventListener(
    "click",
    function (event) {

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
    function (event) {

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
        function (student) {

            const organization =
                String(
                    student.organization ||
                    ""
                ).trim();


            if (
                organization
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
            function (student) {

                return (
                    student.active !== false &&
                    student.status !== "inactive"
                );

            }
        );


    activeStudents.textContent =
        active.length;

}


/* =========================================================
   GET STUDENTS
========================================================= */

function getStudents() {

    try {

        const raw =
            localStorage.getItem(
                STUDENTS_KEY
            );


        if (!raw) {

            return [];

        }


        const parsed =
            JSON.parse(
                raw
            );


        if (
            Array.isArray(
                parsed
            )
        ) {

            return parsed;

        }


        return [];

    } catch (error) {

        console.error(
            "DOMINEXUS: Unable to load students:",
            error
        );


        return [];

    }

}


/* =========================================================
   SAVE STUDENTS
========================================================= */

function saveStudents(
    studentList
) {

    try {

        localStorage.setItem(
            STUDENTS_KEY,
            JSON.stringify(
                studentList
            )
        );


        console.log(
            "DOMINEXUS: Student records updated."
        );


    } catch (error) {

        console.error(
            "DOMINEXUS: Unable to save students:",
            error
        );


        alert(
            "The student record could not be saved."
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    function () {

        if (
            !confirm(
                "Are you sure you want to log out?"
            )
        ) {

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


        window.location.href =
            "moderator-login.html";

    }
);


/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


function getInitials(
    name
) {

    const parts =
        name
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
        parts[0][0] +
        parts[
            parts.length - 1
        ][0]
    ).toUpperCase();

}