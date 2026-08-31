/* =========================================================
   DOMINEXUS
   MODERATOR — ATTENDANCE HISTORY
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
   DOM
========================================================= */

const meetingSelect =
    document.getElementById(
        "meetingSelect"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const historyTableBody =
    document.getElementById(
        "historyTableBody"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const recordCount =
    document.getElementById(
        "recordCount"
    );


const presentCount =
    document.getElementById(
        "presentCount"
    );


const absentCount =
    document.getElementById(
        "absentCount"
    );


const attendanceRate =
    document.getElementById(
        "attendanceRate"
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


const downloadAttendanceButton =
    document.getElementById(
        "downloadAttendanceButton"
    );


/* =========================================================
   DATA
========================================================= */

let meetings = [];

let history = [];

let filteredHistory = [];


/* =========================================================
   MODERATOR INFORMATION
========================================================= */

const savedModeratorName =
    sessionStorage.getItem(
        "moderatorName"
    ) ||
    "System Moderator";


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
   INITIAL LOAD
========================================================= */

loadAttendanceHistory();


/* =========================================================
   FILTER EVENTS
========================================================= */

if (
    meetingSelect
) {

    meetingSelect.addEventListener(
        "change",
        function () {

            applyFilters();

        }
    );

}


if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        function () {

            applyFilters();

        }
    );

}


/* =========================================================
   DOWNLOAD EVENT
========================================================= */

if (
    downloadAttendanceButton
) {

    downloadAttendanceButton.addEventListener(
        "click",
        function () {

            if (
                filteredHistory.length ===
                0
            ) {

                alert(
                    "There are no attendance records to download."
                );

                return;

            }


            downloadAttendanceCSV();

        }
    );

}


/* =========================================================
   LOAD ATTENDANCE HISTORY
========================================================= */

async function loadAttendanceHistory() {

    showLoading();


    try {

        const response =
            await fetch(
                `${API_BASE}/moderator-attendance-history?moderator_id=${encodeURIComponent(
                    moderatorId
                )}`,
                {

                    method:
                        "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "MODERATOR ATTENDANCE HISTORY:",
            data
        );


        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                "Unable to load attendance history."
            );

        }


        meetings =
            Array.isArray(
                data.meetings
            )
                ? data.meetings
                : [];


        history =
            Array.isArray(
                data.history
            )
                ? data.history
                : [];
 
        /* =========================================================
   BACKEND STATISTICS
========================================================= */

if (
    data.statistics
) {

    if (
        recordCount
    ) {

        recordCount.textContent =
            data.statistics
                .attendance_records ??
            0;

    }


    if (
        presentCount
    ) {

        presentCount.textContent =
            data.statistics
                .unique_students_present ??
            0;

    }


    if (
        absentCount
    ) {

        absentCount.textContent =
            data.statistics
                .absent_records ??
            0;

    }


    if (
        attendanceRate
    ) {

        attendanceRate.textContent =
            (
                data.statistics
                    .attendance_rate ??
                0
            ) +
            "%";

    }

}

        /*
         * Update moderator information
         */

        if (
            data.moderator
        ) {

            if (
                data.moderator.name
            ) {

                if (
                    moderatorNameElement
                ) {

                    moderatorNameElement.textContent =
                        data.moderator.name;

                }


                if (
                    moderatorAvatar
                ) {

                    moderatorAvatar.textContent =
                        getInitials(
                            data.moderator.name
                        );

                }


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


        loadMeetingOptions();


        applyFilters();


    } catch (
        error
    ) {

        console.error(
            "ATTENDANCE HISTORY ERROR:",
            error
        );


        meetings =
            [];

        history =
            [];

        filteredHistory =
            [];


        if (
            meetingSelect
        ) {

            meetingSelect.innerHTML = `

                <option value="">
                    All Meetings
                </option>

            `;

        }


        if (
            historyTableBody
        ) {

            historyTableBody.innerHTML =
                "";

        }


        if (
            emptyState
        ) {

            emptyState.classList.remove(
                "hidden"
            );


            emptyState.textContent =
                error.message ||
                "Unable to load attendance history.";

        }


        updateStatistics(
            []
        );

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    if (
        historyTableBody
    ) {

        historyTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    Loading attendance history...

                </td>

            </tr>

        `;

    }


    if (
        emptyState
    ) {

        emptyState.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   LOAD MEETING OPTIONS
========================================================= */

function loadMeetingOptions() {

    if (
        !meetingSelect
    ) {

        return;

    }


    meetingSelect.innerHTML = `

        <option value="">
            All Meetings
        </option>

    `;


    const sortedMeetings =
        [...meetings]
        .sort(
            function (
                a,
                b
            ) {

                return (
                    getMeetingDateValue(
                        b
                    ) -
                    getMeetingDateValue(
                        a
                    )
                );

            }
        );


    sortedMeetings.forEach(
        function (
            meeting
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    meeting.id
                );


            option.textContent =
                buildMeetingLabel(
                    meeting
                );


            meetingSelect.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyFilters() {

    const selectedMeeting =
        meetingSelect
            ? meetingSelect.value
            : "";


    const query =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    filteredHistory =
        history.filter(
            function (
                item
            ) {

                /*
                 * Meeting filter
                 */

                if (
                    selectedMeeting &&
                    String(
                        item.meeting?.id
                    ) !==
                    String(
                        selectedMeeting
                    )
                ) {

                    return false;

                }


                /*
                 * Search filter
                 */

                if (
                    query
                ) {

                    const student =
                        item.student ||
                        {};

                    const meeting =
                        item.meeting ||
                        {};


                    const searchText = [

                        student.name,

                        student.student_id,

                        student.unique_id,

                        student.section,

                        meeting.title,

                        meeting.date,

                        item.status

                    ]
                    .join(" ")
                    .toLowerCase();


                    if (
                        !searchText.includes(
                            query
                        )
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    /*
     * Newest first.
     */

    filteredHistory.sort(
        function (
            a,
            b
        ) {

            return (
                getHistoryDateValue(
                    b
                ) -
                getHistoryDateValue(
                    a
                )
            );

        }
    );


    renderHistory(
        filteredHistory
    );


    updateStatistics(
        filteredHistory
    );

}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderHistory(
    rows
) {

    if (
        !historyTableBody
    ) {

        return;

    }


    historyTableBody.innerHTML =
        "";


    if (
        recordCount
    ) {

        recordCount.textContent =
            rows.length;

    }


    if (
        rows.length ===
        0
    ) {

        if (
            emptyState
        ) {

            emptyState.classList.remove(
                "hidden"
            );


            if (
                searchInput &&
                searchInput.value.trim()
            ) {

                emptyState.textContent =
                    "No attendance records match your search.";

            } else if (
                meetingSelect &&
                meetingSelect.value
            ) {

                emptyState.textContent =
                    "No attendance records found for this meeting.";

            } else {

                emptyState.textContent =
                    "No attendance records found.";

            }

        }


        return;

    }


    if (
        emptyState
    ) {

        emptyState.classList.add(
            "hidden"
        );

    }


    rows.forEach(
        function (
            item
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            const meeting =
                item.meeting ||
                {};


            const student =
                item.student ||
                {};


            const status =
                String(
                    item.status ||
                    "Absent"
                );


            const statusClass =
                status
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            row.innerHTML = `

                <td>

                    <div class="meeting-name">

                        ${escapeHtml(
                            meeting.title ||
                            "Untitled Meeting"
                        )}

                    </div>


                    <div class="meeting-date">

                        ${escapeHtml(
                            formatDate(
                                meeting.date
                            )
                        )}

                    </div>

                </td>


                <td>

                    <div class="student-name">

                        ${escapeHtml(
                            student.name ||
                            "Unknown Student"
                        )}

                    </div>

                </td>


                <td>

                    ${escapeHtml(
                        student.student_id ||
                        "—"
                    )}

                </td>


                <td>

                    <span class="unique-id">

                        ${escapeHtml(
                            student.unique_id ||
                            "—"
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="status ${escapeHtml(
                            statusClass
                        )}"
                    >

                        ${escapeHtml(
                            status
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHtml(
                        formatDateTime(
                            item.scanned_at ||
                            item.created_at
                        )
                    )}

                </td>


                <td>

                    <div class="remarks">

                        ${escapeHtml(
                            item.remarks ||
                            "—"
                        )}

                    </div>

                </td>

            `;


            historyTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics(
    rows
) {

    let present =
        0;

    let absent =
        0;


    rows.forEach(
        function (
            item
        ) {

            const status =
                String(
                    item.status ||
                    ""
                )
                .toLowerCase();


            if (
                status ===
                "present" ||
                status ===
                "late"
            ) {

                present++;

            } else if (
                status ===
                "absent"
            ) {

                absent++;

            }

        }
    );


    if (
        presentCount
    ) {

        presentCount.textContent =
            present;

    }


    if (
        absentCount
    ) {

        absentCount.textContent =
            absent;

    }


    const total =
        present +
        absent;


    const rate =
        total > 0
            ? Math.round(
                (
                    present /
                    total
                ) *
                100
            )
            : 0;


    if (
        attendanceRate
    ) {

        attendanceRate.textContent =
            rate +
            "%";

    }

}


/* =========================================================
   DOWNLOAD ATTENDANCE CSV
========================================================= */

function downloadAttendanceCSV() {

    const headers = [

        "Meeting",

        "Date",

        "Student Name",

        "Student ID",

        "Unique ID",

        "Status",

        "Time In",

        "Remarks"

    ];


    const rows =
        filteredHistory.map(
            function (
                item
            ) {

                const student =
                    item.student ||
                    {};


                const meeting =
                    item.meeting ||
                    {};


                return [

                    meeting.title ||
                    "Untitled Meeting",

                    formatDate(
                        meeting.date
                    ),

                    student.name ||
                    "Unknown Student",

                    student.student_id ||
                    "—",

                    student.unique_id ||
                    "—",

                    item.status ||
                    "—",

                    formatDateTime(
                        item.scanned_at ||
                        item.created_at
                    ),

                    item.remarks ||
                    "—"

                ];

            }
        );


    const csvData = [

        headers,

        ...rows

    ];


    const csv =
        csvData
            .map(
                function (
                    row
                ) {

                    return row
                        .map(
                            function (
                                value
                            ) {

                                return `"${String(
                                    value ??
                                    ""
                                )
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`;

                            }
                        )
                        .join(",");

                }
            )
            .join("\r\n");


    /*
     * UTF-8 BOM makes the CSV display
     * properly in Microsoft Excel.
     */

    const blob =
        new Blob(
            [
                "\uFEFF",
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    /*
     * Build filename.
     */

    let filename =
        "DOMINEXUS_Attendance";


    if (
        meetingSelect &&
        meetingSelect.value
    ) {

        const selectedMeeting =
            meetings.find(
                function (
                    meeting
                ) {

                    return (
                        String(
                            meeting.id
                        ) ===
                        String(
                            meetingSelect.value
                        )
                    );

                }
            );


        if (
            selectedMeeting
        ) {

            filename +=
                "_" +
                sanitizeFilename(
                    selectedMeeting.title ||
                    "Meeting"
                );

        }

    } else {

        filename +=
            "_All_Meetings";

    }


    filename +=
        ".csv";


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   SANITIZE FILENAME
========================================================= */

function sanitizeFilename(
    value
) {

    return String(
        value
    )
    .replace(
        /[<>:"/\\|?*]+/g,
        "_"
    )
    .replace(
        /\s+/g,
        "_"
    )
    .substring(
        0,
        80
    );

}


/* =========================================================
   BUILD MEETING LABEL
========================================================= */

function buildMeetingLabel(
    meeting
) {

    let label =
        meeting.title ||
        "Untitled Meeting";


    if (
        meeting.date
    ) {

        label +=
            " — " +
            formatDate(
                meeting.date
            );

    }


    return label;

}


/* =========================================================
   MEETING DATE VALUE
========================================================= */

function getMeetingDateValue(
    meeting
) {

    if (
        !meeting
    ) {

        return 0;

    }


    const date =
        meeting.date ||
        "";


    const time =
        meeting.start_time ||
        "00:00:00";


    const value =
        new Date(
            date +
            "T" +
            time
        )
        .getTime();


    return Number.isNaN(
        value
    )
        ? 0
        : value;

}


/* =========================================================
   HISTORY DATE VALUE
========================================================= */

function getHistoryDateValue(
    item
) {

    if (
        item.scanned_at
    ) {

        const scanned =
            new Date(
                item.scanned_at
            )
            .getTime();


        if (
            !Number.isNaN(
                scanned
            )
        ) {

            return scanned;

        }

    }


    if (
        item.created_at
    ) {

        const created =
            new Date(
                item.created_at
            )
            .getTime();


        if (
            !Number.isNaN(
                created
            )
        ) {

            return created;

        }

    }


    return getMeetingDateValue(
        item.meeting
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (
        !value
    ) {

        return "—";

    }


    const date =
        new Date(
            String(
                value
            ).substring(
                0,
                10
            ) +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleDateString(
        "en-PH",
        {

            year:
                "numeric",

            month:
                "long",

            day:
                "numeric"

        }
    );

}


/* =========================================================
   FORMAT DATE + TIME
========================================================= */

function formatDateTime(
    value
) {

    if (
        !value
    ) {

        return "—";

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

        return String(
            value
        );

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
   LOGOUT
========================================================= */

if (
    logoutButton
) {

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
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ??
        ""
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
   GET INITIALS
========================================================= */

function getInitials(
    name
) {

    if (
        !name
    ) {

        return "MO";

    }


    const parts =
        String(
            name
        )
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
        parts[0].charAt(0) +
        parts[
            parts.length - 1
        ].charAt(0)
    ).toUpperCase();

}