  /* =========================================
           AUTHENTICATION
        ========================================== */

        if (
            sessionStorage.getItem(
                "moderatorLoggedIn"
            ) !== "true"
        ) {

            window.location.href =
                "moderator-login.html";

        }


        /* =========================================
           MODERATOR INFORMATION
        ========================================== */

        const moderatorName =
            sessionStorage.getItem(
                "moderatorName"
            ) ||
            "System Moderator";


        const moderatorId =
            sessionStorage.getItem(
                "moderatorId"
            ) ||
            "MOD-0001";


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


        /* =========================================
           STORAGE
        ========================================== */

        const MEETINGS_KEY =
            "dominexus_meetings";


        let meetings =
            getMeetings();


        /* =========================================
           FORM
        ========================================== */

        const meetingForm =
            document.getElementById(
                "meetingForm"
            );


        meetingForm.addEventListener(
            "submit",
            function(event) {

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


                const meeting = {

                    id:
                        "meeting-" +
                        Date.now(),

                    title:
                        title,

                    date:
                        date,

                    time:
                        time,

                    description:
                        description,

                    status:
                        "scheduled",

                    createdBy:
                        moderatorId,

                    createdAt:
                        new Date()
                            .toISOString(),

                    startedAt:
                        null,

                    endedAt:
                        null

                };


                meetings.push(
                    meeting
                );


                saveMeetings();


                meetingForm.reset();


                renderMeetings();

            }
        );


        /* =========================================
           RENDER
        ========================================== */

        function renderMeetings() {

            const list =
                document.getElementById(
                    "meetingList"
                );


            list.innerHTML =
                "";


            if (
                meetings.length ===
                0
            ) {

                list.innerHTML = `

                    <div class="empty-state">

                        No meetings have been created yet.

                    </div>

                `;

                return;

            }


            /*
             * Newest meetings first.
             */

            const sortedMeetings =
                [...meetings]
                .sort(
                    function(a, b) {

                        return (
                            new Date(
                                b.createdAt ||
                                0
                            ) -
                            new Date(
                                a.createdAt ||
                                0
                            )
                        );

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
                        meeting.status ||
                        "scheduled";


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

                                    ${meeting.time
                                        ? " • " +
                                          escapeHtml(
                                              meeting.time
                                          )
                                        : ""
                                    }

                                </div>


                                <span
                                    class="status-badge ${status}">

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
                                    status !== "active" &&
                                    status !== "ended"
                                    ? `
                                        <button
                                            class="meeting-button start"
                                            data-action="start"
                                            data-id="${escapeHtml(
                                                meeting.id
                                            )}">
                                            Start
                                        </button>
                                    `
                                    : ""
                                }


                                ${
                                    status === "active"
                                    ? `
                                        <button
                                            class="meeting-button end"
                                            data-action="end"
                                            data-id="${escapeHtml(
                                                meeting.id
                                            )}">
                                            End
                                        </button>
                                    `
                                    : ""
                                }


                                ${
                                    status !== "active"
                                    ? `
                                        <button
                                            class="meeting-button delete"
                                            data-action="delete"
                                            data-id="${escapeHtml(
                                                meeting.id
                                            )}">
                                            Delete
                                        </button>
                                    `
                                    : ""
                                }

                            </div>

                        </div>

                    `;


                    list.appendChild(
                        item
                    );

                }
            );

        }


        /* =========================================
           ACTIONS
        ========================================== */

        document
            .getElementById(
                "meetingList"
            )
            .addEventListener(
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

                        return;

                    }


                    /* START */

                    if (
                        action ===
                        "start"
                    ) {

                        const alreadyActive =
                            meetings.some(
                                function(item) {

                                    return (
                                        item.status ===
                                        "active"
                                    );

                                }
                            );


                        if (
                            alreadyActive
                        ) {

                            alert(
                                "Another meeting is already active. End it before starting another meeting."
                            );

                            return;

                        }


                        meeting.status =
                            "active";


                        meeting.startedAt =
                            new Date()
                                .toISOString();


                        saveMeetings();

                        renderMeetings();

                        return;

                    }


                    /* END */

                    if (
                        action ===
                        "end"
                    ) {

                        const confirmed =
                            confirm(
                                "End this meeting?"
                            );


                        if (!confirmed) {

                            return;

                        }


                        meeting.status =
                            "ended";


                        meeting.endedAt =
                            new Date()
                                .toISOString();


                        saveMeetings();

                        renderMeetings();

                        return;

                    }


                    /* DELETE */

                    if (
                        action ===
                        "delete"
                    ) {

                        const confirmed =
                            confirm(
                                "Delete this meeting?"
                            );


                        if (!confirmed) {

                            return;

                        }


                        meetings =
                            meetings.filter(
                                function(item) {

                                    return (
                                        String(
                                            item.id
                                        ) !==
                                        String(id)
                                    );

                                }
                            );


                        saveMeetings();

                        renderMeetings();

                    }

                }
            );


        /* =========================================
           SAVE
        ========================================== */

        function saveMeetings() {

            localStorage.setItem(
                MEETINGS_KEY,
                JSON.stringify(
                    meetings
                )
            );


            console.log(
                "DOMINEXUS: Meetings saved:",
                meetings
            );

        }


        /* =========================================
           GET MEETINGS
        ========================================== */

        function getMeetings() {

            try {

                const raw =
                    localStorage.getItem(
                        MEETINGS_KEY
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
                    "DOMINEXUS: Meeting storage error:",
                    error
                );


                return [];

            }

        }


        /* =========================================
           LOGOUT
        ========================================== */

        document
            .getElementById(
                "logoutButton"
            )
            .addEventListener(
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


        /* =========================================
           HELPERS
        ========================================== */

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
                    .substring(0, 2)
                    .toUpperCase();

            }


            return (
                parts[0][0] +
                parts[
                    parts.length - 1
                ][0]
            ).toUpperCase();

        }


        /* =========================================
           INITIAL RENDER
        ========================================== */

        renderMeetings();
