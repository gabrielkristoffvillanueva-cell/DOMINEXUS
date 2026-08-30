/* =========================================================
   DOMINEXUS — STUDENT QR CODE
========================================================= */

const API_BASE =
    "http://127.0.0.1:8000/api";


/* =========================================================
   ELEMENTS
========================================================= */

const qrContainer =
    document.getElementById("qrCode");

const downloadButton =
    document.getElementById("downloadQrButton");

const printButton =
    document.getElementById("printQrButton");

const studentNameElement =
    document.getElementById("studentName");

const studentIdElement =
    document.getElementById("studentId");

const uniqueIdElement =
    document.getElementById("uniqueId");

const topStudentName =
    document.getElementById("topStudentName");

const topStudentId =
    document.getElementById("topStudentId");

const topAvatar =
    document.getElementById("topAvatar");

const logoutButton =
    document.getElementById("logoutButton");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* =========================================================
   STUDENT DATA
========================================================= */

let currentStudent = null;


/* =========================================================
   GET VALUE FROM SESSION STORAGE
========================================================= */

function getSessionValue(keys) {

    for (const key of keys) {

        const value =
            sessionStorage.getItem(key);

        if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) {

            return String(value).trim();

        }

    }

    return "";

}


/* =========================================================
   GET STORED USER OBJECT
========================================================= */

function getStoredUser() {

    const possibleKeys = [
        "user",
        "student",
        "currentUser",
        "loggedInUser"
    ];


    for (const key of possibleKeys) {

        const stored =
            sessionStorage.getItem(key);

        if (!stored) {
            continue;
        }


        try {

            const parsed =
                JSON.parse(stored);


            if (
                parsed &&
                typeof parsed === "object"
            ) {

                return parsed;

            }

        } catch (error) {

            console.warn(
                `Could not parse session key: ${key}`
            );

        }

    }


    return null;

}


/* =========================================================
   LOAD STUDENT
========================================================= */

async function loadStudent() {

    const storedUser =
        getStoredUser();


    /*
     * Try to get the Student ID from
     * the stored user object first.
     */

    let studentId =
        storedUser?.student_id ||
        storedUser?.studentId ||
        "";


    /*
     * If not found, check individual
     * sessionStorage values.
     */

    if (!studentId) {

        studentId =
            getSessionValue([
                "studentId",
                "student_id",
                "studentID",
                "loggedInStudentId"
            ]);

    }


    /*
     * Get stored name as fallback.
     */

    const storedName =
        storedUser?.name ||
        storedUser?.full_name ||
        storedUser?.fullName ||
        getSessionValue([
            "studentName",
            "student_name",
            "name"
        ]);


    /*
     * Get stored Unique ID if available.
     */

    let storedUniqueId =
        storedUser?.unique_id ||
        storedUser?.uniqueId ||
        "";


    if (!storedUniqueId) {

        storedUniqueId =
            getSessionValue([
                "uniqueId",
                "unique_id",
                "studentUniqueId",
                "student_unique_id"
            ]);

    }


    console.log(
        "DOMINEXUS stored student data:",
        {
            studentId,
            storedName,
            storedUniqueId
        }
    );


    /*
     * If we have a Student ID, use Laravel
     * to retrieve the official database record.
     */

    if (studentId) {

        try {

            const response =
                await fetch(
                    `${API_BASE}/students/by-student-id/${encodeURIComponent(studentId)}`,
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
                "DOMINEXUS student API:",
                data
            );


            if (response.ok) {

                const student =
                    data.student ||
                    data.data ||
                    data;


                if (student) {

                    currentStudent =
                        student;

                    return student;

                }

            }


            console.warn(
                "Student API did not return a student."
            );


        } catch (error) {

            console.error(
                "Student API error:",
                error
            );

        }

    }


    /*
     * Fallback if API lookup isn't available.
     */

    if (
        storedName ||
        studentId ||
        storedUniqueId
    ) {

        currentStudent = {

            name:
                storedName,

            student_id:
                studentId,

            unique_id:
                storedUniqueId

        };


        return currentStudent;

    }


    return null;

}


/* =========================================================
   DISPLAY STUDENT
========================================================= */

function displayStudent(student) {

    if (!student) {

        showStudentNotFound();

        return;

    }


    const name =
        student.name ||
        student.full_name ||
        student.fullName ||
        "Student";


    const studentId =
        student.student_id ||
        student.studentId ||
        "---";


    const uniqueId =
        student.unique_id ||
        student.uniqueId ||
        "";


    console.log(
        "DOMINEXUS official student:",
        {
            name,
            studentId,
            uniqueId
        }
    );


    /*
     * Main student information.
     */

    if (studentNameElement) {

        studentNameElement.textContent =
            name;

    }


    if (studentIdElement) {

        studentIdElement.textContent =
            studentId;

    }


    if (uniqueIdElement) {

        uniqueIdElement.textContent =
            uniqueId || "---";

    }


    /*
     * Topbar.
     */

    if (topStudentName) {

        topStudentName.textContent =
            name;

    }


    if (topStudentId) {

        topStudentId.textContent =
            `ID: ${studentId}`;

    }


    if (topAvatar) {

        topAvatar.textContent =
            getInitials(name);

    }

}


/* =========================================================
   STUDENT NOT FOUND
========================================================= */

function showStudentNotFound() {

    if (qrContainer) {

        qrContainer.innerHTML = `

            <div style="
                color:#b00000;
                font-size:14px;
                text-align:center;
                padding:30px;
            ">
                Student information not found.
            </div>

        `;

    }


    if (studentNameElement) {

        studentNameElement.textContent =
            "Student";

    }


    if (studentIdElement) {

        studentIdElement.textContent =
            "---";

    }


    if (uniqueIdElement) {

        uniqueIdElement.textContent =
            "---";

    }

}


/* =========================================================
   GENERATE DISPLAY QR
========================================================= */

function generateDisplayQR() {

    if (!qrContainer) {

        console.error(
            "QR container not found."
        );

        return;

    }


    if (
        !currentStudent
    ) {

        showStudentNotFound();

        return;

    }


    const uniqueId =
        currentStudent.unique_id ||
        currentStudent.uniqueId ||
        "";


    if (!uniqueId) {

        qrContainer.innerHTML = `

            <div style="
                color:#b00000;
                font-size:14px;
                text-align:center;
                padding:30px;
            ">
                Student Unique ID not found.
            </div>

        `;

        return;

    }


    /*
     * Clear old QR.
     */

    qrContainer.innerHTML =
        "";


    /*
     * Generate ONE QR.
     */

    new QRCode(
        qrContainer,
        {

            text:
                uniqueId,

            width:
                300,

            height:
                300,

            colorDark:
                "#000000",

            colorLight:
                "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.H

        }
    );


    console.log(
        "DOMINEXUS QR generated:",
        uniqueId
    );

}


/* =========================================================
   CREATE DOWNLOAD IMAGE
========================================================= */

async function createDownloadCanvas() {

    if (!currentStudent) {

        throw new Error(
            "Student information is unavailable."
        );

    }


    const name =
        currentStudent.name ||
        currentStudent.full_name ||
        currentStudent.fullName ||
        "Student";


    const studentId =
        currentStudent.student_id ||
        currentStudent.studentId ||
        "---";


    const uniqueId =
        currentStudent.unique_id ||
        currentStudent.uniqueId ||
        "";


    if (!uniqueId) {

        throw new Error(
            "Student Unique ID is missing."
        );

    }


    /*
     * Final image size.
     */

    const width =
        1000;

    const height =
        1200;


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        width;

    canvas.height =
        height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    /*
     * White background.
     */

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
     * Create temporary high-resolution QR.
     */

    const qrWrapper =
        document.createElement(
            "div"
        );


    qrWrapper.style.position =
        "fixed";

    qrWrapper.style.left =
        "-10000px";

    qrWrapper.style.top =
        "-10000px";

    qrWrapper.style.width =
        "800px";

    qrWrapper.style.height =
        "800px";

    qrWrapper.style.background =
        "#ffffff";


    document.body.appendChild(
        qrWrapper
    );


    try {

        new QRCode(
            qrWrapper,
            {

                text:
                    uniqueId,

                width:
                    800,

                height:
                    800,

                colorDark:
                    "#000000",

                colorLight:
                    "#ffffff",

                correctLevel:
                    QRCode.CorrectLevel.H

            }
        );


        /*
         * Wait for QRCode.js.
         */

        await new Promise(
            function(resolve) {

                setTimeout(
                    resolve,
                    300
                );

            }
        );


        const qrCanvas =
            qrWrapper.querySelector(
                "canvas"
            );


        const qrImage =
            qrWrapper.querySelector(
                "img"
            );


        /*
         * Draw QR.
         */

        ctx.imageSmoothingEnabled =
            false;


        if (qrCanvas) {

            ctx.drawImage(
                qrCanvas,
                100,
                80,
                800,
                800
            );

        } else if (qrImage) {

            if (!qrImage.complete) {

                await new Promise(
                    function(resolve) {

                        qrImage.onload =
                            resolve;

                        qrImage.onerror =
                            resolve;

                    }
                );

            }


            ctx.drawImage(
                qrImage,
                100,
                80,
                800,
                800
            );

        } else {

            throw new Error(
                "QR canvas was not generated."
            );

        }


        /*
         * Student name.
         */

        ctx.textAlign =
            "center";

        ctx.fillStyle =
            "#222222";

        ctx.font =
            "bold 32px Arial";


        ctx.fillText(
            name,
            width / 2,
            950
        );


        /*
         * Student ID.
         */

        ctx.font =
            "20px Arial";

        ctx.fillStyle =
            "#777777";


        const studentLabel =
            "Student ID: ";


        ctx.font =
            "20px Arial";


        const studentLabelWidth =
            ctx.measureText(
                studentLabel
            ).width;


        ctx.font =
            "bold 20px Arial";


        const studentValueWidth =
            ctx.measureText(
                studentId
            ).width;


        const studentStart =
            (
                width -
                (
                    studentLabelWidth +
                    studentValueWidth
                )
            ) / 2;


        ctx.textAlign =
            "left";


        ctx.font =
            "20px Arial";

        ctx.fillStyle =
            "#777777";


        ctx.fillText(
            studentLabel,
            studentStart,
            1000
        );


        ctx.font =
            "bold 20px Arial";

        ctx.fillStyle =
            "#333333";


        ctx.fillText(
            studentId,
            studentStart +
            studentLabelWidth,
            1000
        );


        /*
         * Unique ID.
         */

        const uniqueLabel =
            "Unique ID: ";


        ctx.font =
            "20px Arial";


        const uniqueLabelWidth =
            ctx.measureText(
                uniqueLabel
            ).width;


        ctx.font =
            "bold 20px Arial";


        const uniqueValueWidth =
            ctx.measureText(
                uniqueId
            ).width;


        const uniqueStart =
            (
                width -
                (
                    uniqueLabelWidth +
                    uniqueValueWidth
                )
            ) / 2;


        ctx.font =
            "20px Arial";

        ctx.fillStyle =
            "#777777";


        ctx.fillText(
            uniqueLabel,
            uniqueStart,
            1045
        );


        ctx.font =
            "bold 20px Arial";

        ctx.fillStyle =
            "#333333";


        ctx.fillText(
            uniqueId,
            uniqueStart +
            uniqueLabelWidth,
            1045
        );


        return canvas;


    } finally {

        qrWrapper.remove();

    }

}


/* =========================================================
   DOWNLOAD QR
========================================================= */

async function downloadQRCode() {

    if (!currentStudent) {

        alert(
            "Student information is not available."
        );

        return;

    }


    if (downloadButton) {

        downloadButton.disabled =
            true;

        downloadButton.textContent =
            "Preparing QR...";

    }


    try {

        const canvas =
            await createDownloadCanvas();


        const image =
            canvas.toDataURL(
                "image/png"
            );


        const link =
            document.createElement(
                "a"
            );


        const uniqueId =
            currentStudent.unique_id ||
            currentStudent.uniqueId;


        link.href =
            image;


        link.download =
            `${uniqueId}-DOMINEXUS-QR.png`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


    } catch (error) {

        console.error(
            "QR download error:",
            error
        );


        alert(
            "Unable to download the QR code."
        );

    } finally {

        if (downloadButton) {

            downloadButton.disabled =
                false;

            downloadButton.textContent =
                "Download QR Code";

        }

    }

}


/* =========================================================
   PRINT QR
========================================================= */

async function printQRCode() {

    if (!currentStudent) {

        alert(
            "Student information is not available."
        );

        return;

    }


    const canvas =
        await createDownloadCanvas();


    const image =
        canvas.toDataURL(
            "image/png"
        );


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=800,height=1000"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print your QR code."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                DOMINEXUS Student QR
            </title>

            <style>

                body {
                    margin: 0;
                    padding: 30px;
                    background: white;
                    text-align: center;
                    font-family: Arial, sans-serif;
                }

                img {
                    max-width: 100%;
                    height: auto;
                }

            </style>

        </head>

        <body>

            <img
                src="${image}"
                alt="DOMINEXUS Student QR"
            >

        </body>

        </html>

    `);


    printWindow.document.close();


    setTimeout(
        function() {

            printWindow.focus();

            printWindow.print();

        },
        500
    );

}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {

        return "ST";

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


/* =========================================================
   MOBILE SIDEBAR
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

            sessionStorage.removeItem(
                "user"
            );

            sessionStorage.removeItem(
                "student"
            );

            sessionStorage.removeItem(
                "currentUser"
            );

            sessionStorage.removeItem(
                "loggedInUser"
            );

            sessionStorage.removeItem(
                "studentId"
            );

            sessionStorage.removeItem(
                "studentName"
            );

            sessionStorage.removeItem(
                "uniqueId"
            );


            window.location.href =
                "student-login.html";

        }
    );

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        downloadQRCode
    );

}


if (printButton) {

    printButton.addEventListener(
        "click",
        printQRCode
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeStudentQR() {

    console.log(
        "DOMINEXUS: Initializing Student QR..."
    );


    /*
     * Make sure QRCode.js loaded.
     */

    if (
        typeof QRCode ===
        "undefined"
    ) {

        console.error(
            "QRCode.js is not loaded."
        );

        if (qrContainer) {

            qrContainer.innerHTML = `

                <div style="
                    color:#b00000;
                    padding:20px;
                ">
                    QR library failed to load.
                </div>

            `;

        }

        return;

    }


    const student =
        await loadStudent();


    if (!student) {

        showStudentNotFound();

        return;

    }


    displayStudent(
        student
    );


    generateDisplayQR();


    console.log(
        "DOMINEXUS: Student QR ready."
    );

}


initializeStudentQR();