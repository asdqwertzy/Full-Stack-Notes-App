export const state = {
    accessToken: null,
    csrfToken: null,
    localNotes: [],
    serverNotes: [],
    currentPage: 1,
    pageSize: 6
};

export function initState() {
    state.accessToken = sessionStorage.getItem("accessToken");
    state.csrfToken = sessionStorage.getItem("csrfToken");  
    state.localNotes = JSON.parse(localStorage.getItem("notesStorage")) || [];
}

export function setAccessToken(token) {
    state.accessToken = token;
    if (token) sessionStorage.setItem("accessToken", token);
    else sessionStorage.removeItem("accessToken");
}

export function setCSRFToken(token) { 
    state.csrfToken = token;
    if (token) sessionStorage.setItem("csrfToken", token);
    else sessionStorage.removeItem("csrfToken");
}

export function addLocal(note) {
    state.localNotes.push(note);
    localStorage.setItem("notesStorage", JSON.stringify(state.localNotes));
}

export function clearLocal() {
    state.localNotes = [];
    localStorage.removeItem("notesStorage");
}

export function setServer(notes) {
    state.serverNotes = notes;
}

export function setCurrentPage(page) {
    state.currentPage = page;
}