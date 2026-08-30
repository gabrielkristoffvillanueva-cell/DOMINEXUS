/* =========================================================
   DOMINEXUS — MODERATOR MEETING MANAGEMENT
   Laravel / MySQL Connected
   Organization-Isolated
========================================================= */


/* =========================================================
   API
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
   MODERATOR INFORMATION
========================================================= */

const moderatorName =
    sessionStorage.getItem(
        "moderatorName"
    ) ||
    "Moderator";


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
   ELEMENTS
========================================================= */

const meetingForm =
    document.getElementById(
        "meetingForm"
    );


const meetingList =
    document.getElementById(
        "meetingList"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================================================
   LOAD MEETINGS
========================================================= */

async function loadMeetings() {

    if (!meetingList) {

        return;

    }


    meetingList.innerHTML = `

        <div class="empty-state">

            Loading meetings...

        </div>

    `;


    try {

        /*
         * The moderator_id tells Laravel
         * which moderator is requesting
         * the meetings.
         *
         * Laravel then determines the
         * moderator's organization_id.
         */

        const response =
            await fetch(
                `${API_BASE}/meetings?moderator_id=${encodeURIComponent(
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
            "MODERATOR MEETINGS:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load meetings."
            );

        }


        /*
         * API returns an array.
         */

        meetings =
            Array.isArray(data)
                ? data
                : (
                    data.meetings ||
                    data.data ||
                    []
                );


        renderMeetings();


    } catch (error) {

        console.error(
            "MEETING LOADING ERROR:",
            error
        );


        meetingList.innerHTML = `

            <div class="empty-state">

                Unable to load meetings.
                Make sure the Laravel server is running.

            </div>

        `;

    }

}


/* =========================================================
   LOCAL PAGE STATE
========================================================= */

let meetings = [];


/* =========================================================
   CREATE MEETING
========================================================= */

if (
    meetingForm
) {

    meetingForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const title =
                document.getElementById(
                    "meetingTitle"
                ).value.trim();


            const date =
                document.getElementById(
                    "meetingDate"
                ).value;


            const time =
                document.getElementById(
                    "meetingTime"
                ).value;


            const description =
                document.getElementById(
                    "meetingDescription"
                ).value.trim();


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


            /*
             * Your current HTML only has one
             * time field, so we use it as
             * start_time.
             *
             * Backend allows end_time to
             * remain null.
             */

            const submitButton =
                meetingForm.querySelector(
                    "button[type='submit']"
                );


            if (
                submitButton
            ) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Creating...";

            }


            try {

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
                                JSON.stringify({

                                    moderator_id:
                                        moderatorId,

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
                                        "upcoming"

                                })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "CREATE MEETING RESPONSE:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to create meeting."
                    );

                }


                alert(
                    data.message ||
                    "Meeting created successfully."
                );


                meetingForm.reset();


                /*
                 * Reload from MySQL.
                 */

                await loadMeetings();


            } catch (error) {

                console.error(
                    "CREATE MEETING ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to create meeting."
                );


            } finally {

                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "+ Create Meeting";

                }

            }

        }
    );

}


/* =========================================================
   RENDER MEETINGS
========================================================= */

function renderMeetings() {

    if (
        !meetingList
    ) {

        return;

    }


    meetingList.innerHTML =
        "";


    if (
        meetings.length === 0
    ) {

        meetingList.innerHTML = `

            <div class="empty-state">

                No meetings have been created yet.

            </div>

        `;

        return;

    }


    /*
     * Newest / latest date first.
     */

    const sortedMeetings =
        [...meetings]
        .sort(
            function(a, b) {

                const dateA =
                    new Date(
                        `${a.date || ""}T${
                            a.start_time || "00:00"
                        }`
                    );


                const dateB =
                    new Date(
                        `${b.date || ""}T${
                            b.start_time || "00:00"
                        }`
                    );


                return dateB - dateA;

            }
        );


    sortedMeetings.forEach(
        function(meeting) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "meeting-item";


            const status =
                normalizeStatus(
                    meeting.status
                );


            item.innerHTML = `

                <div class="meeting-top">

                    <div>

                        <h3 class="meeting-title">

                            ${escapeHtml(
                                meeting.title ||
                                "Untitled Meeting"
                            )}

                        </h3>


                        <div class="meeting-info">

                            ${formatDate(
                                meeting.date
                            )}

                            ${
                                meeting.start_time
                                    ? " • " +
                                      escapeHtml(
                                          formatTime(
                                              meeting.start_time
                                          )
                                      )
                                    : ""
                            }

                        </div>


                        <span
                            class="status-badge ${getStatusClass(
                                status
                            )}"
                        >

                            ${capitalize(
                                status
                            )}

                        </span>


                        ${
                            meeting.description
                                ? `
                                    <div class="meeting-description">

                                        ${escapeHtml(
                                            meeting.description
                                        )}

                                    </div>
                                `
                                : ""
                        }

                    </div>


                    <div class="meeting-actions">

                        ${
                            status !== "ongoing" &&
                            status !== "completed" &&
                            status !== "cancelled"

                                ? `
                                    <button
                                        class="meeting-button start"
                                        data-action="start"
                                        data-id="${escapeHtml(
                                            meeting.id
                                        )}"
                                    >
                                        Start
                                    </button>
                                `

                                : ""
                        }


                        ${
                            status === "ongoing"

                                ? `
                                    <button
                                        class="meeting-button end"
                                        data-action="end"
                                        data-id="${escapeHtml(
                                            meeting.id
                                        )}"
                                    >
                                        End
                                    </button>
                                `

                                : ""
                        }


                        ${
                            status !== "ongoing"

                                ? `
                                    <button
                                        class="meeting-button delete"
                                        data-action="delete"
                                        data-id="${escapeHtml(
                                            meeting.id
                                        )}"
                                    >
                                        Delete
                                    </button>
                                `

                                : ""
                        }

                    </div>

                </div>

            `;


            meetingList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   MEETING ACTIONS
========================================================= */

if (
    meetingList
) {

    meetingList.addEventListener(
        "click",
        async function(event) {

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


            if (
                !action ||
                !id
            ) {

                return;

            }


            const meeting =
                meetings.find(
                    function(item) {

                        return (
                            String(
                                item.id
                            ) ===
                            String(id)
                        );

                    }
                );


            if (!meeting) {

                alert(
                    "Meeting could not be found."
                );

                return;

            }


            /*
             * START
             */

            if (
                action === "start"
            ) {

                await startMeeting(
                    meeting
                );

                return;

            }


            /*
             * END
             */

            if (
                action === "end"
            ) {

                await endMeeting(
                    meeting
                );

                return;

            }


            /*
             * DELETE
             */

            if (
                action === "delete"
            ) {

                await deleteMeeting(
                    meeting
                );

            }

        }
    );

}


/* =========================================================
   START MEETING
========================================================= */

async function startMeeting(
    meeting
) {

    /*
     * Check if another meeting
     * is already ongoing.
     */

    const anotherActive =
        meetings.some(
            function(item) {

                return (
                    String(item.id) !==
                    String(meeting.id) &&

                    normalizeStatus(
                        item.status
                    ) === "ongoing"
                );

            }
        );


    if (
        anotherActive
    ) {

        alert(
            "Another meeting is already ongoing. End it before starting another meeting."
        );

        return;

    }


    try {

        /*
         * Preserve the existing
         * meeting information.
         */

        const response =
            await fetch(
                `${API_BASE}/meetings/${meeting.id}`,
                {
                    method: "PUT",

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

                            title:
                                meeting.title,

                            date:
                                meeting.date,

                            start_time:
                                normalizeTime(
                                    meeting.start_time
                                ),

                            end_time:
                                normalizeEndTime(
                                    meeting
                                ),

                            location:
                                meeting.location
                                || null,

                            status:
                                "ongoing"

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to start meeting."
            );

        }


        await loadMeetings();


    } catch (error) {

        console.error(
            "START MEETING ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to start meeting."
        );

    }

}


/* =========================================================
   END MEETING
========================================================= */

async function endMeeting(
    meeting
) {

    const confirmed =
        confirm(
            "End this meeting?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/meetings/${meeting.id}`,
                {
                    method: "PUT",

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

                            title:
                                meeting.title,

                            date:
                                meeting.date,

                            start_time:
                                normalizeTime(
                                    meeting.start_time
                                ),

                            end_time:
                                normalizeEndTime(
                                    meeting
                                ),

                            location:
                                meeting.location
                                || null,

                            status:
                                "completed"

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to end meeting."
            );

        }


        await loadMeetings();


    } catch (error) {

        console.error(
            "END MEETING ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to end meeting."
        );

    }

}


/* =========================================================
   DELETE MEETING
========================================================= */

async function deleteMeeting(
    meeting
) {

    const confirmed =
        confirm(
            "Delete this meeting?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/meetings/${meeting.id}`,
                {
                    method: "DELETE",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            moderator_id:
                                moderatorId

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


        alert(
            data.message ||
            "Meeting deleted successfully."
        );


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
   STATUS HELPERS
========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            ""
        )
        .toLowerCase();


    if (
        value === "active" ||
        value === "ongoing"
    ) {

        return "ongoing";

    }


    if (
        value === "ended" ||
        value === "completed"
    ) {

        return "completed";

    }


    if (
        value === "cancelled"
    ) {

        return "cancelled";

    }


    return "upcoming";

}


function getStatusClass(
    status
) {

    if (
        status === "ongoing"
    ) {

        return "active";

    }


    return status;

}


/* =========================================================
   DATE / TIME
========================================================= */

function formatDate(
    date
) {

    if (!date) {

        return "No date";

    }


    const parsed =
        new Date(
            date +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return date;

    }


    return parsed.toLocaleDateString(
        "en-PH",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


function formatTime(
    time
) {

    if (!time) {

        return "";

    }


    const parts =
        String(
            time
        ).split(":");


    if (
        parts.length < 2
    ) {

        return time;

    }


    let hour =
        parseInt(
            parts[0],
            10
        );


    const minute =
        parts[1];


    if (
        Number.isNaN(
            hour
        )
    ) {

        return time;

    }


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 ||
        12;


    return (
        hour +
        ":" +
        minute +
        " " +
        period
    );

}


function normalizeTime(
    time
) {

    if (!time) {

        return "00:00";

    }


    return String(
        time
    )
    .substring(
        0,
        5
    );

}


function normalizeEndTime(
    meeting
) {

    if (
        meeting.end_time
    ) {

        return normalizeTime(
            meeting.end_time
        );

    }


    /*
     * Backend requires end_time to
     * be after start_time when supplied.
     *
     * If none exists, create a
     * 2-hour default end time.
     */

    if (
        !meeting.start_time
    ) {

        return null;

    }


    const parts =
        String(
            meeting.start_time
        )
        .split(":");


    let hour =
        parseInt(
            parts[0],
            10
        );


    const minute =
        parts[1] ||
        "00";


    if (
        Number.isNaN(
            hour
        )
    ) {

        return null;

    }


    hour =
        (hour + 2) % 24;


    return (
        String(hour)
            .padStart(2, "0") +
        ":" +
        minute
    );

}


/* =========================================================
   TEXT HELPERS
========================================================= */

function capitalize(
    value
) {

    if (!value) {

        return "";

    }


    return (
        value.charAt(0)
            .toUpperCase() +
        value.slice(1)
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

        parts[0]
            .charAt(0) +

        parts[
            parts.length - 1
        ]
        .charAt(0)

    ).toUpperCase();

}


/* =========================================================
   START
========================================================= */

loadMeetings();