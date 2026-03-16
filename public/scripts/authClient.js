import { setAccessToken, setCSRFToken } from "./state.js";


export async function login(username, password) {
    const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Login failed");

    setAccessToken(data.accessToken);
    setCSRFToken(data.csrfToken);  

    return data;
}

export async function register(username, password) {
    const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    return res.json();
}
