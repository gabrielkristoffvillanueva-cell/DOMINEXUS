/* =========================================
   DOMINEXUS — OFFICER MEETINGS
   Laravel / MySQL Connected
========================================= */

const API_BASE = "http://127.0.0.1:8000/api";


/* =========================================
   CHECK OFFICER LOGIN
========================================= */

const officerLoggedIn =
    sessionStorage.getItem("officerLoggedIn");

if (officerLoggedIn !== "true") {
    window.location.href = "officer-login.html";
}


/* =========================================
   OFFICER INFORMATION
========================================= */

const officerName =
    sessionStorage.getItem("officerName") ||
    "Officer";

const officerId =
    sessionStorage.getItem("officerId");


if (!officerId) {
    alert("Officer session expired. Please log in again.");

    sessionStorage.clear();

    window.location.href =
        "officer-login.html";
}


/* =========================================
   ELEMENTS
========================================= */

const topOfficerName =
    document.getElementById("topOfficerName");

const topOfficerId =
    document.getElementById("topOfficerId");

const topAvatar =
    document.getElementById("topAvatar");

const totalMeetings =
    document.getElementById("totalMeetings");

const upcomingMeetings =
    document.getElementById("upcomingMeetings");

const completedMeetings =
    document.getElementById("completedMeetings");

const meetingsGrid =
    document.getElementById("meetingsGrid");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const openCreateButton =
    document.getElementById("openCreateButton");

const meetingModal =
    document.getElementById("meetingModal");

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

const deleteModal =
    document.getElementById("deleteModal");

const cancelDelete =
    document.getElementById("cancelDelete");

const confirmDelete =
    document.getElementById("confirmDelete");

const logoutButton =
    document.getElementById("logoutButton");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* =========================================
   OFFICER DISPLAY
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
   MEETING DATA
========================================= */

let meetings = [];

let meetingToDelete = null;


/* =========================================
   LOAD MEETINGS FROM LARAVEL
========================================= */

async function loadMeetings() {

    try {

        showLoading();


        const response =
            await fetch(
                `${API_BASE}/meetings?officer_id=${encodeURIComponent(officerId)}`,
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
            "Meetings response:",
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
                : [];


        displayMeetings();


    } catch (error) {

        console.error(
            "Load meetings error:",
            error
        );


        meetings = [];


        meetingsGrid.innerHTML = "";


        emptyState.style.display =
            "block";


        emptyState.innerHTML = `

            <div class="empty-icon">
                !
            </div>

            <h3>
                Unable to load meetings
            </h3>

            <p>
                ${escapeHTML(
                    error.message
                )}
            </p>

        `;


        updateSummary();

    }

}


/* =========================================
   DISPLAY MEETINGS
========================================= */

function displayMeetings() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filter =
        statusFilter.value;


    const filtered =
        meetings.filter(
            function (meeting) {

                const title =
                    meeting.title ||
                    "";


                const location =
                    meeting.location ||
                    "";


                const matchesSearch =
                    title
                        .toLowerCase()
                        .includes(search)
                    ||
                    location
                        .toLowerCase()
                        .includes(search);


                const status =
                    getMeetingStatus(
                        meeting
                    );


                let matchesFilter =
                    true;


                if (
                    filter ===
                    "upcoming"
                ) {

                    matchesFilter =
                        status ===
                        "upcoming";

                }


                if (
                    filter ===
                    "completed"
                ) {

                    matchesFilter =
                        status ===
                        "completed";

                }


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );


    meetingsGrid.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }


    filtered.forEach(
        function (meeting) {

            meetingsGrid.appendChild(
                createMeetingCard(
                    meeting
                )
            );

        }
    );


    updateSummary();

}


/* =========================================
   CREATE MEETING CARD
========================================= */

function createMeetingCard(
    meeting
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "meeting-card";


    const title =
        meeting.title ||
        "Untitled Meeting";


    const description =
        meeting.description ||
        "Organization meeting";


    const status =
        getMeetingStatus(
            meeting
        );


    const dateObject =
        parseMeetingDate(
            meeting
        );


    let month = "—";
    let day = "—";


    if (dateObject) {

        month =
            dateObject
                .toLocaleDateString(
                    "en-US",
                    {
                        month: "short"
                    }
                )
                .toUpperCase();


        day =
            dateObject.getDate();

    }


    const statusText =
        status === "completed"
            ? "COMPLETED"
            : status === "ongoing"
                ? "ONGOING"
                : "UPCOMING";


    const statusClass =
        status === "completed"
            ? "completed"
            : "";


    const location =
        meeting.location ||
        "Location not specified";


    const dateText =
        formatDate(
            meeting.date
        );


    const timeText =
        formatTime(
            meeting.start_time
        );


    const endTimeText =
        formatTime(
            meeting.end_time
        );


    let fullTime =
        timeText;


    if (endTimeText) {

        fullTime +=
            " - " +
            endTimeText;

    }


    card.innerHTML = `

        <div class="meeting-card-header">

            <div class="meeting-date-box">

                <span class="month">
                    ${month}
                </span>

                <span class="day">
                    ${day}
                </span>

            </div>


            <span class="
                meeting-status
                ${statusClass}
            ">

                ${statusText}

            </span>

        </div>


        <h3>
            ${escapeHTML(title)}
        </h3>


        <p class="meeting-description">
            ${escapeHTML(description)}
        </p>


        <div class="meeting-info">

            <div class="info-item">

                <span class="info-icon">
                    ◷
                </span>

                <span>
                    ${escapeHTML(dateText)}
                </span>

            </div>


            <div class="info-item">

                <span class="info-icon">
                    ◴
                </span>

                <span>
                    ${escapeHTML(fullTime)}
                </span>

            </div>


            <div class="info-item">

                <span class="info-icon">
                    ⌖
                </span>

                <span>
                    ${escapeHTML(location)}
                </span>

            </div>

        </div>


        <div class="meeting-actions">

            <button
                class="edit-button"
                data-action="edit"
                data-id="${meeting.id}">

                Edit

            </button>


            <button
                class="delete-meeting-button"
                data-action="delete"
                data-id="${meeting.id}">

                Delete

            </button>

        </div>

    `;


    return card;

}


/* =========================================
   CARD BUTTONS
========================================= */

meetingsGrid.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;


        const action =
            button.dataset.action;


        if (
            action === "edit"
        ) {

            openEditMeeting(
                id
            );

        }


        if (
            action === "delete"
        ) {

            openDeleteMeeting(
                id
            );

        }

    }
);


/* =========================================
   CREATE MEETING
========================================= */

openCreateButton.addEventListener(
    "click",
    function () {

        meetingForm.reset();

        editingMeetingId.value =
            "";

        modalTitle.textContent =
            "Create Meeting";


        meetingModal.classList.add(
            "show"
        );

    }
);


/* =========================================
   OPEN EDIT
========================================= */

function openEditMeeting(id) {

    /*
     * Your backend currently has no PUT/PATCH
     * update route, so we don't pretend that
     * Edit is working.
     */

    alert(
        "Edit Meeting is not available yet. We will connect it after the meeting update API is added."
    );

}


/* =========================================
   CLOSE CREATE MODAL
========================================= */

closeModal.addEventListener(
    "click",
    closeMeetingModal
);


cancelButton.addEventListener(
    "click",
    closeMeetingModal
);


meetingModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            meetingModal
        ) {

            closeMeetingModal();

        }

    }
);


function closeMeetingModal() {

    meetingModal.classList.remove(
        "show"
    );

}


/* =========================================
   CREATE MEETING
========================================= */

meetingForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const title =
            meetingTitle.value.trim();


        const date =
            meetingDate.value;


        const startTime =
            meetingTime.value;


        const description =
            meetingDescription.value.trim();


        if (
            !title ||
            !date ||
            !startTime
        ) {

            alert(
                "Please complete the meeting title, date, and time."
            );

            return;

        }


        /*
         * The backend currently accepts:
         *
         * officer_id
         * title
         * date
         * start_time
         * end_time
         * location
         * status
         *
         * The HTML currently has no end-time
         * or location field, so those remain null.
         */

        const payload = {

            officer_id:
                officerId,

            title:
                title,

            date:
                date,

            start_time:
                startTime,

            end_time:
                null,

            location:
                null,

            status:
                "upcoming"

        };


        const saveButton =
            meetingForm.querySelector(
                ".save-button"
            );


        const originalText =
            saveButton
                ? saveButton.textContent
                : "Save Meeting";


        try {

            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";

            }


            const response =
                await fetch(
                    `${API_BASE}/meetings`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
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
                "Create meeting response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    getValidationMessage(
                        data
                    )
                );

            }


            closeMeetingModal();


            meetingForm.reset();


            await loadMeetings();


            alert(
                "Meeting created successfully."
            );


        } catch (error) {

            console.error(
                "Create meeting error:",
                error
            );


            alert(
                error.message ||
                "Unable to create meeting."
            );

        } finally {

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    originalText;

            }

        }

    }
);


/* =========================================
   DELETE MEETING
========================================= */

function openDeleteMeeting(id) {

    meetingToDelete =
        id;


    deleteModal.classList.add(
        "show"
    );

}


cancelDelete.addEventListener(
    "click",
    function () {

        meetingToDelete =
            null;


        deleteModal.classList.remove(
            "show"
        );

    }
);


confirmDelete.addEventListener(
    "click",
    async function () {

        if (!meetingToDelete) {
            return;
        }


        const id =
            meetingToDelete;


        try {

            confirmDelete.disabled =
                true;


            confirmDelete.textContent =
                "Deleting...";


            const response =
                await fetch(
                    `${API_BASE}/meetings/${encodeURIComponent(id)}?officer_id=${encodeURIComponent(officerId)}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            console.log(
                "Delete meeting response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete meeting."
                );

            }


            deleteModal.classList.remove(
                "show"
            );


            meetingToDelete =
                null;


            await loadMeetings();


            alert(
                "Meeting deleted successfully."
            );


        } catch (error) {

            console.error(
                "Delete meeting error:",
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


deleteModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            deleteModal
        ) {

            meetingToDelete =
                null;


            deleteModal.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================
   SUMMARY
========================================= */

function updateSummary() {

    const total =
        meetings.length;


    const upcoming =
        meetings.filter(
            function (meeting) {

                return (
                    getMeetingStatus(
                        meeting
                    ) === "upcoming"
                );

            }
        ).length;


    const completed =
        meetings.filter(
            function (meeting) {

                return (
                    getMeetingStatus(
                        meeting
                    ) === "completed"
                );

            }
        ).length;


    totalMeetings.textContent =
        total;


    upcomingMeetings.textContent =
        upcoming;


    completedMeetings.textContent =
        completed;

}


/* =========================================
   MEETING STATUS
========================================= */

function getMeetingStatus(
    meeting
) {

    const backendStatus =
        String(
            meeting.status ||
            ""
        ).toLowerCase();


    /*
     * Trust backend status first.
     */

    if (
        backendStatus ===
        "cancelled"
    ) {

        return "cancelled";

    }


    if (
        backendStatus ===
        "completed"
    ) {

        return "completed";

    }


    if (
        backendStatus ===
        "ongoing"
    ) {

        return "ongoing";

    }


    /*
     * If backend says upcoming,
     * keep it upcoming.
     */

    if (
        backendStatus ===
        "upcoming"
    ) {

        return "upcoming";

    }


    /*
     * Fallback based on date/time.
     */

    const date =
        parseMeetingDate(
            meeting
        );


    if (!date) {

        return "upcoming";

    }


    return date < new Date()
        ? "completed"
        : "upcoming";

}


/* =========================================
   PARSE MEETING DATE
========================================= */

function parseMeetingDate(
    meeting
) {

    if (!meeting.date) {

        return null;

    }


    const time =
        meeting.start_time ||
        "00:00";


    const date =
        new Date(
            `${meeting.date}T${time}`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(
    value
) {

    if (!value) {

        return "No date";

    }


    const date =
        new Date(
            `${value}T00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(
    value
) {

    if (!value) {

        return "";

    }


    const parts =
        String(value)
            .split(":");


    if (
        parts.length < 2
    ) {

        return value;

    }


    let hour =
        parseInt(
            parts[0],
            10
        );


    const minute =
        parts[1];


    if (
        Number.isNaN(hour)
    ) {

        return value;

    }


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {

        hour = 12;

    }


    return `${hour}:${minute} ${period}`;

}


/* =========================================
   LOADING STATE
========================================= */

function showLoading() {

    meetingsGrid.innerHTML = `

        <div style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
        ">

            Loading meetings...

        </div>

    `;


    emptyState.style.display =
        "none";

}


/* =========================================
   VALIDATION ERROR
========================================= */

function getValidationMessage(
    data
) {

    if (
        data &&
        data.errors
    ) {

        const firstField =
            Object.keys(
                data.errors
            )[0];


        if (
            firstField &&
            data.errors[firstField] &&
            data.errors[firstField][0]
        ) {

            return data.errors[
                firstField
            ][0];

        }

    }


    return (
        data.message ||
        "Unable to complete the request."
    );

}


/* =========================================
   INITIALS
========================================= */

function getInitials(
    name
) {

    if (!name) {

        return "OF";

    }


    const parts =
        name
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


/* =========================================
   ESCAPE HTML
========================================= */

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


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
    "click",
    function () {

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
            "officerRole"
        );

        sessionStorage.removeItem(
            "officerStatus"
        );

        sessionStorage.removeItem(
            "officerOrganizationId"
        );

        sessionStorage.removeItem(
            "officerOrganization"
        );

        sessionStorage.removeItem(
            "officerClubRole"
        );


        window.location.href =
            "officer-login.html";

    }
);


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
        function () {

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


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    displayMeetings
);


/* =========================================
   FILTER
========================================= */

statusFilter.addEventListener(
    "change",
    displayMeetings
);


/* =========================================
   INITIALIZE
========================================= */

loadMeetings();