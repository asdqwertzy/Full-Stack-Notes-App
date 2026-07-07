const express = require("express");
const authService = require("../services/authService.js");
const crypto = require("crypto")

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const { accessToken, refreshToken } = await authService.login(username, password);
        const csrfToken = crypto.randomBytes(32).toString("hex");
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "Strict",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            sameSite: "Strict",
            secure: false
        })
        res.json({ accessToken, csrfToken });
    }
    catch (err) {
        res.status(401).json({ error: "Invalid credentials" })
    }
});

router.post("/refresh", async (req, res) => {
    try {
        const oldToken = req.cookies.refreshToken;
        if (!oldToken) return res.sendStatus(401);
        const { newAccessToken, newRefreshToken } = await authService.refresh(oldToken); 
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            sameSite: "Strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error("Refresh error:", err);
        res.sendStatus(403);
    }
});


router.post("/logout", (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) authService.logout(token);
    res.clearCookie("refreshToken");
    res.clearCookie("csrfToken");
    res.sendStatus(204);
})

module.exports = router;