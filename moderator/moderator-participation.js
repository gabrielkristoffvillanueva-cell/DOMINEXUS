/* =========================================================
   DOMINEXUS
   MODERATOR - PARTICIPATION MONITORING
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

const organizationFilter =
    document.getElementById(
        "organizationFilter"
    );


const statusFilter =
    document.getElementById(
        "statusFilter"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const tableBody =
    document.getElementById(
        "participationTableBody"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const recordCount =
    document.getElementById(
        "recordCount"
    );


const activeCount =
    document.getElementById(
        "activeCount"
    );


const lowCount =
    document.getElementById(
        "lowCount"
    );


const inactiveCount =
    document.getElementById(
        "inactiveCount"
    );


const totalCount =
    document.getElementById(
        "totalCount"
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

const students =
    getStudents();


const meetings =
    getMeetings();


const attendance =
    getAttendance();


/* =========================================================
   INITIALIZE
========================================================= */

loadOrganizations();

const participationData =
    calculateParticipation();

updateSummary(
    participationData
);

renderStudents(
    participationData
);


/* =========================================================
   FILTER EVENTS
========================================================= */

organizationFilter.addEventListener(
    "change",
    applyFilters
);


statusFilter.addEventListener(
    "change",
    applyFilters
);


searchInput.addEventListener(
    "input",
    applyFilters
);


/* =========================================================
   LOAD ORGANIZATIONS
========================================================= */

function loadOrganizations() {

    const organizations =
        new Set();


    students.forEach(
        function (student) {

            const organization =
                String(
                    student.organization ||
                    ""
                ).trim();


            if (
                organization
            ) {

                organizations.add(
                    organization
                );

            }

        }
    );


    Array.from(
        organizations
    )
    .sort()
    .forEach(
        function (organization) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                organization;


            option.textContent =
                organization;


            organizationFilter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   CALCULATE PARTICIPATION
========================================================= */

function calculateParticipation() {

    const totalMeetings =
        meetings.length;


    return students.map(
        function (student) {

            let present =
                0;


            let absent =
                0;


            /*
             * Check each meeting.
             */

            meetings.forEach(
                function (meeting) {

                    const records =
                        getMeetingRecords(
                            meeting.id
                        );


                    const record =
                        findAttendanceRecord(
                            student,
                            records
                        );


                    if (!record) {

                        return;

                    }


                    const status =
                        String(
                            record.status ||
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


            /*
             * Attendance percentage.
             *
             * We use the number of meetings
             * as the denominator.
             */

            const percentage =
                totalMeetings > 0
                    ? Math.round(
                        (
                            present /
                            totalMeetings
                        ) * 100
                    )
                    : 0;


            const status =
                getParticipationStatus(
                    percentage
                );


            return {

                student,

                totalMeetings,

                present,

                absent,

                percentage,

                status

            };

        }
    );

}


/* =========================================================
   STATUS
========================================================= */

function getParticipationStatus(
    percentage
) {

    if (
        percentage >= 75
    ) {

        return "active";

    }


    if (
        percentage >= 50
    ) {

        return "low";

    }


    return "inactive";

}


/* =========================================================
   FILTER
========================================================= */

function applyFilters() {

    let filtered =
        participationData;


    const organization =
        organizationFilter.value;


    const status =
        statusFilter.value;


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (
        organization
    ) {

        filtered =
            filtered.filter(
                function (item) {

                    return (
                        String(
                            item.student.organization ||
                            ""
                        ).trim() ===
                        organization
                    );

                }
            );

    }


    if (
        status
    ) {

        filtered =
            filtered.filter(
                function (item) {

                    return (
                        item.status ===
                        status
                    );

                }
            );

    }


    if (
        query
    ) {

        filtered =
            filtered.filter(
                function (item) {

                    const student =
                        item.student;


                    const values = [

                        student.fullName,

                        student.name,

                        student.studentId,

                        student.uniqueId,

                        student.section,

                        student.organization

                    ];


                    return values.some(
                        function (value) {

                            return String(
                                value ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                query
                            );

                        }
                    );

                }
            );

    }


    renderStudents(
        filtered
    );

}


/* =========================================================
   RENDER
========================================================= */

function renderStudents(
    list
) {

    tableBody.innerHTML =
        "";


    recordCount.textContent =
        list.length;


    if (
        list.length ===
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


    list.forEach(
        function (item) {

            const student =
                item.student;


            const row =
                document.createElement(
                    "tr"
                );


            const name =
                student.fullName ||
                student.name ||
                "Unknown Student";


            const studentId =
                student.studentId ||
                "—";


            const organization =
                student.organization ||
                "—";


            const section =
                student.section ||
                "—";


            row.innerHTML = `

                <td>

                    <div class="student-name">
                        ${escapeHtml(name)}
                    </div>

                    <div class="student-section">
                        ${escapeHtml(section)}
                    </div>

                </td>


                <td>
                    ${escapeHtml(studentId)}
                </td>


                <td>
                    ${escapeHtml(organization)}
                </td>


                <td>
                    ${item.totalMeetings}
                </td>


                <td>
                    ${item.present}
                </td>


                <td>

                    <div class="percentage">
                        ${item.percentage}%
                    </div>

                    <div class="progress-container">

                        <div
                            class="progress-bar"
                            style="width: ${item.percentage}%"
                        ></div>

                    </div>

                </td>


                <td>

                    <span
                        class="participation-status ${item.status}"
                    >
                        ${getStatusLabel(
                            item.status
                        )}
                    </span>

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
    data
) {

    let active =
        0;


    let low =
        0;


    let inactive =
        0;


    data.forEach(
        function (item) {

            if (
                item.status ===
                "active"
            ) {

                active++;

            } else if (
                item.status ===
                "low"
            ) {

                low++;

            } else {

                inactive++;

            }

        }
    );


    activeCount.textContent =
        active;


    lowCount.textContent =
        low;


    inactiveCount.textContent =
        inactive;


    totalCount.textContent =
        students.length;

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


    /*
     * Support array-based attendance
     * if the existing system uses it.
     */

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
   FIND ATTENDANCE RECORD
========================================================= */

function findAttendanceRecord(
    student,
    records
) {

    /*
     * Object-based attendance.
     */

    if (
        !Array.isArray(
            records
        )
    ) {

        const keys =
            Object.keys(
                records
            );


        for (
            let i = 0;
            i < keys.length;
            i++
        ) {

            const key =
                keys[i];


            const record =
                records[key];


            if (
                matchesStudent(
                    student,
                    record,
                    key
                )
            ) {

                return record;

            }

        }


        return null;

    }


    /*
     * Array-based attendance.
     */

    return records.find(
        function (record) {

            return matchesStudent(
                student,
                record,
                ""
            );

        }
    ) || null;

}


/* =========================================================
   MATCH STUDENT
========================================================= */

function matchesStudent(
    student,
    record,
    key
) {

    if (!record) {

        return false;

    }


    const studentUniqueId =
        String(
            student.uniqueId ||
            ""
        ).toLowerCase();


    const studentId =
        String(
            student.studentId ||
            ""
        ).toLowerCase();


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


    const keyValue =
        String(
            key ||
            ""
        ).toLowerCase();


    return (

        (
            studentUniqueId &&
            studentUniqueId ===
            recordUniqueId
        )

        ||

        (
            studentId &&
            studentId ===
            recordStudentId
        )

        ||

        (
            studentUniqueId &&
            studentUniqueId ===
            keyValue
        )

        ||

        (
            studentId &&
            studentId ===
            keyValue
        )

    );

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
   STATUS LABEL
========================================================= */

function getStatusLabel(
    status
) {

    if (
        status ===
        "active"
    ) {

        return "ACTIVE";

    }


    if (
        status ===
        "low"
    ) {

        return "LOW ATTENDANCE";

    }


    return "INACTIVE";

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