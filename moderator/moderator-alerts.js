/* =========================================================
   DOMINEXUS
   MODERATOR - NOTIFICATIONS
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
   API
========================================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


/* =========================================================
   DOM
========================================================= */

const typeFilter =
    document.getElementById(
        "typeFilter"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const alertsContainer =
    document.getElementById(
        "alertsContainer"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const totalAlerts =
    document.getElementById(
        "totalAlerts"
    );

const lowAttendanceAlerts =
    document.getElementById(
        "lowAttendanceAlerts"
    );

const duplicateAlerts =
    document.getElementById(
        "duplicateAlerts"
    );

const invalidAlerts =
    document.getElementById(
        "invalidAlerts"
    );

const displayedAlerts =
    document.getElementById(
        "displayedAlerts"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================================================
   MODERATOR
========================================================= */

const moderatorId =
    sessionStorage.getItem(
        "moderatorId"
    );

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
   DATA
========================================================= */

let notifications = [];


/* =========================================================
   INITIALIZE
========================================================= */

loadNotifications();


/* =========================================================
   FILTER EVENTS
========================================================= */

typeFilter.addEventListener(
    "change",
    function () {

        renderNotifications();

    }
);


searchInput.addEventListener(
    "input",
    function () {

        renderNotifications();

    }
);


/* =========================================================
   LOAD NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    try {

        if (!moderatorId) {

            throw new Error(
                "Moderator ID is missing."
            );

        }


        showLoading();


        const response =
            await fetch(
                `${API_BASE}/moderator-notifications?moderator_id=${encodeURIComponent(
                    moderatorId
                )}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load notifications."
            );

        }


        notifications =
            generateNotifications(
                data
            );


        updateSummary();


        renderNotifications();


    } catch (error) {

        console.error(
            "Notifications error:",
            error
        );


        notifications = [];


        updateSummary();


        alertsContainer.innerHTML =
            "";


        emptyState.classList.remove(
            "hidden"
        );


        emptyState.textContent =
            error.message ||
            "Unable to load notifications.";

    }

}


/* =========================================================
   GENERATE NOTIFICATIONS
========================================================= */

function generateNotifications(
    data
) {

    const generated = [];


    /*
    |--------------------------------------------------------------------------
    | PENDING OFFICER APPLICATIONS
    |--------------------------------------------------------------------------
    */

    const pendingOfficers =
        Array.isArray(
            data.pending_officers
        )
            ? data.pending_officers
            : [];


    pendingOfficers.forEach(
        function (officer) {

            generated.push({

                type:
                    "officer",

                title:
                    "New Officer Application",

                message:
                    `${officer.name || "A student"} submitted an officer application that requires your review.`,

                studentName:
                    officer.name ||
                    "Unknown Student",

                studentId:
                    officer.student_id ||
                    "—",

                meetingName:
                    "",

                date:
                    officer.created_at,

                meta:
                    "Pending officer application"

            });

        }
    );


    /*
    |--------------------------------------------------------------------------
    | LOW ATTENDANCE
    |--------------------------------------------------------------------------
    */

    const lowAttendance =
        Array.isArray(
            data.low_attendance
        )
            ? data.low_attendance
            : [];


    lowAttendance.forEach(
        function (item) {

            const student =
                item.student ||
                {};


            generated.push({

                type:
                    "low",

                title:
                    "Low Attendance",

                message:
                    `${student.name || "Student"} has an attendance rate of ${item.percentage || 0}%.`,

                studentName:
                    student.name ||
                    "Unknown Student",

                studentId:
                    student.student_id ||
                    "—",

                meetingName:
                    "",

                date:
                    null,

                meta:
                    `${item.attendance || 0} of ${item.total_meetings || 0} meetings attended`

            });

        }
    );


    /*
    |--------------------------------------------------------------------------
    | MEETING UPDATES
    |--------------------------------------------------------------------------
    */

    const recentMeetings =
        Array.isArray(
            data.recent_meetings
        )
            ? data.recent_meetings
            : [];


    recentMeetings.forEach(
        function (meeting) {

            let title =
                "Meeting Updated";


            let message =
                `${meeting.title || "A meeting"} was recently updated.`;


            const status =
                String(
                    meeting.status ||
                    ""
                ).toLowerCase();


            if (
                status ===
                "cancelled"
            ) {

                title =
                    "Meeting Cancelled";


                message =
                    `${meeting.title || "A meeting"} has been cancelled.`;

            }

            else if (
                status ===
                "completed"
            ) {

                title =
                    "Meeting Completed";


                message =
                    `${meeting.title || "A meeting"} has been completed.`;

            }

            else if (
                status ===
                "ongoing"
            ) {

                title =
                    "Meeting Started";


                message =
                    `${meeting.title || "A meeting"} is currently ongoing.`;

            }

            else {

                title =
                    "Meeting Updated";


                message =
                    `${meeting.title || "A meeting"} was recently updated.`;

            }


            generated.push({

                type:
                    "meeting",

                title,

                message,

                studentName:
                    "",

                studentId:
                    "",

                meetingName:
                    meeting.title ||
                    "Untitled Meeting",

                date:
                    meeting.updated_at ||
                    meeting.date,

                meta:
                    formatMeetingStatus(
                        meeting.status
                    )

            });

        }
    );


    /*
    |--------------------------------------------------------------------------
    | SORT NEWEST FIRST
    |--------------------------------------------------------------------------
    */

    generated.sort(
        function (a, b) {

            return (
                getDateValue(
                    b.date
                ) -
                getDateValue(
                    a.date
                )
            );

        }
    );


    return generated;

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const total =
        notifications.length;


    const low =
        notifications.filter(
            function (item) {

                return (
                    item.type ===
                    "low"
                );

            }
        ).length;


    const officer =
        notifications.filter(
            function (item) {

                return (
                    item.type ===
                    "officer"
                );

            }
        ).length;


    const meeting =
        notifications.filter(
            function (item) {

                return (
                    item.type ===
                    "meeting"
                );

            }
        ).length;


    totalAlerts.textContent =
        total;


    lowAttendanceAlerts.textContent =
        low;


    /*
     * These two elements originally represented
     * duplicate and invalid records.
     *
     * We now use them for:
     * Officer Applications
     * Meeting Updates
     */

    duplicateAlerts.textContent =
        officer;


    invalidAlerts.textContent =
        meeting;

}


/* =========================================================
   RENDER
========================================================= */

function renderNotifications() {

    const selectedType =
        typeFilter.value;


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    let filtered =
        notifications;


    /*
    |--------------------------------------------------------------------------
    | TYPE FILTER
    |--------------------------------------------------------------------------
    */

    if (
        selectedType
    ) {

        filtered =
            filtered.filter(
                function (item) {

                    return (
                        item.type ===
                        selectedType
                    );

                }
            );

    }


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if (
        query
    ) {

        filtered =
            filtered.filter(
                function (item) {

                    const text = [

                        item.title,

                        item.message,

                        item.studentName,

                        item.studentId,

                        item.meetingName,

                        item.meta

                    ]
                    .join(" ")
                    .toLowerCase();


                    return text.includes(
                        query
                    );

                }
            );

    }


    alertsContainer.innerHTML =
        "";


    displayedAlerts.textContent =
        filtered.length;


    if (
        filtered.length ===
        0
    ) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    filtered.forEach(
        function (item) {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "alert " +
                item.type;


            element.innerHTML = `

                <div class="alert-icon">

                    ${getNotificationIcon(
                        item.type
                    )}

                </div>


                <div class="alert-content">

                    <div class="alert-title">

                        ${escapeHtml(
                            item.title
                        )}

                    </div>


                    <div class="alert-message">

                        ${escapeHtml(
                            item.message
                        )}

                    </div>


                    <div class="alert-meta">

                        <span class="alert-type">

                            ${getNotificationLabel(
                                item.type
                            )}

                        </span>

                        ${escapeHtml(
                            item.meta ||
                            ""
                        )}

                        ${
                            item.meetingName
                                ? " • " +
                                  escapeHtml(
                                      item.meetingName
                                  )
                                : ""
                        }

                        ${
                            item.date
                                ? " • " +
                                  escapeHtml(
                                      formatDateTime(
                                          item.date
                                      )
                                  )
                                : ""
                        }

                    </div>

                </div>

            `;


            alertsContainer.appendChild(
                element
            );

        }
    );

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    alertsContainer.innerHTML = `

        <div
            style="
                text-align:center;
                padding:30px;
                color:#888;
                font-size:12px;
            "
        >
            Loading notifications...
        </div>

    `;


    emptyState.classList.add(
        "hidden"
    );

}


/* =========================================================
   ICON
========================================================= */

function getNotificationIcon(
    type
) {

    if (
        type ===
        "officer"
    ) {

        return "♙";

    }


    if (
        type ===
        "low"
    ) {

        return "⚠";

    }


    if (
        type ===
        "meeting"
    ) {

        return "◫";

    }


    return "!";

}


/* =========================================================
   LABEL
========================================================= */

function getNotificationLabel(
    type
) {

    if (
        type ===
        "officer"
    ) {

        return "OFFICER APPLICATION";

    }


    if (
        type ===
        "low"
    ) {

        return "LOW ATTENDANCE";

    }


    if (
        type ===
        "meeting"
    ) {

        return "MEETING UPDATE";

    }


    return "NOTIFICATION";

}


/* =========================================================
   MEETING STATUS
========================================================= */

function formatMeetingStatus(
    status
) {

    const value =
        String(
            status ||
            ""
        ).toLowerCase();


    if (
        value ===
        "completed"
    ) {

        return "Meeting completed";

    }


    if (
        value ===
        "ongoing"
    ) {

        return "Meeting ongoing";

    }


    if (
        value ===
        "cancelled"
    ) {

        return "Meeting cancelled";

    }


    return "Meeting updated";

}


/* =========================================================
   DATE VALUE
========================================================= */

function getDateValue(
    value
) {

    if (!value) {

        return 0;

    }


    const timestamp =
        new Date(
            value
        ).getTime();


    return Number.isNaN(
        timestamp
    )
        ? 0
        : timestamp;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDateTime(
    value
) {

    if (!value) {

        return "";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleString(
        "en-PH",
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
    );

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    const parts =
        name
            .trim()
            .split(/\s+/);


    if (
        parts.length ===
        1
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


/* =========================================================
   ESCAPE HTML
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