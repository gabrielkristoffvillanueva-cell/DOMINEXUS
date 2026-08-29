/* =========================================================
   DOMINEXUS — STUDENT QR CODE
   Reliable QR Generator
========================================================= */


/* =========================================================
   LOAD QR LIBRARY
========================================================= */

const qrScript =
    document.createElement("script");

qrScript.src =
    "https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js";

qrScript.onload =
    initializeQR;

qrScript.onerror =
    function () {

        console.error(
            "DOMINEXUS: QR library failed to load."
        );

        alert(
            "Unable to load the QR Code generator."
        );

    };

document.head.appendChild(
    qrScript
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeQR() {

    /* -----------------------------------------
       LOGIN
    ----------------------------------------- */

    const loggedIn =
        sessionStorage.getItem(
            "studentLoggedIn"
        );


    if (loggedIn !== "true") {

        window.location.href =
            "student-login.html";

        return;

    }


    /* -----------------------------------------
       CURRENT STUDENT
    ----------------------------------------- */

    const currentStudentId =
        sessionStorage.getItem(
            "studentId"
        );


    if (!currentStudentId) {

        alert(
            "Student information could not be found."
        );

        return;

    }


    /* -----------------------------------------
       LOAD STUDENTS
    ----------------------------------------- */

    let students = [];


    try {

        students =
            JSON.parse(
                localStorage.getItem(
                    "dominexus_students"
                ) || "[]"
            );

    } catch (error) {

        console.error(
            "DOMINEXUS student storage error:",
            error
        );

        return;

    }


    /* -----------------------------------------
       FIND REGISTERED STUDENT
    ----------------------------------------- */

    const registeredStudent =
        students.find(
            function (student) {

                return (

                    student.studentId &&

                    String(
                        student.studentId
                    )
                    .trim()
                    .toLowerCase() ===

                    String(
                        currentStudentId
                    )
                    .trim()
                    .toLowerCase()

                );

            }
        );


    /* -----------------------------------------
       DO NOT CREATE A FAKE UNIQUE ID
    ----------------------------------------- */

    if (!registeredStudent) {

        alert(
            "Your registered student account could not be found."
        );

        console.error(
            "Student not found:",
            currentStudentId
        );

        return;

    }


    /* =================================================
       STUDENT DATA
    ================================================= */

    const studentName =
        registeredStudent.fullName ||
        registeredStudent.name ||
        "Student";


    const studentId =
        registeredStudent.studentId ||
        "";


    const uniqueId =
        String(
            registeredStudent.uniqueId ||
            ""
        )
        .trim();


    /* -----------------------------------------
       UNIQUE ID IS REQUIRED
    ----------------------------------------- */

    if (!uniqueId) {

        alert(
            "Your account does not have a DOMINEXUS Unique ID."
        );

        console.error(
            "Missing uniqueId:",
            registeredStudent
        );

        return;

    }


    console.log(
        "======================================"
    );

    console.log(
        "DOMINEXUS STUDENT QR"
    );

    console.log(
        "Student:",
        studentName
    );

    console.log(
        "Student ID:",
        studentId
    );

    console.log(
        "QR VALUE:",
        uniqueId
    );

    console.log(
        "QR VALUE LENGTH:",
        uniqueId.length
    );

    console.log(
        "======================================"
    );


    /* =================================================
       DISPLAY STUDENT INFORMATION
    ================================================= */

    const studentNameElement =
        document.getElementById(
            "studentName"
        );


    const studentIdElement =
        document.getElementById(
            "studentId"
        );


    const uniqueIdElement =
        document.getElementById(
            "uniqueId"
        );


    const topStudentName =
        document.getElementById(
            "topStudentName"
        );


    const topStudentId =
        document.getElementById(
            "topStudentId"
        );


    const topAvatar =
        document.getElementById(
            "topAvatar"
        );


    if (studentNameElement) {

        studentNameElement.textContent =
            studentName;

    }


    if (studentIdElement) {

        studentIdElement.textContent =
            studentId;

    }


    if (uniqueIdElement) {

        uniqueIdElement.textContent =
            uniqueId;

    }


    if (topStudentName) {

        topStudentName.textContent =
            studentName;

    }


    if (topStudentId) {

        topStudentId.textContent =
            studentId;

    }


    if (topAvatar) {

        topAvatar.textContent =
            getInitials(
                studentName
            );

    }


    /* =================================================
       QR CONTAINER
    ================================================= */

    const qrContainer =
        document.getElementById(
            "qrCode"
        );


    if (!qrContainer) {

        console.error(
            "DOMINEXUS: #qrCode not found."
        );

        return;

    }


    /* =================================================
       CLEAR OLD QR
    ================================================= */

    qrContainer.innerHTML = "";


    /*
       Keep the QR itself at 300 × 300.

       The surrounding white area is separate.
    */

    qrContainer.style.width =
        "300px";

    qrContainer.style.height =
        "300px";

    qrContainer.style.padding =
        "15px";

    qrContainer.style.backgroundColor =
        "#ffffff";

    qrContainer.style.display =
        "flex";

    qrContainer.style.alignItems =
        "center";

    qrContainer.style.justifyContent =
        "center";

    qrContainer.style.boxSizing =
        "content-box";


    /* =================================================
       CREATE CANVAS
    ================================================= */

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        300;

    canvas.height =
        300;


    canvas.style.width =
        "300px";

    canvas.style.height =
        "300px";

    canvas.style.display =
        "block";


    qrContainer.appendChild(
        canvas
    );


    /* =================================================
       GENERATE QR
    ================================================= */

    QRCode.toCanvas(

        canvas,

        uniqueId,

        {

            /*
             * LOW error correction keeps the QR
             * simple and easier for cameras to read.
             *
             * The QR is displayed on a clean white
             * background, so high correction is not needed.
             */

            errorCorrectionLevel:
                "L",

            width:
                300,

            margin:
                4,

            color: {

                dark:
                    "#000000",

                light:
                    "#ffffff"

            }

        },

        function (error) {

            if (error) {

                console.error(
                    "DOMINEXUS QR generation error:",
                    error
                );

                qrContainer.innerHTML = "";

                alert(
                    "Unable to generate your QR Code."
                );

                return;

            }


            console.log(
                "DOMINEXUS QR GENERATED SUCCESSFULLY."
            );

            console.log(
                "QR contains ONLY:",
                uniqueId
            );

        }

    );


    /* =================================================
       DOWNLOAD
    ================================================= */

    const downloadButton =
        document.getElementById(
            "downloadQrButton"
        );


    if (downloadButton) {

        downloadButton.onclick =
            function () {

                /*
                 * Use the actual canvas.
                 */

                const link =
                    document.createElement(
                        "a"
                    );


                link.download =
                    uniqueId +
                    "-DOMINEXUS-QR.png";


                link.href =
                    canvas.toDataURL(
                        "image/png"
                    );


                link.click();

            };

    }


    /* =================================================
       PRINT
    ================================================= */

    const printButton =
        document.getElementById(
            "printQrButton"
        );


    if (printButton) {

        printButton.onclick =
            function () {

                printQRCode(
                    studentName,
                    studentId,
                    uniqueId,
                    canvas
                );

            };

    }


    /* =================================================
       LOGOUT
    ================================================= */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.onclick =
            logoutStudent;

    }


    /* =================================================
       MOBILE MENU
    ================================================= */

    setupMobileMenu();

}


/* =========================================================
   PRINT QR
========================================================= */

function printQRCode(
    studentName,
    studentId,
    uniqueId,
    canvas
) {

    if (!canvas) {

        alert(
            "QR Code is not ready yet."
        );

        return;

    }


    const image =
        canvas.toDataURL(
            "image/png"
        );


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=600,height=700"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print the QR code."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                DOMINEXUS QR Code
            </title>

            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    text-align:
                        center;

                    padding:
                        40px;

                }

                h1 {

                    color:
                        #8b0000;

                }

                img {

                    width:
                        300px;

                    height:
                        300px;

                    margin:
                        25px;

                }

                p {

                    margin:
                        8px;

                }

            </style>

        </head>

        <body>

            <h1>
                DOMINEXUS
            </h1>

            <h2>
                Student Attendance QR Code
            </h2>

            <img
                src="${image}"
            >

            <p>
                <strong>
                    ${studentName}
                </strong>
            </p>

            <p>
                Student ID:
                ${studentId}
            </p>

            <p>
                Unique ID:
                ${uniqueId}
            </p>

            <script>

                window.onload =
                    function () {

                        window.print();

                    };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

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
        !menuButton ||
        !sidebar ||
        !sidebarOverlay
    ) {

        return;

    }


    menuButton.onclick =
        function () {

            sidebar.classList.add(
                "open"
            );

            sidebarOverlay.classList.add(
                "show"
            );

        };


    sidebarOverlay.onclick =
        function () {

            sidebar.classList.remove(
                "open"
            );

            sidebarOverlay.classList.remove(
                "show"
            );

        };


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        sidebar.classList.remove(
                            "open"
                        );

                        sidebarOverlay.classList.remove(
                            "show"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutStudent() {

    if (
        !confirm(
            "Are you sure you want to log out?"
        )
    ) {

        return;

    }


    sessionStorage.removeItem(
        "studentLoggedIn"
    );

    sessionStorage.removeItem(
        "studentId"
    );

    sessionStorage.removeItem(
        "studentName"
    );

    sessionStorage.removeItem(
        "studentUniqueId"
    );


    window.location.href =
        "student-login.html";

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {

        return "ST";

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