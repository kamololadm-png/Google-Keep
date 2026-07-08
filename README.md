# Keep Clone

A simplified Google Keep clone built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step.

## Quick Start

Open `index.html` directly in a browser, or serve it locally:

```bash
python -m http.server 8080
```

Then visit http://localhost:8080

## Project Structure

```
keep-clone/
├── index.html      # App structure: navbar, sidebar, compose box, notes grid, edit modal
├── css/
│   └── style.css   # All styling, organised by section (navbar, sidebar, cards, modal, etc.)
├── js/
│   └── app.js      # All app logic, organised by section (state, rendering, actions, etc.)
└── README.md
```

## Features

- **Create notes** — click the "Take a note..." box, add a title/text, click Close (or click outside) to save
- **Display notes** — saved notes render in a responsive masonry-style grid, persisted via `localStorage`
- **Archive notes** — hover a note to reveal the archive icon; archived notes move to the Archive view in the sidebar
- **Delete notes** — trash icon on hover, or inside the edit modal
- **Edit notes** — click any note to open it in a modal, edit title/text, or change its colour
- **Colour labels** — palette icon in both the compose box and edit modal lets you tag a note with a background colour
- **Search** — filters the currently visible view (Notes or Archive) by title/text as you type
- **Grid / list view toggle** — top-right icon switches the notes layout
- **Tooltips** — every icon button shows a label on hover via `data-tooltip` attributes (pure CSS, no JS library)

## Notes on Implementation

- Notes are stored as an array of objects in `localStorage` under the key `keepCloneNotes`
- No note is saved until the compose box loses focus/closes, and empty notes are discarded automatically
- Editing a note down to empty title + empty text deletes it (matches Google Keep's real behaviour)
