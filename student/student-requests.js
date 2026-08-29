/* =========================================
   DOMINEXUS STUDENT REQUESTS
   Uses the SAME session/localStorage system
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    if (!isLoggedIn()) return;

    loadStudent();
    loadMeetings();
    loadRequests();
    setupForm();
    setupNavigation();
    setupLogout();
});

function isLoggedIn() {
    if (sessionStorage.getItem("studentLoggedIn") !== "true") {
        window.location.href = "student-login.html";
        return false;
    }
    return true;
}

function getStudent() {
    const id = sessionStorage.getItem("studentId") || "";
    const students = JSON.parse(localStorage.getItem("dominexus_students") || "[]");

    return students.find(function (s) {
        return s.studentId &&
            id &&
            s.studentId.toLowerCase() === id.toLowerCase();
    }) || {
        studentId: id || "2026-0001",
        uniqueId: sessionStorage.getItem("studentUniqueId") || "SDCA-DEMO",
        fullName: sessionStorage.getItem("studentName") || "Student"
    };
}

function loadStudent() {
    const s = getStudent();
    const name = s.fullName || s.name || "Student";

    document.getElementById("topStudentName").textContent = name;
    document.getElementById("topStudentId").textContent = s.studentId || "---";
    document.getElementById("topAvatar").textContent = initials(name);
}

function loadMeetings() {
    const select = document.getElementById("meetingSelect");
    const meetings = JSON.parse(localStorage.getItem("dominexus_meetings") || "[]");

    meetings.forEach(function (m) {
        const option = document.createElement("option");
        const id = m.id || m.meetingId || m.date;
        const title = m.title || m.meetingName || m.name || "Organization Meeting";
        option.value = id;
        option.textContent = title;
        option.dataset.date = m.date || m.meetingDate || "";
        select.appendChild(option);
    });

    select.addEventListener("change", function () {
        const option = this.options[this.selectedIndex];
        if (option && option.dataset.date) {
            document.getElementById("requestDate").value = option.dataset.date;
        }
    });
}

function setupForm() {
    document.getElementById("requestForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const student = getStudent();
        const select = document.getElementById("meetingSelect");
        const selected = select.options[select.selectedIndex];

        const request = {
            id: "REQ-" + Date.now(),
            studentId: student.studentId,
            uniqueId: student.uniqueId || "",
            studentName: student.fullName || student.name || "Student",
            requestType: document.getElementById("requestType").value,
            meetingId: select.value,
            meetingName: selected ? selected.textContent : "",
            meetingDate: document.getElementById("requestDate").value,
            reason: document.getElementById("requestReason").value.trim(),
            supportingDocument:
                document.getElementById("supportingDocument").files[0]?.name || "",
            status: "Pending",
            officerRemarks: "",
            createdAt: new Date().toISOString()
        };

        if (!request.requestType || !request.meetingId ||
            !request.meetingDate || !request.reason) {
            alert("Please complete all required fields.");
            return;
        }

        const requests = JSON.parse(
            localStorage.getItem("dominexus_requests") || "[]"
        );

        requests.push(request);

        localStorage.setItem(
            "dominexus_requests",
            JSON.stringify(requests)
        );

        this.reset();
        loadRequests();
        alert("Your request has been submitted successfully.");
    });
}

function loadRequests() {
    const student = getStudent();
    const all = JSON.parse(
        localStorage.getItem("dominexus_requests") || "[]"
    );

    const requests = all.filter(function (r) {
        return r.studentId === student.studentId ||
            (r.uniqueId && r.uniqueId === student.uniqueId);
    }).reverse();

    const list = document.getElementById("requestList");
    const empty = document.getElementById("emptyState");

    list.innerHTML = "";

    if (!requests.length) {
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";

    requests.forEach(function (r) {
        const item = document.createElement("div");
        item.className = "request-item";

        const status = String(r.status || "Pending").toLowerCase();
        const statusClass =
            status === "approved" ? "approved" :
                status === "rejected" ? "rejected" : "pending";

        item.innerHTML = `
            <div>
                <h4>${safe(r.requestType)}</h4>
                <p><strong>Meeting:</strong> ${safe(r.meetingName)}</p>
                <p><strong>Date:</strong> ${safe(formatDate(r.meetingDate))}</p>
                <p class="request-reason">${safe(r.reason)}</p>
                ${r.supportingDocument
                ? `<p><strong>Document:</strong> ${safe(r.supportingDocument)}</p>`
                : ""}
                ${r.officerRemarks
                ? `<p><strong>Officer Remark:</strong> ${safe(r.officerRemarks)}</p>`
                : ""}
            </div>
            <div>
                <span class="status-badge ${statusClass}">
                    ${safe(r.status || "Pending")}
                </span>
            </div>
        `;

        list.appendChild(item);
    });
}

function setupNavigation() {
    const menu = document.getElementById("menuButton");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    menu.addEventListener("click", function () {
        sidebar.classList.add("open");
        overlay.classList.add("show");
    });

    overlay.addEventListener("click", closeSidebar);

    document.querySelectorAll(".nav-item").forEach(function (link) {
        link.addEventListener("click", closeSidebar);
    });

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    }
}

function setupLogout() {
    document.getElementById("logoutButton").addEventListener("click", function () {
        if (!confirm("Are you sure you want to log out?")) return;

        sessionStorage.removeItem("studentLoggedIn");
        sessionStorage.removeItem("studentId");
        sessionStorage.removeItem("studentName");
        sessionStorage.removeItem("studentUniqueId");

        window.location.href = "student-login.html";
    });
}

function initials(name) {
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(value) {
    if (!value) return "---";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    });
}

function safe(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

/* =========================================
   AUTO REFRESH REQUEST STATUS
========================================= */

window.addEventListener("storage", function (event) {

    if (event.key === "dominexus_requests") {
        loadRequests();
    }

});