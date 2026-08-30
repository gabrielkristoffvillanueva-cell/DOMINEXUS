/* =========================================================
   DOMINEXUS — OFFICER MEMBERS
   Laravel / MySQL Connected
========================================================= */


/* =========================================================
   API
========================================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


/* =========================================================
   OFFICER LOGIN
========================================================= */

const loggedIn =
    sessionStorage.getItem(
        "officerLoggedIn"
    );


if (loggedIn !== "true") {

    window.location.href =
        "officer-login.html";

}


const officerName =
    sessionStorage.getItem(
        "officerName"
    ) || "Officer";


const officerId =
    sessionStorage.getItem(
        "officerId"
    ) || "";


/* =========================================================
   ELEMENTS
========================================================= */

const topOfficerName =
    document.getElementById(
        "topOfficerName"
    );

const topOfficerId =
    document.getElementById(
        "topOfficerId"
    );

const topAvatar =
    document.getElementById(
        "topAvatar"
    );


const totalMembers =
    document.getElementById(
        "totalMembers"
    );

const activeMembers =
    document.getElementById(
        "activeMembers"
    );

const totalOfficers =
    document.getElementById(
        "totalOfficers"
    );


const membersTable =
    document.getElementById(
        "membersTable"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );

const roleFilter =
    document.getElementById(
        "roleFilter"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const menuButton =
    document.getElementById(
        "menuButton"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


/* =========================================================
   MEMBER MODAL
========================================================= */

const memberModal =
    document.getElementById(
        "memberModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const closeProfileButton =
    document.getElementById(
        "closeProfileButton"
    );

const modalAvatar =
    document.getElementById(
        "modalAvatar"
    );

const modalName =
    document.getElementById(
        "modalName"
    );

const modalStudentId =
    document.getElementById(
        "modalStudentId"
    );

const modalSection =
    document.getElementById(
        "modalSection"
    );

const modalRole =
    document.getElementById(
        "modalRole"
    );

const modalStatus =
    document.getElementById(
        "modalStatus"
    );

const modalAttendance =
    document.getElementById(
        "modalAttendance"
    );


/* =========================================================
   DATA
========================================================= */

let members = [];


/* =========================================================
   DISPLAY OFFICER
========================================================= */

if (topOfficerName) {

    topOfficerName.textContent =
        officerName;

}


if (topOfficerId) {

    topOfficerId.textContent =
        officerId ||
        "Officer ID";

}


if (topAvatar) {

    topAvatar.textContent =
        getInitials(
            officerName
        );

}


/* =========================================================
   LOAD MEMBERS FROM LARAVEL
========================================================= */

async function loadMembers() {

    if (!officerId) {

        console.error(
            "Officer ID is missing."
        );

        showLoadError(
            "Officer ID is missing."
        );

        return;

    }


    if (membersTable) {

        membersTable.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:40px;
                    "
                >

                    Loading members...

                </td>

            </tr>

        `;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/officer-members?officer_id=${encodeURIComponent(
                    officerId
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
            "DOMINEXUS MEMBERS RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Unable to load members (${response.status}).`
            );

        }


        members =
            Array.isArray(
                data.members
            )
                ? data.members
                : [];


        updateStatistics(
            data.statistics
        );


        displayMembers();


    } catch (error) {

        console.error(
            "MEMBERS LOAD ERROR:",
            error
        );


        members = [];


        updateStatistics({
            total_members: 0,
            active_members: 0,
            total_officers: 0
        });


        showLoadError(
            error.message ||
            "Unable to load members."
        );

    }

}


/* =========================================================
   DISPLAY MEMBERS
========================================================= */

function displayMembers() {

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
        members.filter(
            function(member) {

                const name =
                    String(
                        member.name ||
                        ""
                    ).toLowerCase();


                const studentId =
                    String(
                        member.student_id ||
                        ""
                    ).toLowerCase();


                const section =
                    String(
                        member.section ||
                        ""
                    ).toLowerCase();


                const role =
                    String(
                        member.club_role ||
                        "Member"
                    ).toLowerCase();


                const matchesSearch =
                    !search ||

                    name.includes(
                        search
                    ) ||

                    studentId.includes(
                        search
                    ) ||

                    section.includes(
                        search
                    );


                const matchesRole =
                    selectedRole ===
                        "all" ||

                    role ===
                        selectedRole.toLowerCase();


                return (
                    matchesSearch &&
                    matchesRole
                );

            }
        );


    if (membersTable) {

        membersTable.innerHTML =
            "";

    }


    if (
        filtered.length === 0
    ) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }


        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    filtered.forEach(
        function(member) {

            createMemberRow(
                member
            );

        }
    );

}


/* =========================================================
   CREATE MEMBER ROW
========================================================= */

function createMemberRow(
    member
) {

    if (!membersTable) {
        return;
    }


    const row =
        document.createElement(
            "tr"
        );


    const name =
        member.name ||
        "Unnamed Student";


    const studentId =
        member.student_id ||
        "No ID";


    const section =
        member.section ||
        "No Section";


    const role =
        member.club_role ||
        "Member";


    const status =
        member.status ||
        "Active";


    const attendance =
        Number(
            member.attendance
        ) || 0;


    row.innerHTML = `

        <td>

            <div class="member-name-cell">

                <div class="member-avatar">

                    ${escapeHTML(
                        getInitials(
                            name
                        )
                    )}

                </div>

                <div>

                    <strong>
                        ${escapeHTML(
                            name
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            studentId
                        )}
                    </span>

                </div>

            </div>

        </td>


        <td>
            ${escapeHTML(
                section
            )}
        </td>


        <td>

            <span class="
                role-badge
                ${getRoleClass(
                    role
                )}
            ">

                ${escapeHTML(
                    role
                )}

            </span>

        </td>


        <td>

            <span class="
                status-badge
                ${getStatusClass(
                    status
                )}
            ">

                ${escapeHTML(
                    status
                )}

            </span>

        </td>


        <td>

            <span class="attendance-value">

                ${attendance}%

            </span>

        </td>


        <td>

            <button
                type="button"
                class="view-button"
                data-member-id="${escapeHTML(
                    member.id
                )}"
            >

                View

            </button>

        </td>

    `;


    membersTable.appendChild(
        row
    );

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics(
    statistics
) {

    const stats =
        statistics || {};


    const total =
        Number(
            stats.total_members
        ) || 0;


    const active =
        Number(
            stats.active_members
        ) || 0;


    const officers =
        Number(
            stats.total_officers
        ) || 0;


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


/* =========================================================
   VIEW MEMBER
========================================================= */

if (membersTable) {

    membersTable.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    ".view-button"
                );


            if (!button) {
                return;
            }


            const memberId =
                button.dataset.memberId;


            const member =
                members.find(
                    function(item) {

                        return String(
                            item.id
                        ) === String(
                            memberId
                        );

                    }
                );


            if (member) {

                showMemberProfile(
                    member
                );

            }

        }
    );

}


/* =========================================================
   SHOW MEMBER PROFILE
========================================================= */

function showMemberProfile(
    member
) {

    const name =
        member.name ||
        "Unnamed Student";


    const studentId =
        member.student_id ||
        "No ID";


    const section =
        member.section ||
        "No Section";


    const role =
        member.club_role ||
        "Member";


    const status =
        member.status ||
        "Active";


    const attendance =
        Number(
            member.attendance
        ) || 0;


    if (modalAvatar) {

        modalAvatar.textContent =
            getInitials(
                name
            );

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


/* =========================================================
   CLOSE MODAL
========================================================= */

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
        function(event) {

            if (
                event.target ===
                memberModal
            ) {

                closeMemberModal();

            }

        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        displayMembers
    );

}


/* =========================================================
   ROLE FILTER
========================================================= */

if (roleFilter) {

    roleFilter.addEventListener(
        "change",
        displayMembers
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

if (
    menuButton &&
    sidebar &&
    sidebarOverlay
) {

    menuButton.addEventListener(
        "click",
        function() {

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


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function(link) {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );

}


function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            if (
                !confirm(
                    "Are you sure you want to log out?"
                )
            ) {

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


/* =========================================================
   LOAD ERROR
========================================================= */

function showLoadError(
    message
) {

    if (membersTable) {

        membersTable.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:40px;
                    "
                >

                    ${escapeHTML(
                        message
                    )}

                </td>

            </tr>

        `;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }

}


/* =========================================================
   HELPERS
========================================================= */

function getInitials(
    name
) {

    if (!name) {
        return "ST";
    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[
            parts.length - 1
        ].charAt(0)
    ).toUpperCase();

}


function getRoleClass(
    role
) {

    const value =
        String(
            role || ""
        ).toLowerCase();


    if (
        value ===
        "officer"
    ) {

        return "role-officer";

    }


    if (
        value ===
        "moderator"
    ) {

        return "role-moderator";

    }


    return "role-member";

}


function getStatusClass(
    status
) {

    const value =
        String(
            status || ""
        ).toLowerCase();


    if (
        value ===
        "inactive"
    ) {

        return "status-inactive";

    }


    return "status-active";

}


function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =========================================================
   INITIALIZE
========================================================= */

loadMembers();