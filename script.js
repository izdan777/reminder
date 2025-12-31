import { db } from "./config.js";
import { ref, push, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
let editKey = null;

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
  editKey = null;
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

  const reminderData = { detail, date, time };

  if (editKey) {
    // Edit existing reminder
    const updateRef = ref(db, 'reminders/' + editKey);
    update(updateRef, reminderData);
  } else {
    // Add new reminder
    const remindersRef = ref(db, 'reminders');
    const newReminderRef = push(remindersRef);
    set(newReminderRef, reminderData);
  }

  modal.style.display = "none";
});

// Render reminders from DB
function renderReminders(data) {
  const now = new Date();
  reminderList.innerHTML = "";

  if (!data) return;

  Object.entries(data).forEach(([key, r]) => {
    const reminderDateTime = parseLocalDateTime(r.date, r.time);
    if (reminderDateTime <= now) return; // skip past reminders

    const card = document.createElement("div");
    card.className = "reminder-card";

    const detail = document.createElement("h3");
    detail.textContent = r.detail;

    const dateText = document.createElement("p");
    dateText.textContent = r.time ? `Date: ${formatDateDDMMYYYY(r.date)} ${r.time}` : `Date: ${formatDateDDMMYYYY(r.date)}`;

    const diffMs = reminderDateTime - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const remaining = document.createElement("p");
    remaining.textContent = `Remaining: ${diffDays} days ${diffHrs} hrs ${diffMin} mins`;

    const btnDiv = document.createElement("div");
    btnDiv.className = "card-buttons";
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editReminder(key, r);
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteReminder(key);

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
function editReminder(key, r) {
  editKey = key;
  modalTitle.textContent = "Edit Reminder";
  reminderDetail.value = r.detail;
  reminderDate.value = r.date;
  reminderTime.value = r.time || "";
  modal.style.display = "flex";
}

// Delete reminder
function deleteReminder(key) {
  if (confirm("Delete this reminder?")) {
    const delRef = ref(db, 'reminders/' + key);
    remove(delRef);
  }
}

// Listen for changes in DB
const remindersRef = ref(db, 'reminders');
onValue(remindersRef, (snapshot) => {
  renderReminders(snapshot.val());
});

// Auto update remaining time every minute
setInterval(() => {
  if (pages[3].classList.contains("active")) {
    onValue(remindersRef, (snapshot) => {
      renderReminders(snapshot.val());
    });
  }
}, 60000);
