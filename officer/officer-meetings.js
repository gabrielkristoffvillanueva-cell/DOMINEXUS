/* =========================================
   DOMINEXUS OFFICER MEETINGS
========================================= */


/* =========================================
   CHECK OFFICER LOGIN
========================================= */

const officerLoggedIn =
    sessionStorage.getItem("officerLoggedIn");

if (officerLoggedIn !== "true") {

    window.location.href =
        "officer-login.html";

}


/* =========================================
   OFFICER INFORMATION
========================================= */

const officerName =
    sessionStorage.getItem("officerName")
    || "Demo Officer";

const officerId =
    sessionStorage.getItem("officerId")
    || "OFF-0001";


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
   DISPLAY OFFICER
========================================= */

topOfficerName.textContent =
    officerName;

topOfficerId.textContent =
    officerId;

topAvatar.textContent =
    getInitials(officerName);


/* =========================================
   MEETING STORAGE
========================================= */

let meetings =
    JSON.parse(
        localStorage.getItem(
            "dominexus_meetings"
        ) || "[]"
    );


let meetingToDelete = null;


/* =========================================
   SAVE MEETINGS
========================================= */

function saveMeetings() {

    localStorage.setItem(
        "dominexus_meetings",
        JSON.stringify(meetings)
    );

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
        meetings.filter(meeting => {

            const title =
                meeting.title ||
                meeting.name ||
                "";

            const description =
                meeting.description ||
                "";

            const matchesSearch =

                title
                    .toLowerCase()
                    .includes(search)

                ||

                description
                    .toLowerCase()
                    .includes(search);


            const completed =
                isMeetingCompleted(meeting);


            let matchesFilter = true;


            if (filter === "upcoming") {

                matchesFilter =
                    !completed;

            }


            if (filter === "completed") {

                matchesFilter =
                    completed;

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    meetingsGrid.innerHTML = "";


    if (filtered.length === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }


    filtered.forEach(meeting => {

        meetingsGrid.appendChild(
            createMeetingCard(meeting)
        );

    });


    updateSummary();

}


/* =========================================
   CREATE MEETING CARD
========================================= */

function createMeetingCard(meeting) {

    const card =
        document.createElement("div");

    card.className =
        "meeting-card";


    const title =
        meeting.title ||
        "Untitled Meeting";


    const date =
        meeting.date ||
        "";


    const time =
        meeting.time ||
        "No time";


    const description =
        meeting.description ||
        "No description provided.";


    const completed =
        isMeetingCompleted(meeting);


    const dateObject =
        parseMeetingDate(meeting);


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
        completed
            ? "COMPLETED"
            : "UPCOMING";


    const statusClass =
        completed
            ? "completed"
            : "";


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
                    ${escapeHTML(
                        formatDate(date)
                    )}
                </span>

            </div>


            <div class="info-item">

                <span class="info-icon">
                    ◴
                </span>

                <span>
                    ${escapeHTML(
                        formatTime(time)
                    )}
                </span>

            </div>

        </div>


        <div class="meeting-actions">

            <button
                class="edit-button"
                data-action="edit"
                data-id="${escapeHTML(
                    meeting.id
                )}">

                Edit

            </button>


            <button
                class="delete-meeting-button"
                data-action="delete"
                data-id="${escapeHTML(
                    meeting.id
                )}">

                Delete

            </button>

        </div>

    `;


    return card;

}


/* =========================================
   CARD ACTIONS
========================================= */

meetingsGrid.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest("button");


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;

        const action =
            button.dataset.action;


        if (action === "edit") {

            openEditMeeting(id);

        }


        if (action === "delete") {

            openDeleteMeeting(id);

        }

    }
);


/* =========================================
   OPEN CREATE
========================================= */

openCreateButton.addEventListener(
    "click",
    () => {

        openCreateMeeting();

    }
);


function openCreateMeeting() {

    meetingForm.reset();

    editingMeetingId.value = "";

    modalTitle.textContent =
        "Create Meeting";


    meetingModal.classList.add(
        "show"
    );

}


/* =========================================
   OPEN EDIT
========================================= */

function openEditMeeting(id) {

    const meeting =
        meetings.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!meeting) {
        return;
    }


    editingMeetingId.value =
        meeting.id;

    meetingTitle.value =
        meeting.title || "";

    meetingDate.value =
        meeting.date || "";

    meetingTime.value =
        meeting.time || "";

    meetingDescription.value =
        meeting.description || "";


    modalTitle.textContent =
        "Edit Meeting";


    meetingModal.classList.add(
        "show"
    );

}


/* =========================================
   CLOSE MEETING MODAL
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
    event => {

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
   SAVE MEETING
========================================= */

meetingForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


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
                "Please complete the meeting title, date, and time."
            );

            return;

        }


        const existingId =
            editingMeetingId.value;


        if (existingId) {

            const index =
                meetings.findIndex(
                    meeting =>
                        String(
                            meeting.id
                        ) ===
                        String(existingId)
                );


            if (index !== -1) {

                meetings[index] = {

                    ...meetings[index],

                    title,
                    date,
                    time,
                    description

                };

            }

        } else {

            const newMeeting = {

                id:
                    "meeting-" +
                    Date.now(),

                title,

                date,

                time,

                description,

                createdBy:
                    officerId,

                createdAt:
                    new Date()
                        .toISOString()

            };


            meetings.push(
                newMeeting
            );

        }


        saveMeetings();

        displayMeetings();

        closeMeetingModal();


        alert(
            existingId
                ? "Meeting updated successfully."
                : "Meeting created successfully."
        );

    }
);


/* =========================================
   DELETE MEETING
========================================= */

function openDeleteMeeting(id) {

    meetingToDelete = id;

    deleteModal.classList.add(
        "show"
    );

}


cancelDelete.addEventListener(
    "click",
    () => {

        meetingToDelete = null;

        deleteModal.classList.remove(
            "show"
        );

    }
);


confirmDelete.addEventListener(
    "click",
    () => {

        if (!meetingToDelete) {
            return;
        }


        meetings =
            meetings.filter(
                meeting =>
                    String(meeting.id) !==
                    String(meetingToDelete)
            );


        saveMeetings();

        displayMeetings();


        meetingToDelete = null;

        deleteModal.classList.remove(
            "show"
        );

    }
);


deleteModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            deleteModal
        ) {

            meetingToDelete = null;

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


    const completed =
        meetings.filter(
            meeting =>
                isMeetingCompleted(meeting)
        ).length;


    const upcoming =
        total - completed;


    totalMeetings.textContent =
        total;

    upcomingMeetings.textContent =
        upcoming;

    completedMeetings.textContent =
        completed;

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
   CHECK MEETING DATE
========================================= */

function isMeetingCompleted(meeting) {

    const meetingDate =
        parseMeetingDate(meeting);


    if (!meetingDate) {

        return false;

    }


    return meetingDate < new Date();

}


/* =========================================
   PARSE DATE
========================================= */

function parseMeetingDate(meeting) {

    if (!meeting.date) {
        return null;
    }


    const dateString =
        meeting.date;


    const timeString =
        meeting.time ||
        "00:00";


    const date =
        new Date(
            `${dateString}T${timeString}`
        );


    if (Number.isNaN(date.getTime())) {

        return null;

    }


    return date;

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(date) {

    if (!date) {
        return "No date";
    }


    const dateObject =
        new Date(
            `${date}T00:00`
        );


    if (Number.isNaN(
        dateObject.getTime()
    )) {

        return date;

    }


    return dateObject.toLocaleDateString(
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

function formatTime(time) {

    if (!time) {
        return "No time";
    }


    const parts =
        time.split(":");


    if (parts.length < 2) {

        return time;

    }


    let hour =
        parseInt(
            parts[0],
            10
        );

    const minute =
        parts[1];


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return (
        hour +
        ":" +
        minute +
        " " +
        period
    );

}


/* =========================================
   INITIALS
========================================= */

function getInitials(name) {

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
   SECURITY
========================================= */

function escapeHTML(value) {

    return String(value)
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


/* =========================================
   MOBILE MENU
========================================= */

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


/* =========================================
   INITIALIZE
========================================= */

displayMeetings();