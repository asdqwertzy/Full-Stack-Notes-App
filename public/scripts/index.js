import * as notesClient from "./notesClient.js";
import * as authClient from "./authClient.js";
import {
    state,
    initState,
    addLocal,
    clearLocal,
    setServer,
    setCurrentPage,
    setAccessToken
} from "./state.js";


window.state = state;
window.setAccessToken = setAccessToken;

initState();


if (!state.accessToken) {
    window.location.href = "/login.html";
}


const inputField = document.getElementById("inputText");
const localList = document.getElementById("notesList");
const serverMessage = document.getElementById("serverMessage");
const tbody = document.querySelector("#notesTable tbody");
const pagination = document.getElementById("pagination");


function getCSRFToken() {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("csrfToken="))
        ?.split("=")[1];
}

async function fetchWithAuth(url, options = {}) {
    options.headers ||= {};
    options.headers.Authorization = `Bearer ${state.accessToken}`;
    options.headers["X-CSRF-Token"] = getCSRFToken();
    options.credentials = "include";

    let res = await fetch(url, options);

    if (res.status === 401) {
        const refreshRes = await fetch("/auth/refresh", { method: "POST", credentials: "include" });
        if (refreshRes.ok) {
            const data = await refreshRes.json();
            setAccessToken(data.accessToken);
            options.headers.Authorization = `Bearer ${data.accessToken}`;
            res = await fetch(url, options);
        }
    }
    return res;
}


function renderLocalNotes() {
    localList.innerHTML = "";
    state.localNotes.forEach(n => {
        const li = document.createElement("li");
        li.textContent = `${n.text} (${new Date(n.createdAt).toLocaleString()})`;
        localList.appendChild(li);
    });
}

function saveLocalNote() {
    const text = inputField.value.trim();
    if (!text) return;
    addLocal({ text, createdAt: new Date().toISOString() });
    renderLocalNotes();
    inputField.value = "";
}

function clearLocalNotes() {
    clearLocal();
    renderLocalNotes();
}


async function saveServerNote() {
    const text = cleanNote(inputField.value);
    if (!text) return;

    try {
        const res = await notesClient.addNote(text);
        if (!res || !res.note) throw new Error("Add failed");
        await loadServer(state.currentPage);
        serverMessage.textContent = "";
        inputField.value = "";
    } catch (err) {
        console.error(err);
        serverMessage.textContent = "Add failed";
    }
}

async function loadServer(page = 1) {
    try {
        const data = await notesClient.getNotes(page, state.pageSize);
        setServer(data.notes || []);
        setCurrentPage(page);
        renderTable(data.notes || []);
        renderPagination(page, data.totalPages || 1);
    } catch (err) {
        console.error(err);
        serverMessage.textContent = "Failed to load server notes";
    }
}

async function deleteServerNote(id) {
    try {
        await notesClient.deleteNote(id);
        await loadServer(state.currentPage);
    } catch (err) {
        console.error(err);
        serverMessage.textContent = "Delete failed";
    }
}

async function editServerNote(id) {
    const newText = prompt("Edit note:");
    if (!newText) return;
    try {
        await notesClient.updateNote(id, newText);
        await loadServer(state.currentPage);
    } catch (err) {
        console.error(err);
        serverMessage.textContent = "Edit failed";
    }
}


function cleanNote(input) {
    let note = input.trim();
    note = note.replace(/<[^>]*>/g, "");
    if (note.length > 30) note = note.slice(0, 30);
    return note || null;
}

function renderTable(notes) {
    tbody.innerHTML = "";
    notes.forEach(n => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${n.id}</td>
            <td>${n.text}</td>
            <td>${new Date(n.createdAt).toLocaleString()}</td>
            <td>
                <button class="edit-btn" data-id="${n.id}">Edit</button>
                <button class="delete-btn" data-id="${n.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPagination(current, total) {
    pagination.innerHTML = "";
    for (let i = 1; i <= total; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.disabled = i === current;
        btn.onclick = () => loadServer(i);
        pagination.appendChild(btn);
    }
}


document.querySelector("#notesTable tbody").addEventListener("click", e => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("delete-btn")) deleteServerNote(id);
    if (e.target.classList.contains("edit-btn")) editServerNote(id);
});

document.getElementById("noteForm").addEventListener("submit", e => {
    e.preventDefault();
    saveServerNote();
});


document.getElementById("saveNoteBtn").addEventListener("click", saveLocalNote);
document.getElementById("clearNotesBtn").addEventListener("click", clearLocalNotes);
document.getElementById("loadNotesBtn").addEventListener("click", renderLocalNotes);

document.getElementById("saveServerBtn").addEventListener("click", saveServerNote);
document.getElementById("clearServerBtn").addEventListener("click", async () => {
    try {
        await notesClient.fetchWithAuth("/api", { method: "DELETE" });
        await loadServer(1);
    } catch (err) {
        console.error(err);
        serverMessage.textContent = "Failed to clear server notes";
    }
});
document.getElementById("loadServerBtn").addEventListener("click", () => loadServer(state.currentPage));

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("/auth/logout", { method: "POST", credentials: "include" });
    setAccessToken(null);
    window.location.href = "/login.html";
});


renderLocalNotes();
loadServer(state.currentPage);
