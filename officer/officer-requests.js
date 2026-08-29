/* =========================================
   DOMINEXUS OFFICER REQUESTS
   CONNECTED TO STUDENT REQUESTS
========================================= */


/* =========================================
   CHECK OFFICER LOGIN
========================================= */

if (sessionStorage.getItem("officerLoggedIn") !== "true") {
    window.location.href = "officer-login.html";
}


/* =========================================
   OFFICER INFORMATION
========================================= */

const officerId =
    sessionStorage.getItem("officerId") || "OFF-0001";

const officerName =
    sessionStorage.getItem("officerName") || "Demo Officer";


/* =========================================
   ELEMENTS
========================================= */

const topOfficerName = document.getElementById("topOfficerName");
const topOfficerId = document.getElementById("topOfficerId");
const topAvatar = document.getElementById("topAvatar");

const requestList = document.getElementById("requestList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const totalRequests = document.getElementById("totalRequests");
const pendingRequests = document.getElementById("pendingRequests");
const approvedRequests = document.getElementById("approvedRequests");

const logoutButton = document.getElementById("logoutButton");

const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");


/* =========================================
   MODAL ELEMENTS
========================================= */

const requestModal = document.getElementById("requestModal");
const closeModal = document.getElementById("closeModal");

const modalTitle = document.getElementById("modalTitle");
const modalAvatar = document.getElementById("modalAvatar");

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


/* =========================================
   DISPLAY OFFICER
========================================= */

topOfficerName.textContent = officerName;
topOfficerId.textContent = officerId;
topAvatar.textContent = getInitials(officerName);


/* =========================================
   GET REQUESTS
========================================= */

function getRequests() {

    return JSON.parse(
        localStorage.getItem("dominexus_requests") || "[]"
    );

}


/* =========================================
   SAVE REQUESTS
========================================= */

function saveRequests(data) {

    localStorage.setItem(
        "dominexus_requests",
        JSON.stringify(data)
    );

}


/* =========================================
   DISPLAY REQUESTS
========================================= */

function displayRequests() {

    const requests = getRequests();

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value;


    const filteredRequests =
        requests.filter(request => {

            const studentName =
                String(request.studentName || "").toLowerCase();

            const studentId =
                String(request.studentId || "").toLowerCase();

            const requestType =
                String(
                    request.requestType ||
                    request.type ||
                    ""
                ).toLowerCase();

            const meetingName =
                String(
                    request.meetingName ||
                    ""
                ).toLowerCase();


            const matchesSearch =
                studentName.includes(search) ||
                studentId.includes(search) ||
                requestType.includes(search) ||
                meetingName.includes(search);


            const status =
                normalizeStatus(request.status);


            const matchesStatus =
                selectedStatus === "all" ||
                status === selectedStatus;


            return matchesSearch && matchesStatus;

        });


    requestList.innerHTML = "";


    if (filteredRequests.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        filteredRequests.forEach(request => {
            createRequestCard(request);
        });

    }


    updateSummary(requests);

}


/* =========================================
   CREATE REQUEST CARD
========================================= */

function createRequestCard(request) {

    const item =
        document.createElement("div");

    item.className = "request-item";


    const studentName =
        request.studentName ||
        "Unknown Student";

    const studentId =
        request.studentId ||
        "---";


    const requestType =
        request.requestType ||
        request.type ||
        "Request";


    const meetingName =
        request.meetingName ||
        "Organization Meeting";


    const meetingDate =
        request.meetingDate ||
        request.date ||
        "";


    const status =
        normalizeStatus(request.status);


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
                ${getInitials(studentName)}
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
                    ${escapeHTML(formatDate(meetingDate))}
                </span>

            </div>

        </div>


        <div class="request-right">

            <span class="request-status ${statusClass}">
                ${escapeHTML(status)}
            </span>

            <button
                class="view-button"
                data-id="${escapeHTML(request.id)}">

                View

            </button>

        </div>

    `;


    requestList.appendChild(item);

}


/* =========================================
   OPEN REQUEST
========================================= */

requestList.addEventListener("click", function(event) {

    const button =
        event.target.closest(".view-button");

    if (!button) return;


    const requests = getRequests();


    const request =
        requests.find(item =>
            String(item.id) ===
            String(button.dataset.id)
        );


    if (!request) return;


    openModal(request);

});


/* =========================================
   OPEN MODAL
========================================= */

function openModal(request) {

    const requestType =
        request.requestType ||
        request.type ||
        "Request";


    const studentName =
        request.studentName ||
        "Unknown Student";


    const studentId =
        request.studentId ||
        "---";


    const meetingName =
        request.meetingName ||
        "Organization Meeting";


    const meetingDate =
        request.meetingDate ||
        request.date ||
        "";


    const reason =
        request.reason ||
        request.message ||
        "No reason provided.";


    modalTitle.textContent =
        requestType;


    modalAvatar.textContent =
        getInitials(studentName);


    modalStudentName.textContent =
        studentName;


    modalStudentId.textContent =
        studentId;


    modalType.textContent =
        requestType;


    modalDate.textContent =
        formatDate(meetingDate);


    modalMessage.textContent =
        `${meetingName}\n\n${reason}`;


    requestModal.classList.add("show");


    const status =
        normalizeStatus(request.status);


    if (status === "Pending") {

        modalActions.style.display = "flex";

        approveButton.style.display = "block";
        rejectButton.style.display = "block";


        approveButton.dataset.id =
            request.id;

        rejectButton.dataset.id =
            request.id;

    } else {

        modalActions.style.display = "none";

    }

}


/* =========================================
   CLOSE MODAL
========================================= */

closeModal.addEventListener(
    "click",
    closeRequestModal
);


requestModal.addEventListener(
    "click",
    function(event) {

        if (event.target === requestModal) {
            closeRequestModal();
        }

    }
);


function closeRequestModal() {

    requestModal.classList.remove("show");

}


/* =========================================
   APPROVE
========================================= */

approveButton.addEventListener(
    "click",
    function() {

        updateRequestStatus(
            approveButton.dataset.id,
            "Approved"
        );

    }
);


/* =========================================
   REJECT
========================================= */

rejectButton.addEventListener(
    "click",
    function() {

        updateRequestStatus(
            rejectButton.dataset.id,
            "Rejected"
        );

    }
);


/* =========================================
   UPDATE REQUEST STATUS
========================================= */

function updateRequestStatus(
    requestId,
    newStatus
) {

    const requests = getRequests();


    const request =
        requests.find(item =>
            String(item.id) ===
            String(requestId)
        );


    if (!request) {

        alert("Request could not be found.");

        return;

    }


    const confirmation =
        confirm(
            `Are you sure you want to ${newStatus.toLowerCase()} this request?`
        );


    if (!confirmation) return;


    /*
       Update status
    */

    request.status =
        newStatus;


    /*
       Save officer information
    */

    request.reviewedBy =
        officerName;

    request.reviewedById =
        officerId;

    request.reviewedAt =
        new Date().toISOString();


    /*
       Optional officer remark
    */

    const remark =
        prompt(
            "Officer remark (optional):",
            request.officerRemarks || ""
        );


    if (remark !== null) {

        request.officerRemarks =
            remark.trim();

    }


    /*
       Save back to shared storage
    */

    saveRequests(requests);


    closeRequestModal();

    displayRequests();


    alert(
        `Request has been ${newStatus.toLowerCase()}.`
    );

}


/* =========================================
   SUMMARY
========================================= */

function updateSummary(requests) {

    const total =
        requests.length;


    const pending =
        requests.filter(request =>
            normalizeStatus(request.status) ===
            "Pending"
        ).length;


    const approved =
        requests.filter(request =>
            normalizeStatus(request.status) ===
            "Approved"
        ).length;


    totalRequests.textContent =
        total;


    pendingRequests.textContent =
        pending;


    approvedRequests.textContent =
        approved;

}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    displayRequests
);


/* =========================================
   FILTER
========================================= */

statusFilter.addEventListener(
    "change",
    displayRequests
);


/* =========================================
   LOGOUT
========================================= */

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


/* =========================================
   MOBILE MENU
========================================= */

menuButton.addEventListener(
    "click",
    function() {

        sidebar.classList.add("open");

        sidebarOverlay.classList.add("show");

    }
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebar
);


function closeSidebar() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");

}


/* =========================================
   STORAGE UPDATE
   Automatically refresh when another
   page changes dominexus_requests.
========================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            "dominexus_requests"
        ) {

            displayRequests();

        }

    }
);


/* =========================================
   HELPER:
   NORMALIZE STATUS
========================================= */

function normalizeStatus(status) {

    const value =
        String(status || "Pending")
            .toLowerCase();


    if (value === "approved") {
        return "Approved";
    }


    if (value === "rejected") {
        return "Rejected";
    }


    return "Pending";

}


/* =========================================
   HELPER:
   INITIALS
========================================= */

function getInitials(name) {

    const value =
        String(name || "Student")
            .trim();


    if (!value) return "ST";


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


/* =========================================
   HELPER:
   FORMAT DATE
========================================= */

function formatDate(value) {

    if (!value) return "---";


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {
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
   HELPER:
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   INITIALIZE
========================================= */

displayRequests();