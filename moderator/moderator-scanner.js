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
    document.getElementById("scannerIndicatorText");

const scannerMessage =
    document.getElementById("scannerMessage");

const manualUniqueId =
    document.getElementById("manualUniqueId");

const manualSearchButton =
    document.getElementById("manualSearchButton");

const manualStatus =
    document.getElementById("manualStatus");

const studentCard =
    document.getElementById("studentCard");

const studentName =
    document.getElementById("studentName");

const studentId =
    document.getElementById("studentId");

const studentUniqueId =
    document.getElementById("studentUniqueId");

const studentMessage =
    document.getElementById("studentMessage");

const confirmAttendanceButton =
    document.getElementById("confirmAttendanceButton");

const logoutButton =
    document.getElementById("logoutButton");

const moderatorNameElement =
    document.getElementById("moderatorName");

const moderatorAvatar =
    document.getElementById("moderatorAvatar");


/* =========================================================
   SCANNER VARIABLES
========================================================= */

let html5QrCode = null;

let scannerRunning = false;

let lastDecodedValue = "";

let lastDecodedAt = 0;

let currentStudent = null;


/* =========================================================
   MODERATOR INFORMATION
========================================================= */

const moderatorName =
    sessionStorage.getItem("moderatorName") ||
    "System Moderator";


moderatorNameElement.textContent =
    moderatorName;


moderatorAvatar.textContent =
    getInitials(moderatorName);


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
                JSON.parse(raw);


            if (
                Array.isArray(parsed)
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
                document.createElement("option");


            option.value =
                meeting.id;


            option.textContent =
                buildMeetingLabel(meeting);


            meetingSelect.appendChild(
                option
            );

        }
    );


    if (
        meetings.length === 0
    ) {

        const option =
            document.createElement("option");


        option.value = "";

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

            meetingStatus.style.color =
                "#888";

            return;

        }


        meetingStatus.textContent =
            "Meeting selected. The scanner can now be started.";

        meetingStatus.style.color =
            "#198754";

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


        if (
            typeof Html5Qrcode ===
            "undefined"
        ) {

            scannerMessage.textContent =
                "QR scanner library did not load. Check your internet connection.";

            return;

        }


        try {

            scannerMessage.textContent =
                "Requesting camera permission...";


            startScannerButton.disabled =
                true;


            html5QrCode =
                new Html5Qrcode(
                    "qr-reader"
                );


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


            /*
             * Use the first available camera
             * by default.
             */

            let cameraId =
                cameras[0].id;


            /*
             * Prefer the rear camera
             * on phones.
             */

            const rearCamera =
                cameras.find(
                    function(camera) {

                        const label =
                            String(
                                camera.label ||
                                ""
                            ).toLowerCase();


                        return (
                            label.includes("back") ||
                            label.includes("rear") ||
                            label.includes("environment")
                        );

                    }
                );


            if (rearCamera) {

                cameraId =
                    rearCamera.id;

            }


            await html5QrCode.start(

                cameraId,

                {

                    fps: 10,

                    qrbox: {
                        width: 230,
                        height: 230
                    },

                    aspectRatio: 1.0,

                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.QR_CODE
                    ]

                },

                onQrSuccess,

                onQrError

            );


            scannerRunning =
                true;


            setScannerActive(
                true
            );


            scannerMessage.textContent =
                "Scanner is active. Position the student's QR code inside the frame.";


            stopScannerButton.disabled =
                false;

        }

        catch (error) {

            console.error(
                "DOMINEXUS: Scanner failed to start:",
                error
            );


            scannerRunning =
                false;


            setScannerActive(
                false
            );


            startScannerButton.disabled =
                false;


            stopScannerButton.disabled =
                true;


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
                )
            ) {

                message =
                    "Camera permission was denied. Allow camera access and try again.";

            }

            else if (
                errorText.includes(
                    "no camera"
                )
            ) {

                message =
                    "No camera was found on this device.";

            }

            else {

                message =
                    "Unable to start the camera. Check your camera permission and try again.";

            }


            scannerMessage.textContent =
                message;

        }

    }
);


/* =========================================================
   QR SUCCESS
========================================================= */

function onQrSuccess(
    decodedText
) {

    const now =
        Date.now();


    const value =
        String(
            decodedText ||
            ""
        ).trim();


    if (!value) {

        return;

    }


    /*
     * Prevent repeated detection of the
     * same QR code within 3 seconds.
     */

    if (
        value === lastDecodedValue &&
        now - lastDecodedAt < 3000
    ) {

        return;

    }


    lastDecodedValue =
        value;


    lastDecodedAt =
        now;


    console.log(
        "DOMINEXUS QR DECODED:",
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

function onQrError(
    errorMessage
) {

    /*
     * Ignore temporary scanning errors.
     * The library calls this repeatedly while
     * searching for a QR code.
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
        ).trim();


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
                JSON.parse(raw);


            if (
                Array.isArray(parsed)
            ) {

                students =
                    parsed;

            }

        }

    }

    catch (error) {

        console.error(
            "DOMINEXUS: Student data error:",
            error
        );

    }


    const student =
        students.find(
            function(item) {

                const storedUniqueId =
                    String(
                        item.uniqueId ||
                        ""
                    )
                    .trim()
                    .toUpperCase();


                return (
                    storedUniqueId ===
                    cleanedId.toUpperCase()
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
     * Stop the camera after successful detection.
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


        manualStatus.textContent =
            "Searching...";


        findStudent(
            value
        );

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

        if (!meetingSelect.value) {

            studentMessage.textContent =
                "Please select a meeting first.";

            studentMessage.style.color =
                "#7b1113";

            return;

        }


        if (!currentStudent) {

            studentMessage.textContent =
                "No student is currently selected.";

            studentMessage.style.color =
                "#7b1113";

            return;

        }


        /*
         * Backend/database connection will be added later.
         */

        studentMessage.textContent =
            "Attendance confirmed for this student.";

        studentMessage.style.color =
            "#198754";


        console.log(
            "DOMINEXUS ATTENDANCE:",
            {
                meetingId:
                    meetingSelect.value,

                student:
                    currentStudent
            }
        );

    }
);


/* =========================================================
   STOP SCANNER
========================================================= */

async function stopScanner() {

    if (html5QrCode) {

        try {

            if (scannerRunning) {

                await html5QrCode.stop();

            }

        }

        catch (error) {

            console.warn(
                "DOMINEXUS: Scanner stop warning:",
                error
            );

        }


        try {

            await html5QrCode.clear();

        }

        catch (error) {

            console.warn(
                "DOMINEXUS: Scanner clear warning:",
                error
            );

        }

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

    const title =
        meeting.title ||
        "Untitled Meeting";


    let label =
        title;


    if (meeting.date) {

        label +=
            " — " +
            formatDate(
                meeting.date
            );

    }


    if (meeting.time) {

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