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
   STORAGE
========================================================= */

const STUDENTS_KEY =
    "dominexus_students";

const MEETINGS_KEY =
    "dominexus_meetings";

const ATTENDANCE_KEY =
    "dominexus_attendance";


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
   MODERATOR
========================================================= */

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

let students =
    getStudents();


let meetings =
    getMeetings();


let attendance =
    getAttendance();


let currentRows =
    [];


/* =========================================================
   INITIALIZE
========================================================= */

loadMeetings();

generateReport();


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

    students =
        getStudents();


    meetings =
        getMeetings();


    attendance =
        getAttendance();


    const selectedMeeting =
        meetingSelect.value;


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    const rows =
        [];


    /*
     * Selected meeting.
     */

    if (
        selectedMeeting
    ) {

        const meeting =
            meetings.find(
                function (item) {

                    return (
                        String(
                            item.id
                        ) ===
                        String(
                            selectedMeeting
                        )
                    );

                }
            );


        if (meeting) {

            addMeetingRows(
                rows,
                meeting,
                query
            );

        }

    }


    /*
     * All meetings.
     */

    else {

        meetings.forEach(
            function (meeting) {

                addMeetingRows(
                    rows,
                    meeting,
                    query
                );

            }
        );

    }


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
   ADD MEETING ROWS
========================================================= */

function addMeetingRows(
    rows,
    meeting,
    query
) {

    const records =
        getMeetingRecords(
            meeting.id
        );


    const recordList =
        getRecordList(
            records
        );


    recordList.forEach(
        function (record, index) {

            if (!record) {

                return;

            }


            const student =
                findStudent(
                    record,
                    records,
                    index
                );


            const name =
                student
                    ? (
                        student.fullName ||
                        student.name ||
                        "Unknown Student"
                    )
                    : (
                        record.fullName ||
                        record.name ||
                        "Unknown Student"
                    );


            const studentId =
                student
                    ? (
                        student.studentId ||
                        record.studentId ||
                        "—"
                    )
                    : (
                        record.studentId ||
                        "—"
                    );


            const uniqueId =
                student
                    ? (
                        student.uniqueId ||
                        record.uniqueId ||
                        "—"
                    )
                    : (
                        record.uniqueId ||
                        "—"
                    );


            const searchText = [

                name,

                studentId,

                uniqueId,

                meeting.title,

                record.status,

                record.remarks

            ]
            .join(" ")
            .toLowerCase();


            if (
                query &&
                !searchText.includes(
                    query
                )
            ) {

                return;

            }


            rows.push({

                meeting,

                record,

                student,

                name,

                studentId,

                uniqueId

            });

        }
    );

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
                    item.record.status ||
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
                            status
                        )}
                    </span>

                </td>


                <td>
                    ${escapeHtml(
                        formatDateTime(
                            item.record.timeIn
                        )
                    )}
                </td>


                <td>

                    <div class="remarks">
                        ${escapeHtml(
                            item.record.remarks ||
                            "—"
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


    let absent =
        0;


    rows.forEach(
        function (item) {

            const status =
                String(
                    item.record.status ||
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
                "absent"
            ) {

                absent++;

            }

        }
    );


    let total;


    /*
     * When one meeting is selected,
     * total students means all registered
     * students for that meeting.
     */

    if (
        selectedMeeting
    ) {

        total =
            students.length;

    }


    /*
     * When all meetings are selected,
     * total represents the number of
     * attendance records shown.
     */

    else {

        total =
            present +
            absent;

    }


    totalStudents.textContent =
        total;


    presentStudents.textContent =
        present;


    absentStudents.textContent =
        absent;


    const denominator =
        selectedMeeting
            ? students.length
            : present + absent;


    const rate =
        denominator > 0
            ? Math.round(
                (
                    present /
                    denominator
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

                item.record.status ||
                "Absent",

                item.record.timeIn ||
                "",

                item.record.remarks ||
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

        "Club Role",

        "Organization"

    ];


    const csvRows = [

        headers

    ];


    students.forEach(
        function (student) {

            csvRows.push([

                student.fullName ||
                student.name ||
                "",

                student.studentId ||
                "",

                student.uniqueId ||
                "",

                student.section ||
                "",

                student.clubRole ||
                student.role ||
                "",

                student.organization ||
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
   CSV ESCAPE
========================================================= */

function csvEscape(
    value
) {

    const text =
        String(
            value ?? ""
        );


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n") ||
        text.includes("\r")
    ) {

        return (
            '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"'
        );

    }


    return text;

}


/* =========================================================
   GET MEETING RECORDS
========================================================= */

function getMeetingRecords(
    meetingId
) {

    if (
        attendance &&
        attendance[
            meetingId
        ] &&
        typeof attendance[
            meetingId
        ] === "object"
    ) {

        return attendance[
            meetingId
        ];

    }


    if (
        Array.isArray(
            attendance
        )
    ) {

        return attendance.filter(
            function (record) {

                return (
                    String(
                        record.meetingId ||
                        ""
                    ) ===
                    String(
                        meetingId
                    )
                );

            }
        );

    }


    return {};

}


/* =========================================================
   RECORD LIST
========================================================= */

function getRecordList(
    records
) {

    if (
        Array.isArray(
            records
        )
    ) {

        return records;

    }


    if (
        records &&
        typeof records === "object"
    ) {

        return Object.keys(
            records
        )
        .map(
            function (key) {

                return records[key];

            }
        )
        .filter(
            function (record) {

                return !!record;

            }
        );

    }


    return [];

}


/* =========================================================
   FIND STUDENT
========================================================= */

function findStudent(
    record,
    records,
    index
) {

    const recordUniqueId =
        String(
            record.uniqueId ||
            ""
        ).toLowerCase();


    const recordStudentId =
        String(
            record.studentId ||
            ""
        ).toLowerCase();


    const recordKey =
        String(
            record.uniqueId ||
            record.studentId ||
            ""
        ).toLowerCase();


    return students.find(
        function (student) {

            const uniqueId =
                String(
                    student.uniqueId ||
                    ""
                ).toLowerCase();


            const studentId =
                String(
                    student.studentId ||
                    ""
                ).toLowerCase();


            return (

                (
                    recordUniqueId &&
                    uniqueId ===
                    recordUniqueId
                )

                ||

                (
                    recordStudentId &&
                    studentId ===
                    recordStudentId
                )

                ||

                (
                    recordKey &&
                    (
                        uniqueId ===
                        recordKey ||

                        studentId ===
                        recordKey
                    )
                )

            );

        }
    ) || null;

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
        meeting.time ||
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
   DATE
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
   DATE + TIME
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