/* =========================================================
   DOMINEXUS
   MODERATOR QR SCANNER
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


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================================================
   SCANNER VARIABLES
========================================================= */

let html5QrCode =
    null;


let scannerRunning =
    false;


/* =========================================================
   LOAD MODERATOR INFORMATION
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


    let meetings = [];


    try {

        const raw =
            localStorage.getItem(
                "dominexus_meetings"
            );


        if (raw) {

            const parsed =
                JSON.parse(
                    raw
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                meetings =
                    parsed;

            }

        }

    } catch (error) {

        console.error(
            "DOMINEXUS: Unable to load meetings.",
            error
        );

    }


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
   MEETING SELECTION
========================================================= */

meetingSelect.addEventListener(
    "change",
    function() {

        const selected =
            meetingSelect.value;


        if (!selected) {

            meetingStatus.textContent =
                "Please select a meeting before starting the scanner.";

            return;

        }


        meetingStatus.textContent =
            "Meeting selected. The scanner can now be started.";

    }
);


/* =========================================================
   START SCANNER
========================================================= */

startScannerButton.addEventListener(
    "click",
    async function() {

        if (!meetingSelect.value) {

            meetingStatus.textContent =
                "Please select a meeting first.";

            meetingStatus.style.color =
                "#7b1113";

            return;

        }


        if (scannerRunning) {

            return;

        }


        /*
         * Check that the library exists.
         */

        if (
            typeof Html5Qrcode ===
            "undefined"
        ) {

            scannerMessage.textContent =
                "QR scanner library did not load.";


            console.error(
                "DOMINEXUS: Html5Qrcode is undefined."
            );


            return;

        }


        try {

            scannerMessage.textContent =
                "Starting camera...";


            setScannerActive(
                true
            );


            html5QrCode =
                new Html5Qrcode(
                    "qr-reader"
                );


            /*
             * Use the browser's
             * environment-facing camera.
             *
             * This is better for a
             * webcam/phone rear camera.
             */

            await html5QrCode.start(

                {
                    facingMode:
                        "environment"
                },

                {
                    fps:
                        10,

                    qrbox:
                        {
                            width: 230,
                            height: 230
                        },

                    aspectRatio:
                        1.0,

                    formatsToSupport:
                        [
                            Html5QrcodeSupportedFormats.QR_CODE
                        ]

                },

                onQrSuccess,

                onQrError

            );


            scannerRunning =
                true;


            scannerMessage.textContent =
                "Scanner is active. Position the QR code inside the frame.";

            startScannerButton.disabled =
                true;


            stopScannerButton.disabled =
                false;


        } catch (error) {

            console.error(
                "DOMINEXUS: Scanner failed to start:",
                error
            );


            scannerRunning =
                false;


            setScannerActive(
                false
            );


            scannerMessage.textContent =
                "Unable to start the camera. Check browser camera permission.";

        }

    }
);


/* =========================================================
   QR SUCCESS
========================================================= */

function onQrSuccess(
    decodedText
) {

    console.log(
        "DOMINEXUS QR DECODED:",
        decodedText
    );


    scannerMessage.textContent =
        "QR detected: " +
        decodedText;


    /*
     * Show decoded value
     * temporarily.
     *
     * Student lookup and attendance
     * will be connected in the next step.
     */

    findStudent(
        decodedText
    );

}


/* =========================================================
   QR ERROR
========================================================= */

function onQrError(
    errorMessage
) {

    /*
     * Do NOT display every frame's
     * decode failure to the user.
     *
     * html5-qrcode calls this constantly
     * while searching.
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
            uniqueId
        )
        .trim();


    if (!cleanedId) {

        return;

    }


    let students = [];


    try {

        const raw =
            localStorage.getItem(
                "dominexus_students"
            );


        if (raw) {

            const parsed =
                JSON.parse(
                    raw
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                students =
                    parsed;

            }

        }

    } catch (error) {

        console.error(
            "DOMINEXUS: Student data error:",
            error
        );

    }


    const student =
        students.find(
            function(item) {

                return (
                    String(
                        item.uniqueId ||
                        ""
                    )
                    .trim()
                    .toUpperCase() ===
                    cleanedId
                    .toUpperCase()
                );

            }
        );


    if (!student) {

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
   DISPLAY STUDENT
========================================================= */

function displayStudent(
    student
) {

    studentName.textContent =
        student.fullName ||
        student.name ||
        "Unknown";


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
     * Stop the scanner after a successful
     * detection so the same QR isn't
     * repeatedly decoded.
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


        manualStatus.textContent =
            "";


        if (!value) {

            manualStatus.textContent =
                "Please enter the student's Unique ID.";

            manualStatus.style.color =
                "#7b1113";

            return;

        }


        findStudent(
            value
        );


        manualStatus.textContent =
            "Searching...";

    }
);


/* =========================================================
   ENTER KEY FOR MANUAL ID
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
   STOP SCANNER
========================================================= */

async function stopScanner() {

    if (
        !html5QrCode ||
        !scannerRunning
    ) {

        setScannerActive(
            false
        );

        return;

    }


    try {

        await html5QrCode.stop();


    } catch (error) {

        console.warn(
            "DOMINEXUS: Scanner stop warning:",
            error
        );

    }


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
    function() {

        stopScanner();

    }
);


/* =========================================================
   SCANNER INDICATOR
========================================================= */

function setScannerActive(
    active
) {

    if (active) {

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
    function() {

        const confirmed =
            confirm(
                "Are you sure you want to log out?"
            );


        if (!confirmed) {

            return;

        }


        stopScanner();


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

    const title =
        meeting.title ||
        "Untitled Meeting";


    let label =
        title;


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