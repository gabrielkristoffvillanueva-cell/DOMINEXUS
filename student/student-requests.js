/* =========================================================
   DOMINEXUS — STUDENT REQUESTS
   LARAVEL / MYSQL VERSION
========================================================= */

const API_BASE = "http://127.0.0.1:8000/api";


document.addEventListener("DOMContentLoaded", function () {

    if (!isLoggedIn()) return;

    loadStudent();
    loadMeetings();
    loadRequests();

    setupForm();
    setupNavigation();
    setupLogout();

});


/* =========================================================
   LOGIN
========================================================= */

function isLoggedIn() {

    if (
        sessionStorage.getItem("studentLoggedIn") !== "true"
    ) {

        window.location.href =
            "student-login.html";

        return false;

    }

    return true;

}


/* =========================================================
   LOAD STUDENT
========================================================= */

async function loadStudent() {

    const studentId =
        sessionStorage.getItem("studentId");

    if (!studentId) return;


    try {

        const response =
            await fetch(
                `${API_BASE}/students/by-student-id/${encodeURIComponent(studentId)}`,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load student."
            );

        }


        const student =
            data.student ||
            data.data ||
            data;


        const name =
            student.name ||
            "Student";


        document.getElementById(
            "topStudentName"
        ).textContent =
            name;


        document.getElementById(
            "topStudentId"
        ).textContent =
            student.student_id ||
            studentId;


        document.getElementById(
            "topAvatar"
        ).textContent =
            initials(name);


    } catch (error) {

        console.error(
            "Student loading error:",
            error
        );

    }

}


/* =========================================================
   LOAD MEETINGS
========================================================= */

async function loadMeetings() {

    const select =
        document.getElementById(
            "meetingSelect"
        );


    if (!select) return;


    select.innerHTML = `
        <option value="">
            Loading meetings...
        </option>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE}/meetings`,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


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


        select.innerHTML = `
            <option value="">
                Select meeting
            </option>
        `;


        /*
         * Get the student's organization.
         */

        const studentId =
            sessionStorage.getItem(
                "studentId"
            );


        let studentOrganizationId =
            null;


        if (studentId) {

            try {

                const studentResponse =
                    await fetch(
                        `${API_BASE}/students/by-student-id/${encodeURIComponent(studentId)}`
                    );


                const studentData =
                    await studentResponse.json();


                const student =
                    studentData.student ||
                    studentData.data ||
                    studentData;


                studentOrganizationId =
                    student.organization_id;

            } catch (error) {

                console.warn(
                    "Could not determine organization:",
                    error
                );

            }

        }


        meetings.forEach(function (meeting) {

            /*
             * Only show meetings belonging
             * to the student's organization.
             */

            if (
                studentOrganizationId &&
                String(
                    meeting.organization_id
                ) !== String(
                    studentOrganizationId
                )
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                meeting.id;


            option.textContent =
                meeting.title ||
                `Meeting #${meeting.id}`;


            option.dataset.date =
                meeting.date || "";


            select.appendChild(
                option
            );

        });


        if (
            select.options.length === 1
        ) {

            select.innerHTML = `
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


        select.innerHTML = `
            <option value="">
                Unable to load meetings
            </option>
        `;

    }

}


/* =========================================================
   MEETING SELECTION
========================================================= */

document
    .getElementById("meetingSelect")
    ?.addEventListener(
        "change",
        function () {

            const selected =
                this.options[
                    this.selectedIndex
                ];


            const date =
                selected?.dataset.date;


            if (date) {

                document.getElementById(
                    "requestDate"
                ).value =
                    date;

            }

        }
    );


/* =========================================================
   SUBMIT REQUEST
========================================================= */

function setupForm() {

    const form =
        document.getElementById(
            "requestForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const studentId =
                sessionStorage.getItem(
                    "studentId"
                );


            const requestType =
                document.getElementById(
                    "requestType"
                ).value;


            const meetingSelect =
                document.getElementById(
                    "meetingSelect"
                );


            const meetingId =
                meetingSelect.value;


            const meetingDate =
                document.getElementById(
                    "requestDate"
                ).value;


            const reason =
                document.getElementById(
                    "requestReason"
                ).value.trim();


            const documentInput =
                document.getElementById(
                    "supportingDocument"
                );


            const selectedMeeting =
                meetingSelect.options[
                    meetingSelect.selectedIndex
                ];


            const supportingDocument =
                documentInput.files.length > 0
                    ? documentInput.files[0].name
                    : null;


            if (
                !studentId ||
                !requestType ||
                !meetingId ||
                !meetingDate ||
                !reason
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;

            }


            const submitButton =
                form.querySelector(
                    ".submit-button"
                );


            submitButton.disabled = true;

            submitButton.textContent =
                "Submitting...";


            try {

                const response =
                    await fetch(
                        `${API_BASE}/requests`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                student_id:
                                    studentId,

                                meeting_id:
                                    meetingId,

                                request_type:
                                    requestType,

                                meeting_date:
                                    meetingDate,

                                reason:
                                    reason,

                                supporting_document:
                                    supportingDocument

                            })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Request API response:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to submit request."
                    );

                }


                form.reset();


                await loadRequests();


                alert(
                    "Your request has been submitted successfully."
                );


            } catch (error) {

                console.error(
                    "Request submission error:",
                    error
                );


                alert(
                    "Your request could not be submitted.\n\n" +
                    error.message
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Request";

            }

        }
    );

}


/* =========================================================
   LOAD REQUEST HISTORY
========================================================= */

async function loadRequests() {

    const studentId =
        sessionStorage.getItem(
            "studentId"
        );


    if (!studentId) return;


    try {

        const response =
            await fetch(
                `${API_BASE}/requests?student_id=${encodeURIComponent(studentId)}`,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load requests."
            );

        }


        const requests =
            Array.isArray(data)
                ? data
                : data.data ||
                  data.requests ||
                  [];


        displayRequests(
            requests
        );


    } catch (error) {

        console.error(
            "Request history error:",
            error
        );


        displayRequests([]);

    }

}


/* =========================================================
   DISPLAY REQUESTS
========================================================= */

function displayRequests(
    requests
) {

    const list =
        document.getElementById(
            "requestList"
        );


    const empty =
        document.getElementById(
            "emptyState"
        );


    if (!list || !empty) return;


    list.innerHTML = "";


    if (
        !requests ||
        requests.length === 0
    ) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    requests.forEach(
        function (request) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "request-item";


            const status =
                String(
                    request.status ||
                    "pending"
                ).toLowerCase();


            const statusClass =
                status === "approved"
                    ? "approved"
                    : status === "rejected"
                        ? "rejected"
                        : "pending";


            const meeting =
                request.meeting;


            const meetingName =
                meeting
                    ? meeting.title
                    : "Organization Meeting";


            const officerRemarks =
                request.officer_remarks;


            item.innerHTML = `

                <div>

                    <h4>
                        ${safe(
                            request.request_type
                        )}
                    </h4>

                    <p>
                        <strong>Meeting:</strong>
                        ${safe(meetingName)}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${safe(
                            formatDate(
                                request.meeting_date
                            )
                        )}
                    </p>

                    <p class="request-reason">
                        ${safe(
                            request.reason
                        )}
                    </p>

                    ${
                        request.supporting_document
                            ? `
                                <p>
                                    <strong>
                                        Document:
                                    </strong>
                                    ${safe(
                                        request.supporting_document
                                    )}
                                </p>
                            `
                            : ""
                    }

                    ${
                        officerRemarks
                            ? `
                                <p>
                                    <strong>
                                        Officer Remark:
                                    </strong>
                                    ${safe(
                                        officerRemarks
                                    )}
                                </p>
                            `
                            : ""
                    }

                </div>


                <div>

                    <span
                        class="status-badge ${statusClass}">

                        ${safe(
                            capitalize(status)
                        )}

                    </span>

                </div>

            `;


            list.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function setupNavigation() {

    const menu =
        document.getElementById(
            "menuButton"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !menu ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    menu.addEventListener(
        "click",
        function () {

            sidebar.classList.add(
                "open"
            );

            overlay.classList.add(
                "show"
            );

        }
    );


    overlay.addEventListener(
        "click",
        closeSidebar
    );


    document
        .querySelectorAll(".nav-item")
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

        overlay.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) return;


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
                "student-login.html";

        }
    );

}


/* =========================================================
   HELPERS
========================================================= */

function initials(name) {

    if (!name) {
        return "ST";
    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


function formatDate(value) {

    if (!value) {
        return "---";
    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


function capitalize(value) {

    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}


function safe(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}