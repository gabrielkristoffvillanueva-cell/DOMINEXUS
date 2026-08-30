/* =========================================================
   DOMINEXUS — OFFICER ATTENDANCE
   LARAVEL API CONNECTED
========================================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


/* =========================================================
   LOGIN CHECK
========================================================= */

if (
    sessionStorage.getItem("officerLoggedIn") !== "true"
) {
    window.location.href =
        "officer-login.html";
}


/* =========================================================
   OFFICER INFORMATION
========================================================= */

const officerId =
    sessionStorage.getItem("officerId") ||
    "";

const officerName =
    sessionStorage.getItem("officerName") ||
    "Officer";


/* =========================================================
   ELEMENTS
========================================================= */

const meetingSelect =
    document.getElementById("meetingSelect");

const startScannerButton =
    document.getElementById(
        "startScannerButton"
    );

const stopScannerButton =
    document.getElementById(
        "stopScannerButton"
    );

const qrScannerContainer =
    document.getElementById("qrScanner");

const scanResult =
    document.getElementById("scanResult");

const scannedStudentName =
    document.getElementById(
        "scannedStudentName"
    );

const scannedStudentId =
    document.getElementById(
        "scannedStudentId"
    );

const scannedStudentUniqueId =
    document.getElementById(
        "scannedStudentUniqueId"
    );

const confirmAttendanceButton =
    document.getElementById(
        "confirmAttendanceButton"
    );

const manualUniqueId =
    document.getElementById(
        "manualUniqueId"
    );

const manualUniqueIdButton =
    document.getElementById(
        "manualUniqueIdButton"
    );

const manualUniqueIdMessage =
    document.getElementById(
        "manualUniqueIdMessage"
    );

const attendanceTable =
    document.getElementById(
        "attendanceTable"
    );

const emptyAttendance =
    document.getElementById(
        "emptyAttendance"
    );

const totalMembers =
    document.getElementById(
        "totalMembers"
    );

const presentMembers =
    document.getElementById(
        "presentMembers"
    );

const attendanceRate =
    document.getElementById(
        "attendanceRate"
    );

const selectedMeetingText =
    document.getElementById(
        "selectedMeetingText"
    );

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

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

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


/* =========================================================
   VARIABLES
========================================================= */

let dominexusQRScanner =
    null;

let qrScannerRunning =
    false;

let currentScannedStudent =
    null;

let processingScan =
    false;


/* =========================================================
   DISPLAY OFFICER
========================================================= */

if (topOfficerName) {

    topOfficerName.textContent =
        officerName;

}

if (topOfficerId) {

    topOfficerId.textContent =
        officerId || "Officer ID";

}

if (topAvatar) {

    topAvatar.textContent =
        getInitials(
            officerName
        );

}


/* =========================================================
   LOAD MEETINGS
========================================================= */

async function loadMeetings() {

    if (!meetingSelect) {
        return;
    }


    meetingSelect.innerHTML = `
        <option value="">
            Loading meetings...
        </option>
    `;


    try {

        if (!officerId) {

            throw new Error(
                "Officer ID is missing."
            );

        }


        /*
         * IMPORTANT:
         *
         * Include officer_id so Laravel
         * only returns meetings belonging
         * to this officer's organization.
         */

        const response =
            await fetch(
                `${API_BASE}/meetings?officer_id=${encodeURIComponent(
                    officerId
                )}`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(
                        () => ({})
                    );

            throw new Error(
                errorData.message ||
                `Failed to load meetings (${response.status})`
            );

        }


        const data =
            await response.json();


        console.log(
            "DOMINEXUS meetings:",
            data
        );


        const meetings =
            Array.isArray(data)
                ? data
                : data.meetings ||
                  data.data ||
                  [];


        meetingSelect.innerHTML = `
            <option value="">
                Select a meeting
            </option>
        `;


        meetings.forEach(
            function(meeting) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    meeting.id;


                option.textContent =
                    meeting.title ||
                    meeting.name ||
                    meeting.meeting_name ||
                    `Meeting #${meeting.id}`;


                meetingSelect.appendChild(
                    option
                );

            }
        );


        if (
            meetings.length === 0
        ) {

            meetingSelect.innerHTML = `
                <option value="">
                    No meetings available
                </option>
            `;

        }


    } catch (error) {

        console.error(
            "Meeting loading error:",
            error
        );


        meetingSelect.innerHTML = `
            <option value="">
                Unable to load meetings
            </option>
        `;

    }

}


/* =========================================================
   MEETING CHANGE
========================================================= */

if (meetingSelect) {

    meetingSelect.addEventListener(
        "change",
        async function() {

            currentScannedStudent =
                null;

            processingScan =
                false;


            if (scanResult) {

                scanResult.style.display =
                    "none";

            }


            if (
                confirmAttendanceButton
            ) {

                confirmAttendanceButton.disabled =
                    true;

            }


            const selectedOption =
                meetingSelect.options[
                    meetingSelect.selectedIndex
                ];


            if (
                !meetingSelect.value
            ) {

                if (
                    selectedMeetingText
                ) {

                    selectedMeetingText.textContent =
                        "Select a meeting to view attendance.";

                }


                clearAttendanceTable();

                return;

            }


            if (
                selectedMeetingText
            ) {

                selectedMeetingText.textContent =
                    `Attendance for ${selectedOption.textContent}`;

            }


            await loadAttendance(
                meetingSelect.value
            );

        }
    );

}


/* =========================================================
   FIND STUDENT FROM LARAVEL
========================================================= */

async function findStudent(
    uniqueId
) {

    const cleanedId =
        String(
            uniqueId || ""
        ).trim();


    if (!cleanedId) {

        throw new Error(
            "Student Unique ID is empty."
        );

    }


    console.log(
        "Looking up student:",
        cleanedId
    );


    const response =
        await fetch(
            `${API_BASE}/students/${encodeURIComponent(cleanedId)}`,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    let data = {};


    try {

        data =
            await response.json();

    } catch (error) {

        console.warn(
            "Response was not JSON."
        );

    }


    console.log(
        "Student API response:",
        data
    );


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Student was not found."
        );

    }


    return (
        data.student ||
        data.data ||
        data
    );

}


/* =========================================================
   SHOW STUDENT
========================================================= */

function showStudent(
    student,
    scannedValue
) {

    currentScannedStudent =
        student;


    if (scannedStudentName) {

        scannedStudentName.textContent =
            student.name ||
            student.full_name ||
            student.fullName ||
            "Student";

    }


    if (scannedStudentId) {

        scannedStudentId.textContent =
            student.student_id ||
            student.studentId ||
            "--";

    }


    if (scannedStudentUniqueId) {

        scannedStudentUniqueId.textContent =
            student.unique_id ||
            student.uniqueId ||
            scannedValue;

    }


    if (scanResult) {

        scanResult.style.display =
            "block";

    }


    if (
        confirmAttendanceButton
    ) {

        confirmAttendanceButton.disabled =
            false;

    }

}


/* =========================================================
   HANDLE QR SCAN
========================================================= */

async function handleScannedStudent(
    decodedText
) {

    const scannedValue =
        String(
            decodedText || ""
        ).trim();


    if (!scannedValue) {

        processingScan =
            false;

        return;

    }


    console.log(
        "DOMINEXUS QR DETECTED:",
        scannedValue
    );


    const status =
        document.getElementById(
            "qrScannerStatus"
        );


    if (status) {

        status.textContent =
            "QR detected. Finding student...";

    }


    try {

        const student =
            await findStudent(
                scannedValue
            );


        console.log(
            "STUDENT FOUND:",
            student
        );


        showStudent(
            student,
            scannedValue
        );


        if (status) {

            status.textContent =
                "Student found. Please mark attendance.";

        }


    } catch (error) {

        console.error(
            "Student lookup failed:",
            error
        );


        currentScannedStudent =
            null;


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


        if (
            confirmAttendanceButton
        ) {

            confirmAttendanceButton.disabled =
                true;

        }


        if (status) {

            status.textContent =
                "Student was not found.";

        }


        processingScan =
            false;

    }

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


    if (
        !meetingSelect ||
        !meetingSelect.value
    ) {

        return;

    }


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        console.error(
            "Html5Qrcode library is not loaded."
        );

        return;

    }


    if (!qrScannerContainer) {

        console.error(
            "QR scanner container not found."
        );

        return;

    }


    currentScannedStudent =
        null;

    processingScan =
        false;


    if (scanResult) {

        scanResult.style.display =
            "none";

    }


    if (
        confirmAttendanceButton
    ) {

        confirmAttendanceButton.disabled =
            true;

    }


    qrScannerContainer.innerHTML = `

        <div
            id="dominexus-qr-reader"
            class="dominexus-qr-reader">
        </div>

        <div class="qr-scan-overlay">

            <div class="qr-scan-frame">

                <span
                    class="qr-corner top-left">
                </span>

                <span
                    class="qr-corner top-right">
                </span>

                <span
                    class="qr-corner bottom-left">
                </span>

                <span
                    class="qr-corner bottom-right">
                </span>

                <span
                    class="qr-scan-line">
                </span>

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


    dominexusQRScanner =
        new Html5Qrcode(
            "dominexus-qr-reader"
        );


    try {

        const cameras =
            await Html5Qrcode.getCameras();


        console.log(
            "DOMINEXUS CAMERA LIST:",
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


        let selectedCamera =
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


        if (!selectedCamera) {

            selectedCamera =
                cameras[0];

        }


        console.log(
            "DOMINEXUS CAMERA:",
            selectedCamera
        );


        const scanConfig = {

            fps: 15,

            qrbox: {
                width: 300,
                height: 300
            },

            aspectRatio: 1,

            disableFlip: false

        };


        await dominexusQRScanner.start(

            selectedCamera.id,

            scanConfig,


            function(
                decodedText,
                decodedResult
            ) {

                console.log(
                    "QR RAW RESULT:",
                    decodedText,
                    decodedResult
                );


                const value =
                    String(
                        decodedText || ""
                    ).trim();


                if (!value) {

                    return;

                }


                if (
                    processingScan
                ) {

                    return;

                }


                console.log(
                    "DOMINEXUS QR DETECTED:",
                    value
                );


                processingScan =
                    true;


                handleScannedStudent(
                    value
                );

            },


            function(errorMessage) {

                /*
                 * Normal no-QR frames are ignored.
                 */

            }

        );


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
            "DOMINEXUS: Scanner started successfully."
        );


    } catch (error) {

        console.error(
            "DOMINEXUS: Scanner failed to start.",
            error
        );


        await stopQRScanner();

    }

}


/* =========================================================
   STOP QR SCANNER
========================================================= */

async function stopQRScanner() {

    console.log(
        "DOMINEXUS: Stopping QR scanner."
    );


    if (dominexusQRScanner) {

        try {

            if (
                qrScannerRunning
            ) {

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
   LOAD ATTENDANCE
========================================================= */

async function loadAttendance(
    meetingId
) {

    if (!meetingId) {

        clearAttendanceTable();

        return;

    }


    try {

        /*
         * IMPORTANT:
         *
         * officer_id is included so the
         * backend verifies that this meeting
         * belongs to the officer's organization.
         */

        const response =
            await fetch(
                `${API_BASE}/attendances?meeting_id=${encodeURIComponent(
                    meetingId
                )}&officer_id=${encodeURIComponent(
                    officerId
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
            "DOMINEXUS attendance:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load attendance."
            );

        }


        const attendance =
            Array.isArray(data)
                ? data
                : data.attendance ||
                  data.data ||
                  [];


        displayAttendance(
            attendance
        );


    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );


        clearAttendanceTable();

    }

}


/* =========================================================
   DISPLAY ATTENDANCE
========================================================= */

function displayAttendance(
    attendance
) {

    if (!attendanceTable) {

        return;

    }


    attendanceTable.innerHTML =
        "";


    if (
        !attendance ||
        attendance.length === 0
    ) {

        if (emptyAttendance) {

            emptyAttendance.style.display =
                "block";

        }


        updateStatistics(
            attendance
        );

        return;

    }


    if (emptyAttendance) {

        emptyAttendance.style.display =
            "none";

    }


    attendance.forEach(
        function(record) {

            const row =
                document.createElement(
                    "tr"
                );


            const student =
                record.student ||
                {};


            const name =
                student.name ||
                student.full_name ||
                "Unknown Student";


            const studentId =
                student.student_id ||
                "--";


            const status =
                record.status ||
                "present";


            const scannedAt =
                record.scanned_at ||
                "--";


            const remarks =
                record.officer_remarks ||
                "—";


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        name
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        studentId
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        capitalize(status)
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        formatDateTime(
                            scannedAt
                        )
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        remarks
                    )}
                </td>

            `;


            attendanceTable.appendChild(
                row
            );

        }
    );


    updateStatistics(
        attendance
    );

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics(
    attendance
) {

    const records =
        Array.isArray(attendance)
            ? attendance
            : [];


    const total =
        records.length;


    const present =
        records.filter(
            function(record) {

                return (
                    record.status ===
                    "present" ||

                    record.status ===
                    "late"
                );

            }
        ).length;


    const rate =
        total > 0
            ? Math.round(
                (
                    present /
                    total
                ) * 100
            )
            : 0;


    /*
     * Total members for this meeting
     * is not returned by the attendance
     * endpoint yet.
     */

    if (totalMembers) {

        totalMembers.textContent =
            "—";

    }


    if (presentMembers) {

        presentMembers.textContent =
            present;

    }


    if (attendanceRate) {

        attendanceRate.textContent =
            rate + "%";

    }

}


/* =========================================================
   CLEAR ATTENDANCE TABLE
========================================================= */

function clearAttendanceTable() {

    if (attendanceTable) {

        attendanceTable.innerHTML =
            "";

    }


    if (emptyAttendance) {

        emptyAttendance.style.display =
            "block";

    }


    if (totalMembers) {

        totalMembers.textContent =
            "—";

    }


    if (presentMembers) {

        presentMembers.textContent =
            "0";

    }


    if (attendanceRate) {

        attendanceRate.textContent =
            "0%";

    }

}


/* =========================================================
   CONFIRM / MARK PRESENT
========================================================= */

async function confirmStudentAttendance() {

    if (
        !currentScannedStudent
    ) {

        return;

    }


    if (
        !meetingSelect ||
        !meetingSelect.value
    ) {

        return;

    }


    const student =
        currentScannedStudent;


    const meetingId =
        meetingSelect.value;


    const studentId =
        student.student_id ||
        student.studentId;


    if (!studentId) {

        return;

    }


    if (
        confirmAttendanceButton
    ) {

        confirmAttendanceButton.disabled =
            true;

        confirmAttendanceButton.textContent =
            "Saving...";

    }


    try {

        console.log(
            "Sending attendance:",
            {
                meeting_id:
                    meetingId,

                student_id:
                    studentId,

                status:
                    "present"
            }
        );


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
                                meetingId,

                            student_id:
                                studentId,

                            status:
                                "present"

                        })

                }
            );


        let data = {};


        try {

            data =
                await response.json();

        } catch (error) {

            console.warn(
                "Attendance response was not JSON."
            );

        }


        console.log(
            "Attendance API response:",
            data
        );


        if (
            response.status === 201 ||
            response.status === 409
        ) {

            currentScannedStudent =
                null;


            if (scanResult) {

                scanResult.style.display =
                    "none";

            }


            if (
                confirmAttendanceButton
            ) {

                confirmAttendanceButton.textContent =
                    "Mark Present";

                confirmAttendanceButton.disabled =
                    true;

            }


            /*
             * Scanner stays running.
             */

            processingScan =
                false;


            const status =
                document.getElementById(
                    "qrScannerStatus"
                );


            if (status) {

                status.textContent =
                    "Scanning for QR code...";

            }


            await loadAttendance(
                meetingId
            );


            return;

        }


        throw new Error(
            data.message ||
            "Unable to record attendance."
        );


    } catch (error) {

        console.error(
            "Attendance recording error:",
            error
        );


        if (
            confirmAttendanceButton
        ) {

            confirmAttendanceButton.disabled =
                false;

            confirmAttendanceButton.textContent =
                "Mark Present";

        }


        processingScan =
            false;

    }

}


/* =========================================================
   MANUAL UNIQUE ID SEARCH
========================================================= */

async function manualFindStudent() {

    const value =
        manualUniqueId
            ? manualUniqueId.value.trim()
            : "";


    if (!value) {

        if (manualUniqueIdMessage) {

            manualUniqueIdMessage.textContent =
                "Please enter the student's Unique ID.";

        }

        return;

    }


    if (
        !meetingSelect ||
        !meetingSelect.value
    ) {

        if (manualUniqueIdMessage) {

            manualUniqueIdMessage.textContent =
                "Please select a meeting first.";

        }

        return;

    }


    if (
        manualUniqueIdButton
    ) {

        manualUniqueIdButton.disabled =
            true;

    }


    if (
        manualUniqueIdMessage
    ) {

        manualUniqueIdMessage.textContent =
            "Finding student...";

    }


    try {

        const student =
            await findStudent(
                value
            );


        showStudent(
            student,
            value
        );


        if (
            manualUniqueIdMessage
        ) {

            manualUniqueIdMessage.textContent =
                "Student found. Please mark attendance.";

        }

    } catch (error) {

        console.error(
            "Manual student lookup error:",
            error
        );


        if (
            manualUniqueIdMessage
        ) {

            manualUniqueIdMessage.textContent =
                error.message ||
                "Student not found.";

        }

    } finally {

        if (
            manualUniqueIdButton
        ) {

            manualUniqueIdButton.disabled =
                false;

        }

    }

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

if (startScannerButton) {

    startScannerButton.addEventListener(
        "click",
        startQRScanner
    );

}


if (stopScannerButton) {

    stopScannerButton.addEventListener(
        "click",
        stopQRScanner
    );

}


if (
    confirmAttendanceButton
) {

    confirmAttendanceButton.addEventListener(
        "click",
        confirmStudentAttendance
    );

}


if (
    manualUniqueIdButton
) {

    manualUniqueIdButton.addEventListener(
        "click",
        manualFindStudent
    );

}


/* =========================================================
   ENTER KEY FOR MANUAL SEARCH
========================================================= */

if (manualUniqueId) {

    manualUniqueId.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                manualFindStudent();

            }

        }
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

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
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function(link) {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );

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
   HELPERS
========================================================= */

function formatDateTime(
    value
) {

    if (!value) {
        return "--";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    const text =
        String(value);


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function getInitials(
    name
) {

    if (!name) {
        return "OF";
    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (
        parts.length === 1
    ) {

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


function escapeHTML(
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


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        if (
            dominexusQRScanner
        ) {

            try {

                dominexusQRScanner.stop();

            } catch (error) {

                console.log(
                    error
                );

            }

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

loadMeetings();