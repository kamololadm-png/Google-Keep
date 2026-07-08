/* =========================================================
   Google Keep Clone — App Logic
   Sections: State, Storage, Rendering, Compose Box, Edit Modal,
             Note Actions, Colour Palette, Sidebar / Search / View,
             Init
   ========================================================= */

/* ---------- State ---------- */
const STORAGE_KEY = "keepCloneNotes";

/** @type {{id:string, title:string, text:string, color:string, archived:boolean, createdAt:number}[]} */
let notes = [];
let currentView = "notes";   // "notes" | "archive" | "trash" | "reminders"
let searchTerm = "";

const COLORS = [
  { name: "Default", value: "#ffffff" },
  { name: "Red",     value: "#f28b82" },
  { name: "Orange",  value: "#fbbc04" },
  { name: "Yellow",  value: "#fff475" },
  { name: "Green",   value: "#ccff90" },
  { name: "Teal",    value: "#a7ffeb" },
  { name: "Blue",    value: "#cbf0f8" },
  { name: "Purple",  value: "#d7aefb" },
  { name: "Pink",    value: "#fdcfe8" },
];

/* ---------- DOM References ---------- */
const notesGrid      = document.getElementById("notesGrid");
const emptyState      = document.getElementById("emptyState");
const sectionTitle    = document.getElementById("sectionTitle");

const composeBox      = document.getElementById("composeBox");
const composeTitle    = document.getElementById("composeTitle");
const composeText     = document.getElementById("composeText");
const composeActions  = document.getElementById("composeActions");
const closeComposeBtn = document.getElementById("closeComposeBtn");
const composePaletteBtn = document.getElementById("composePaletteBtn");
const composePalette  = document.getElementById("composePalette");

const editOverlay     = document.getElementById("editOverlay");
const editTitle       = document.getElementById("editTitle");
const editText        = document.getElementById("editText");
const modalArchiveBtn = document.getElementById("modalArchiveBtn");
const modalDeleteBtn  = document.getElementById("modalDeleteBtn");
const modalCloseBtn   = document.getElementById("modalCloseBtn");
const modalPaletteBtn = document.getElementById("modalPaletteBtn");
const editPalette     = document.getElementById("editPalette");
const editModal       = document.getElementById("editModal");

const sidebar         = document.getElementById("sidebar");
const sidebarToggle   = document.getElementById("sidebarToggle");
const sidebarItems    = document.querySelectorAll(".sidebar-item[data-view]");
const searchInput     = document.getElementById("searchInput");
const refreshBtn      = document.getElementById("refreshBtn");
const layoutToggle    = document.getElementById("layoutToggle");

let composeColor = "#ffffff";
let activeEditId = null;   // id of note currently open in the modal

/* ---------- Storage ---------- */
function loadNotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  notes = raw ? JSON.parse(raw) : [];
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

/* ---------- Rendering ---------- */
function render() {
  const titles = { notes: "Notes", archive: "Archive", trash: "Trash", reminders: "Reminders" };
  sectionTitle.textContent = titles[currentView] || "Notes";

  let visible;
  if (currentView === "reminders") {
    // Reminders aren't implemented in this simplified version — always empty.
    visible = [];
  } else if (currentView === "trash") {
    visible = notes.filter((n) => n.trashed);
  } else if (currentView === "archive") {
    visible = notes.filter((n) => n.archived && !n.trashed);
  } else {
    visible = notes.filter((n) => !n.archived && !n.trashed);
  }

  if (searchTerm.trim() && currentView !== "reminders") {
    const q = searchTerm.trim().toLowerCase();
    visible = visible.filter(
      (n) => n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q)
    );
  }

  visible.sort((a, b) => b.createdAt - a.createdAt);

  notesGrid.innerHTML = "";
  visible.forEach((note) => notesGrid.appendChild(buildNoteCard(note)));

  emptyState.classList.toggle("show", visible.length === 0);
  emptyState.textContent =
    currentView === "reminders"
      ? "No reminders. This feature isn't implemented in this simplified version."
      : currentView === "trash"
      ? "Trash is empty."
      : currentView === "archive"
      ? "No archived notes."
      : searchTerm
      ? "No notes match your search."
      : "No notes yet. Notes you add appear here.";
}

function buildNoteCard(note) {
  const card = document.createElement("div");
  card.className = "note-card";
  card.style.background = note.color || "#ffffff";
  card.dataset.id = note.id;

  const titleEl = document.createElement("div");
  titleEl.className = "note-title";
  titleEl.textContent = note.title;
  titleEl.style.display = note.title ? "block" : "none";

  const textEl = document.createElement("div");
  textEl.className = "note-text";
  textEl.textContent = note.text;

  const actions = document.createElement("div");
  actions.className = "note-actions";

  if (note.trashed) {
    actions.innerHTML = `
      <button class="icon-btn-sm" data-action="restore" data-tooltip="Restore">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
      </button>
      <button class="icon-btn-sm" data-action="delete-forever" data-tooltip="Delete forever">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    `;
  } else {
    actions.innerHTML = `
      <button class="icon-btn-sm" data-action="archive" data-tooltip="${note.archived ? "Unarchive" : "Archive"}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.55 5.22 19 3H5L3.44 5.22A2 2 0 0 0 3 6.44V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.44a2 2 0 0 0-.45-1.22zM12 17.5 6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.82-1h12.12l.82 1H5.12z"/></svg>
      </button>
      <button class="icon-btn-sm" data-action="delete" data-tooltip="Delete note">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    `;
  }

  // Open the edit modal when clicking the card body, but not the action icons
  card.addEventListener("click", (e) => {
    if (e.target.closest(".note-actions")) return;
    openEditModal(note.id);
  });

  const archiveBtn = actions.querySelector('[data-action="archive"]');
  if (archiveBtn) {
    archiveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleArchive(note.id);
    });
  }

  const deleteBtn = actions.querySelector('[data-action="delete"]');
  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      trashNote(note.id);
    });
  }

  const restoreBtn = actions.querySelector('[data-action="restore"]');
  if (restoreBtn) {
    restoreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      restoreNote(note.id);
    });
  }

  const deleteForeverBtn = actions.querySelector('[data-action="delete-forever"]');
  if (deleteForeverBtn) {
    deleteForeverBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      permanentlyDeleteNote(note.id);
    });
  }

  card.append(titleEl, textEl, actions);
  return card;
}

/* ---------- Compose Box (create) ---------- */
function expandCompose() {
  composeBox.classList.add("active");
}

function collapseCompose() {
  composeBox.classList.remove("active");
  closePalette(composePalette);
}

function saveComposeNote() {
  const title = composeTitle.value.trim();
  const text = composeText.value.trim();

  if (title || text) {
    notes.push({
      id: crypto.randomUUID(),
      title,
      text,
      color: composeColor,
      archived: false,
      trashed: false,
      createdAt: Date.now(),
    });
    saveNotes();
    render();
  }

  composeTitle.value = "";
  composeText.value = "";
  composeColor = "#ffffff";
  collapseCompose();
}

composeText.addEventListener("focus", expandCompose);
composeTitle.addEventListener("focus", expandCompose);
closeComposeBtn.addEventListener("click", saveComposeNote);

// Clicking anywhere outside the compose box also saves + collapses it
document.addEventListener("click", (e) => {
  if (composeBox.classList.contains("active") && !composeBox.contains(e.target)) {
    saveComposeNote();
  }
});

/* ---------- Edit Modal ---------- */
function openEditModal(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  activeEditId = id;
  editTitle.value = note.title;
  editText.value = note.text;
  editModal.style.background = note.color || "#ffffff";

  if (note.trashed) {
    modalArchiveBtn.dataset.tooltip = "Restore";
    modalDeleteBtn.dataset.tooltip = "Delete forever";
  } else {
    modalArchiveBtn.dataset.tooltip = note.archived ? "Unarchive" : "Archive";
    modalDeleteBtn.dataset.tooltip = "Delete note";
  }

  editOverlay.classList.add("open");
  editTitle.focus();
}

function saveAndCloseModal() {
  const note = notes.find((n) => n.id === activeEditId);
  if (note) {
    note.title = editTitle.value.trim();
    note.text = editText.value.trim();

    // If both fields end up empty, remove the note entirely
    if (!note.title && !note.text) {
      notes = notes.filter((n) => n.id !== activeEditId);
    }
    saveNotes();
  }

  activeEditId = null;
  editOverlay.classList.remove("open");
  closePalette(editPalette);
  render();
}

modalCloseBtn.addEventListener("click", saveAndCloseModal);

editOverlay.addEventListener("click", (e) => {
  if (e.target === editOverlay) saveAndCloseModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && editOverlay.classList.contains("open")) {
    saveAndCloseModal();
  }
});

modalArchiveBtn.addEventListener("click", () => {
  if (!activeEditId) return;
  const note = notes.find((n) => n.id === activeEditId);
  if (!note) return;

  if (note.trashed) {
    restoreNote(activeEditId);
  } else {
    toggleArchive(activeEditId);
  }
  activeEditId = null;
  editOverlay.classList.remove("open");
  render();
});

modalDeleteBtn.addEventListener("click", () => {
  if (!activeEditId) return;
  const note = notes.find((n) => n.id === activeEditId);
  if (!note) return;

  if (note.trashed) {
    permanentlyDeleteNote(activeEditId);
  } else {
    trashNote(activeEditId);
  }
  activeEditId = null;
  editOverlay.classList.remove("open");
});

/* ---------- Note Actions ---------- */
function toggleArchive(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  note.archived = !note.archived;
  saveNotes();
  render();
}

function trashNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  note.trashed = true;
  saveNotes();
  render();
}

function restoreNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  note.trashed = false;
  saveNotes();
  render();
}

function permanentlyDeleteNote(id) {
  notes = notes.filter((n) => n.id !== id);
  saveNotes();
  render();
}

/* ---------- Colour Palette ---------- */
function buildPalette(container, onSelect) {
  container.innerHTML = "";
  COLORS.forEach((c) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.background = c.value;
    swatch.title = c.name;
    swatch.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelect(c.value);
    });
    container.appendChild(swatch);
  });
}

function togglePalette(popover) {
  popover.classList.toggle("open");
}

function closePalette(popover) {
  popover.classList.remove("open");
}

buildPalette(composePalette, (color) => {
  composeColor = color;
  composeBox.style.background = color;
  closePalette(composePalette);
});

buildPalette(editPalette, (color) => {
  const note = notes.find((n) => n.id === activeEditId);
  if (note) {
    note.color = color;
    editModal.style.background = color;
    saveNotes();
  }
  closePalette(editPalette);
});

composePaletteBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  togglePalette(composePalette);
});

modalPaletteBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  togglePalette(editPalette);
});

document.addEventListener("click", () => {
  closePalette(composePalette);
  closePalette(editPalette);
});

/* ---------- Sidebar / Search / View controls ---------- */
sidebarItems.forEach((item) => {
  item.addEventListener("click", () => {
    sidebarItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    currentView = item.dataset.view;
    render();
  });
});

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  render();
});

refreshBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchTerm = "";
  loadNotes();
  render();
});

layoutToggle.addEventListener("click", () => {
  const isGrid = notesGrid.classList.contains("grid-view");
  notesGrid.classList.toggle("grid-view", !isGrid);
  notesGrid.classList.toggle("list-view", isGrid);
  layoutToggle.dataset.tooltip = isGrid ? "Grid view" : "List view";
});

/* ---------- Init ---------- */
loadNotes();
render();