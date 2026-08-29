/* =========================================================
   DOMINEXUS — OFFICER ATTENDANCE
   COMPLETE FRONT-END VERSION
========================================================= */


/* =========================================================
   LOGIN CHECK
========================================================= */

if (
    sessionStorage.getItem("officerLoggedIn") !== "true"
) {
    window.location.href = "officer-login.html";
}


/* =========================================================
   ELEMENTS
========================================================= */

const meetingSelect =
    document.getElementById("meetingSelect");

const startScannerButton =
    document.getElementById("startScannerButton");

const stopScannerButton =
    document.getElementById("stopScannerButton");

const qrScannerContainer =
    document.getElementById("qrScanner");

const scanResult =
    document.getElementById("scanResult");

const scannedStudentName =
    document.getElementById("scannedStudentName");

const scannedStudentId =
    document.getElementById("scannedStudentId");

const scannedStudentUniqueId =
    document.getElementById("scannedStudentUniqueId");

const confirmAttendanceButton =
    document.getElementById(
        "confirmAttendanceButton"
    );


/* =========================================================
   SCANNER VARIABLES
========================================================= */

let dominexusQRScanner = null;

let qrScannerRunning = false;

let currentScannedStudent = null;

let processingScan = false;


/* =========================================================
   STORAGE
========================================================= */

function getStudents() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "dominexus_students"
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Student storage error:",
            error
        );

        return [];

    }

}


function getAttendance() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "dominexus_attendance"
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Attendance storage error:",
            error
        );

        return [];

    }

}


function saveAttendance(records) {

    localStorage.setItem(
        "dominexus_attendance",
        JSON.stringify(records)
    );

}


/* =========================================================
   LOAD MEETINGS
========================================================= */

function loadMeetings() {

    if (!meetingSelect) {
        return;
    }

    let meetings = [];

    try {

        meetings = JSON.parse(
            localStorage.getItem(
                "dominexus_meetings"
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Meeting storage error:",
            error
        );

    }


    meetingSelect.innerHTML = `
        <option value="">
            Select a meeting
        </option>
    `;


    meetings.forEach(function(meeting) {

        const option =
            document.createElement("option");

        option.value =
            meeting.id ||
            meeting.meetingId ||
            meeting.date ||
            "";

        option.textContent =
            meeting.title ||
            meeting.name ||
            meeting.meetingName ||
            "Organization Meeting";

        meetingSelect.appendChild(
            option
        );

    });

}


/* =========================================================
   LOAD ATTENDANCE
========================================================= */

function loadAttendance() {

    /*
       Keep this function available for the
       existing attendance table/statistics.
    */

    console.log(
        "DOMINEXUS attendance loaded:",
        getAttendance()
    );

}


/* =========================================================
   START BUTTON
========================================================= */

if (startScannerButton) {

    startScannerButton.addEventListener(
        "click",
        startQRScanner
    );

}


/* =========================================================
   STOP BUTTON
========================================================= */

if (stopScannerButton) {

    stopScannerButton.addEventListener(
        "click",
        stopQRScanner
    );

}


/* =========================================================
   START QR SCANNER
========================================================= */

async function startQRScanner() {

    console.log(
        "DOMINEXUS: Start QR Scanner clicked."
    );


    if (qrScannerRunning) {

        console.log(
            "Scanner is already running."
        );

        return;

    }


    /* -----------------------------------------
       CHECK MEETING
    ----------------------------------------- */

    if (
        meetingSelect &&
        !meetingSelect.value
    ) {

        alert(
            "Please select a meeting first."
        );

        return;

    }


    /* -----------------------------------------
       CHECK LIBRARY
    ----------------------------------------- */

    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        alert(
            "QR Scanner library is not loaded.\n\n" +
            "Please make sure html5-qrcode is loaded before officer-attendance.js."
        );

        console.error(
            "Html5Qrcode is undefined."
        );

        return;

    }


    if (!qrScannerContainer) {

        alert(
            "QR scanner container was not found."
        );

        return;

    }


    /* -----------------------------------------
       RESET
    ----------------------------------------- */

    currentScannedStudent =
        null;

    processingScan =
        false;


    if (scanResult) {

        scanResult.style.display =
            "none";

    }


    if (confirmAttendanceButton) {

        confirmAttendanceButton.disabled =
            true;

    }


    /* -----------------------------------------
       CREATE SCANNER AREA
    ----------------------------------------- */

    qrScannerContainer.innerHTML = `

        <div
            id="dominexus-qr-reader"
            class="dominexus-qr-reader">
        </div>

        <div class="qr-scan-overlay">

            <div class="qr-scan-frame">

                <span class="qr-corner top-left"></span>

                <span class="qr-corner top-right"></span>

                <span class="qr-corner bottom-left"></span>

                <span class="qr-corner bottom-right"></span>

                <span class="qr-scan-line"></span>

            </div>

        </div>

        <div class="qr-scanner-status">

            <span
                id="qrStatusDot"
                class="qr-status-dot">
            </span>

            <span id="qrScannerStatus">
                Starting camera...
            </span>

        </div>

    `;


    /* -----------------------------------------
       CREATE HTML5 QR CODE INSTANCE
    ----------------------------------------- */

    dominexusQRScanner =
        new Html5Qrcode(
            "dominexus-qr-reader"
        );


    try {

        /* -------------------------------------
           GET CAMERAS
        ------------------------------------- */

        const cameras =
            await Html5Qrcode.getCameras();


        console.log(
            "DOMINEXUS cameras:",
            cameras
        );


        if (
            !cameras ||
            cameras.length === 0
        ) {

            throw new Error(
                "No camera was detected."
            );

        }


        /* -------------------------------------
           CAMERA SELECTION
        ------------------------------------- */

        let selectedCamera =
            cameras.find(function(camera) {

                const label =
                    String(
                        camera.label || ""
                    ).toLowerCase();


                return (
                    label.includes("back") ||
                    label.includes("rear") ||
                    label.includes("environment")
                );

            });


        /*
           If there is no identifiable rear camera,
           use the first available camera.

           This is important for desktop webcams.
        */

        if (!selectedCamera) {

            selectedCamera =
                cameras[0];

        }


        const cameraId =
            selectedCamera.id;


        console.log(
            "DOMINEXUS selected camera:",
            selectedCamera
        );


        /* -------------------------------------
           SCANNER CONFIGURATION
        ------------------------------------- */

        const scanConfig = {

            fps: 10,

            qrbox: {
                width: 280,
                height: 280
            },

            aspectRatio: 1.0,

            disableFlip: false,

            formatsToSupport: [

                Html5QrcodeSupportedFormats.QR_CODE

            ]

        };


        /* -------------------------------------
           START CAMERA
        ------------------------------------- */

        await dominexusQRScanner.start(

            cameraId,

            scanConfig,

            function(
                decodedText,
                decodedResult
            ) {

                console.log(
                    "================================"
                );

                console.log(
                    "DOMINEXUS QR DETECTED!"
                );

                console.log(
                    "RAW QR VALUE:",
                    decodedText
                );

                console.log(
                    "FULL RESULT:",
                    decodedResult
                );

                console.log(
                    "================================"
                );


                /*
                   Ignore additional callbacks while
                   processing the current scan.
                */

                if (processingScan) {

                    return;

                }


                processingScan =
                    true;


                /* ---------------------------------
                   SHOW DETECTED STATUS
                --------------------------------- */

                const status =
                    document.getElementById(
                        "qrScannerStatus"
                    );


                const statusDot =
                    document.getElementById(
                        "qrStatusDot"
                    );


                if (status) {

                    status.textContent =
                        "QR code detected!";

                }


                if (statusDot) {

                    statusDot.classList.add(
                        "detected"
                    );

                }


                /* ---------------------------------
                   PROCESS QR
                --------------------------------- */

                handleScannedStudent(
                    decodedText
                );

            },

            function(errorMessage) {

                /*
                   DO NOT display these errors.

                   html5-qrcode calls this repeatedly
                   while it is searching for a QR code.
                */

            }

        );


        /*
           IMPORTANT:
           Set this TRUE only AFTER the camera
           successfully starts.
        */

        qrScannerRunning =
            true;


        const status =
            document.getElementById(
                "qrScannerStatus"
            );


        if (status) {

            status.textContent =
                "Scanning for QR code...";

        }


        if (startScannerButton) {

            startScannerButton.disabled =
                true;

        }


        if (stopScannerButton) {

            stopScannerButton.style.display =
                "inline-flex";

            stopScannerButton.disabled =
                false;

        }


        console.log(
            "DOMINEXUS QR SCANNER IS NOW ACTIVE."
        );


    } catch (error) {

        console.error(
            "DOMINEXUS QR scanner error:",
            error
        );


        qrScannerRunning =
            false;


        alert(
            "Unable to start the QR scanner.\n\n" +
            error.message
        );


        await stopQRScanner();

    }

}


/* =========================================================
   HANDLE SCANNED STUDENT
========================================================= */

function handleScannedStudent(
    decodedText
) {

    console.log(
        "Processing QR value:",
        decodedText
    );


    /*
       Clean the QR value.
    */

    const scannedValue =
        String(
            decodedText || ""
        )
        .trim();


    if (!scannedValue) {

        console.warn(
            "QR value is empty."
        );

        processingScan =
            false;

        return;

    }


    /* -----------------------------------------
       LOAD STUDENTS
    ----------------------------------------- */

    const students =
        getStudents();


    console.log(
        "Registered students:",
        students
    );


    /* -----------------------------------------
       FIND BY UNIQUE ID
    ----------------------------------------- */

    const student =
        students.find(function(item) {

            const savedUniqueId =
                String(
                    item.uniqueId ||
                    item.uniqueID ||
                    item.unique_id ||
                    ""
                )
                .trim()
                .toUpperCase();


            return (
                savedUniqueId ===
                scannedValue.toUpperCase()
            );

        });


    /* -----------------------------------------
       STUDENT NOT FOUND
    ----------------------------------------- */

    if (!student) {

        console.warn(
            "No student found for QR:",
            scannedValue
        );


        if (scanResult) {

            scanResult.style.display =
                "block";

        }


        if (scannedStudentName) {

            scannedStudentName.textContent =
                "Student Not Found";

        }


        if (scannedStudentId) {

            scannedStudentId.textContent =
                "--";

        }


        if (scannedStudentUniqueId) {

            scannedStudentUniqueId.textContent =
                scannedValue;

        }


        if (confirmAttendanceButton) {

            confirmAttendanceButton.disabled =
                true;

        }


        const status =
            document.getElementById(
                "qrScannerStatus"
            );


        if (status) {

            status.textContent =
                "QR detected, but student was not found.";

        }


        /*
           Allow another scan after a short delay.
        */

        setTimeout(function() {

            processingScan =
                false;

        }, 1200);


        return;

    }


    /* -----------------------------------------
       STUDENT FOUND
    ----------------------------------------- */

    console.log(
        "STUDENT FOUND:",
        student
    );


    currentScannedStudent =
        student;


    if (scannedStudentName) {

        scannedStudentName.textContent =
            student.fullName ||
            student.name ||
            "Student";

    }


    if (scannedStudentId) {

        scannedStudentId.textContent =
            student.studentId ||
            "--";

    }


    if (scannedStudentUniqueId) {

        scannedStudentUniqueId.textContent =
            student.uniqueId ||
            scannedValue;

    }


    if (scanResult) {

        scanResult.style.display =
            "block";

    }


    if (confirmAttendanceButton) {

        confirmAttendanceButton.disabled =
            false;

    }


    const status =
        document.getElementById(
            "qrScannerStatus"
        );


    if (status) {

        status.textContent =
            "Student found! Please confirm attendance.";

    }


    const statusDot =
        document.getElementById(
            "qrStatusDot"
        );


    if (statusDot) {

        statusDot.classList.add(
            "detected"
        );

    }


    /*
       Stop the camera after a successful
       student match.

       This prevents repeated scans.
    */

    stopQRScanner();


    processingScan =
        false;

}


/* =========================================================
   CONFIRM ATTENDANCE
========================================================= */

if (confirmAttendanceButton) {

    confirmAttendanceButton.addEventListener(
        "click",
        confirmStudentAttendance
    );

}


function confirmStudentAttendance() {

    if (!currentScannedStudent) {

        alert(
            "Please scan a student QR code first."
        );

        return;

    }


    if (
        meetingSelect &&
        !meetingSelect.value
    ) {

        alert(
            "Please select a meeting first."
        );

        return;

    }


    const student =
        currentScannedStudent;


    const attendance =
        getAttendance();


    const meetingValue =
        meetingSelect
            ? meetingSelect.value
            : "";


    const meetingName =
        meetingSelect &&
        meetingSelect.selectedOptions.length
            ? meetingSelect.selectedOptions[0].textContent.trim()
            : "Organization Meeting";


    /* -----------------------------------------
       PREVENT DUPLICATE ATTENDANCE
    ----------------------------------------- */

    const alreadyRecorded =
        attendance.some(function(record) {

            return (

                String(
                    record.uniqueId || ""
                ).toUpperCase() ===
                String(
                    student.uniqueId || ""
                ).toUpperCase()

                &&

                String(
                    record.meetingId || ""
                ) ===
                String(
                    meetingValue
                )

            );

        });


    if (alreadyRecorded) {

        alert(
            "This student has already been recorded for this meeting."
        );

        return;

    }


    /* -----------------------------------------
       CURRENT TIME
    ----------------------------------------- */

    const now =
        new Date();


    const timeIn =
        now.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );


    /* -----------------------------------------
       CREATE RECORD
    ----------------------------------------- */

    const newRecord = {

        id:
            Date.now(),

        meetingId:
            meetingValue,

        meetingName:
            meetingName,

        studentId:
            student.studentId || "",

        uniqueId:
            student.uniqueId || "",

        studentName:
            student.fullName ||
            student.name ||
            "",

        status:
            "Present",

        timeIn:
            timeIn,

        timeOut:
            "",

        remarks:
            "",

        date:
            now.toISOString(),

        recordedAt:
            now.toISOString()

    };


    /* -----------------------------------------
       SAVE
    ----------------------------------------- */

    attendance.push(
        newRecord
    );


    saveAttendance(
        attendance
    );


    console.log(
        "Attendance saved:",
        newRecord
    );


    alert(
        "Attendance recorded successfully for " +
        (
            student.fullName ||
            student.name ||
            "student"
        ) +
        "."
    );


    /* -----------------------------------------
       RESET
    ----------------------------------------- */

    currentScannedStudent =
        null;


    if (scanResult) {

        scanResult.style.display =
            "none";

    }


    if (confirmAttendanceButton) {

        confirmAttendanceButton.disabled =
            true;

    }


    const status =
        document.getElementById(
            "qrScannerStatus"
        );


    if (status) {

        status.textContent =
            "Attendance saved successfully.";

    }


    loadAttendance();

}


/* =========================================================
   STOP QR SCANNER
========================================================= */

async function stopQRScanner() {

    console.log(
        "Stopping DOMINEXUS QR scanner..."
    );


    if (dominexusQRScanner) {

        try {

            if (qrScannerRunning) {

                await dominexusQRScanner.stop();

            }

        } catch (error) {

            console.warn(
                "Scanner stop warning:",
                error
            );

        }


        try {

            await dominexusQRScanner.clear();

        } catch (error) {

            console.warn(
                "Scanner clear warning:",
                error
            );

        }

    }


    dominexusQRScanner =
        null;


    qrScannerRunning =
        false;


    processingScan =
        false;


    if (startScannerButton) {

        startScannerButton.disabled =
            false;

    }


    if (stopScannerButton) {

        stopScannerButton.disabled =
            false;

        stopScannerButton.style.display =
            "none";

    }


    if (qrScannerContainer) {

        qrScannerContainer.innerHTML = `

            <div class="scanner-placeholder">

                <div class="scanner-icon">
                    ▣
                </div>

                <h4>
                    Ready to Scan
                </h4>

                <p>
                    Select a meeting first,
                    then scan the student's QR code.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const menuButton =
    document.getElementById(
        "menuButton"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


if (
    menuButton &&
    sidebar &&
    sidebarOverlay
) {

    menuButton.addEventListener(
        "click",
        function() {

            sidebar.classList.add(
                "open"
            );

            sidebarOverlay.classList.add(
                "show"
            );

        }
    );


    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );


    document
        .querySelectorAll(".nav-item")
        .forEach(function(link) {

            link.addEventListener(
                "click",
                closeSidebar
            );

        });

}


function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

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
                "officerLoggedIn"
            );

            sessionStorage.removeItem(
                "officerId"
            );

            sessionStorage.removeItem(
                "officerName"
            );

            sessionStorage.removeItem(
                "officerOrganization"
            );


            window.location.href =
                "officer-login.html";

        }
    );

}


/* =========================================================
   OFFICER INFORMATION
========================================================= */

const officerName =
    sessionStorage.getItem(
        "officerName"
    ) ||
    "Officer";


const officerId =
    sessionStorage.getItem(
        "officerId"
    ) ||
    "Officer ID";


const topOfficerName =
    document.getElementById(
        "topOfficerName"
    );


const topOfficerId =
    document.getElementById(
        "topOfficerId"
    );


const topAvatar =
    document.getElementById(
        "topAvatar"
    );


if (topOfficerName) {

    topOfficerName.textContent =
        officerName;

}


if (topOfficerId) {

    topOfficerId.textContent =
        officerId;

}


if (topAvatar) {

    topAvatar.textContent =
        getInitials(
            officerName
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

loadMeetings();

loadAttendance();


/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {

    if (!name) {

        return "OF";

    }


    const parts =
        name
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[
            parts.length - 1
        ].charAt(0)
    ).toUpperCase();

}