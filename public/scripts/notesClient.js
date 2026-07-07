import { state, setAccessToken } from "./state.js";



function getCSRFToken() {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("csrfToken="))
        ?.split("=")[1];
}



export async function fetchWithAuth(url, options = {}) {
    options.headers ||= {};
    options.headers.Authorization = `Bearer ${state.accessToken}`;
    options.headers["X-CSRF-Token"] = getCSRFToken();
    options.credentials = "include";

    let res = await fetch(url, options);

    if (res.status === 401) {
        const refreshRes = await fetch("/auth/refresh", {
            method: "POST",
            credentials: "include",
            headers: { "X-CSRF-Token": getCSRFToken() }
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            setAccessToken(data.accessToken);
            options.headers.Authorization = `Bearer ${data.accessToken}`;
            res = await fetch(url, options);
        } else {
            throw new Error("Access token expired and refresh failed");
        }
    }


    if (res.status === 403) {

        const csrfRes = await fetch("/auth/csrf", { method: "GET", credentials: "include" });
        if (!csrfRes.ok) throw new Error("Failed to refresh CSRF token");
        const csrfData = await csrfRes.json();
        state.csrfToken = csrfData.csrfToken;
        options.headers["X-CSRF-Token"] = state.csrfToken;

        res = await fetch(url, options);

        if (res.status === 401) {
            const refreshRes = await fetch("/auth/refresh", {
                method: "POST",
                credentials: "include",
                headers: { "X-CSRF-Token": state.csrfToken }
            });
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                setAccessToken(data.accessToken);
                options.headers.Authorization = `Bearer ${data.accessToken}`;
                res = await fetch(url, options);
            } else {
                throw new Error("Access token expired after CSRF rotation");
            }
        }
    }
    return res;
}



export async function getNotes(page, limit) {
    const res = await fetchWithAuth(`/api?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch notes");
    return res.json();
}

export async function addNote(text) {
    const res = await fetchWithAuth("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error("Add failed");
    return res.json();
}
export async function deleteNote(id) {
    const res = await fetchWithAuth(`/api/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
}

export async function updateNote(id, text) {
    const res = await fetchWithAuth(`/api/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error("Edit failed");
    return res.json();
}
