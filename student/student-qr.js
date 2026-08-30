/* =========================================
   DOMINEXUS STUDENT QR CODE
========================================= */


/* =========================================
   LOAD QR LIBRARY
========================================= */

const qrScript =
    document.createElement("script");

qrScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

qrScript.onload =
    initializeQR;

qrScript.onerror =
    function () {

        console.error(
            "DOMINEXUS: QR library failed to load."
        );

        alert(
            "Unable to load the QR Code library. Please check your internet connection."
        );

    };

document.head.appendChild(
    qrScript
);


/* =========================================
   INITIALIZE
========================================= */

function initializeQR() {

    /* =====================================
       CHECK LOGIN
    ===================================== */

    const loggedIn =
        sessionStorage.getItem(
            "studentLoggedIn"
        );


    if (
        loggedIn !== "true"
    ) {

        window.location.href =
            "student-login.html";

        return;

    }


    /* =====================================
       GET STUDENT INFORMATION
    ===================================== */

    const currentStudentId =
        sessionStorage.getItem(
            "studentId"
        ) || "";


    const sessionStudentName =
        sessionStorage.getItem(
            "studentName"
        ) || "Student";


    const sessionUniqueId =
        sessionStorage.getItem(
            "studentUniqueId"
        ) || "";


    /*
     * Keep the localStorage fallback because
     * some older demo accounts may still exist
     * there.
     */

    let students = [];


    try {

        students =
            JSON.parse(
                localStorage.getItem(
                    "dominexus_students"
                ) || "[]"
            );


        if (
            !Array.isArray(
                students
            )
        ) {

            students = [];

        }

    } catch (error) {

        console.warn(
            "DOMINEXUS: Could not read local student data.",
            error
        );

        students = [];

    }


    const registeredStudent =
        students.find(
            function (student) {

                const storedStudentId =
                    String(
                        student.studentId ||
                        student.student_id ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                return (
                    storedStudentId &&
                    currentStudentId &&
                    storedStudentId ===
                    currentStudentId
                        .trim()
                        .toLowerCase()
                );

            }
        );


    const currentStudent =
        registeredStudent || {

            studentId:
                currentStudentId,

            fullName:
                sessionStudentName,

            uniqueId:
                sessionUniqueId

        };


    /* =====================================
       STUDENT INFORMATION
    ===================================== */

    const studentName =
        currentStudent.fullName ||
        currentStudent.name ||
        sessionStudentName ||
        "Student";


    const studentId =
        currentStudent.studentId ||
        currentStudent.student_id ||
        currentStudentId ||
        "Unknown";


    const uniqueId =
        currentStudent.uniqueId ||
        currentStudent.unique_id ||
        sessionUniqueId ||
        "";


    /*
     * Do NOT generate a fake QR ID.
     *
     * The QR must contain the real Unique ID
     * stored in the student's account.
     */

    if (!uniqueId) {

        alert(
            "Your Unique ID could not be found. Please log in again."
        );

        return;

    }


    /* =====================================
       DISPLAY STUDENT
    ===================================== */

    setText(
        "studentName",
        studentName
    );


    setText(
        "studentId",
        studentId
    );


    setText(
        "uniqueId",
        uniqueId
    );


    setText(
        "topStudentName",
        studentName
    );


    setText(
        "topStudentId",
        studentId
    );


    setText(
        "topAvatar",
        getInitials(
            studentName
        )
    );


    /* =====================================
       QR CONTAINER
    ===================================== */

    const qrContainer =
        document.getElementById(
            "qrCode"
        );


    if (!qrContainer) {

        console.error(
            "DOMINEXUS: #qrCode was not found."
        );

        return;

    }


    qrContainer.innerHTML =
        "";


    qrContainer.style.backgroundColor =
        "#ffffff";

    qrContainer.style.padding =
        "10px";

    qrContainer.style.boxSizing =
        "content-box";


    /* =====================================
       GENERATE QR
    ===================================== */

    new QRCode(
        qrContainer,
        {

            text:
                uniqueId,

            width:
                280,

            height:
                280,

            colorDark:
                "#000000",

            colorLight:
                "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.M

        }
    );


    /*
     * QRCode.js normally creates an IMG
     * and a CANVAS depending on browser/
     * library behavior.
     */

    setTimeout(
        function () {

            const qrImage =
                qrContainer.querySelector(
                    "img"
                );


            const qrCanvas =
                qrContainer.querySelector(
                    "canvas"
                );


            if (qrCanvas) {

                qrCanvas.style.display = "block";
                qrCanvas.style.width = "280px";
                qrCanvas.style.height = "280px";
                qrCanvas.style.imageRendering = "pixelated";

                if (qrImage) {
                    qrImage.style.display = "none";
                }

            } else if (qrImage) {

                qrImage.style.display = "block";
                qrImage.style.width = "280px";
                qrImage.style.height = "280px";
                qrImage.style.imageRendering = "pixelated";

            }


            if (
                !qrImage &&
                !qrCanvas
            ) {

                console.error(
                    "DOMINEXUS: QR was not generated."
                );

            }

        },
        100
    );


    /* =====================================
       DOWNLOAD QR
    ===================================== */

    const downloadQrButton =
        document.getElementById(
            "downloadQrButton"
        );


    if (downloadQrButton) {

        downloadQrButton.addEventListener(
            "click",
            function () {

                downloadQRCode(
                    qrContainer,
                    uniqueId
                );

            }
        );

    }


    /* =====================================
       PRINT QR
    ===================================== */

    const printQrButton =
        document.getElementById(
            "printQrButton"
        );


    if (printQrButton) {

        printQrButton.addEventListener(
            "click",
            function () {

                printQRCode(
                    studentName,
                    studentId,
                    uniqueId,
                    qrContainer
                );

            }
        );

    }


    /* =====================================
       LOGOUT
    ===================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutStudent
        );

    }


    /* =====================================
       MOBILE MENU
    ===================================== */

    setupMobileMenu();

}


/* =========================================
   SET TEXT
========================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================
   DOWNLOAD QR
========================================= */

function downloadQRCode(
    qrContainer,
    uniqueId
) {

    /*
     * First try CANVAS.
     */

    const qrCanvas =
        qrContainer.querySelector(
            "canvas"
        );


    if (qrCanvas) {

        try {

            const image =
                qrCanvas.toDataURL(
                    "image/png"
                );


            downloadDataURL(
                image,
                uniqueId +
                "-DOMINEXUS-QR.png"
            );


            return;

        } catch (error) {

            console.error(
                "Canvas QR download failed:",
                error
            );

        }

    }


    /*
     * If canvas isn't available,
     * try IMG.
     */

    const qrImage =
        qrContainer.querySelector(
            "img"
        );


    if (qrImage) {

        /*
         * If the image has already loaded,
         * download it directly.
         */

        if (
            qrImage.complete &&
            qrImage.naturalWidth > 0
        ) {

            downloadImage(
                qrImage.src,
                uniqueId +
                "-DOMINEXUS-QR.png"
            );


            return;

        }


        /*
         * Wait for image loading.
         */

        qrImage.onload =
            function () {

                downloadImage(
                    qrImage.src,
                    uniqueId +
                    "-DOMINEXUS-QR.png"
                );

            };


        return;

    }


    /*
     * QR hasn't rendered yet.
     */

    alert(
        "QR Code is still loading. Please try again."
    );

}


/* =========================================
   DOWNLOAD DATA URL
========================================= */

function downloadDataURL(
    dataURL,
    filename
) {

    const link =
        document.createElement(
            "a"
        );


    link.href =
        dataURL;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );

}


/* =========================================
   DOWNLOAD IMAGE
========================================= */

function downloadImage(
    imageURL,
    filename
) {

    /*
     * Convert the image into a canvas first.
     * This gives us a real PNG download.
     */

    const image =
        new Image();


    image.onload =
        function () {

            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                image.naturalWidth ||
                280;


            canvas.height =
                image.naturalHeight ||
                280;


            const context =
                canvas.getContext(
                    "2d"
                );


            context.fillStyle =
                "#ffffff";


            context.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            context.drawImage(
                image,
                0,
                0
            );


            const dataURL =
                canvas.toDataURL(
                    "image/png"
                );


            downloadDataURL(
                dataURL,
                filename
            );

        };


    image.onerror =
        function () {

            /*
             * Fallback: download the
             * original image source.
             */

            downloadDataURL(
                imageURL,
                filename
            );

        };


    image.src =
        imageURL;

}


/* =========================================
   PRINT QR
========================================= */

function printQRCode(
    studentName,
    studentId,
    uniqueId,
    qrContainer
) {

    /*
     * Get QR as an image source.
     */

    const qrCanvas =
        qrContainer.querySelector(
            "canvas"
        );


    const qrImage =
        qrContainer.querySelector(
            "img"
        );


    let qrSource =
        "";


    if (qrCanvas) {

        try {

            qrSource =
                qrCanvas.toDataURL(
                    "image/png"
                );

        } catch (error) {

            console.error(
                "Unable to prepare QR for printing.",
                error
            );

        }

    }


    if (
        !qrSource &&
        qrImage
    ) {

        qrSource =
            qrImage.src;

    }


    if (!qrSource) {

        alert(
            "QR Code is still loading. Please try again."
        );

        return;

    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=600,height=700"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print your QR Code."
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

                h2 {

                    margin-bottom:
                        25px;

                }

                img {

                    width:
                        280px;

                    height:
                        280px;

                    margin:
                        25px;

                    image-rendering:
                        pixelated;

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
                src="${qrSource}"
                alt="DOMINEXUS Student QR Code"
            >


            <p>
                <strong>
                    ${escapeHTML(studentName)}
                </strong>
            </p>


            <p>
                Student ID:
                ${escapeHTML(studentId)}
            </p>


            <p>
                Unique ID:
                ${escapeHTML(uniqueId)}
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


/* =========================================
   GET INITIALS
========================================= */

function getInitials(
    name
) {

    if (!name) {

        return "ST";

    }


    const parts =
        String(
            name
        )
            .trim()
            .split(
                /\s+/
            );


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


/* =========================================
   LOGOUT
========================================= */

function logoutStudent() {

    const confirmLogout =
        confirm(
            "Are you sure you want to log out?"
        );


    if (!confirmLogout) {

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


/* =========================================
   MOBILE MENU
========================================= */

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


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );


    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

        sidebarOverlay.classList.remove(
            "show"
        );

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

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