/* =========================================================
   DOMINEXUS
   MODERATOR QR SCANNER
========================================================= */


/* =========================================================
   AUTHENTICATION
========================================================= */

if (
    sessionStorage.getItem("moderatorLoggedIn") !== "true"
) {

    window.location.href =
        "moderator-login.html";

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const meetingSelect =
    document.getElementById("meetingSelect");

const meetingStatus =
    document.getElementById("meetingStatus");

const startScannerButton =
    document.getElementById("startScannerButton");

const stopScannerButton =
    document.getElementById("stopScannerButton");

const scannerIndicator =
    document.getElementById("scannerIndicator");

const scannerIndicatorText =
    document.getElementById(
        "scannerIndicatorText"
    );

const scannerMessage =
    document.getElementById("scannerMessage");

const manualUniqueId =
    document.getElementById("manualUniqueId");

const manualSearchButton =
    document.getElementById(
        "manualSearchButton"
    );

const manualStatus =
    document.getElementById("manualStatus");

const studentCard =
    document.getElementById("studentCard");

const studentName =
    document.getElementById("studentName");

const studentId =
    document.getElementById("studentId");

const studentUniqueId =
    document.getElementById(
        "studentUniqueId"
    );

const studentMessage =
    document.getElementById(
        "studentMessage"
    );

const confirmAttendanceButton =
    document.getElementById(
        "confirmAttendanceButton"
    );

const logoutButton =
    document.getElementById("logoutButton");

const moderatorNameElement =
    document.getElementById(
        "moderatorName"
    );

const moderatorAvatar =
    document.getElementById(
        "moderatorAvatar"
    );


/* =========================================================
   STORAGE KEYS
========================================================= */

const MEETINGS_KEY =
    "dominexus_meetings";

const STUDENTS_KEY =
    "dominexus_students";

const ATTENDANCE_KEY =
    "dominexus_attendance";


/* =========================================================
   VARIABLES
========================================================= */

let html5QrCode = null;

let scannerRunning = false;

let currentStudent = null;

let lastDecodedValue = "";

let lastDecodedAt = 0;


/* =========================================================
   MODERATOR INFORMATION
========================================================= */

const moderatorName =
    sessionStorage.getItem(
        "moderatorName"
    ) ||
    "System Moderator";


moderatorNameElement.textContent =
    moderatorName;


moderatorAvatar.textContent =
    getInitials(
        moderatorName
    );


/* =========================================================
   INITIALIZE
========================================================= */

loadMeetings();


/* =========================================================
   LOAD MEETINGS
========================================================= */

function loadMeetings() {

    const previousValue =
        meetingSelect.value;


    meetingSelect.innerHTML = "";


    const defaultOption =
        document.createElement("option");


    defaultOption.value = "";

    defaultOption.textContent =
        "Select a meeting";


    meetingSelect.appendChild(
        defaultOption
    );


    const meetings =
        getMeetings();


    if (
        meetings.length === 0
    ) {

        const emptyOption =
            document.createElement(
                "option"
            );


        emptyOption.value = "";

        emptyOption.textContent =
            "No meetings available — create one first";

        emptyOption.disabled =
            true;


        meetingSelect.appendChild(
            emptyOption
        );


        meetingStatus.textContent =
            "No meetings found on this browser. Create a meeting first.";


        meetingStatus.classList.add(
            "warning"
        );


        return;

    }


    meetingStatus.textContent =
        "Select a meeting to record attendance.";


    meetingStatus.classList.remove(
        "warning"
    );


    meetings
        .sort(
            function(a, b) {

                return (
                    new Date(
                        b.createdAt ||
                        0
                    ) -
                    new Date(
                        a.createdAt ||
                        0
                    )
                );

            }
        )
        .forEach(
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
        previousValue &&
        meetings.some(
            function(meeting) {

                return (
                    String(
                        meeting.id
                    ) ===
                    String(
                        previousValue
                    )
                );

            }
        )
    ) {

        meetingSelect.value =
            previousValue;

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


        /*
         * Normal DOMINEXUS format:
         * Array
         */

        if (
            Array.isArray(
                parsed
            )
        ) {

            return parsed;

        }


        /*
         * Extra compatibility in case
         * the backend later changes the
         * storage structure.
         */

        if (
            parsed &&
            Array.isArray(
                parsed.meetings
            )
        ) {

            return parsed.meetings;

        }


        if (
            parsed &&
            Array.isArray(
                parsed.data
            )
        ) {

            return parsed.data;

        }


        return [];

    }

    catch (error) {

        console.error(
            "DOMINEXUS: Could not read meetings.",
            error
        );


        return [];

    }

}


/* =========================================================
   MEETING CHANGE
========================================================= */

meetingSelect.addEventListener(
    "change",
    function() {

        if (
            !meetingSelect.value
        ) {

            meetingStatus.textContent =
                "Select a meeting to record attendance.";

            return;

        }


        const meetings =
            getMeetings();


        const meeting =
            meetings.find(
                function(item) {

                    return (
                        String(
                            item.id
                        ) ===
                        String(
                            meetingSelect.value
                        )
                    );

                }
            );


        if (meeting) {

            meetingStatus.textContent =
                "Selected: " +
                buildMeetingLabel(
                    meeting
                );

        }

    }
);


/* =========================================================
   START CAMERA
========================================================= */

startScannerButton.addEventListener(
    "click",
    startScanner
);


async function startScanner() {

    /*
     * IMPORTANT:
     * A meeting is NOT required just to
     * start the camera.
     */

    if (
        scannerRunning
    ) {

        return;

    }


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        scannerMessage.textContent =
            "QR scanner library did not load. Make sure you are connected to the internet.";


        console.error(
            "Html5Qrcode is undefined."
        );


        return;

    }


    try {

        startScannerButton.disabled =
            true;


        scannerMessage.textContent =
            "Requesting camera permission...";


        html5QrCode =
            new Html5Qrcode(
                "qr-reader"
            );


        /*
         * First try the rear/environment
         * camera.
         */

        try {

            await html5QrCode.start(

                {
                    facingMode:
                        "environment"
                },

                {
                    fps: 10,

                    qrbox: {
                        width: 250,
                        height: 250
                    },

                    aspectRatio: 1.0

                },

                handleQrSuccess,

                handleQrError

            );

        }

        catch (environmentError) {

            console.warn(
                "Environment camera failed. Trying available camera.",
                environmentError
            );


            /*
             * Fallback for laptops/desktops.
             */

            const cameras =
                await Html5Qrcode.getCameras();


            if (
                !cameras ||
                cameras.length === 0
            ) {

                throw new Error(
                    "No camera was found."
                );

            }


            await html5QrCode.start(

                cameras[0].id,

                {

                    fps: 10,

                    qrbox: {
                        width: 250,
                        height: 250
                    },

                    aspectRatio: 1.0

                },

                handleQrSuccess,

                handleQrError

            );

        }


        scannerRunning =
            true;


        setScannerActive(
            true
        );


        scannerMessage.textContent =
            "Camera is active. Point it at a QR code.";


        stopScannerButton.disabled =
            false;

    }

    catch (error) {

        console.error(
            "DOMINEXUS CAMERA ERROR:",
            error
        );


        scannerRunning =
            false;


        startScannerButton.disabled =
            false;


        stopScannerButton.disabled =
            true;


        setScannerActive(
            false
        );


        let message =
            "Unable to start the camera.";


        const errorText =
            String(
                error?.message ||
                error ||
                ""
            ).toLowerCase();


        if (
            errorText.includes(
                "permission"
            ) ||
            errorText.includes(
                "notallowed"
            )
        ) {

            message =
                "Camera permission was denied. Allow camera access in your browser.";

        }

        else if (
            errorText.includes(
                "notfound"
            ) ||
            errorText.includes(
                "no camera"
            )
        ) {

            message =
                "No camera was found on this device.";

        }

        else if (
            errorText.includes(
                "secure"
            )
        ) {

            message =
                "Camera requires HTTPS or localhost.";

        }

        else {

            message =
                "Camera could not start. Open the browser console for the exact error.";

        }


        scannerMessage.textContent =
            message;

    }

}


/* =========================================================
   QR SUCCESS
========================================================= */

function handleQrSuccess(
    decodedText
) {

    const value =
        String(
            decodedText ||
            ""
        ).trim();


    if (!value) {

        return;

    }


    const now =
        Date.now();


    /*
     * Prevent the same QR code from
     * being processed repeatedly.
     */

    if (
        value ===
        lastDecodedValue &&
        now -
        lastDecodedAt <
        3000
    ) {

        return;

    }


    lastDecodedValue =
        value;


    lastDecodedAt =
        now;


    console.log(
        "DOMINEXUS QR:",
        value
    );


    scannerMessage.textContent =
        "QR detected. Looking for student...";


    findStudent(
        value
    );

}


/* =========================================================
   QR SCAN ERROR
========================================================= */

function handleQrError(
    errorMessage
) {

    /*
     * html5-qrcode calls this repeatedly
     * while it is searching.
     *
     * Do not display these messages to
     * the user because they are normal.
     */

}


/* =========================================================
   FIND STUDENT
========================================================= */

function findStudent(
    uniqueId
) {

    const cleanedId =
        String(
            uniqueId ||
            ""
        )
        .trim()
        .toUpperCase();


    if (!cleanedId) {

        return;

    }


    const students =
        getStudents();


    const student =
        students.find(
            function(item) {

                const storedId =
                    String(
                        item.uniqueId ||
                        ""
                    )
                    .trim()
                    .toUpperCase();


                return (
                    storedId ===
                    cleanedId
                );

            }
        );


    if (!student) {

        currentStudent =
            null;


        studentCard.classList.add(
            "hidden"
        );


        scannerMessage.textContent =
            "QR detected, but no matching student was found.";


        return;

    }


    displayStudent(
        student
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


        if (
            Array.isArray(
                parsed
            )
        ) {

            return parsed;

        }


        if (
            parsed &&
            Array.isArray(
                parsed.students
            )
        ) {

            return parsed.students;

        }


        if (
            parsed &&
            Array.isArray(
                parsed.data
            )
        ) {

            return parsed.data;

        }


        return [];

    }

    catch (error) {

        console.error(
            "DOMINEXUS: Student data error.",
            error
        );


        return [];

    }

}


/* =========================================================
   DISPLAY STUDENT
========================================================= */

function displayStudent(
    student
) {

    currentStudent =
        student;


    studentName.textContent =
        student.fullName ||
        student.name ||
        "Unknown Student";


    studentId.textContent =
        student.studentId ||
        "—";


    studentUniqueId.textContent =
        student.uniqueId ||
        "—";


    studentMessage.textContent =
        "Student identity successfully verified.";


    studentMessage.style.color =
        "#198754";


    studentCard.classList.remove(
        "hidden"
    );


    scannerMessage.textContent =
        "Student QR successfully detected.";


    /*
     * Stop camera after successful scan.
     */

    stopScanner();

}


/* =========================================================
   MANUAL SEARCH
========================================================= */

manualSearchButton.addEventListener(
    "click",
    function() {

        const value =
            manualUniqueId.value.trim();


        if (!value) {

            manualStatus.textContent =
                "Please enter the student's Unique ID.";

            manualStatus.style.color =
                "#7b1113";

            return;

        }


        manualStatus.textContent =
            "Searching...";


        findStudent(
            value
        );


        if (
            currentStudent
        ) {

            manualStatus.textContent =
                "Student found.";

            manualStatus.style.color =
                "#198754";

        }

        else {

            manualStatus.textContent =
                "No student found.";

            manualStatus.style.color =
                "#7b1113";

        }

    }
);


/* =========================================================
   ENTER KEY
========================================================= */

manualUniqueId.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            manualSearchButton.click();

        }

    }
);


/* =========================================================
   CONFIRM ATTENDANCE
========================================================= */

confirmAttendanceButton.addEventListener(
    "click",
    function() {

        /*
         * NOW a meeting IS required.
         */

        if (
            !meetingSelect.value
        ) {

            studentMessage.textContent =
                "Please select a meeting before confirming attendance.";

            studentMessage.style.color =
                "#7b1113";


            meetingStatus.textContent =
                "A meeting is required to record attendance.";

            meetingStatus.classList.add(
                "warning"
            );


            meetingSelect.focus();


            return;

        }


        if (
            !currentStudent
        ) {

            studentMessage.textContent =
                "No student is currently selected.";

            studentMessage.style.color =
                "#7b1113";


            return;

        }


        recordAttendance(
            currentStudent,
            meetingSelect.value
        );

    }
);


/* =========================================================
   RECORD ATTENDANCE
========================================================= */

function recordAttendance(
    student,
    meetingId
) {

    let attendance =
        {};


    try {

        attendance =
            JSON.parse(
                localStorage.getItem(
                    ATTENDANCE_KEY
                ) ||
                "{}"
            );

    }

    catch (error) {

        attendance =
            {};

    }


    if (
        !attendance[meetingId]
    ) {

        attendance[meetingId] =
            {};

    }


    const uniqueId =
        student.uniqueId ||
        student.studentId;


    attendance[meetingId][
        uniqueId
    ] = {

        studentId:
            student.studentId ||
            "",

        uniqueId:
            student.uniqueId ||
            "",

        studentName:
            student.fullName ||
            student.name ||
            "",

        status:
            "Present",

        recordedAt:
            new Date()
                .toISOString(),

        recordedBy:
            sessionStorage.getItem(
                "moderatorId"
            ) ||
            "MOD-0001"

    };


    localStorage.setItem(
        ATTENDANCE_KEY,
        JSON.stringify(
            attendance
        )
    );


    studentMessage.textContent =
        "Attendance successfully recorded.";


    studentMessage.style.color =
        "#198754";


    console.log(
        "DOMINEXUS ATTENDANCE RECORDED:",
        attendance[meetingId][
            uniqueId
        ]
    );

}


/* =========================================================
   STOP SCANNER
========================================================= */

async function stopScanner() {

    if (
        !html5QrCode
    ) {

        return;

    }


    try {

        if (
            scannerRunning
        ) {

            await html5QrCode.stop();

        }

    }

    catch (error) {

        console.warn(
            "DOMINEXUS: Camera stop warning.",
            error
        );

    }


    try {

        await html5QrCode.clear();

    }

    catch (error) {

        console.warn(
            "DOMINEXUS: Camera clear warning.",
            error
        );

    }


    html5QrCode =
        null;


    scannerRunning =
        false;


    startScannerButton.disabled =
        false;


    stopScannerButton.disabled =
        true;


    setScannerActive(
        false
    );


    scannerMessage.textContent =
        "Scanner stopped.";

}


stopScannerButton.addEventListener(
    "click",
    stopScanner
);


/* =========================================================
   SCANNER STATUS
========================================================= */

function setScannerActive(
    active
) {

    if (
        active
    ) {

        scannerIndicator.classList.add(
            "active"
        );


        scannerIndicatorText.textContent =
            "Scanner Active";


        return;

    }


    scannerIndicator.classList.remove(
        "active"
    );


    scannerIndicatorText.textContent =
        "Scanner Off";

}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async function() {

        const confirmed =
            confirm(
                "Are you sure you want to log out?"
            );


        if (!confirmed) {

            return;

        }


        await stopScanner();


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
            year: "numeric",
            month: "long",
            day: "numeric"
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
        parts.length <
        2
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


function getInitials(
    name
) {

    const parts =
        String(
            name ||
            ""
        )
        .trim()
        .split(/\s+/);


    if (
        parts.length === 0 ||
        !parts[0]
    ) {

        return "M";

    }


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


/* =========================================================
   REFRESH WHEN RETURNING TO PAGE
========================================================= */

window.addEventListener(
    "pageshow",
    function() {

        loadMeetings();

    }
);


/*
 * If another DOMINEXUS page changes
 * localStorage in another tab, update
 * the meeting list automatically.
 */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            MEETINGS_KEY
        ) {

            loadMeetings();

        }

    }
);