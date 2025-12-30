// NAVIGATION
const navLinks = document.querySelectorAll("nav a");
const pages = document.querySelectorAll(".page");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    pages.forEach(page => page.classList.remove("active"));
    document.getElementById(link.dataset.page).classList.add("active");
    if (window.innerWidth <= 768) navMenu.style.display = "none";
  });
});

menuToggle.addEventListener("click", () => {
  navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
});

// REMINDERS LOGIC
let reminders = [];
let editId = null;

const addBtn = document.getElementById("addReminderBtn");
const modal = document.getElementById("reminderModal");
const modalTitle = document.getElementById("modalTitle");
const reminderDetail = document.getElementById("reminderDetail");
const reminderDate = document.getElementById("reminderDate");
const reminderTime = document.getElementById("reminderTime");
const saveBtn = document.getElementById("saveReminderBtn");
const cancelBtn = document.getElementById("cancelReminderBtn");
const reminderList = document.getElementById("reminderList");

// Parse date and time in local time
function parseLocalDateTime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  } else {
    return new Date(year, month - 1, day, 0, 0);
  }
}

// Format date to DD.MM.YYYY
function formatDateDDMMYYYY(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

// Open modal
addBtn.addEventListener("click", () => {
  editId = null;
  modalTitle.textContent = "Add Reminder";
  reminderDetail.value = "";
  reminderDate.value = "";
  reminderTime.value = "";
  modal.style.display = "flex";
});

// Close modal
cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Save reminder
saveBtn.addEventListener("click", () => {
  const detail = reminderDetail.value.trim();
  const date = reminderDate.value;
  const time = reminderTime.value;

  if (!detail || !date) {
    alert("Please enter reminder detail and date.");
    return;
  }

  const newReminder = {
    id: editId ? editId : Date.now(),
    detail,
    date,
    time,
    createdAt: new Date().toISOString()
  };

  if (editId) {
    reminders = reminders.map(r => r.id === editId ? newReminder : r);
  } else {
    reminders.push(newReminder);
  }

  modal.style.display = "none";
  renderReminders();
});

// Render reminders
function renderReminders() {
  const now = new Date();
  // Remove past reminders immediately
  reminders = reminders.filter(r => {
    const reminderDateTime = parseLocalDateTime(r.date, r.time);
    return reminderDateTime > now;
  });

  // Sort by date/time
  reminders.sort((a, b) => parseLocalDateTime(a.date, a.time) - parseLocalDateTime(b.date, b.time));

  reminderList.innerHTML = "";

  reminders.forEach(r => {
    const card = document.createElement("div");
    card.className = "reminder-card";

    const detail = document.createElement("h3");
    detail.textContent = r.detail;

    const dateText = document.createElement("p");
    dateText.textContent = r.time ? `Date: ${formatDateDDMMYYYY(r.date)} ${r.time}` : `Date: ${formatDateDDMMYYYY(r.date)}`;

    const remaining = document.createElement("p");
    const reminderDateTime = parseLocalDateTime(r.date, r.time);
    const diffMs = reminderDateTime - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    remaining.textContent = `Remaining: ${diffDays} days ${diffHrs} hrs ${diffMin} mins`;

    const btnDiv = document.createElement("div");
    btnDiv.className = "card-buttons";
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editReminder(r.id);
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteReminder(r.id);

    btnDiv.appendChild(editBtn);
    btnDiv.appendChild(delBtn);

    card.appendChild(detail);
    card.appendChild(dateText);
    card.appendChild(remaining);
    card.appendChild(btnDiv);

    reminderList.appendChild(card);
  });
}

// Edit reminder
function editReminder(id) {
  const r = reminders.find(r => r.id === id);
  if (!r) return;
  editId = id;
  modalTitle.textContent = "Edit Reminder";
  reminderDetail.value = r.detail;
  reminderDate.value = r.date;
  reminderTime.value = r.time || "";
  modal.style.display = "flex";
}

// Delete reminder
function deleteReminder(id) {
  if (confirm("Delete this reminder?")) {
    reminders = reminders.filter(r => r.id !== id);
    renderReminders();
  }
}

// Auto update remaining time every minute
setInterval(() => {
  if (pages[3].classList.contains("active")) renderReminders();
}, 60000);
