const bcrypt = require("bcrypt");
const prisma = require("../prismaClient");
const express = require("express");
const { NotBeforeError } = require("jsonwebtoken");
const router = express.Router();


router.post("/register", async (req, res) => {
    console.log(req.body)
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Missing fields" });
        }
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({ data: { username, password: hashedPassword } })
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        console.error("Register route error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
