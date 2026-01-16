console.log("SCRIPT LOADED");

/* 🔴 GOOGLE APPS SCRIPT WEB APP URL */
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbw0NGXks3YA6xNx2Y5wJaumYAHWy6CifekfJ2gFRR3MdgVt96KoVQRNlwQby0EUkt5lPg/exec";

/* =========================
   DOM ELEMENTS
   ========================= */
const datePicker = document.getElementById("datePicker");
const sectionPicker = document.getElementById("sectionPicker");
const timetable = document.getElementById("timetable");

let allData = [];

/* =========================
   HELPERS
   ========================= */
function cleanDate(dateStr) {
  return dateStr.replace(/\s+/g, "");
}

function showNoData(msg) {
  timetable.innerHTML = `<p class="no-data">${msg}</p>`;
}

function formatTime(timeStr) {
  return timeStr
    .replace(/to/i, "–")
    .replace(/(\d)\.(\d)/g, "$1:$2")
    .replace(/AM/g, " AM")
    .replace(/PM/g, " PM");
}

/* =========================
   CARD
   ========================= */
function createCard(item) {
  const div = document.createElement("div");

  const isFree =
    !item.subject || item.subject.toLowerCase().includes("free");

  div.className = `card ${isFree ? "free" : item.type || "class"}`;

  div.innerHTML = `
    <div class="time">${formatTime(item.time)}</div>
    <div class="content">
      <div class="subject">${isFree ? "Free Period" : item.subject}</div>
      <div class="meta">${item.day} • Section ${item.section}</div>
    </div>
  `;

  return div;
}

/* =========================
   FETCH DATA
   ========================= */
fetch(WEB_APP_URL)
  .then(res => res.json())
  .then(data => {
    console.log("DATA LOADED:", data.length);
    allData = data;

    /* 🔥 AUTO-DETECT SECTIONS (E, F, G…) */
    const sections = [...new Set(data.map(d => d.section))].sort();

    sectionPicker.innerHTML = "";
    sections.forEach(sec => {
      const opt = document.createElement("option");
      opt.value = sec;
      opt.textContent = `Section ${sec}`;
      sectionPicker.appendChild(opt);
    });

    /* DEFAULT DATE = TODAY */
    const today = new Date().toISOString().split("T")[0];
    datePicker.value = today;

    render();
  })
  .catch(err => {
    console.error("FETCH ERROR:", err);
    showNoData("Failed to load timetable");
  });

/* =========================
   RENDER
   ========================= */
function render() {
  timetable.innerHTML = "";

  const selectedDate = datePicker.value;
  const selectedSection = sectionPicker.value;

  const filtered = allData.filter(item =>
    cleanDate(item.date) === selectedDate &&
    item.section === selectedSection
  );

  if (filtered.length === 0) {
    showNoData("No classes for this date");
    return;
  }

  filtered.forEach(item => {
    timetable.appendChild(createCard(item));
  });
}

/* =========================
   EVENTS
   ========================= */
datePicker.addEventListener("change", render);
sectionPicker.addEventListener("change", render);
