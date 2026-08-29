/* =========================================================
   DOMINEXUS
   MODERATOR - LIVE ATTENDANCE
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
   DOM
========================================================= */

const meetingSelect =
    document.getElementById(
        "meetingSelect"
    );


const meetingStatus =
    document.getElementById(
        "meetingStatus"
    );


const attendanceList =
    document.getElementById(
        "attendanceList"
    );


const presentCount =
    document.getElementById(
        "presentCount"
    );


const absentCount =
    document.getElementById(
        "absentCount"
    );


const totalCount =
    document.getElementById(
        "totalCount"
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
   LOAD MEETINGS
========================================================= */

loadMeetings();


function loadMeetings() {

    meetingSelect.innerHTML = `

        <option value="">
            Select a meeting
        </option>

    `;


    const meetings =
        getMeetings();


    meetings.forEach(
        function(meeting) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                meeting.id;


            option.textContent =
                buildMeetingLabel(
                    meeting
                );


            meetingSelect.appendChild(
                option
            );

        }
    );


    if (
        meetings.length ===
        0
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.textContent =
            "No meetings available";


        option.disabled =
            true;


        meetingSelect.appendChild(
            option
        );

    }

}


/* =========================================================
   MEETING CHANGE
========================================================= */

meetingSelect.addEventListener(
    "change",
    function() {

        const meetingId =
            meetingSelect.value;


        if (!meetingId) {

            meetingStatus.textContent =
                "Select a meeting to view attendance.";

            clearAttendance();

            return;

        }


        updateAttendance(
            meetingId
        );

    }
);


/* =========================================================
   UPDATE ATTENDANCE
========================================================= */

function updateAttendance(
    meetingId
) {

    const meetings =
        getMeetings();


    const meeting =
        meetings.find(
            function(item) {

                return (
                    String(
                        item.id
                    ) ===
                    String(meetingId)
                );

            }
        );


    if (!meeting) {

        meetingStatus.textContent =
            "Meeting could not be found.";

        clearAttendance();

        return;

    }


    meetingStatus.textContent =
        meeting.title +
        " • " +
        formatDate(
            meeting.date
        ) +
        (
            meeting.time
                ? " • " +
                  formatTime(
                      meeting.time
                  )
                : ""
        );


    const students =
        getStudents();


    const records =
        getAttendanceForMeeting(
            meetingId
        );


    let present =
        [];


    let absent =
        0;


    /*
     * Find Present records.
     */

    Object.values(
        records
    )
    .forEach(
        function(record) {

            if (
                !record
            ) {

                return;

            }


            if (
                record.status ===
                "Present"
            ) {

                present.push(
                    record
                );

            }

        }
    );


    /*
     * Calculate absent based on
     * registered students minus
     * present students.
     */

    absent =
        Math.max(
            students.length -
            present.length,
            0
        );


    const total =
        students.length;


    const rate =
        total > 0
            ? Math.round(
                (
                    present.length /
                    total
                ) * 100
            )
            : 0;


    presentCount.textContent =
        present.length;


    absentCount.textContent =
        absent;


    totalCount.textContent =
        total;


    attendanceRate.textContent =
        rate +
        "%";


    renderPresentStudents(
        present,
        students
    );

}


/* =========================================================
   RENDER PRESENT STUDENTS
========================================================= */

function renderPresentStudents(
    records,
    students
) {

    attendanceList.innerHTML =
        "";


    if (
        records.length ===
        0
    ) {

        attendanceList.innerHTML = `

            <div class="empty-state">

                No students have been marked
                present for this meeting yet.

            </div>

        `;

        return;

    }


    /*
     * Sort by Time In.
     */

    records.sort(
        function(a, b) {

            return (
                new Date(
                    a.timeIn ||
                    0
                ) -
                new Date(
                    b.timeIn ||
                    0
                )
            );

        }
    );


    records.forEach(
        function(record) {

            const student =
                findStudent(
                    record
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "attendance-row";


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


            const id =
                student
                    ? (
                        student.studentId ||
                        "—"
                    )
                    : (
                        record.studentId ||
                        "—"
                    );


            const time =
                record.timeIn
                    ? formatDateTime(
                        record.timeIn
                    )
                    : "—";


            row.innerHTML = `

                <div>

                    <div class="student-name">
                        ${escapeHtml(
                            name
                        )}
                    </div>

                    <div class="student-id">
                        Student ID:
                        ${escapeHtml(
                            id
                        )}
                    </div>

                </div>


                <div class="time-in">

                    Time In:
                    ${escapeHtml(
                        time
                    )}

                </div>


                <div>

                    <span class="present-badge">
                        PRESENT
                    </span>

                </div>

            `;


            attendanceList.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   FIND STUDENT
========================================================= */

function findStudent(
    record
) {

    const students =
        getStudents();


    const possibleIds = [

        record.studentId,

        record.uniqueId,

        record.id

    ];


    return students.find(
        function(student) {

            return possibleIds.some(
                function(value) {

                    if (!value) {

                        return false;

                    }


                    return (

                        String(
                            student.studentId ||
                            ""
                        ).toLowerCase() ===
                        String(
                            value
                        ).toLowerCase()

                        ||

                        String(
                            student.uniqueId ||
                            ""
                        ).toLowerCase() ===
                        String(
                            value
                        ).toLowerCase()

                        ||

                        String(
                            student.id ||
                            ""
                        ).toLowerCase() ===
                        String(
                            value
                        ).toLowerCase()

                    );

                }
            );

        }
    ) || null;

}


/* =========================================================
   GET STUDENTS
========================================================= */

function getStudents() {

    try {

        const raw =
            localStorage.getItem(
                "dominexus_students"
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
                "dominexus_meetings"
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
            "DOMINEXUS: Meeting data error:",
            error
        );


        return [];

    }

}


/* =========================================================
   GET ATTENDANCE
========================================================= */

function getAttendanceForMeeting(
    meetingId
) {

    try {

        const raw =
            localStorage.getItem(
                "dominexus_attendance"
            );


        if (!raw) {

            return {};

        }


        const parsed =
            JSON.parse(
                raw
            );


        if (!parsed) {

            return {};

        }


        /*
         * Expected format:
         *
         * {
         *   meetingId: {
         *      studentId: {...}
         *   }
         * }
         */

        if (
            parsed[
                meetingId
            ] &&
            typeof parsed[
                meetingId
            ] === "object"
        ) {

            return parsed[
                meetingId
            ];

        }


        return {};

    } catch (error) {

        console.error(
            "DOMINEXUS: Attendance data error:",
            error
        );


        return {};

    }

}


/* =========================================================
   CLEAR
========================================================= */

function clearAttendance() {

    presentCount.textContent =
        "0";


    absentCount.textContent =
        "0";


    totalCount.textContent =
        "0";


    attendanceRate.textContent =
        "0%";


    attendanceList.innerHTML = `

        <div class="empty-state">

            Select a meeting to view
            live attendance.

        </div>

    `;

}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
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


/* =========================================================
   HELPERS
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


    if (
        meeting.time
    ) {

        label +=
            " • " +
            formatTime(
                meeting.time
            );

    }


    return label;

}


function formatDate(
    date
) {

    if (!date) {

        return "";

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
            year:
                "numeric",

            month:
                "long",

            day:
                "numeric"
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
        time.split(":");


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


function formatDateTime(
    value
) {

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
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
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