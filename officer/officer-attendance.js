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
    sessionStorage.getItem(
        "officerLoggedIn"
    ) !== "true"
) {

    window.location.href =
        "officer-login.html";

}


/* =========================================================
   OFFICER SESSION
========================================================= */

const officerId =
    sessionStorage.getItem(
        "officerId"
    );

const officerName =
    sessionStorage.getItem(
        "officerName"
    ) || "Officer";


if (!officerId) {

    alert(
        "Officer session expired. Please log in again."
    );

    sessionStorage.clear();

    window.location.href =
        "officer-login.html";

}


/* =========================================================
   ELEMENTS
========================================================= */

const meetingSelect =
    document.getElementById(
        "meetingSelect"
    );

const startScannerButton =
    document.getElementById(
        "startScannerButton"
    );

const stopScannerButton =
    document.getElementById(
        "stopScannerButton"
    );

const qrScannerContainer =
    document.getElementById(
        "qrScanner"
    );

const scanResult =
    document.getElementById(
        "scanResult"
    );

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

const selectedMeetingText =
    document.getElementById(
        "selectedMeetingText"
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

let dominexusQRScanner = null;

let qrScannerRunning = false;

let currentScannedStudent = null;

let processingScan = false;

let currentAttendance = [];


/* =========================================================
   DISPLAY OFFICER
========================================================= */

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

        const response =
            await fetch(
                `${API_BASE}/meetings?officer_id=${encodeURIComponent(officerId)}`,
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
            "Officer meetings:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load meetings."
            );

        }


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
            function (meeting) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    meeting.id;


                option.textContent =
                    meeting.title ||
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


        alert(
            "Unable to load meetings.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   MEETING SELECTED
========================================================= */

meetingSelect.addEventListener(
    "change",
    async function () {

        const meetingId =
            meetingSelect.value;


        currentScannedStudent =
            null;


        if (scanResult) {

            scanResult.style.display =
                "none";

        }


        if (!meetingId) {

            selectedMeetingText.textContent =
                "Select a meeting to view attendance.";


            clearAttendanceTable();

            return;

        }


        const selectedOption =
            meetingSelect.options[
                meetingSelect.selectedIndex
            ];


        selectedMeetingText.textContent =
            `Attendance for ${selectedOption.textContent}`;


        await loadAttendance(
            meetingId
        );

    }
);


/* =========================================================
   LOAD ATTENDANCE
========================================================= */

async function loadAttendance(
    meetingId
) {

    try {

        if (attendanceTable) {

            attendanceTable.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        style="text-align:center;padding:30px;"
                    >
                        Loading attendance...
                    </td>

                </tr>

            `;

        }


        const response =
            await fetch(
                `${API_BASE}/attendances?meeting_id=${encodeURIComponent(meetingId)}`,
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
            "Attendance records:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load attendance."
            );

        }


        currentAttendance =
            Array.isArray(data)
                ? data
                : data.attendance ||
                  data.data ||
                  [];


        displayAttendance(
            currentAttendance
        );


    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );


        currentAttendance = [];


        clearAttendanceTable();


        if (emptyAttendance) {

            emptyAttendance.style.display =
                "block";

            emptyAttendance.innerHTML = `

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    Unable to load attendance
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            `;

        }

    }

}


/* =========================================================
   DISPLAY ATTENDANCE
========================================================= */

function displayAttendance(
    records
) {

    if (!attendanceTable) {
        return;
    }


    attendanceTable.innerHTML =
        "";


    if (
        !records ||
        records.length === 0
    ) {

        if (emptyAttendance) {

            emptyAttendance.style.display =
                "block";

        }


        updateAttendanceSummary(
            records
        );

        return;

    }


    if (emptyAttendance) {

        emptyAttendance.style.display =
            "none";

    }


    records.forEach(
        function (record) {

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


            const timeIn =
                record.scanned_at ||
                "--";


            const remarks =
                record.officer_remarks ||
                "—";


            row.innerHTML = `

                <td>
                    ${escapeHTML(name)}
                </td>

                <td>
                    ${escapeHTML(studentId)}
                </td>

                <td>

                    <span class="attendance-status">

                        ${escapeHTML(
                            capitalize(
                                status
                            )
                        )}

                    </span>

                </td>

                <td>
                    ${escapeHTML(
                        formatDateTime(
                            timeIn
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


    updateAttendanceSummary(
        records
    );

}


/* =========================================================
   ATTENDANCE SUMMARY
========================================================= */

function updateAttendanceSummary(
    records
) {

    const total =
        records.length;


    const present =
        records.filter(
            function (record) {

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
     * We currently don't have an API endpoint
     * that returns ALL organization members.
     *
     * Therefore we don't pretend that the
     * attendance-record count is the member count.
     *
     * Total Members will remain 0 until we add
     * the Officer Members endpoint.
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
   FIND STUDENT
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
            "Student response was not JSON."
        );

    }


    console.log(
        "Student lookup:",
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
            "Student";

    }


    if (scannedStudentId) {

        scannedStudentId.textContent =
            student.student_id ||
            "--";

    }


    if (scannedStudentUniqueId) {

        scannedStudentUniqueId.textContent =
            student.unique_id ||
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
        "QR DETECTED:",
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


        showStudent(
            student,
            scannedValue
        );


        if (status) {

            status.textContent =
                "Student found. Please confirm attendance.";

        }


        await stopQRScanner();


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


        if (confirmAttendanceButton) {

            confirmAttendanceButton.disabled =
                true;

        }


        if (status) {

            status.textContent =
                "Student was not found.";

        }


        alert(
            error.message ||
            "Student was not found."
        );

    }


    processingScan =
        false;

}


/* =========================================================
   START QR SCANNER
========================================================= */

async function startQRScanner() {

    if (qrScannerRunning) {
        return;
    }


    if (
        !meetingSelect ||
        !meetingSelect.value
    ) {

        alert(
            "Please select a meeting first."
        );

        return;

    }


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        alert(
            "QR Scanner library is not loaded."
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


    if (confirmAttendanceButton) {

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


    dominexusQRScanner =
        new Html5Qrcode(
            "dominexus-qr-reader"
        );


    try {

        const cameras =
            await Html5Qrcode.getCameras();


        console.log(
            "Available cameras:",
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
                function (camera) {

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


        await dominexusQRScanner.start(

            selectedCamera.id,

            {
                fps: 10,

                qrbox: {
                    width: 280,
                    height: 280
                },

                aspectRatio: 1,

                disableFlip: false,

                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE
                ]

            },

            function (decodedText) {

                if (
                    processingScan
                ) {

                    return;

                }


                processingScan =
                    true;


                handleScannedStudent(
                    decodedText
                );

            },

            function () {

                /*
                 * Ignore continuous
                 * scanner errors.
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


        startScannerButton.disabled =
            true;


        stopScannerButton.style.display =
            "inline-flex";


    } catch (error) {

        console.error(
            "QR scanner error:",
            error
        );


        alert(
            "Unable to start the QR scanner.\n\n" +
            error.message
        );


        await stopQRScanner();

    }

}


/* =========================================================
   STOP QR SCANNER
========================================================= */

async function stopQRScanner() {

    if (dominexusQRScanner) {

        try {

            if (qrScannerRunning) {

                await dominexusQRScanner.stop();

            }

        } catch (error) {

            console.warn(
                "Scanner stop:",
                error
            );

        }


        try {

            await dominexusQRScanner.clear();

        } catch (error) {

            console.warn(
                "Scanner clear:",
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

        stopScannerButton.style.display =
            "none";

    }

}


/* =========================================================
   CONFIRM ATTENDANCE
========================================================= */

async function confirmStudentAttendance() {

    if (
        !currentScannedStudent
    ) {

        alert(
            "Please scan a student QR code first."
        );

        return;

    }


    if (
        !meetingSelect ||
        !meetingSelect.value
    ) {

        alert(
            "Please select a meeting first."
        );

        return;

    }


    const student =
        currentScannedStudent;


    const meetingId =
        meetingSelect.value;


    const studentId =
        student.student_id;


    if (!studentId) {

        alert(
            "This student does not have a Student ID."
        );

        return;

    }


    confirmAttendanceButton.disabled =
        true;


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
                                meetingId,

                            student_id:
                                studentId,

                            status:
                                "present"

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "Attendance response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to record attendance."
            );

        }


        alert(
            "Attendance recorded successfully for " +
            (
                student.name ||
                "student"
            ) +
            "."
        );


        currentScannedStudent =
            null;


        if (scanResult) {

            scanResult.style.display =
                "none";

        }


        await loadAttendance(
            meetingId
        );


    } catch (error) {

        console.error(
            "Attendance error:",
            error
        );


        alert(
            error.message ||
            "Unable to record attendance."
        );


        confirmAttendanceButton.disabled =
            false;

    }

}


/* =========================================================
   MANUAL UNIQUE ID
========================================================= */

async function manualFindStudent() {

    const value =
        manualUniqueId
            ? manualUniqueId.value.trim()
            : "";


    if (!value) {

        alert(
            "Please enter the student's Unique ID."
        );

        return;

    }


    if (
        !meetingSelect ||
        !meetingSelect.value
    ) {

        alert(
            "Please select a meeting first."
        );

        return;

    }


    manualUniqueIdButton.disabled =
        true;


    manualUniqueIdMessage.textContent =
        "Finding student...";


    try {

        const student =
            await findStudent(
                value
            );


        showStudent(
            student,
            value
        );


        manualUniqueIdMessage.textContent =
            "Student found. Please confirm attendance.";


    } catch (error) {

        console.error(
            error
        );


        manualUniqueIdMessage.textContent =
            error.message ||
            "Student not found.";

    } finally {

        manualUniqueIdButton.disabled =
            false;

    }

}


/* =========================================================
   CLEAR TABLE
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
   FORMAT DATE/TIME
========================================================= */

function formatDateTime(
    value
) {

    if (!value) {
        return "--";
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


/* =========================================================
   CAPITALIZE
========================================================= */

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


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    if (!name) {
        return "OF";
    }


    const parts =
        name
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


/* =========================================================
   ESCAPE HTML
========================================================= */

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
   LOGOUT
========================================================= */

if (logoutButton) {

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


            sessionStorage.clear();


            window.location.href =
                "officer-login.html";

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
        function () {

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
   BUTTONS
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


if (confirmAttendanceButton) {

    confirmAttendanceButton.addEventListener(
        "click",
        confirmStudentAttendance
    );

}


if (manualUniqueIdButton) {

    manualUniqueIdButton.addEventListener(
        "click",
        manualFindStudent
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

loadMeetings();