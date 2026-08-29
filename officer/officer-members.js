/* =========================================
   DOMINEXUS OFFICER MEMBERS
   Connected to Student Registration
========================================= */


/* =========================================
   CHECK OFFICER LOGIN
========================================= */

const loggedIn =
    sessionStorage.getItem("officerLoggedIn");

if (loggedIn !== "true") {

    window.location.href =
        "officer-login.html";

}


/* =========================================
   OFFICER INFORMATION
========================================= */

const officerName =
    sessionStorage.getItem("officerName")
    || "Officer";

const officerId =
    sessionStorage.getItem("officerId")
    || "Officer ID";


/* =========================================
   ELEMENTS
========================================= */

const topOfficerName =
    document.getElementById("topOfficerName");

const topOfficerId =
    document.getElementById("topOfficerId");

const topAvatar =
    document.getElementById("topAvatar");

const totalMembers =
    document.getElementById("totalMembers");

const activeMembers =
    document.getElementById("activeMembers");

const totalOfficers =
    document.getElementById("totalOfficers");

const membersTable =
    document.getElementById("membersTable");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const roleFilter =
    document.getElementById("roleFilter");

const logoutButton =
    document.getElementById("logoutButton");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* =========================================
   MEMBER MODAL
========================================= */

const memberModal =
    document.getElementById("memberModal");

const closeModal =
    document.getElementById("closeModal");

const closeProfileButton =
    document.getElementById("closeProfileButton");

const modalAvatar =
    document.getElementById("modalAvatar");

const modalName =
    document.getElementById("modalName");

const modalStudentId =
    document.getElementById("modalStudentId");

const modalSection =
    document.getElementById("modalSection");

const modalRole =
    document.getElementById("modalRole");

const modalStatus =
    document.getElementById("modalStatus");

const modalAttendance =
    document.getElementById("modalAttendance");


/* =========================================
   DISPLAY OFFICER
========================================= */

if (topOfficerName) {
    topOfficerName.textContent =
        officerName;
}

if (topOfficerId) {
    topOfficerId.textContent =
        officerId;
}

if (topAvatar) {
    topAvatar.textContent =
        getInitials(officerName);
}


/* =========================================
   GET REGISTERED STUDENTS
========================================= */

function getRegisteredStudents() {

    try {

        const savedStudents =
            localStorage.getItem(
                "dominexus_students"
            );

        if (!savedStudents) {
            return [];
        }

        const parsedStudents =
            JSON.parse(savedStudents);

        if (!Array.isArray(parsedStudents)) {
            return [];
        }

        return parsedStudents;

    } catch (error) {

        console.error(
            "Unable to load registered students:",
            error
        );

        return [];

    }

}


/* =========================================
   LOAD MEMBERS
========================================= */

let members =
    getRegisteredStudents();


/* =========================================
   DISPLAY MEMBERS
========================================= */

function displayMembers() {

    /*
       IMPORTANT:
       Reload the students every time
       instead of keeping an old copy.
    */

    members =
        getRegisteredStudents();


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedRole =
        roleFilter
            ? roleFilter.value
            : "all";


    const filtered =
        members.filter(member => {

            const name =
                member.fullName ||
                member.name ||
                "Unnamed Student";


            const studentId =
                member.studentId ||
                "";


            const section =
                member.section ||
                "";


            const role =
                member.clubRole ||
                member.role ||
                "Member";


            const matchesSearch =

                name
                    .toLowerCase()
                    .includes(search)

                ||

                studentId
                    .toLowerCase()
                    .includes(search)

                ||

                section
                    .toLowerCase()
                    .includes(search);


            const matchesRole =
                selectedRole === "all" ||
                role.toLowerCase() ===
                selectedRole.toLowerCase();


            return (
                matchesSearch &&
                matchesRole
            );

        });


    /*
       Clear old table
    */

    if (membersTable) {
        membersTable.innerHTML = "";
    }


    /*
       Empty state
    */

    if (filtered.length === 0) {

        if (emptyState) {
            emptyState.style.display =
                "block";
        }

    } else {

        if (emptyState) {
            emptyState.style.display =
                "none";
        }

    }


    /*
       Create rows
    */

    filtered.forEach(member => {

        if (!membersTable) {
            return;
        }


        const row =
            document.createElement("tr");


        const name =
            member.fullName ||
            member.name ||
            "Unnamed Student";


        const studentId =
            member.studentId ||
            "No ID";


        const section =
            member.section ||
            "No Section";


        const role =
            member.clubRole ||
            member.role ||
            "Member";


        const status =
            member.status ||
            "Active";


        const attendance =
            calculateAttendance(
                member
            );


        row.innerHTML = `

            <td>

                <div class="member-name-cell">

                    <div class="member-avatar">

                        ${escapeHTML(
                            getInitials(name)
                        )}

                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <span>
                            ${escapeHTML(studentId)}
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(section)}
            </td>


            <td>

                <span class="
                    role-badge
                    ${getRoleClass(role)}
                ">

                    ${escapeHTML(role)}

                </span>

            </td>


            <td>

                <span class="
                    status-badge
                    ${getStatusClass(status)}
                ">

                    ${escapeHTML(status)}

                </span>

            </td>


            <td>

                <span class="attendance-value">

                    ${attendance}%

                </span>

            </td>


            <td>

                <button
                    class="view-button"
                    data-student-id="${escapeHTML(
                        studentId
                    )}">

                    View

                </button>

            </td>

        `;


        membersTable.appendChild(row);

    });


    updateStatistics();

}


/* =========================================
   UPDATE STATISTICS
========================================= */

function updateStatistics() {

    /*
       Always get the newest data.
    */

    members =
        getRegisteredStudents();


    const total =
        members.length;


    const active =
        members.filter(member => {

            const status =
                member.status ||
                "Active";

            return (
                status.toLowerCase() ===
                "active"
            );

        }).length;


    const officers =
        members.filter(member => {

            const role =
                member.clubRole ||
                member.role ||
                "Member";

            return (
                role.toLowerCase() ===
                "officer"
            );

        }).length;


    if (totalMembers) {
        totalMembers.textContent =
            total;
    }


    if (activeMembers) {
        activeMembers.textContent =
            active;
    }


    if (totalOfficers) {
        totalOfficers.textContent =
            officers;
    }

}


/* =========================================
   CALCULATE ATTENDANCE
========================================= */

function calculateAttendance(member) {

    const history =
        Array.isArray(
            member.attendanceHistory
        )
            ? member.attendanceHistory
            : [];


    if (history.length === 0) {

        return 0;

    }


    const present =
        history.filter(record => {

            const status =
                record.status ||
                "";

            return (
                status.toLowerCase() ===
                    "present"

                ||

                status.toLowerCase() ===
                    "late"
            );

        }).length;


    return Math.round(
        (present / history.length) * 100
    );

}


/* =========================================
   VIEW MEMBER
========================================= */

if (membersTable) {

    membersTable.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".view-button"
                );


            if (!button) {
                return;
            }


            const studentId =
                button.dataset.studentId;


            const student =
                getRegisteredStudents()
                    .find(member => {

                        return (
                            String(
                                member.studentId
                            ).toLowerCase() ===
                            String(
                                studentId
                            ).toLowerCase()
                        );

                    });


            if (student) {

                showMemberProfile(
                    student
                );

            }

        }
    );

}


/* =========================================
   SHOW MEMBER PROFILE
========================================= */

function showMemberProfile(student) {

    const name =
        student.fullName ||
        student.name ||
        "Unnamed Student";


    const studentId =
        student.studentId ||
        "No ID";


    const section =
        student.section ||
        "No Section";


    const role =
        student.clubRole ||
        student.role ||
        "Member";


    const status =
        student.status ||
        "Active";


    const attendance =
        calculateAttendance(
            student
        );


    if (modalAvatar) {

        modalAvatar.textContent =
            getInitials(name);

    }


    if (modalName) {

        modalName.textContent =
            name;

    }


    if (modalStudentId) {

        modalStudentId.textContent =
            studentId;

    }


    if (modalSection) {

        modalSection.textContent =
            section;

    }


    if (modalRole) {

        modalRole.textContent =
            role;

    }


    if (modalStatus) {

        modalStatus.textContent =
            status;

    }


    if (modalAttendance) {

        modalAttendance.textContent =
            attendance + "%";

    }


    if (memberModal) {

        memberModal.classList.add(
            "show"
        );

    }

}


/* =========================================
   CLOSE MEMBER MODAL
========================================= */

function closeMemberModal() {

    if (memberModal) {

        memberModal.classList.remove(
            "show"
        );

    }

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeMemberModal
    );

}


if (closeProfileButton) {

    closeProfileButton.addEventListener(
        "click",
        closeMemberModal
    );

}


if (memberModal) {

    memberModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                memberModal
            ) {

                closeMemberModal();

            }

        }
    );

}


/* =========================================
   SEARCH
========================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        displayMembers
    );

}


/* =========================================
   ROLE FILTER
========================================= */

if (roleFilter) {

    roleFilter.addEventListener(
        "change",
        displayMembers
    );

}


/* =========================================
   REFRESH WHEN PAGE BECOMES ACTIVE
========================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            "dominexus_students"
        ) {

            displayMembers();

        }

    }
);


/*
   This also checks again whenever
   the Officer Members page becomes
   visible.
*/

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            displayMembers();

        }

    }
);


/* =========================================
   GET INITIALS
========================================= */

function getInitials(name) {

    if (!name) {
        return "ST";
    }


    const parts =
        name
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();

}


/* =========================================
   ROLE CLASS
========================================= */

function getRoleClass(role) {

    const value =
        String(role)
            .toLowerCase();


    if (value === "officer") {
        return "role-officer";
    }


    if (value === "moderator") {
        return "role-moderator";
    }


    return "role-member";

}


/* =========================================
   STATUS CLASS
========================================= */

function getStatusClass(status) {

    const value =
        String(status)
            .toLowerCase();


    if (value === "inactive") {
        return "status-inactive";
    }


    return "status-active";

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmLogout) {
                return;
            }


            sessionStorage.removeItem(
                "officerLoggedIn"
            );

            sessionStorage.removeItem(
                "officerId"
            );

            sessionStorage.removeItem(
                "officerName"
            );

            sessionStorage.removeItem(
                "officerOrganization"
            );


            window.location.href =
                "officer-login.html";

        }
    );

}


/* =========================================
   MOBILE MENU
========================================= */

if (
    menuButton &&
    sidebar &&
    sidebarOverlay
) {

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.add(
                "open"
            );

            sidebarOverlay.classList.add(
                "show"
            );

        }
    );


    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );


    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

        sidebarOverlay.classList.remove(
            "show"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(link => {

            link.addEventListener(
                "click",
                closeSidebar
            );

        });

}


/* =========================================
   INITIALIZE
========================================= */

displayMembers();