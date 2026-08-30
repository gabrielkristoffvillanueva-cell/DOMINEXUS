/* =========================================================
   DOMINEXUS
   MODERATOR QR SCANNER
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
   DOM ELEMENTS
========================================================= */

const meetingSelect =
    document.getElementById(
        "meetingSelect"
    );

const meetingStatus =
    document.getElementById(
        "meetingStatus"
    );

const startScannerButton =
    document.getElementById(
        "startScannerButton"
    );

const stopScannerButton =
    document.getElementById(
        "stopScannerButton"
    );

const scannerIndicator =
    document.getElementById(
        "scannerIndicator"
    );

const scannerIndicatorText =
    document.getElementById(
        "scannerIndicatorText"
    );

const scannerMessage =
    document.getElementById(
        "scannerMessage"
    );

const manualUniqueId =
    document.getElementById(
        "manualUniqueId"
    );

const manualSearchButton =
    document.getElementById(
        "manualSearchButton"
    );

const manualStatus =
    document.getElementById(
        "manualStatus"
    );

const studentCard =
    document.getElementById(
        "studentCard"
    );

const studentName =
    document.getElementById(
        "studentName"
    );

const studentId =
    document.getElementById(
        "studentId"
    );

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
   VARIABLES
========================================================= */

let html5QrCode = null;

let scannerRunning = false;

let currentStudent = null;

let meetings = [];

let lastDecodedValue = "";

let lastDecodedAt = 0;


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

loadMeetings();


/* =========================================================
   LOAD MEETINGS
   ONLY THIS MODERATOR'S ORGANIZATION
========================================================= */

async function loadMeetings() {

    if (
        !meetingSelect
    ) {

        return;

    }


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
            "MODERATOR SCANNER MEETINGS:",
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
            "MEETING LOAD ERROR:",
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
        "Select a meeting to record attendance.";

    meetingStatus.classList.remove(
        "warning"
    );


    /*
     * Sort newest/latest meetings first.
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
   MEETING SELECTION
========================================================= */

meetingSelect.addEventListener(
    "change",
    function() {

        const selectedId =
            meetingSelect.value;


        if (
            !selectedId
        ) {

            meetingStatus.textContent =
                "Select a meeting to record attendance.";

            meetingStatus.classList.remove(
                "warning"
            );

            return;

        }


        const meeting =
            meetings.find(
                function(item) {

                    return (
                        String(
                            item.id
                        ) ===
                        String(
                            selectedId
                        )
                    );

                }
            );


        if (!meeting) {

            meetingStatus.textContent =
                "Selected meeting could not be found.";

            meetingStatus.classList.add(
                "warning"
            );

            return;

        }


        meetingStatus.textContent =
            "Selected: " +
            buildMeetingLabel(
                meeting
            );


        meetingStatus.classList.remove(
            "warning"
        );


        /*
         * Clear previously found student
         * when changing the meeting.
         */

        clearStudent();

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
            "QR scanner library did not load. Check your internet connection and refresh the page.";

        return;

    }


    try {

        startScannerButton.disabled =
            true;


        scannerMessage.textContent =
            "Requesting camera permission...";


        /*
         * Clear old scanner instance.
         */

        if (
            html5QrCode
        ) {

            try {

                await html5QrCode.clear();

            }

            catch (error) {

                console.warn(
                    "Old scanner cleanup warning:",
                    error
                );

            }

        }


        html5QrCode =
            new Html5Qrcode(
                "qr-reader"
            );


        /*
         * Try rear/environment camera first.
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

        catch (
            environmentError
        ) {

            console.warn(
                "Environment camera failed:",
                environmentError
            );


            /*
             * Desktop/laptop fallback.
             */

            const cameras =
                await Html5Qrcode.getCameras();


            if (
                !cameras ||
                cameras.length === 0
            ) {

                throw new Error(
                    "No camera was found on this device."
                );

            }


            /*
             * Prefer the first available
             * camera.
             */

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
            "Camera is active. Point it at a student's QR code.";


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
            )
            .toLowerCase();


        if (
            errorText.includes(
                "permission"
            ) ||
            errorText.includes(
                "notallowed"
            )
        ) {

            message =
                "Camera permission was denied. Allow camera access in your browser settings.";

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
                "Camera access requires HTTPS or localhost.";

        }


        scannerMessage.textContent =
            message;


        startScannerButton.disabled =
            false;

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
        )
        .trim();


    if (!value) {

        return;

    }


    const now =
        Date.now();


    /*
     * Prevent repeated detection.
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
        "DOMINEXUS QR DETECTED:",
        value
    );


    scannerMessage.textContent =
        "QR detected. Verifying student...";


    findStudent(
        value
    );

}


/* =========================================================
   QR ERROR
========================================================= */

function handleQrError(
    errorMessage
) {

    /*
     * html5-qrcode calls this continuously
     * while searching for a QR code.
     *
     * These are normal scanning messages,
     * so we intentionally don't display them.
     */

}


/* =========================================================
   FIND STUDENT FROM DATABASE
========================================================= */

async function findStudent(
    uniqueId
) {

    const cleanedId =
        String(
            uniqueId ||
            ""
        )
        .trim();


    if (!cleanedId) {

        return;

    }


    try {

        manualStatus.textContent =
            "Searching student...";


        /*
         * Your Laravel route:
         *
         * GET /api/students/{uniqueId}
         */

        const response =
            await fetch(
                `${API_BASE}/students/${encodeURIComponent(
                    cleanedId
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
            "STUDENT LOOKUP RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Student not found."
            );

        }


        /*
         * Handle common API response
         * structures.
         */

        const student =
            data.student ||
            data.data ||
            data;


        if (
            !student ||
            typeof student !== "object"
        ) {

            throw new Error(
                "Student record was not found."
            );

        }


        currentStudent =
            student;


        displayStudent(
            student
        );


        manualStatus.textContent =
            "Student found.";

        manualStatus.style.color =
            "#198754";


    } catch (error) {

        console.error(
            "STUDENT LOOKUP ERROR:",
            error
        );


        currentStudent =
            null;


        studentCard.classList.add(
            "hidden"
        );


        scannerMessage.textContent =
            "QR detected, but the student could not be found.";


        manualStatus.textContent =
            error.message ||
            "Student not found.";

        manualStatus.style.color =
            "#7b1113";

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


    const name =
        student.name ||
        student.fullName ||
        student.full_name ||
        "Unknown Student";


    const id =
        student.student_id ||
        student.studentId ||
        "—";


    const uniqueId =
        student.unique_id ||
        student.uniqueId ||
        "—";


    studentName.textContent =
        name;


    studentId.textContent =
        id;


    studentUniqueId.textContent =
        uniqueId;


    studentMessage.textContent =
        "Student identity successfully verified. Select the meeting and confirm attendance.";


    studentMessage.style.color =
        "#198754";


    studentCard.classList.remove(
        "hidden"
    );


    scannerMessage.textContent =
        "Student QR successfully detected.";


    /*
     * Stop the camera after finding
     * the student so another scan
     * doesn't happen accidentally.
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

    }
);


/* =========================================================
   ENTER KEY — MANUAL SEARCH
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


        recordAttendance();

    }
);


/* =========================================================
   RECORD ATTENDANCE
   DATABASE
========================================================= */

async function recordAttendance() {

    const selectedMeetingId =
        meetingSelect.value;


    /*
     * Backend expects student_id,
     * not unique_id.
     */

    const selectedStudentId =
        currentStudent.student_id ||
        currentStudent.studentId;


    if (
        !selectedStudentId
    ) {

        studentMessage.textContent =
            "Student ID is missing from the student record.";

        studentMessage.style.color =
            "#7b1113";

        return;

    }


    confirmAttendanceButton.disabled =
        true;


    confirmAttendanceButton.textContent =
        "Recording...";


    try {

        const response =
            await fetch(
                `${API_BASE}/attendances`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            meeting_id:
                                Number(
                                    selectedMeetingId
                                ),

                            student_id:
                                selectedStudentId,

                            status:
                                "present"

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "ATTENDANCE RESPONSE:",
            data
        );


        if (!response.ok) {

            /*
             * 409 means duplicate attendance.
             */

            if (
                response.status ===
                409
            ) {

                throw new Error(
                    "Attendance has already been recorded for this student in this meeting."
                );

            }


            throw new Error(
                data.message ||
                "Unable to record attendance."
            );

        }


        studentMessage.textContent =
            data.message ||
            "Attendance recorded successfully.";


        studentMessage.style.color =
            "#198754";


        scannerMessage.textContent =
            "Attendance recorded successfully.";


        /*
         * Clear current student after
         * successful attendance.
         */

        setTimeout(
            function() {

                clearStudent();

            },
            1500
        );


    } catch (error) {

        console.error(
            "ATTENDANCE ERROR:",
            error
        );


        studentMessage.textContent =
            error.message ||
            "Unable to record attendance.";


        studentMessage.style.color =
            "#7b1113";

    } finally {

        confirmAttendanceButton.disabled =
            false;


        confirmAttendanceButton.textContent =
            "Confirm Attendance";

    }

}


/* =========================================================
   CLEAR STUDENT
========================================================= */

function clearStudent() {

    currentStudent =
        null;


    studentCard.classList.add(
        "hidden"
    );


    manualUniqueId.value =
        "";


    manualStatus.textContent =
        "";


    studentMessage.textContent =
        "";


    scannerMessage.textContent =
        "Click \"Start QR Scanner\" to activate the camera.";

}


/* =========================================================
   STOP SCANNER
========================================================= */

async function stopScanner() {

    if (
        !html5QrCode
    ) {

        scannerRunning =
            false;


        if (
            startScannerButton
        ) {

            startScannerButton.disabled =
                false;

        }


        if (
            stopScannerButton
        ) {

            stopScannerButton.disabled =
                true;

        }


        setScannerActive(
            false
        );

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
            "CAMERA STOP WARNING:",
            error
        );

    }


    try {

        await html5QrCode.clear();

    }

    catch (error) {

        console.warn(
            "CAMERA CLEAR WARNING:",
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


/* =========================================================
   SCANNER STATUS
========================================================= */

function setScannerActive(
    active
) {

    if (
        !scannerIndicator
    ) {

        return;

    }


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
        String(
            time
        ).split(":");


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


/* =========================================================
   PAGE CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        if (
            html5QrCode &&
            scannerRunning
        ) {

            /*
             * Browser normally releases
             * the camera when leaving.
             */

            html5QrCode.stop()
                .catch(
                    function() {}
                );

        }

    }
);