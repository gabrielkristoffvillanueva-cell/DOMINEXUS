/* =========================================================
   DOMINEXUS
   MODERATOR - LIVE ATTENDANCE
   Laravel / MySQL Connected
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


const liveIndicator =
    document.getElementById(
        "liveIndicator"
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


const moderatorNameElement =
    document.getElementById(
        "moderatorName"
    );


const moderatorAvatar =
    document.getElementById(
        "moderatorAvatar"
    );


if (
    moderatorNameElement
) {

    moderatorNameElement.textContent =
        moderatorName;

}


if (
    moderatorAvatar
) {

    moderatorAvatar.textContent =
        getInitials(
            moderatorName
        );

}


/* =========================================================
   DATA
========================================================= */

let meetings = [];

let students = [];

let attendance = [];


/* =========================================================
   INITIALIZE
========================================================= */

loadMeetings();


/* =========================================================
   LOAD MEETINGS
========================================================= */

async function loadMeetings() {

    meetingSelect.innerHTML = `

        <option value="">
            Loading meetings...
        </option>

    `;


    try {

        const response =
            await fetch(
                `${API_BASE}/meetings?moderator_id=${encodeURIComponent(
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


        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                "Unable to load meetings."
            );

        }


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
            "LIVE ATTENDANCE - MEETING ERROR:",
            error
        );


        meetingSelect.innerHTML = `

            <option value="">
                Unable to load meetings
            </option>

        `;


        meetingStatus.textContent =
            "Unable to load meetings.";

    }

}


/* =========================================================
   RENDER MEETINGS
========================================================= */

function renderMeetings() {

    meetingSelect.innerHTML = `

        <option value="">
            Select a meeting
        </option>

    `;


    if (
        meetings.length ===
        0
    ) {

        meetingSelect.innerHTML = `

            <option value="">
                No meetings available
            </option>

        `;


        meetingStatus.textContent =
            "No meetings available.";


        return;

    }


    meetings
        .slice()
        .sort(
            function (
                a,
                b
            ) {

                return (
                    getMeetingDateValue(b) -
                    getMeetingDateValue(a)
                );

            }
        )
        .forEach(
            function (
                meeting
            ) {

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


    meetingStatus.textContent =
        "Select a meeting to view attendance.";

    setMeetingIndicator(
        null
    );

}


/* =========================================================
   MEETING CHANGE
========================================================= */

meetingSelect.addEventListener(
    "change",
    async function () {

        const meetingId =
            meetingSelect.value;


        if (!meetingId) {

            meetingStatus.textContent =
                "Select a meeting to view attendance.";

            setMeetingIndicator(
                null
            );

            clearAttendance();

            return;

        }


        await updateAttendance(
            meetingId
        );

    }
);


/* =========================================================
   UPDATE ATTENDANCE
========================================================= */

async function updateAttendance(
    meetingId
) {

    const meeting =
        meetings.find(
            function (
                item
            ) {

                return (
                    String(
                        item.id
                    ) ===
                    String(
                        meetingId
                    )
                );

            }
        );


    if (!meeting) {

        meetingStatus.textContent =
            "Meeting could not be found.";

        setMeetingIndicator(
            null
        );

        clearAttendance();

        return;

    }


    meetingStatus.textContent =
        buildMeetingStatusText(
            meeting
        );


    setMeetingIndicator(
        meeting.status
    );


    try {

        attendanceList.innerHTML = `

            <div class="empty-state">

                Loading attendance...

            </div>

        `;


        const response =
            await fetch(
                `${API_BASE}/attendances?meeting_id=${encodeURIComponent(
                    meetingId
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


        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                "Unable to load attendance."
            );

        }


        attendance =
            Array.isArray(data)
                ? data
                : (
                    data.attendance ||
                    data.data ||
                    []
                );


        await loadStudents(
            meetingId
        );


        calculateAndRender(
            attendance,
            students,
            meeting
        );


    } catch (error) {

        console.error(
            "LIVE ATTENDANCE ERROR:",
            error
        );


        clearAttendance();


        attendanceList.innerHTML = `

            <div class="empty-state">

                Unable to load attendance.
                Make sure the Laravel server is running.

            </div>

        `;

    }

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents(
    meetingId
) {

    /*
     * We use the moderator's student records
     * so only students from the moderator's
     * organization are considered.
     */

    try {

        const response =
            await fetch(
                `${API_BASE}/moderator-students?moderator_id=${encodeURIComponent(
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


        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                "Unable to load students."
            );

        }


        students =
            Array.isArray(
                data.students
            )
                ? data.students
                : [];


    } catch (error) {

        console.error(
            "STUDENT LOADING ERROR:",
            error
        );


        students = [];

    }

}


/* =========================================================
   CALCULATE + RENDER
========================================================= */

function calculateAndRender(
    records,
    studentList,
    meeting
) {

    const normalizedRecords =
        Array.isArray(records)
            ? records
            : [];


    const total =
        studentList.length;


    const present =
        normalizedRecords.filter(
            function (
                record
            ) {

                const status =
                    String(
                        record.status ||
                        ""
                    ).toLowerCase();


                return (
                    status === "present" ||
                    status === "late"
                );

            }
        );


    const absent =
        normalizedRecords.filter(
            function (
                record
            ) {

                return (
                    String(
                        record.status ||
                        ""
                    ).toLowerCase() ===
                    "absent"
                );

            }
        );


    /*
     * If the meeting is completed,
     * the backend should already have
     * generated absent records.
     *
     * If it is still ongoing, students
     * without an attendance record are
     * not counted as officially absent yet.
     */

    const officialAbsent =
        absent.length;


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
        officialAbsent;


    totalCount.textContent =
        total;


    attendanceRate.textContent =
        rate +
        "%";


    renderPresentStudents(
        present
    );

}


/* =========================================================
   RENDER PRESENT STUDENTS
========================================================= */

function renderPresentStudents(
    records
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


    records
        .slice()
        .sort(
            function (
                a,
                b
            ) {

                return (
                    getAttendanceTime(
                        a
                    ) -
                    getAttendanceTime(
                        b
                    )
                );

            }
        )
        .forEach(
            function (
                record
            ) {

                const student =
                    record.student ||
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
                            student.name ||
                            student.fullName ||
                            "Unknown Student"
                        )
                        : "Unknown Student";


                const studentId =
                    student
                        ? (
                            student.student_id ||
                            student.studentId ||
                            "—"
                        )
                        : (
                            record.student_id ||
                            record.studentId ||
                            "—"
                        );


                const time =
                    record.scanned_at ||
                    record.timeIn ||
                    null;


                const status =
                    String(
                        record.status ||
                        "present"
                    ).toLowerCase();


                row.innerHTML = `

    <div class="student-info">

        <div class="student-name">
            ${escapeHtml(name)}
        </div>

        <div class="student-id">
            Student ID:
            ${escapeHtml(studentId)}
        </div>

    </div>


    <div class="time-in">

        Time In:
        ${escapeHtml(
                    formatDateTime(time)
                )}

    </div>


    <div class="attendance-status">

        <span class="status ${status}">

            ${escapeHtml(
                    status.toUpperCase()
                )}

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

    const possibleIds = [

        record.user_id,

        record.student_id,

        record.studentId,

        record.unique_id,

        record.uniqueId

    ];


    return students.find(
        function (
            student
        ) {

            return possibleIds.some(
                function (
                    value
                ) {

                    if (!value) {

                        return false;

                    }


                    return (

                        String(
                            student.id ||
                            ""
                        ) ===
                        String(
                            value
                        )

                        ||

                        String(
                            student.student_id ||
                            ""
                        ).toLowerCase() ===
                        String(
                            value
                        ).toLowerCase()

                        ||

                        String(
                            student.unique_id ||
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
   MEETING STATUS INDICATOR
========================================================= */

function setMeetingIndicator(
    status
) {

    if (!liveIndicator) {

        return;

    }


    const normalized =
        normalizeStatus(
            status
        );


    liveIndicator.className =
        "live-indicator";


    if (
        normalized ===
        "ongoing"
    ) {

        liveIndicator.classList.add(
            "ongoing"
        );


        liveIndicator.innerHTML = `

            <span class="live-dot"></span>

            LIVE

        `;

        return;

    }


    if (
        normalized ===
        "completed"
    ) {

        liveIndicator.classList.add(
            "completed"
        );


        liveIndicator.innerHTML = `

            <span class="live-dot"></span>

            COMPLETED

        `;

        return;

    }


    if (
        normalized ===
        "cancelled"
    ) {

        liveIndicator.classList.add(
            "cancelled"
        );


        liveIndicator.innerHTML = `

            <span class="live-dot"></span>

            CANCELLED

        `;

        return;

    }


    liveIndicator.classList.add(
        "upcoming"
    );


    liveIndicator.innerHTML = `

        <span class="live-dot"></span>

        UPCOMING

    `;

}


/* =========================================================
   STATUS NORMALIZATION
========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            ""
        ).toLowerCase();


    if (
        value === "ongoing" ||
        value === "active"
    ) {

        return "ongoing";

    }


    if (
        value === "completed" ||
        value === "ended"
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


/* =========================================================
   MEETING STATUS TEXT
========================================================= */

function buildMeetingStatusText(
    meeting
) {

    let text =
        meeting.title ||
        "Untitled Meeting";


    if (
        meeting.date
    ) {

        text +=
            " • " +
            formatDate(
                meeting.date
            );

    }


    const time =
        meeting.start_time ||
        meeting.time;


    if (
        time
    ) {

        text +=
            " • " +
            formatTime(
                time
            );

    }


    return text;

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


    const time =
        meeting.start_time ||
        meeting.time;


    if (
        time
    ) {

        label +=
            " • " +
            formatTime(
                time
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
        meeting.time ||
        "00:00:00";


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
   ATTENDANCE TIME
========================================================= */

function getAttendanceTime(
    record
) {

    const value =
        record.scanned_at ||
        record.timeIn ||
        null;


    if (!value) {

        return 0;

    }


    const time =
        new Date(
            value
        ).getTime();


    return Number.isNaN(
        time
    )
        ? 0
        : time;

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


    /*
     * Handles both:
     *
     * 2026-08-31
     * 2026-08-31T00:00:00.000000Z
     */

    const normalized =
        String(
            value
        ).substring(
            0,
            10
        );


    const date =
        new Date(
            normalized +
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
   FORMAT TIME
========================================================= */

function formatTime(
    value
) {

    if (!value) {

        return "";

    }


    const text =
        String(
            value
        );


    /*
     * If backend gives:
     * 14:53:00
     */

    const parts =
        text.split(":");


    if (
        parts.length >= 2
    ) {

        let hour =
            parseInt(
                parts[0],
                10
            );


        const minute =
            parts[1];


        if (
            !Number.isNaN(
                hour
            )
        ) {

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

    }


    return text;

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
   INITIALS
========================================================= */

function getInitials(
    name
) {

    const parts =
        String(
            name ||
            ""
        )
            .trim()
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    if (
        parts.length ===
        0
    ) {

        return "M";

    }


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