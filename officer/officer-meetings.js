/* =========================================================
   DOMINEXUS — OFFICER MEETINGS
   Laravel API Connected
========================================================= */

const API_BASE = "http://127.0.0.1:8000/api";


/* =========================================================
   LOGIN
========================================================= */

if (
    sessionStorage.getItem("officerLoggedIn") !== "true"
) {
    window.location.href = "officer-login.html";
}


const officerId =
    sessionStorage.getItem("officerId") || "";

const officerName =
    sessionStorage.getItem("officerName") || "Officer";


/* =========================================================
   ELEMENTS
========================================================= */

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");

const topOfficerName =
    document.getElementById("topOfficerName");

const topOfficerId =
    document.getElementById("topOfficerId");

const topAvatar =
    document.getElementById("topAvatar");

const meetingsGrid =
    document.getElementById("meetingsGrid");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const totalMeetings =
    document.getElementById("totalMeetings");

const upcomingMeetings =
    document.getElementById("upcomingMeetings");

const completedMeetings =
    document.getElementById("completedMeetings");


/* =========================================================
   CREATE / EDIT MODAL
========================================================= */

const meetingModal =
    document.getElementById("meetingModal");

const openCreateButton =
    document.getElementById("openCreateButton");

const closeModal =
    document.getElementById("closeModal");

const cancelButton =
    document.getElementById("cancelButton");

const meetingForm =
    document.getElementById("meetingForm");

const modalTitle =
    document.getElementById("modalTitle");

const editingMeetingId =
    document.getElementById("editingMeetingId");

const meetingTitle =
    document.getElementById("meetingTitle");

const meetingDate =
    document.getElementById("meetingDate");

const meetingTime =
    document.getElementById("meetingTime");

const meetingDescription =
    document.getElementById("meetingDescription");


/* =========================================================
   DELETE MODAL
========================================================= */

const deleteModal =
    document.getElementById("deleteModal");

const cancelDelete =
    document.getElementById("cancelDelete");

const confirmDelete =
    document.getElementById("confirmDelete");


/* =========================================================
   DATA
========================================================= */

let meetings = [];

let currentDeleteId = null;


/* =========================================================
   TOPBAR
========================================================= */

if (topOfficerName) {
    topOfficerName.textContent =
        officerName;
}

if (topOfficerId) {
    topOfficerId.textContent =
        officerId || "Officer ID";
}

if (topAvatar) {
    topAvatar.textContent =
        getInitials(officerName);
}


/* =========================================================
   LOAD MEETINGS
========================================================= */

async function loadMeetings() {

    if (meetingsGrid) {

        meetingsGrid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
                color:#888;
            ">
                Loading meetings...
            </div>
        `;

    }


    try {

        if (!officerId) {

            throw new Error(
                "Officer ID is missing."
            );

        }


        const response =
            await fetch(
                `${API_BASE}/meetings?officer_id=${encodeURIComponent(
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
            "DOMINEXUS meetings:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load meetings."
            );

        }


        meetings =
            Array.isArray(data)
                ? data
                : data.meetings || [];


        displayMeetings();


    } catch (error) {

        console.error(
            "MEETINGS LOAD ERROR:",
            error
        );


        meetings = [];


        if (meetingsGrid) {

            meetingsGrid.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:40px;
                    color:#a33;
                ">
                    Unable to load meetings.
                </div>
            `;

        }


        updateSummary();

    }

}


/* =========================================================
   DISPLAY MEETINGS
========================================================= */

function displayMeetings() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    const filtered =
        meetings.filter(
            meeting => {

                const title =
                    String(
                        meeting.title ||
                        ""
                    ).toLowerCase();


                const location =
                    String(
                        meeting.location ||
                        ""
                    ).toLowerCase();


                const status =
                    normalizeStatus(
                        meeting.status
                    );


                const matchesSearch =
                    !search ||
                    title.includes(search) ||
                    location.includes(search);


                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    if (meetingsGrid) {

        meetingsGrid.innerHTML = "";

    }


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


        filtered.forEach(
            meeting => {

                createMeetingCard(
                    meeting
                );

            }
        );

    }


    updateSummary();

}


/* =========================================================
   CREATE MEETING CARD
========================================================= */

function createMeetingCard(
    meeting
) {

    const card =
        document.createElement("div");

    card.className =
        "meeting-card";


    const status =
        normalizeStatus(
            meeting.status
        );


    const date =
        formatMeetingDate(
            meeting.date
        );


    const location =
        meeting.location ||
        "No location specified";


    const time =
        formatTime(
            meeting.start_time
        );


    const description =
        meeting.description ||
        "Organization meeting";


    const statusClass =
        status === "completed"
            ? "completed"
            : "";


    card.innerHTML = `

        <div class="meeting-card-header">

            <div class="meeting-date-box">

                <span class="month">
                    ${escapeHTML(date.month)}
                </span>

                <span class="day">
                    ${escapeHTML(date.day)}
                </span>

            </div>


            <span class="
                meeting-status
                ${statusClass}
            ">

                ${escapeHTML(
                    capitalize(status)
                )}

            </span>

        </div>


        <h3>
            ${escapeHTML(
                meeting.title ||
                "Untitled Meeting"
            )}
        </h3>


        <p class="meeting-description">

            ${escapeHTML(
                description
            )}

        </p>


        <div class="meeting-info">

            <div class="info-item">

                <span class="info-icon">
                    ◷
                </span>

                ${escapeHTML(time)}

            </div>


            <div class="info-item">

                <span class="info-icon">
                    📍
                </span>

                ${escapeHTML(location)}

            </div>


            <div class="info-item">

                <span class="info-icon">
                    ▦
                </span>

                ${escapeHTML(
                    date.full
                )}

            </div>

        </div>


        <div class="meeting-actions">

            <button
                type="button"
                class="edit-button"
                data-id="${meeting.id}"
            >
                Edit
            </button>


            <button
                type="button"
                class="delete-meeting-button"
                data-id="${meeting.id}"
            >
                Delete
            </button>

        </div>

    `;


    meetingsGrid.appendChild(
        card
    );

}


/* =========================================================
   CARD BUTTONS
========================================================= */

if (meetingsGrid) {

    meetingsGrid.addEventListener(
        "click",
        event => {

            const editButton =
                event.target.closest(
                    ".edit-button"
                );


            const deleteButton =
                event.target.closest(
                    ".delete-meeting-button"
                );


            if (editButton) {

                const meeting =
                    meetings.find(
                        item =>
                            String(item.id) ===
                            String(
                                editButton.dataset.id
                            )
                    );


                if (meeting) {

                    openEditModal(
                        meeting
                    );

                }

                return;
            }


            if (deleteButton) {

                currentDeleteId =
                    deleteButton.dataset.id;

                openDeleteModal();

            }

        }
    );

}


/* =========================================================
   OPEN CREATE MODAL
========================================================= */

if (openCreateButton) {

    openCreateButton.addEventListener(
        "click",
        () => {

            resetMeetingForm();

            modalTitle.textContent =
                "Create Meeting";

            meetingModal.classList.add(
                "show"
            );

        }
    );

}


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditModal(
    meeting
) {

    resetMeetingForm();


    modalTitle.textContent =
        "Edit Meeting";


    editingMeetingId.value =
        meeting.id;


    meetingTitle.value =
        meeting.title || "";


    meetingDate.value =
        formatDateForInput(
            meeting.date
        );


    meetingTime.value =
        formatTimeForInput(
            meeting.start_time
        );


    meetingDescription.value =
        meeting.description || "";


    meetingModal.classList.add(
        "show"
    );

}


/* =========================================================
   RESET FORM
========================================================= */

function resetMeetingForm() {

    if (meetingForm) {

        meetingForm.reset();

    }


    if (editingMeetingId) {

        editingMeetingId.value =
            "";

    }

}


/* =========================================================
   CLOSE MEETING MODAL
========================================================= */

function closeMeetingModal() {

    meetingModal.classList.remove(
        "show"
    );

    resetMeetingForm();

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeMeetingModal
    );

}


if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        closeMeetingModal
    );

}


if (meetingModal) {

    meetingModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                meetingModal
            ) {

                closeMeetingModal();

            }

        }
    );

}


/* =========================================================
   CREATE / UPDATE
========================================================= */

if (meetingForm) {

    meetingForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const id =
                editingMeetingId.value;


            const isEditing =
                Boolean(id);


            const title =
                meetingTitle.value.trim();


            const date =
                meetingDate.value;


            const time =
                meetingTime.value;


            const description =
                meetingDescription.value.trim();


            if (
                !title ||
                !date ||
                !time
            ) {

                alert(
                    "Please complete the required meeting fields."
                );

                return;

            }


            const payload = {

                officer_id:
                    officerId,

                title:
                    title,

                date:
                    date,

                start_time:
                    time,

                end_time:
                    null,

                location:
                    null,

                status:
                    null

            };


            const saveButton =
                meetingForm.querySelector(
                    ".save-button"
                );


            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    isEditing
                        ? "Updating..."
                        : "Saving...";

            }


            try {

                const url =
                    isEditing
                        ? `${API_BASE}/meetings/${id}`
                        : `${API_BASE}/meetings`;


                const method =
                    isEditing
                        ? "PUT"
                        : "POST";


                const response =
                    await fetch(
                        url,
                        {
                            method:
                                method,

                            headers: {

                                "Accept":
                                    "application/json",

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    payload
                                )

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "MEETING SAVE:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to save meeting."
                    );

                }


                /*
                 * The current backend does not
                 * have a description column in the
                 * Meeting model.
                 *
                 * Therefore the description field
                 * is intentionally not sent.
                 */


                closeMeetingModal();


                await loadMeetings();


            } catch (error) {

                console.error(
                    "MEETING SAVE ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to save meeting."
                );


            } finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Save Meeting";

                }

            }

        }
    );

}


/* =========================================================
   DELETE MODAL
========================================================= */

function openDeleteModal() {

    deleteModal.classList.add(
        "show"
    );

}


function closeDeleteModal() {

    deleteModal.classList.remove(
        "show"
    );

    currentDeleteId =
        null;

}


if (cancelDelete) {

    cancelDelete.addEventListener(
        "click",
        closeDeleteModal
    );

}


if (deleteModal) {

    deleteModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                deleteModal
            ) {

                closeDeleteModal();

            }

        }
    );

}


/* =========================================================
   DELETE MEETING
========================================================= */

if (confirmDelete) {

    confirmDelete.addEventListener(
        "click",
        async () => {

            if (!currentDeleteId) {
                return;
            }


            confirmDelete.disabled =
                true;

            confirmDelete.textContent =
                "Deleting...";


            try {

                const response =
                    await fetch(
                        `${API_BASE}/meetings/${currentDeleteId}`,
                        {
                            method:
                                "DELETE",

                            headers: {

                                "Accept":
                                    "application/json",

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({
                                    officer_id:
                                        officerId
                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to delete meeting."
                    );

                }


                closeDeleteModal();


                await loadMeetings();


            } catch (error) {

                console.error(
                    "DELETE MEETING ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to delete meeting."
                );


            } finally {

                confirmDelete.disabled =
                    false;

                confirmDelete.textContent =
                    "Delete";

            }

        }
    );

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const total =
        meetings.length;


    const upcoming =
        meetings.filter(
            meeting =>
                normalizeStatus(
                    meeting.status
                ) ===
                "upcoming"
        ).length;


    const completed =
        meetings.filter(
            meeting =>
                normalizeStatus(
                    meeting.status
                ) ===
                "completed"
        ).length;


    if (totalMeetings) {

        totalMeetings.textContent =
            total;

    }


    if (upcomingMeetings) {

        upcomingMeetings.textContent =
            upcoming;

    }


    if (completedMeetings) {

        completedMeetings.textContent =
            completed;

    }

}


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        displayMeetings
    );

}


/* =========================================================
   FILTER
========================================================= */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        displayMeetings
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

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
   MOBILE MENU
========================================================= */

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

}


function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "show"
    );

}


/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "upcoming"
        ).toLowerCase();


    if (
        value ===
        "completed"
    ) {

        return "completed";

    }


    if (
        value ===
        "ongoing"
    ) {

        return "ongoing";

    }


    if (
        value ===
        "cancelled"
    ) {

        return "cancelled";

    }


    return "upcoming";

}


/* =========================================================
   DATE
========================================================= */

function formatMeetingDate(
    value
) {

    if (!value) {

        return {
            month: "---",
            day: "--",
            full: "---"
        };

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return {
            month: "---",
            day: "--",
            full: String(value)
        };

    }


    return {

        month:
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short"
                }
            ),

        day:
            date.toLocaleDateString(
                "en-US",
                {
                    day: "numeric"
                }
            ),

        full:
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            )

    };

}


/* =========================================================
   DATE FOR INPUT
========================================================= */

function formatDateForInput(
    value
) {

    if (!value) {
        return "";
    }


    return String(
        value
    ).substring(
        0,
        10
    );

}


/* =========================================================
   TIME
========================================================= */

function formatTime(
    value
) {

    if (!value) {

        return "Time not specified";

    }


    const parts =
        String(value).split(":");


    let hour =
        Number(parts[0]);


    const minute =
        parts[1] ||
        "00";


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 ||
        12;


    return `${hour}:${minute} ${suffix}`;

}


function formatTimeForInput(
    value
) {

    if (!value) {
        return "";
    }


    return String(
        value
    ).substring(
        0,
        5
    );

}


/* =========================================================
   CAPITALIZE
========================================================= */

function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    const value =
        String(
            name ||
            "Officer"
        ).trim();


    const parts =
        value.split(
            /\s+/
        );


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


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
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


/* =========================================================
   INITIALIZE
========================================================= */

loadMeetings();