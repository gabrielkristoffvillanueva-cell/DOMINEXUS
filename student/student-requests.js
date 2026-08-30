/* =========================================
   DOMINEXUS — STUDENT REQUESTS
   Laravel / MySQL Connected
========================================= */

const API_BASE = "http://127.0.0.1:8000/api";

let currentStudent = null;


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (!isLoggedIn()) {
            return;
        }

        setupNavigation();
        setupLogout();
        setupMeetingSelection();
        setupForm();

        await loadStudent();

        await loadMeetings();

        await loadRequests();

    }
);


/* =========================================
   LOGIN CHECK
========================================= */

function isLoggedIn() {

    const loggedIn =
        sessionStorage.getItem(
            "studentLoggedIn"
        );


    if (loggedIn !== "true") {

        window.location.href =
            "student-login.html";

        return false;

    }


    return true;

}


/* =========================================
   LOAD CURRENT STUDENT
========================================= */

async function loadStudent() {

    const studentId =
        sessionStorage.getItem(
            "studentId"
        );


    if (!studentId) {

        window.location.href =
            "student-login.html";

        return;

    }


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


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load student."
            );

        }


        currentStudent =
            data.student ||
            data.data ||
            data;


        const name =
            currentStudent.name ||
            "Student";


        const actualStudentId =
            currentStudent.student_id ||
            studentId;


        /* =====================================
           TOP PROFILE
        ===================================== */

        const nameElement =
            document.getElementById(
                "topStudentName"
            );


        const idElement =
            document.getElementById(
                "topStudentId"
            );


        const avatarElement =
            document.getElementById(
                "topAvatar"
            );


        if (nameElement) {

            nameElement.textContent =
                name;

        }


        if (idElement) {

            idElement.textContent =
                actualStudentId;

        }


        if (avatarElement) {

            avatarElement.textContent =
                getInitials(name);

        }


        /* =====================================
           SAVE DATA FOR OTHER STUDENT PAGES
        ===================================== */

        sessionStorage.setItem(
            "studentName",
            name
        );


        sessionStorage.setItem(
            "studentId",
            actualStudentId
        );


        if (
            currentStudent.organization_id !== null &&
            currentStudent.organization_id !== undefined
        ) {

            sessionStorage.setItem(
                "studentOrganizationId",
                currentStudent.organization_id
            );

        }


        if (currentStudent.section) {

            sessionStorage.setItem(
                "studentSection",
                currentStudent.section
            );

        }


        if (currentStudent.unique_id) {

            sessionStorage.setItem(
                "studentUniqueId",
                currentStudent.unique_id
            );

        }


        if (currentStudent.club_role) {

            sessionStorage.setItem(
                "studentClubRole",
                currentStudent.club_role
            );

        }


        console.log(
            "Current student:",
            currentStudent
        );


    } catch (error) {

        console.error(
            "Student loading error:",
            error
        );


        alert(
            "Unable to load your student information."
        );

    }

}


/* =========================================
   LOAD MEETINGS
========================================= */

async function loadMeetings() {

    const select =
        document.getElementById(
            "meetingSelect"
        );


    if (!select) {
        return;
    }


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
                    method: "GET",

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
                : data.data ||
                  data.meetings ||
                  [];


        select.innerHTML = `
            <option value="">
                Select meeting
            </option>
        `;


        const organizationId =
            currentStudent
                ? currentStudent.organization_id
                : sessionStorage.getItem(
                    "studentOrganizationId"
                );


        console.log(
            "Student organization ID:",
            organizationId
        );


        /*
         * Only show meetings from the
         * student's organization.
         */

        meetings.forEach(
            function (meeting) {

                if (
                    organizationId !== null &&
                    organizationId !== undefined &&
                    organizationId !== ""
                ) {

                    if (
                        String(
                            meeting.organization_id
                        ) !== String(
                            organizationId
                        )
                    ) {

                        return;

                    }

                }


                /*
                 * Don't allow cancelled meetings
                 * to be selected.
                 */

                if (
                    String(
                        meeting.status || ""
                    ).toLowerCase() ===
                    "cancelled"
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


                /*
                 * Laravel may return:
                 *
                 * 2026-09-01T00:00:00.000000Z
                 *
                 * Convert it to:
                 *
                 * 2026-09-01
                 */

                option.dataset.date =
                    normalizeDate(
                        meeting.date
                    );


                select.appendChild(
                    option
                );

            }
        );


        if (
            select.options.length === 1
        ) {

            select.innerHTML = `
                <option value="">
                    No meetings available
                </option>
            `;

        }


        console.log(
            "Available request meetings:",
            select.options.length - 1
        );


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


/* =========================================
   MEETING SELECTION
========================================= */

function setupMeetingSelection() {

    const select =
        document.getElementById(
            "meetingSelect"
        );


    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        function () {

            const selected =
                this.options[
                    this.selectedIndex
                ];


            const date =
                selected?.dataset.date;


            if (date) {

                const dateInput =
                    document.getElementById(
                        "requestDate"
                    );


                if (dateInput) {

                    dateInput.value =
                        date;

                }

            }

        }
    );

}


/* =========================================
   SUBMIT REQUEST
========================================= */

function setupForm() {

    const form =
        document.getElementById(
            "requestForm"
        );


    if (!form) {
        return;
    }


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
                )?.value;


            const meetingSelect =
                document.getElementById(
                    "meetingSelect"
                );


            const meetingId =
                meetingSelect?.value;


            const meetingDate =
                document.getElementById(
                    "requestDate"
                )?.value;


            const reason =
                document.getElementById(
                    "requestReason"
                )?.value.trim();


            const documentInput =
                document.getElementById(
                    "supportingDocument"
                );


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


            /*
             * At this stage the backend expects
             * the document field as data.
             *
             * We send the filename only.
             */

            const supportingDocument =
                documentInput &&
                documentInput.files.length > 0
                    ? documentInput.files[0].name
                    : null;


            const submitButton =
                form.querySelector(
                    ".submit-button"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Submitting...";

            }


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
                    "Request response:",
                    data
                );


                if (!response.ok) {

                    /*
                     * Laravel validation errors
                     */

                    if (
                        data.errors
                    ) {

                        const messages =
                            Object.values(
                                data.errors
                            )
                            .flat()
                            .join("\n");


                        throw new Error(
                            messages
                        );

                    }


                    throw new Error(
                        data.message ||
                        "Unable to submit request."
                    );

                }


                form.reset();


                const dateInput =
                    document.getElementById(
                        "requestDate"
                    );


                if (dateInput) {

                    dateInput.value =
                        "";

                }


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

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Request";

                }

            }

        }
    );

}


/* =========================================
   LOAD REQUEST HISTORY
========================================= */

async function loadRequests() {

    const studentId =
        sessionStorage.getItem(
            "studentId"
        );


    if (!studentId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/requests?student_id=${encodeURIComponent(studentId)}`,
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


        console.log(
            "Student requests:",
            requests
        );


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


/* =========================================
   DISPLAY REQUESTS
========================================= */

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


    if (
        !list ||
        !empty
    ) {

        return;

    }


    list.innerHTML =
        "";


    if (
        !Array.isArray(requests) ||
        requests.length === 0
    ) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    /*
     * Newest requests first.
     */

    requests.sort(
        function (a, b) {

            return (
                getRequestDate(b) -
                getRequestDate(a)
            );

        }
    );


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


            let statusClass =
                "pending";


            if (
                status === "approved"
            ) {

                statusClass =
                    "approved";

            }


            if (
                status === "rejected"
            ) {

                statusClass =
                    "rejected";

            }


            const meeting =
                request.meeting;


            const meetingName =
                meeting?.title ||
                request.meeting_name ||
                "Organization Meeting";


            const meetingDate =
                request.meeting_date ||
                meeting?.date ||
                null;


            const officerRemarks =
                request.officer_remarks ||
                request.remarks ||
                null;


            item.innerHTML = `

                <div>

                    <h4>
                        ${safe(
                            request.request_type ||
                            "Attendance Request"
                        )}
                    </h4>


                    <p>
                        <strong>
                            Meeting:
                        </strong>

                        ${safe(
                            meetingName
                        )}
                    </p>


                    <p>
                        <strong>
                            Date:
                        </strong>

                        ${safe(
                            formatDate(
                                meetingDate
                            )
                        )}
                    </p>


                    <p class="request-reason">

                        ${safe(
                            request.reason ||
                            ""
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


/* =========================================
   REQUEST DATE
========================================= */

function getRequestDate(request) {

    const value =
        request.created_at ||
        request.meeting_date ||
        "";


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return new Date(0);

    }


    return date;

}


/* =========================================
   NORMALIZE DATE
========================================= */

function normalizeDate(value) {

    if (!value) {
        return "";
    }


    /*
     * If already YYYY-MM-DD
     */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {

        return value;

    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    /*
     * Use UTC because Laravel's
     * serialized date includes Z.
     */

    return [
        date.getUTCFullYear(),

        String(
            date.getUTCMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getUTCDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");

}


/* =========================================
   FORMAT DATE
========================================= */

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


/* =========================================
   INITIALS
========================================= */

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


/* =========================================
   CAPITALIZE
========================================= */

function capitalize(value) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/* =========================================
   SAFE HTML
========================================= */

function safe(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =========================================
   MOBILE NAVIGATION
========================================= */

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

        overlay.classList.remove(
            "show"
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) {
        return;
    }


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