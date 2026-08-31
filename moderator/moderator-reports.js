/* =========================================================
   DOMINEXUS
   MODERATOR - REPORTS
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

const meetingSelect =
    document.getElementById(
        "meetingSelect"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const tableBody =
    document.getElementById(
        "reportTableBody"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const recordCount =
    document.getElementById(
        "recordCount"
    );


const totalStudents =
    document.getElementById(
        "totalStudents"
    );


const presentStudents =
    document.getElementById(
        "presentStudents"
    );


const absentStudents =
    document.getElementById(
        "absentStudents"
    );


const attendanceRate =
    document.getElementById(
        "attendanceRate"
    );


const downloadAttendance =
    document.getElementById(
        "downloadAttendance"
    );


const downloadStudents =
    document.getElementById(
        "downloadStudents"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================================================
   DATA
========================================================= */

let students = [];

let meetings = [];

let attendance = [];

let currentRows = [];


/* =========================================================
   MODERATOR
========================================================= */

const moderatorName =
    sessionStorage.getItem(
        "moderatorName"
    ) ||
    "System Moderator";


const moderatorId =
    sessionStorage.getItem(
        "moderatorId"
    );


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
   INITIALIZE
========================================================= */

loadReports();


/* =========================================================
   EVENTS
========================================================= */

meetingSelect.addEventListener(
    "change",
    generateReport
);


searchInput.addEventListener(
    "input",
    generateReport
);


downloadAttendance.addEventListener(
    "click",
    downloadAttendanceCSV
);


downloadStudents.addEventListener(
    "click",
    downloadStudentsCSV
);


/* =========================================================
   LOAD REPORT DATA
========================================================= */

async function loadReports() {

    try {

        if (!moderatorId) {

            throw new Error(
                "Moderator ID is missing from the session."
            );

        }


        showLoading();


        const response =
            await fetch(
                `${API_BASE}/moderator-reports?moderator_id=${encodeURIComponent(
                    moderatorId
                )}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load reports."
            );

        }


        students =
            Array.isArray(
                data.students
            )
                ? data.students
                : [];


        meetings =
            Array.isArray(
                data.meetings
            )
                ? data.meetings
                : [];


        attendance =
            Array.isArray(
                data.attendance
            )
                ? data.attendance
                : [];


        loadMeetings();

        generateReport();


    } catch (error) {

        console.error(
            "Reports error:",
            error
        );


        tableBody.innerHTML =
            "";


        recordCount.textContent =
            "0";


        emptyState.classList.remove(
            "hidden"
        );


        emptyState.textContent =
            error.message ||
            "Unable to load reports.";

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    tableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                style="text-align:center;padding:30px;"
            >
                Loading reports...
            </td>

        </tr>

    `;


    emptyState.classList.add(
        "hidden"
    );

}


/* =========================================================
   LOAD MEETINGS
========================================================= */

function loadMeetings() {

    meetingSelect.innerHTML = `

        <option value="">
            All Meetings
        </option>

    `;


    meetings
        .slice()
        .sort(
            function (a, b) {

                return (
                    getMeetingDateValue(b) -
                    getMeetingDateValue(a)
                );

            }
        )
        .forEach(
            function (meeting) {

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
   GENERATE REPORT
========================================================= */

function generateReport() {

    const selectedMeeting =
        meetingSelect.value;


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    let rows =
        attendance
            .map(
                function (record) {

                    return buildRow(
                        record
                    );

                }
            )
            .filter(
                function (row) {

                    if (!row) {

                        return false;

                    }


                    if (
                        selectedMeeting &&
                        String(
                            row.meetingId
                        ) !==
                        String(
                            selectedMeeting
                        )
                    ) {

                        return false;

                    }


                    if (!query) {

                        return true;

                    }


                    const searchText = [

                        row.name,

                        row.studentId,

                        row.uniqueId,

                        row.meetingTitle,

                        row.status,

                        row.remarks

                    ]
                    .join(" ")
                    .toLowerCase();


                    return searchText.includes(
                        query
                    );

                }
            );


    rows.sort(
        function (a, b) {

            return (
                getMeetingDateValue(
                    b.meeting
                ) -
                getMeetingDateValue(
                    a.meeting
                )
            );

        }
    );


    currentRows =
        rows;


    renderReport(
        rows
    );


    updateSummary(
        rows,
        selectedMeeting
    );

}


/* =========================================================
   BUILD ROW
========================================================= */

function buildRow(
    record
) {

    const meeting =
        record.meeting ||
        findMeeting(
            record.meeting_id
        );


    const student =
        record.student ||
        findStudent(
            record
        );


    if (!meeting || !student) {

        return null;

    }


    return {

        meetingId:
            record.meeting_id,

        meeting,

        student,

        name:
            student.name ||
            "Unknown Student",

        studentId:
            student.student_id ||
            "—",

        uniqueId:
            student.unique_id ||
            "—",

        status:
            record.status ||
            "absent",

        timeIn:
            record.scanned_at ||
            null,

        remarks:
            record.remarks ||
            "—"

    };

}


/* =========================================================
   FIND MEETING
========================================================= */

function findMeeting(
    meetingId
) {

    return meetings.find(
        function (meeting) {

            return (
                String(
                    meeting.id
                ) ===
                String(
                    meetingId
                )
            );

        }
    ) || null;

}


/* =========================================================
   FIND STUDENT
========================================================= */

function findStudent(
    record
) {

    return students.find(
        function (student) {

            return (

                (
                    record.student_id &&
                    String(
                        student.id
                    ) ===
                    String(
                        record.user_id
                    )
                )

                ||

                (
                    record.user_id &&
                    String(
                        student.id
                    ) ===
                    String(
                        record.user_id
                    )
                )

            );

        }
    ) || null;

}


/* =========================================================
   RENDER REPORT
========================================================= */

function renderReport(
    rows
) {

    tableBody.innerHTML =
        "";


    recordCount.textContent =
        rows.length;


    if (
        rows.length ===
        0
    ) {

        emptyState.classList.remove(
            "hidden"
        );

        emptyState.textContent =
            "No report records found.";

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    rows.forEach(
        function (item) {

            const row =
                document.createElement(
                    "tr"
                );


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
                            item.meeting.title ||
                            "Untitled Meeting"
                        )}
                    </div>

                    <div class="meeting-date">
                        ${escapeHtml(
                            formatDate(
                                item.meeting.date
                            )
                        )}
                    </div>

                </td>


                <td>

                    <div class="student-name">
                        ${escapeHtml(
                            item.name
                        )}
                    </div>

                </td>


                <td>
                    ${escapeHtml(
                        item.studentId
                    )}
                </td>


                <td>

                    <span class="unique-id">
                        ${escapeHtml(
                            item.uniqueId
                        )}
                    </span>

                </td>


                <td>

                    <span
                        class="status ${statusClass}"
                    >
                        ${escapeHtml(
                            capitalize(
                                status
                            )
                        )}
                    </span>

                </td>


                <td>
                    ${escapeHtml(
                        formatDateTime(
                            item.timeIn
                        )
                    )}
                </td>


                <td>

                    <div class="remarks">
                        ${escapeHtml(
                            item.remarks
                        )}
                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary(
    rows,
    selectedMeeting
) {

    let present =
        0;


    let late =
        0;


    let absent =
        0;


    let excused =
        0;


    rows.forEach(
        function (item) {

            const status =
                String(
                    item.status ||
                    ""
                ).toLowerCase();


            if (
                status ===
                "present"
            ) {

                present++;

            }


            if (
                status ===
                "late"
            ) {

                late++;

            }


            if (
                status ===
                "absent"
            ) {

                absent++;

            }


            if (
                status ===
                "excused"
            ) {

                excused++;

            }

        }
    );


    /*
    |--------------------------------------------------------------------------
    | SELECTED MEETING
    |--------------------------------------------------------------------------
    */

    if (
        selectedMeeting
    ) {

        const total =
            students.length;


        totalStudents.textContent =
            total;


        presentStudents.textContent =
            present;


        absentStudents.textContent =
            absent;


        const rate =
            total > 0
                ? Math.round(
                    (
                        (
                            present +
                            late
                        ) /
                        total
                    ) * 100
                )
                : 0;


        attendanceRate.textContent =
            rate +
            "%";


        return;

    }


    /*
    |--------------------------------------------------------------------------
    | ALL MEETINGS
    |--------------------------------------------------------------------------
    */

    const uniqueStudents =
        new Set();


    rows.forEach(
        function (item) {

            uniqueStudents.add(
                String(
                    item.student.id
                )
            );

        }
    );


    totalStudents.textContent =
        uniqueStudents.size;


    presentStudents.textContent =
        present;


    absentStudents.textContent =
        absent;


    const totalRecorded =
        present +
        late +
        absent +
        excused;


    const rate =
        totalRecorded > 0
            ? Math.round(
                (
                    (
                        present +
                        late
                    ) /
                    totalRecorded
                ) * 100
            )
            : 0;


    attendanceRate.textContent =
        rate +
        "%";

}


/* =========================================================
   DOWNLOAD ATTENDANCE CSV
========================================================= */

function downloadAttendanceCSV() {

    if (
        currentRows.length ===
        0
    ) {

        alert(
            "There are no attendance records to download."
        );

        return;

    }


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


    const csvRows = [

        headers

    ];


    currentRows.forEach(
        function (item) {

            csvRows.push([

                item.meeting.title ||
                "Untitled Meeting",

                item.meeting.date ||
                "",

                item.name,

                item.studentId,

                item.uniqueId,

                capitalize(
                    item.status
                ),

                item.timeIn ||
                "",

                item.remarks ||
                ""

            ]);

        }
    );


    downloadCSV(
        csvRows,
        "dominexus-attendance-report.csv"
    );

}


/* =========================================================
   DOWNLOAD STUDENTS CSV
========================================================= */

function downloadStudentsCSV() {

    if (
        students.length ===
        0
    ) {

        alert(
            "There are no student records to download."
        );

        return;

    }


    const headers = [

        "Full Name",

        "Student ID",

        "Unique ID",

        "Section",

        "Club Role"

    ];


    const csvRows = [

        headers

    ];


    students.forEach(
        function (student) {

            csvRows.push([

                student.name ||
                "",

                student.student_id ||
                "",

                student.unique_id ||
                "",

                student.section ||
                "",

                student.club_role ||
                ""

            ]);

        }
    );


    downloadCSV(
        csvRows,
        "dominexus-student-records.csv"
    );

}


/* =========================================================
   CSV DOWNLOAD
========================================================= */

function downloadCSV(
    rows,
    filename
) {

    const csv =
        rows
            .map(
                function (row) {

                    return row
                        .map(
                            function (value) {

                                return csvEscape(
                                    value
                                );

                            }
                        )
                        .join(",");

                }
            )
            .join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" +
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


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   MEETING LABEL
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

    if (!meeting) {

        return 0;

    }


    const date =
        meeting.date ||
        "";


    const time =
        meeting.start_time ||
        "00:00";


    const value =
        new Date(
            date +
            "T" +
            time
        ).getTime();


    return Number.isNaN(
        value
    )
        ? 0
        : value;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(
            value +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

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
   FORMAT DATE TIME
========================================================= */

function formatDateTime(
    value
) {

    if (!value) {

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

        return value;

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
   CAPITALIZE
========================================================= */

function capitalize(
    value
) {

    const text =
        String(
            value ||
            ""
        );


    return text.charAt(0)
        .toUpperCase() +
        text.slice(1);

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


/* =========================================================
   HELPERS
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