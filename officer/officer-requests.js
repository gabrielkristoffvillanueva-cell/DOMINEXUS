/* =========================================================
   DOMINEXUS — OFFICER REQUESTS
========================================================= */

const API_BASE = "http://127.0.0.1:8000/api";


/* =========================================================
   LOGIN CHECK
========================================================= */

if (sessionStorage.getItem("officerLoggedIn") !== "true") {
    window.location.href = "officer-login.html";
}


/* =========================================================
   OFFICER DATA
========================================================= */

const officerId =
    sessionStorage.getItem("officerId") || "";

const officerName =
    sessionStorage.getItem("officerName") || "Officer";


/* =========================================================
   ELEMENTS
========================================================= */

const topOfficerName =
    document.getElementById("topOfficerName");

const topOfficerId =
    document.getElementById("topOfficerId");

const topAvatar =
    document.getElementById("topAvatar");

const requestList =
    document.getElementById("requestList");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const totalRequests =
    document.getElementById("totalRequests");

const pendingRequests =
    document.getElementById("pendingRequests");

const approvedRequests =
    document.getElementById("approvedRequests");

const logoutButton =
    document.getElementById("logoutButton");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* =========================================================
   MODAL
========================================================= */

const requestModal =
    document.getElementById("requestModal");

const closeModal =
    document.getElementById("closeModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalAvatar =
    document.getElementById("modalAvatar");

const modalStudentName =
    document.getElementById("modalStudentName");

const modalStudentId =
    document.getElementById("modalStudentId");

const modalType =
    document.getElementById("modalType");

const modalDate =
    document.getElementById("modalDate");

const modalMessage =
    document.getElementById("modalMessage");

const modalActions =
    document.getElementById("modalActions");

const approveButton =
    document.getElementById("approveButton");

const rejectButton =
    document.getElementById("rejectButton");

const officerRemarks =
    document.getElementById("officerRemarks");

const remarksBox =
    document.getElementById("remarksBox");

const existingRemarksBox =
    document.getElementById("existingRemarksBox");

const modalExistingRemarks =
    document.getElementById("modalExistingRemarks");

const supportingDocumentBox =
    document.getElementById("supportingDocumentBox");

const modalSupportingDocument =
    document.getElementById("modalSupportingDocument");


/* =========================================================
   DATA
========================================================= */

let allRequests = [];

let currentRequest = null;


/* =========================================================
   OFFICER DISPLAY
========================================================= */

if (topOfficerName) {
    topOfficerName.textContent = officerName;
}

if (topOfficerId) {
    topOfficerId.textContent = officerId;
}

if (topAvatar) {
    topAvatar.textContent = getInitials(officerName);
}


/* =========================================================
   LOAD REQUESTS
========================================================= */

async function loadRequests() {

    if (requestList) {
        requestList.innerHTML = `
            <div class="loading-state">
                Loading requests...
            </div>
        `;
    }

    try {

        const response = await fetch(
            `${API_BASE}/requests`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.json();

        console.log(
            "DOMINEXUS requests:",
            data
        );

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to load requests."
            );
        }

        allRequests =
            Array.isArray(data)
                ? data
                : data.requests || [];

        displayRequests();

    } catch (error) {

        console.error(
            "REQUEST LOAD ERROR:",
            error
        );

        allRequests = [];

        if (requestList) {
            requestList.innerHTML = `
                <div class="loading-state">
                    Unable to load requests.
                </div>
            `;
        }

        updateSummary([]);

    }
}


/* =========================================================
   DISPLAY REQUESTS
========================================================= */

function displayRequests() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    const filteredRequests =
        allRequests.filter(
            request => {

                const student =
                    request.student || {};

                const meeting =
                    request.meeting || {};


                const studentName =
                    String(
                        student.name || ""
                    ).toLowerCase();

                const studentId =
                    String(
                        student.student_id || ""
                    ).toLowerCase();

                const requestType =
                    String(
                        request.request_type || ""
                    ).toLowerCase();

                const meetingName =
                    String(
                        meeting.title || ""
                    ).toLowerCase();

                const status =
                    normalizeStatus(
                        request.status
                    );


                const matchesSearch =
                    !search ||
                    studentName.includes(search) ||
                    studentId.includes(search) ||
                    requestType.includes(search) ||
                    meetingName.includes(search);


                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    if (requestList) {
        requestList.innerHTML = "";
    }


    if (filteredRequests.length === 0) {

        if (emptyState) {
            emptyState.style.display = "block";
        }

    } else {

        if (emptyState) {
            emptyState.style.display = "none";
        }

        filteredRequests.forEach(
            request => {
                createRequestCard(request);
            }
        );
    }


    updateSummary(allRequests);
}


/* =========================================================
   CREATE REQUEST CARD
========================================================= */

function createRequestCard(request) {

    const item =
        document.createElement("div");

    item.className =
        "request-item";


    const student =
        request.student || {};

    const meeting =
        request.meeting || {};


    const studentName =
        student.name ||
        "Unknown Student";

    const studentId =
        student.student_id ||
        "---";

    const requestType =
        request.request_type ||
        "Request";

    const meetingName =
        meeting.title ||
        "Organization Meeting";

    const meetingDate =
        request.meeting_date ||
        meeting.date ||
        "";

    const status =
        normalizeStatus(
            request.status
        );


    let statusClass =
        "status-pending";

    if (status === "Approved") {
        statusClass = "status-approved";
    }

    if (status === "Rejected") {
        statusClass = "status-rejected";
    }


    item.innerHTML = `

        <div class="request-left">

            <div class="request-avatar">
                ${escapeHTML(
                    getInitials(studentName)
                )}
            </div>

            <div class="request-info">

                <h3>
                    ${escapeHTML(requestType)}
                </h3>

                <p>
                    ${escapeHTML(studentName)}
                    ·
                    ${escapeHTML(studentId)}
                </p>

                <p>
                    ${escapeHTML(meetingName)}
                </p>

                <span class="request-date">
                    ${escapeHTML(
                        formatDate(meetingDate)
                    )}
                </span>

            </div>

        </div>


        <div class="request-right">

            <span class="request-status ${statusClass}">
                ${escapeHTML(status)}
            </span>

            <button
                type="button"
                class="view-button"
                data-id="${request.id}"
            >
                View
            </button>

        </div>
    `;


    requestList.appendChild(item);
}


/* =========================================================
   VIEW REQUEST
========================================================= */

if (requestList) {

    requestList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".view-button"
                );

            if (!button) {
                return;
            }


            const request =
                allRequests.find(
                    item =>
                        String(item.id) ===
                        String(button.dataset.id)
                );


            if (!request) {
                return;
            }


            openModal(request);
        }
    );
}


/* =========================================================
   OPEN MODAL
========================================================= */

function openModal(request) {

    currentRequest = request;


    const student =
        request.student || {};

    const meeting =
        request.meeting || {};


    const studentName =
        student.name ||
        "Unknown Student";

    const studentId =
        student.student_id ||
        "---";

    const requestType =
        request.request_type ||
        "Request";

    const meetingName =
        meeting.title ||
        "Organization Meeting";

    const meetingDate =
        request.meeting_date ||
        meeting.date ||
        "";

    const reason =
        request.reason ||
        "No reason provided.";

    const status =
        normalizeStatus(
            request.status
        );


    /* Student */

    modalTitle.textContent =
        requestType;

    modalAvatar.textContent =
        getInitials(studentName);

    modalStudentName.textContent =
        studentName;

    modalStudentId.textContent =
        studentId;


    /* Request details */

    modalType.textContent =
        requestType;

    modalDate.textContent =
        `${meetingName} · ${formatDate(meetingDate)}`;

    modalMessage.textContent =
        reason;


    /* Supporting document */

    if (
        request.supporting_document
    ) {

        supportingDocumentBox.style.display =
            "block";

        modalSupportingDocument.textContent =
            request.supporting_document;

    } else {

        supportingDocumentBox.style.display =
            "none";

    }


    /* Remarks */

    if (officerRemarks) {
        officerRemarks.value = "";
    }


    if (
        status === "Pending"
    ) {

        modalActions.style.display =
            "flex";

        remarksBox.style.display =
            "block";

        existingRemarksBox.style.display =
            "none";

    } else {

        modalActions.style.display =
            "none";

        remarksBox.style.display =
            "none";


        if (
            request.officer_remarks
        ) {

            existingRemarksBox.style.display =
                "block";

            modalExistingRemarks.textContent =
                request.officer_remarks;

        } else {

            existingRemarksBox.style.display =
                "none";

        }
    }


    requestModal.classList.add("show");
}


/* =========================================================
   CLOSE MODAL
========================================================= */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeRequestModal
    );
}


if (requestModal) {

    requestModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                requestModal
            ) {

                closeRequestModal();

            }
        }
    );
}


function closeRequestModal() {

    requestModal.classList.remove(
        "show"
    );

    currentRequest = null;
}


/* =========================================================
   APPROVE REQUEST
========================================================= */

if (approveButton) {

    approveButton.addEventListener(
        "click",
        async () => {

            if (!currentRequest) {
                return;
            }


            await updateRequestStatus(
                currentRequest.id,
                "approve"
            );

        }
    );
}


/* =========================================================
   REJECT REQUEST
========================================================= */

if (rejectButton) {

    rejectButton.addEventListener(
        "click",
        async () => {

            if (!currentRequest) {
                return;
            }


            await updateRequestStatus(
                currentRequest.id,
                "reject"
            );

        }
    );
}


/* =========================================================
   UPDATE REQUEST STATUS
========================================================= */

async function updateRequestStatus(
    requestId,
    action
) {

    const remarks =
        officerRemarks
            ? officerRemarks.value.trim()
            : "";


    /*
     * Prevent double clicking while
     * the request is being processed.
     */

    approveButton.disabled = true;
    rejectButton.disabled = true;


    try {

        const response =
            await fetch(
                `${API_BASE}/requests/${requestId}/${action}`,
                {
                    method: "PUT",

                    headers: {
                        "Accept":
                            "application/json",

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        officer_id:
                            officerId,

                        officer_remarks:
                            remarks || null

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            `DOMINEXUS ${action}:`,
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Unable to ${action} request.`
            );

        }


        /*
         * Update local request immediately.
         */

        const updatedRequest =
            data.request;


        const index =
            allRequests.findIndex(
                request =>
                    String(request.id) ===
                    String(requestId)
            );


        if (
            index !== -1 &&
            updatedRequest
        ) {

            allRequests[index] =
                updatedRequest;

        }


        /*
         * Close modal.
         */

        closeRequestModal();


        /*
         * Refresh request list.
         */

        displayRequests();


        /*
         * No confirmation popup.
         * Just log success.
         */

        console.log(
            data.message ||
            `Request ${action}d successfully.`
        );


    } catch (error) {

        console.error(
            `REQUEST ${action.toUpperCase()} ERROR:`,
            error
        );


        alert(
            error.message ||
            `Unable to ${action} request.`
        );


    } finally {

        approveButton.disabled = false;
        rejectButton.disabled = false;

    }
}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary(requests) {

    const total =
        requests.length;


    const pending =
        requests.filter(
            request =>
                normalizeStatus(
                    request.status
                ) === "Pending"
        ).length;


    const approved =
        requests.filter(
            request =>
                normalizeStatus(
                    request.status
                ) === "Approved"
        ).length;


    totalRequests.textContent =
        total;

    pendingRequests.textContent =
        pending;

    approvedRequests.textContent =
        approved;
}


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        displayRequests
    );
}


/* =========================================================
   STATUS FILTER
========================================================= */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        displayRequests
    );
}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

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
   MOBILE MENU
========================================================= */

if (
    menuButton &&
    sidebar &&
    sidebarOverlay
) {

    menuButton.addEventListener(
        "click",
        () => {

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

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "show"
    );
}


/* =========================================================
   STATUS NORMALIZER
========================================================= */

function normalizeStatus(status) {

    const value =
        String(
            status || "pending"
        ).toLowerCase();


    if (value === "approved") {
        return "Approved";
    }


    if (value === "rejected") {
        return "Rejected";
    }


    return "Pending";
}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {

    const value =
        String(
            name || "Student"
        ).trim();


    if (!value) {
        return "ST";
    }


    const parts =
        value.split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {

    if (!value) {
        return "---";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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
   START
========================================================= */

loadRequests();