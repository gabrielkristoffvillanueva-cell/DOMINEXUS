/* =========================================================
   DOMINEXUS — STUDENT QR CODE
   Laravel / MySQL VERSION
========================================================= */

const API_BASE = "http://127.0.0.1:8000/api";


/* =========================================================
   AUTHENTICATION
========================================================= */

if (
    sessionStorage.getItem("studentLoggedIn") !== "true"
) {
    window.location.href = "student-login.html";
}


/* =========================================================
   ELEMENTS
========================================================= */

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

const qrCodeContainer =
    document.getElementById("qrCode");

const downloadButton =
    document.getElementById("downloadQR");

const logoutButton =
    document.getElementById("logoutButton");


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeQR
);


async function initializeQR() {

    const studentId =
        sessionStorage.getItem("studentId");


    if (!studentId) {

        alert(
            "Your student session is missing. Please log in again."
        );

        sessionStorage.clear();

        window.location.href =
            "student-login.html";

        return;

    }


    try {

        console.log(
            "Loading student:",
            studentId
        );


        /*
         * Get the actual student from Laravel.
         */

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


        let data = {};


        try {

            data =
                await response.json();

        } catch (error) {

            console.warn(
                "Server did not return JSON."
            );

        }


        console.log(
            "Student API response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load your student information."
            );

        }


        const student =
            data.student ||
            data.data ||
            data;


        /*
         * Get database values.
         */

        const name =
            student.name ||
            "Student";


        const actualStudentId =
            student.student_id ||
            studentId;


        const uniqueId =
            student.unique_id;


        if (!uniqueId) {

            throw new Error(
                "Your account does not have a Unique ID yet."
            );

        }


        /*
         * Display student information.
         */

        if (studentNameElement) {

            studentNameElement.textContent =
                name;

        }


        if (studentIdElement) {

            studentIdElement.textContent =
                actualStudentId;

        }


        if (uniqueIdElement) {

            uniqueIdElement.textContent =
                uniqueId;

        }


        if (topStudentName) {

            topStudentName.textContent =
                name;

        }


        if (topStudentId) {

            topStudentId.textContent =
                actualStudentId;

        }


        if (topAvatar) {

            topAvatar.textContent =
                getInitials(name);

        }


        /*
         * Generate QR.
         *
         * IMPORTANT:
         * The QR contains ONLY the Unique ID.
         */

        generateQRCode(
            uniqueId
        );


        console.log(
            "DOMINEXUS QR generated:",
            uniqueId
        );


    } catch (error) {

        console.error(
            "DOMINEXUS QR ERROR:",
            error
        );


        if (qrCodeContainer) {

            qrCodeContainer.innerHTML = `
                <div class="qr-error">
                    Unable to load QR code.
                </div>
            `;

        }


        alert(
            "Unable to load your QR code.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   GENERATE QR CODE
========================================================= */

function generateQRCode(
    uniqueId
) {

    if (!qrCodeContainer) {

        console.error(
            "QR container was not found."
        );

        return;

    }


    /*
     * Make sure the QR library loaded.
     */

    if (
        typeof QRCode ===
        "undefined"
    ) {

        console.error(
            "QRCode library is not loaded."
        );


        qrCodeContainer.innerHTML = `
            <div class="qr-error">
                QR Code library failed to load.
            </div>
        `;

        return;

    }


    /*
     * Clear old QR.
     */

    qrCodeContainer.innerHTML = "";


    /*
     * White background makes the QR
     * easier for scanners to read.
     */

    /*
     * Generate QR.
     */

    new QRCode(
        qrCodeContainer,
        {
            text: String(uniqueId),

            width: 280,

            height: 280,

            colorDark: "#000000",

            colorLight: "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.M
        }
    );

}


/* =========================================================
   DOWNLOAD QR
========================================================= */

if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        downloadQRCode
    );

}


function downloadQRCode() {

    if (!qrCodeContainer) {

        return;

    }


    const canvas =
        qrCodeContainer.querySelector(
            "canvas"
        );


    const image =
        qrCodeContainer.querySelector(
            "img"
        );


    /*
     * html5-qrcode / qrcode libraries
     * can render either canvas or img.
     */

    if (canvas) {

        const link =
            document.createElement("a");


        link.download =
            "DOMINEXUS-Student-QR.png";


        link.href =
            canvas.toDataURL(
                "image/png"
            );


        link.click();


        return;

    }


    if (image) {

        const link =
            document.createElement("a");


        link.download =
            "DOMINEXUS-Student-QR.png";


        link.href =
            image.src;


        link.target =
            "_blank";


        link.click();


        return;

    }


    alert(
        "QR code is not ready yet."
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

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


            sessionStorage.clear();


            window.location.href =
                "student-login.html";

        }
    );

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

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