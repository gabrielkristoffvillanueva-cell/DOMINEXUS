/* =========================================================
   DOMINEXUS
   MODERATOR - NOTIFICATIONS / ALERTS
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
   LOAD DATA
========================================================= */

let students =
    getStudents();


let meetings =
    getMeetings();


let attendance =
    getAttendance();


/* =========================================================
   GENERATE ALERTS
========================================================= */

let alerts =
    generateAlerts();


updateSummary(
    alerts
);


renderAlerts(
    alerts
);


/* =========================================================
   FILTERS
========================================================= */

typeFilter.addEventListener(
    "change",
    function () {

        renderAlerts(
            alerts
        );

    }
);


searchInput.addEventListener(
    "input",
    function () {

        renderAlerts(
            alerts
        );

    }
);


/* =========================================================
   GENERATE ALERTS
========================================================= */

function generateAlerts() {

    const generated =
        [];


    /*
     * LOW ATTENDANCE
     */

    const participation =
        calculateParticipation();


    participation.forEach(
        function (item) {

            if (
                item.percentage <
                50
            ) {

                generated.push({

                    type:
                        "low",

                    title:
                        "Low Attendance",

                    message:
                        item.name +
                        " has attended only " +
                        item.percentage +
                        "% of recorded meetings.",

                    studentName:
                        item.name,

                    studentId:
                        item.studentId,

                    uniqueId:
                        item.uniqueId,

                    meetingName:
                        "",

                    meta:
                        "Attendance monitoring"

                });

            }

        }
    );


    /*
     * DUPLICATE RECORDS
     */

    meetings.forEach(
        function (meeting) {

            const records =
                getMeetingRecords(
                    meeting.id
                );


            const seen =
                {};


            const recordList =
                getRecordList(
                    records
                );


            recordList.forEach(
                function (record) {

                    const uniqueId =
                        String(
                            record.uniqueId ||
                            record.studentId ||
                            ""
                        ).trim();


                    if (!uniqueId) {

                        return;

                    }


                    if (
                        seen[
                            uniqueId
                        ]
                    ) {

                        const student =
                            findStudent(
                                uniqueId,
                                record.studentId
                            );


                        generated.push({

                            type:
                                "duplicate",

                            title:
                                "Duplicate Attendance Record",

                            message:
                                (
                                    student
                                        ? (
                                            student.fullName ||
                                            student.name
                                        )
                                        : uniqueId
                                ) +
                                " has more than one attendance record for " +
                                (
                                    meeting.title ||
                                    "this meeting"
                                ) +
                                ".",

                            studentName:
                                student
                                    ? (
                                        student.fullName ||
                                        student.name
                                    )
                                    : "Unknown Student",

                            studentId:
                                student
                                    ? (
                                        student.studentId ||
                                        record.studentId ||
                                        "—"
                                    )
                                    : (
                                        record.studentId ||
                                        "—"
                                    ),

                            uniqueId:
                                uniqueId,

                            meetingName:
                                meeting.title ||
                                "Untitled Meeting",

                            meta:
                                "Duplicate record detected"

                        });

                    }


                    seen[
                        uniqueId
                    ] = true;

                }
            );

        }
    );


    /*
     * INVALID / UNKNOWN STUDENTS
     */

    meetings.forEach(
        function (meeting) {

            const records =
                getMeetingRecords(
                    meeting.id
                );


            const recordList =
                getRecordList(
                    records
                );


            recordList.forEach(
                function (record) {

                    const uniqueId =
                        String(
                            record.uniqueId ||
                            ""
                        ).trim();


                    const studentId =
                        String(
                            record.studentId ||
                            ""
                        ).trim();


                    const student =
                        findStudent(
                            uniqueId,
                            studentId
                        );


                    if (
                        !student
                    ) {

                        generated.push({

                            type:
                                "invalid",

                            title:
                                "Unknown Student Record",

                            message:
                                "An attendance record does not match any registered student.",

                            studentName:
                                record.fullName ||
                                record.name ||
                                "Unknown Student",

                            studentId:
                                studentId ||
                                "—",

                            uniqueId:
                                uniqueId ||
                                "—",

                            meetingName:
                                meeting.title ||
                                "Untitled Meeting",

                            meta:
                                "Student ID / Unique ID not found"

                        });

                    }

                }
            );

        }
    );


    return generated;

}


/* =========================================================
   PARTICIPATION
========================================================= */

function calculateParticipation() {

    const totalMeetings =
        meetings.length;


    return students.map(
        function (student) {

            let present =
                0;


            meetings.forEach(
                function (meeting) {

                    const records =
                        getMeetingRecords(
                            meeting.id
                        );


                    const record =
                        findAttendanceInMeeting(
                            student,
                            records
                        );


                    if (
                        record &&
                        String(
                            record.status ||
                            ""
                        ).toLowerCase() ===
                        "present"
                    ) {

                        present++;

                    }

                }
            );


            const percentage =
                totalMeetings > 0
                    ? Math.round(
                        (
                            present /
                            totalMeetings
                        ) * 100
                    )
                    : 0;


            return {

                name:
                    student.fullName ||
                    student.name ||
                    "Unknown Student",

                studentId:
                    student.studentId ||
                    "—",

                uniqueId:
                    student.uniqueId ||
                    "—",

                percentage

            };

        }
    );

}


/* =========================================================
   FIND ATTENDANCE
========================================================= */

function findAttendanceInMeeting(
    student,
    records
) {

    const list =
        getRecordList(
            records
        );


    return list.find(
        function (record) {

            return (

                (
                    student.uniqueId &&
                    record.uniqueId &&
                    String(
                        student.uniqueId
                    ).toLowerCase() ===
                    String(
                        record.uniqueId
                    ).toLowerCase()
                )

                ||

                (
                    student.studentId &&
                    record.studentId &&
                    String(
                        student.studentId
                    ).toLowerCase() ===
                    String(
                        record.studentId
                    ).toLowerCase()
                )

            );

        }
    ) || null;

}


/* =========================================================
   RENDER ALERTS
========================================================= */

function renderAlerts(
    allAlerts
) {

    let filtered =
        allAlerts;


    const selectedType =
        typeFilter.value;


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (
        selectedType
    ) {

        filtered =
            filtered.filter(
                function (alert) {

                    return (
                        alert.type ===
                        selectedType
                    );

                }
            );

    }


    if (
        query
    ) {

        filtered =
            filtered.filter(
                function (alert) {

                    const text = [

                        alert.title,

                        alert.message,

                        alert.studentName,

                        alert.studentId,

                        alert.uniqueId,

                        alert.meetingName,

                        alert.meta

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
        function (alert) {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "alert " +
                alert.type;


            element.innerHTML = `

                <div class="alert-icon">
                    ${getAlertIcon(
                        alert.type
                    )}
                </div>


                <div class="alert-content">

                    <div class="alert-title">
                        ${escapeHtml(
                            alert.title
                        )}
                    </div>


                    <div class="alert-message">
                        ${escapeHtml(
                            alert.message
                        )}
                    </div>


                    <div class="alert-meta">

                        <span class="alert-type">
                            ${getAlertLabel(
                                alert.type
                            )}
                        </span>

                        ${escapeHtml(
                            alert.meta
                        )}

                        ${
                            alert.meetingName
                                ? " • " +
                                  escapeHtml(
                                      alert.meetingName
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
   SUMMARY
========================================================= */

function updateSummary(
    alerts
) {

    const low =
        alerts.filter(
            function (alert) {

                return (
                    alert.type ===
                    "low"
                );

            }
        ).length;


    const duplicate =
        alerts.filter(
            function (alert) {

                return (
                    alert.type ===
                    "duplicate"
                );

            }
        ).length;


    const invalid =
        alerts.filter(
            function (alert) {

                return (
                    alert.type ===
                    "invalid"
                );

            }
        ).length;


    totalAlerts.textContent =
        alerts.length;


    lowAttendanceAlerts.textContent =
        low;


    duplicateAlerts.textContent =
        duplicate;


    invalidAlerts.textContent =
        invalid;

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
        ).map(
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
    uniqueId,
    studentId
) {

    return students.find(
        function (student) {

            const studentUniqueId =
                String(
                    student.uniqueId ||
                    ""
                ).toLowerCase();


            const studentStudentId =
                String(
                    student.studentId ||
                    ""
                ).toLowerCase();


            return (

                (
                    uniqueId &&
                    studentUniqueId ===
                    String(
                        uniqueId
                    ).toLowerCase()
                )

                ||

                (
                    studentId &&
                    studentStudentId ===
                    String(
                        studentId
                    ).toLowerCase()
                )

            );

        }
    ) || null;

}


/* =========================================================
   ICONS
========================================================= */

function getAlertIcon(
    type
) {

    if (
        type ===
        "low"
    ) {

        return "⚠";

    }


    if (
        type ===
        "duplicate"
    ) {

        return "↻";

    }


    return "!";

}


/* =========================================================
   LABEL
========================================================= */

function getAlertLabel(
    type
) {

    if (
        type ===
        "low"
    ) {

        return "LOW ATTENDANCE";

    }


    if (
        type ===
        "duplicate"
    ) {

        return "DUPLICATE";

    }


    return "INVALID";

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