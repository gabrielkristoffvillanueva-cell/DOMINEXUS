/* =========================================================
   DOMINEXUS
   MODERATOR - LIVE ATTENDANCE
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


const moderatorNameElement =
    document.getElementById(
        "moderatorName"
    );


const moderatorAvatar =
    document.getElementById(
        "moderatorAvatar"
    );


/* =========================================================
   DATA
========================================================= */

let meetings = [];

let selectedMeeting = null;

let totalStudents = 0;


/* =========================================================
   MODERATOR INFORMATION
========================================================= */

const moderatorName =
    sessionStorage.getItem(
        "moderatorName"
    ) ||
    "Moderator";


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
   INITIALIZE
========================================================= */

initialize();


async function initialize() {

    await loadModeratorData();

    await loadMeetings();

}


/* =========================================================
   LOAD MODERATOR DATA
   Used to get total registered
   students in this organization.
========================================================= */

async function loadModeratorData() {

    try {

        const response =
            await fetch(
                `${API_BASE}/moderator-dashboard?moderator_id=${encodeURIComponent(
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
            "LIVE ATTENDANCE MODERATOR DATA:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load moderator information."
            );

        }


        /*
         * The moderator dashboard already
         * returns the total students for
         * this moderator's organization.
         */

        totalStudents =
            Number(
                data.students?.total
            ) || 0;


        totalCount.textContent =
            totalStudents;


    } catch (error) {

        console.error(
            "MODERATOR DATA ERROR:",
            error
        );


        totalStudents =
            0;


        totalCount.textContent =
            "0";

    }

}


/* =========================================================
   LOAD MEETINGS
   ONLY THIS MODERATOR'S ORGANIZATION
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
            "LIVE ATTENDANCE MEETINGS:",
            data
        );


        if (!response.ok) {

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


        populateMeetingSelect();


    } catch (error) {

        console.error(
            "MEETINGS ERROR:",
            error
        );


        meetingSelect.innerHTML = `

            <option value="">
                Unable to load meetings
            </option>

        `;


        meetingStatus.textContent =
            error.message ||
            "Unable to load meetings.";


        meetingStatus.classList.add(
            "warning"
        );

    }

}


/* =========================================================
   POPULATE MEETING SELECT
========================================================= */

function populateMeetingSelect() {

    meetingSelect.innerHTML = "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";


    defaultOption.textContent =
        "Select a meeting";


    meetingSelect.appendChild(
        defaultOption
    );


    if (
        meetings.length === 0
    ) {

        const emptyOption =
            document.createElement(
                "option"
            );


        emptyOption.value =
            "";


        emptyOption.textContent =
            "No meetings available";


        emptyOption.disabled =
            true;


        meetingSelect.appendChild(
            emptyOption
        );


        meetingStatus.textContent =
            "No meetings found for your organization.";


        meetingStatus.classList.add(
            "warning"
        );


        return;

    }


    meetingStatus.textContent =
        "Select a meeting to view attendance.";


    meetingStatus.classList.remove(
        "warning"
    );


    /*
     * Sort newest/latest meeting first.
     */

    const sortedMeetings =
        [...meetings]
        .sort(
            function(a, b) {

                const dateA =
                    new Date(
                        `${a.date || ""}T${
                            a.start_time ||
                            "00:00"
                        }`
                    );


                const dateB =
                    new Date(
                        `${b.date || ""}T${
                            b.start_time ||
                            "00:00"
                        }`
                    );


                return dateB - dateA;

            }
        );


    sortedMeetings.forEach(
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

}


/* =========================================================
   MEETING CHANGE
========================================================= */

meetingSelect.addEventListener(
    "change",
    async function() {

        const meetingId =
            meetingSelect.value;


        if (!meetingId) {

            selectedMeeting =
                null;


            meetingStatus.textContent =
                "Select a meeting to view attendance.";


            clearAttendance();


            return;

        }


        selectedMeeting =
            meetings.find(
                function(meeting) {

                    return (
                        String(
                            meeting.id
                        ) ===
                        String(
                            meetingId
                        )
                    );

                }
            );


        if (!selectedMeeting) {

            meetingStatus.textContent =
                "Meeting could not be found.";


            clearAttendance();


            return;

        }


        meetingStatus.textContent =
            buildMeetingLabel(
                selectedMeeting
            );


        meetingStatus.classList.remove(
            "warning"
        );


        await updateAttendance(
            meetingId
        );

    }
);


/* =========================================================
   LOAD ATTENDANCE FOR SELECTED MEETING
========================================================= */

async function updateAttendance(
    meetingId
) {

    /*
     * Show loading state.
     */

    attendanceList.innerHTML = `

        <div class="empty-state">

            Loading attendance...

        </div>

    `;


    try {

        /*
         * AttendanceController supports:
         *
         * GET /api/attendances?meeting_id=ID
         */

        const response =
            await fetch(
                `${API_BASE}/attendances?meeting_id=${encodeURIComponent(
                    meetingId
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
            "LIVE ATTENDANCE RECORDS:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load attendance."
            );

        }


        const records =
            Array.isArray(data)
                ? data
                : (
                    data.attendances ||
                    data.data ||
                    []
                );


        processAttendance(
            records
        );


    } catch (error) {

        console.error(
            "ATTENDANCE LOAD ERROR:",
            error
        );


        clearAttendance();


        attendanceList.innerHTML = `

            <div class="empty-state">

                Unable to load attendance records.

            </div>

        `;

    }

}


/* =========================================================
   PROCESS ATTENDANCE
========================================================= */

function processAttendance(
    records
) {

    /*
     * Present includes:
     *
     * present
     * late
     *
     * because both mean the student
     * actually attended the meeting.
     */

    const presentRecords =
        records.filter(
            function(record) {

                const status =
                    String(
                        record.status ||
                        ""
                    )
                    .toLowerCase();


                return (
                    status === "present" ||
                    status === "late"
                );

            }
        );


    /*
     * Students explicitly marked absent.
     */

    const explicitAbsent =
        records.filter(
            function(record) {

                return (
                    String(
                        record.status ||
                        ""
                    )
                    .toLowerCase() ===
                    "absent"
                );

            }
        ).length;


    /*
     * Students that have no attendance
     * record yet are also considered
     * not present for the current
     * meeting.
     *
     * This keeps the total based on
     * registered students.
     */

    const absent =
        Math.max(
            totalStudents -
            presentRecords.length,
            explicitAbsent
        );


    const total =
        totalStudents;


    const rate =
        total > 0
            ? Math.round(
                (
                    presentRecords.length /
                    total
                ) * 100
            )
            : 0;


    /*
     * Update statistics.
     */

    presentCount.textContent =
        presentRecords.length;


    absentCount.textContent =
        absent;


    totalCount.textContent =
        total;


    attendanceRate.textContent =
        rate +
        "%";


    /*
     * Render students.
     */

    renderPresentStudents(
        presentRecords
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
        records.length === 0
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
     * Sort by scanned_at.
     */

    const sortedRecords =
        [...records]
        .sort(
            function(a, b) {

                const dateA =
                    new Date(
                        a.scanned_at ||
                        0
                    );


                const dateB =
                    new Date(
                        b.scanned_at ||
                        0
                    );


                return dateA - dateB;

            }
        );


    sortedRecords.forEach(
        function(record) {

            const student =
                record.student ||
                {};


            const name =
                student.name ||
                record.student_name ||
                "Unknown Student";


            const id =
                student.student_id ||
                record.student_id ||
                "—";


            const status =
                String(
                    record.status ||
                    "present"
                )
                .toLowerCase();


            const timeIn =
                record.scanned_at
                    ? formatDateTime(
                        record.scanned_at
                    )
                    : "—";


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "attendance-row";


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
                        timeIn
                    )}

                </div>


                <div>

                    <span class="present-badge">

                        ${escapeHtml(
                            status === "late"
                                ? "LATE"
                                : "PRESENT"
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
   CLEAR ATTENDANCE
========================================================= */

function clearAttendance() {

    presentCount.textContent =
        "0";


    absentCount.textContent =
        "0";


    totalCount.textContent =
        totalStudents;


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
   AUTO REFRESH
   Makes "LIVE" actually live.
========================================================= */

let refreshTimer =
    null;


function startLiveRefresh() {

    stopLiveRefresh();


    refreshTimer =
        setInterval(
            async function() {

                const meetingId =
                    meetingSelect.value;


                if (
                    !meetingId
                ) {

                    return;

                }


                await updateAttendance(
                    meetingId
                );

            },
            5000
        );

}


function stopLiveRefresh() {

    if (
        refreshTimer
    ) {

        clearInterval(
            refreshTimer
        );


        refreshTimer =
            null;

    }

}


/*
 * Start live refresh whenever
 * a meeting is selected.
 */

meetingSelect.addEventListener(
    "change",
    function() {

        if (
            meetingSelect.value
        ) {

            startLiveRefresh();

        } else {

            stopLiveRefresh();

        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

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


        stopLiveRefresh();


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
        meeting.start_time
    ) {

        label +=
            " • " +
            formatTime(
                meeting.start_time
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


function getInitials(
    name
) {

    if (!name) {

        return "MO";

    }


    const parts =
        String(
            name
        )
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
        parts[0].charAt(0) +
        parts[
            parts.length - 1
        ].charAt(0)
    ).toUpperCase();

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


/* =========================================================
   PAGE CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        stopLiveRefresh();

    }
);