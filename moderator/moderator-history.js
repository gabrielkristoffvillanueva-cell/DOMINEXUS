/* =========================================================
   DOMINEXUS
   MODERATOR - ATTENDANCE HISTORY
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
   STORAGE KEYS
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


/* =========================================================
   MODERATOR INFORMATION
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
   INITIAL LOAD
========================================================= */

loadMeetingOptions();

renderHistory();


/* =========================================================
   FILTER EVENTS
========================================================= */

meetingSelect.addEventListener(
    "change",
    function () {

        renderHistory();

    }
);


searchInput.addEventListener(
    "input",
    function () {

        renderHistory();

    }
);


/* =========================================================
   LOAD MEETINGS
========================================================= */

function loadMeetingOptions() {

    meetingSelect.innerHTML = `

        <option value="">
            All Meetings
        </option>

    `;


    const meetings =
        getMeetings();


    meetings.sort(
        function (a, b) {

            return getMeetingDateValue(b) -
                   getMeetingDateValue(a);

        }
    );


    meetings.forEach(
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
   RENDER HISTORY
========================================================= */

function renderHistory() {

    const meetings =
        getMeetings();

    const students =
        getStudents();

    const attendance =
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
     * Go through every meeting.
     */

    meetings.forEach(
        function (meeting) {

            if (
                selectedMeeting &&
                String(
                    meeting.id
                ) !==
                String(
                    selectedMeeting
                )
            ) {

                return;

            }


            const meetingRecords =
                getMeetingRecords(
                    attendance,
                    meeting.id
                );


            /*
             * Create a row for every
             * attendance record.
             */

            Object.keys(
                meetingRecords
            )
            .forEach(
                function (key) {

                    const record =
                        meetingRecords[key];


                    if (!record) {

                        return;

                    }


                    const student =
                        findStudentForRecord(
                            students,
                            record,
                            key
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
                                key
                            )
                            : (
                                record.uniqueId ||
                                key
                            );


                    const searchText = [

                        name,

                        studentId,

                        uniqueId,

                        meeting.title,

                        record.status

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

                        name,

                        studentId,

                        uniqueId

                    });

                }
            );

        }
    );


    /*
     * Sort newest meeting first.
     */

    rows.sort(
        function (a, b) {

            const meetingDifference =
                getMeetingDateValue(
                    b.meeting
                ) -
                getMeetingDateValue(
                    a.meeting
                );


            if (
                meetingDifference !== 0
            ) {

                return meetingDifference;

            }


            return (
                new Date(
                    b.record.timeIn ||
                    0
                ) -
                new Date(
                    a.record.timeIn ||
                    0
                )
            );

        }
    );


    renderRows(
        rows,
        students
    );


    updateStatistics(
        rows,
        students
    );

}


/* =========================================================
   RENDER ROWS
========================================================= */

function renderRows(
    rows
) {

    historyTableBody.innerHTML =
        "";


    recordCount.textContent =
        rows.length;


    if (
        rows.length === 0
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


            const meeting =
                item.meeting;


            const record =
                item.record;


            const status =
                String(
                    record.status ||
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

                    <span class="status ${statusClass}">
                        ${escapeHtml(
                            status
                        )}
                    </span>

                </td>


                <td>
                    ${escapeHtml(
                        formatDateTime(
                            record.timeIn
                        )
                    )}
                </td>


                <td>

                    <div class="remarks">
                        ${escapeHtml(
                            record.remarks ||
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
    rows,
    students
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

            } else if (
                status ===
                "absent"
            ) {

                absent++;

            }

        }
    );


    presentCount.textContent =
        present;


    absentCount.textContent =
        absent;


    /*
     * When a specific meeting is selected,
     * calculate its attendance rate.
     *
     * When all meetings are selected,
     * calculate the rate based on the
     * displayed records.
     */

    let rate =
        0;


    if (
        meetingSelect.value
    ) {

        const total =
            students.length;


        rate =
            total > 0
                ? Math.round(
                    (
                        present /
                        total
                    ) * 100
                )
                : 0;

    } else {

        const total =
            present +
            absent;


        rate =
            total > 0
                ? Math.round(
                    (
                        present /
                        total
                    ) * 100
                )
                : 0;

    }


    attendanceRate.textContent =
        rate +
        "%";

}


/* =========================================================
   GET STUDENTS
========================================================= */

function getStudents() {

    try {

        const raw =
            localStorage.getItem(
                STUDENTS_KEY
            );


        if (!raw) {

            return [];

        }


        const parsed =
            JSON.parse(
                raw
            );


        return Array.isArray(
            parsed
        )
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "DOMINEXUS: Student data error:",
            error
        );


        return [];

    }

}


/* =========================================================
   GET MEETINGS
========================================================= */

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


        return Array.isArray(
            parsed
        )
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "DOMINEXUS: Meeting data error:",
            error
        );


        return [];

    }

}


/* =========================================================
   GET ATTENDANCE
========================================================= */

function getAttendance() {

    try {

        const raw =
            localStorage.getItem(
                ATTENDANCE_KEY
            );


        if (!raw) {

            return {};

        }


        return JSON.parse(
            raw
        ) || {};

    } catch (error) {

        console.error(
            "DOMINEXUS: Attendance data error:",
            error
        );


        return {};

    }

}


/* =========================================================
   GET MEETING RECORDS
========================================================= */

function getMeetingRecords(
    attendance,
    meetingId
) {

    /*
     * Primary expected structure:
     *
     * attendance[meetingId]
     */

    if (
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


    /*
     * Some versions of the system may
     * store attendance as an array.
     */

    if (
        Array.isArray(
            attendance
        )
    ) {

        const records =
            {};


        attendance.forEach(
            function (record, index) {

                if (
                    String(
                        record.meetingId ||
                        ""
                    ) ===
                    String(
                        meetingId
                    )
                ) {

                    const key =
                        record.uniqueId ||
                        record.studentId ||
                        index;


                    records[key] =
                        record;

                }

            }
        );


        return records;

    }


    return {};

}


/* =========================================================
   FIND STUDENT
========================================================= */

function findStudentForRecord(
    students,
    record,
    key
) {

    return students.find(
        function (student) {

            const studentId =
                String(
                    student.studentId ||
                    ""
                ).toLowerCase();


            const uniqueId =
                String(
                    student.uniqueId ||
                    ""
                ).toLowerCase();


            const recordStudentId =
                String(
                    record.studentId ||
                    ""
                ).toLowerCase();


            const recordUniqueId =
                String(
                    record.uniqueId ||
                    ""
                ).toLowerCase();


            const keyValue =
                String(
                    key ||
                    ""
                ).toLowerCase();


            return (

                (
                    recordStudentId &&
                    studentId ===
                    recordStudentId
                )

                ||

                (
                    recordUniqueId &&
                    uniqueId ===
                    recordUniqueId
                )

                ||

                (
                    keyValue &&
                    (
                        uniqueId ===
                        keyValue ||

                        studentId ===
                        keyValue
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
   MEETING DATE
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
        )
        .getTime();


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