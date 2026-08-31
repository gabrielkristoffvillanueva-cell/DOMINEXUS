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
   LOAD ATTENDANCE HISTORY
========================================================= */

async function loadAttendanceHistory() {

    showLoading();

    try {

        /* =====================================================
           1. LOAD ATTENDANCE HISTORY
        ===================================================== */

        const historyResponse =
            await fetch(
                `${API_BASE}/moderator-attendance-history?moderator_id=${encodeURIComponent(
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


        const historyData =
            await historyResponse.json();


        console.log(
            "ATTENDANCE HISTORY RESPONSE:",
            historyData
        );


        if (
            !historyResponse.ok
        ) {

            throw new Error(
                historyData.message ||
                "Unable to load attendance history."
            );

        }


        history =
            Array.isArray(
                historyData.history
            )
                ? historyData.history
                : [];


        /* =====================================================
           2. LOAD ALL MODERATOR MEETINGS
        ===================================================== */

        const meetingsResponse =
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


        const meetingsData =
            await meetingsResponse.json();


        console.log(
            "MEETINGS RESPONSE:",
            meetingsData
        );


        if (
            !meetingsResponse.ok
        ) {

            throw new Error(
                meetingsData.message ||
                "Unable to load meetings."
            );

        }


        /*
         * The meetings endpoint normally returns
         * an array directly.
         */

        if (
            Array.isArray(
                meetingsData
            )
        ) {

            meetings =
                meetingsData;

        } else {

            meetings =
                meetingsData.meetings ||
                meetingsData.data ||
                [];

        }


        /* =====================================================
           3. FALLBACK MEETINGS FROM HISTORY
        ===================================================== */

        if (
            meetings.length === 0 &&
            history.length > 0
        ) {

            const meetingMap =
                new Map();


            history.forEach(
                function (
                    item
                ) {

                    if (
                        item.meeting &&
                        item.meeting.id
                    ) {

                        meetingMap.set(
                            String(
                                item.meeting.id
                            ),
                            item.meeting
                        );

                    }

                }
            );


            meetings =
                Array.from(
                    meetingMap.values()
                );

        }


        console.log(
            "FINAL MEETINGS FOR DROPDOWN:",
            meetings
        );


        /* =====================================================
           4. BACKEND STATISTICS
        ===================================================== */

        if (
            historyData.statistics
        ) {

            if (
                recordCount
            ) {

                recordCount.textContent =
                    historyData.statistics
                        .attendance_records ??
                    0;

            }


            if (
                presentCount
            ) {

                presentCount.textContent =
                    historyData.statistics
                        .unique_students_present ??
                    0;

            }


            if (
                absentCount
            ) {

                absentCount.textContent =
                    historyData.statistics
                        .absent_records ??
                    0;

            }


            if (
                attendanceRate
            ) {

                attendanceRate.textContent =
                    (
                        historyData.statistics
                            .attendance_rate ??
                        0
                    ) +
                    "%";

            }

        }


        /* =====================================================
           5. MODERATOR INFORMATION
        ===================================================== */

        if (
            historyData.moderator
        ) {

            if (
                historyData.moderator.name
            ) {

                if (
                    moderatorNameElement
                ) {

                    moderatorNameElement.textContent =
                        historyData.moderator.name;

                }


                if (
                    moderatorAvatar
                ) {

                    moderatorAvatar.textContent =
                        getInitials(
                            historyData.moderator.name
                        );

                }


                sessionStorage.setItem(
                    "moderatorName",
                    historyData.moderator.name
                );

            }


            if (
                historyData.moderator.organization_id
                !== undefined
            ) {

                sessionStorage.setItem(
                    "moderatorOrganizationId",
                    historyData.moderator.organization_id
                );

            }

        }


        /* =====================================================
           6. POPULATE MEETING DROPDOWN
        ===================================================== */

        loadMeetingOptions();


        /* =====================================================
           7. DISPLAY HISTORY
        ===================================================== */

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
   LOADING
========================================================= */

function showLoading() {

    if (
        historyTableBody
    ) {

        historyTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
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
   DOWNLOAD ATTENDANCE WITH DIGITAL SIGNATURE
========================================================= */

function downloadAttendanceCSV() {

    if (
        !filteredHistory ||
        filteredHistory.length === 0
    ) {

        alert(
            "There are no attendance records to download."
        );

        return;

    }


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


                /*
                 * Digital signature
                 */

                const signature =
                    student.digital_signature ||
                    student.digitalSignature ||
                    student.signature ||
                    "";


                let signatureHTML =

                    `
                        <span class="no-signature">
                            No signature available
                        </span>
                    `;


                if (
                    signature &&
                    String(
                        signature
                    ).trim()
                ) {

                    signatureHTML =

                        `
                            <img
                                src="${escapeAttribute(
                                    signature
                                )}"
                                class="signature"
                                alt="Digital Signature"
                            >
                        `;

                }


                return `

                    <tr>

                        <td>
                            ${escapeHtml(
                                meeting.title ||
                                "Untitled Meeting"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                formatDate(
                                    meeting.date
                                )
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                student.name ||
                                "Unknown Student"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                student.student_id ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                student.unique_id ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                item.status ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                formatDateTime(
                                    item.scanned_at ||
                                    item.created_at
                                )
                            )}
                        </td>


                        <td class="signature-cell">

                            ${signatureHTML}

                        </td>


                        <td>
                            ${escapeHtml(
                                item.remarks ||
                                "—"
                            )}
                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    /* =====================================================
       REPORT TITLE
    ===================================================== */

    let reportTitle =
        "DOMINEXUS Attendance Report";


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

            const title =
                selectedMeeting.title ||
                "Meeting";


            reportTitle =
                title +
                " - Attendance Report";


            filename +=
                "_" +
                sanitizeFilename(
                    title
                );

        }

    } else {

        filename +=
            "_All_Meetings";

    }


    filename +=
        ".html";


    /* =====================================================
       HTML REPORT
    ===================================================== */

    const html = `

<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <title>
        ${escapeHtml(
            reportTitle
        )}
    </title>


    <style>

        * {
            box-sizing: border-box;
        }


        body {

            font-family:
                Arial,
                Helvetica,
                sans-serif;

            margin: 40px;

            color: #222;

            background: #fff;

        }


        .header {

            margin-bottom: 25px;

        }


        .header h1 {

            margin: 0 0 6px 0;

            font-size: 24px;

        }


        .header p {

            margin: 0;

            color: #666;

            font-size: 13px;

        }


        table {

            width: 100%;

            border-collapse: collapse;

            margin-top: 20px;

        }


        th {

            background: #f1f1f1;

            font-size: 11px;

            text-align: left;

            padding: 10px;

            border: 1px solid #ccc;

        }


        td {

            font-size: 11px;

            padding: 10px;

            border: 1px solid #ccc;

            vertical-align: middle;

        }


        .signature-cell {

            width: 150px;

            height: 70px;

            text-align: center;

        }


        .signature {

            max-width: 130px;

            max-height: 55px;

            object-fit: contain;

        }


        .no-signature {

            color: #888;

            font-style: italic;

            font-size: 10px;

        }


        .footer {

            margin-top: 25px;

            font-size: 11px;

            color: #777;

        }


        @media print {

            body {

                margin: 15px;

            }


            table {

                page-break-inside: auto;

            }


            tr {

                page-break-inside: avoid;

                page-break-after: auto;

            }

        }

    </style>

</head>


<body>


    <div class="header">

        <h1>
            ${escapeHtml(
                reportTitle
            )}
        </h1>


        <p>
            Generated by DOMINEXUS Moderator Portal
        </p>

    </div>


    <table>

        <thead>

            <tr>

                <th>
                    Meeting
                </th>

                <th>
                    Date
                </th>

                <th>
                    Student Name
                </th>

                <th>
                    Student ID
                </th>

                <th>
                    Unique ID
                </th>

                <th>
                    Status
                </th>

                <th>
                    Time In
                </th>

                <th>
                    Digital Signature
                </th>

                <th>
                    Remarks
                </th>

            </tr>

        </thead>


        <tbody>

            ${rows}

        </tbody>

    </table>


    <div class="footer">

        Total Records:
        ${filteredHistory.length}

    </div>


</body>

</html>

    `;


    /* =====================================================
       DOWNLOAD
    ===================================================== */

    const blob =
        new Blob(
            [
                html
            ],
            {
                type:
                    "text/html;charset=utf-8"
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
   ESCAPE HTML ATTRIBUTE
========================================================= */

function escapeAttribute(
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
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
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


/* =========================================================
   INITIAL LOAD
========================================================= */

loadAttendanceHistory();