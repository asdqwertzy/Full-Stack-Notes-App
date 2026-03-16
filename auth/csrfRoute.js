const express = require("express");
const router = express.Router();
const crypto = require("crypto");

router.get("/", (req, res) => {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie("csrfToken", token, { httpOnly: false, sameSite: "strict" });
    res.json({ csrfToken: token });
});

module.exports = router;
