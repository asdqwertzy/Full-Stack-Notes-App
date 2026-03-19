require("dotenv").config();

const express = require("express");
const authenticate = require("./middleware/authenticate");
const authRegisterRouter = require("./auth/register");
const authLoginRouter = require("./auth/login");
const csrfProtection = require("./middleware/csrf");
const prisma = require("./prismaClient");
const { login, refresh } = require("./services/authService");
const cookieParser = require("cookie-parser");


process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const app = express();
const port = 8080;

app.use(express.json());
app.use(cookieParser());
app.use("/auth/csrf", require("./auth/csrfRoute"));
app.use(express.static('public'));

app.use("/auth", authRegisterRouter);
app.use("/auth", authLoginRouter);

app.use("/api", authenticate);

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get("/api", async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 6, 50);
        const skip = (page - 1) * limit;

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where: { userId: req.user.id },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.note.count({ where: { userId: req.user.id } })
        ]);

        res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            notes
        });
    } catch (err) {
        console.error("GET /api error:", err);
        res.status(500).send("Server error");
    }
});


app.post("/api", csrfProtection, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) throw new Error("No text provided");

        const note = await prisma.note.create({
            data: { text, userId: req.user.id }
        })
        res.status(201).json({ status: "Saved", note });
    } catch (err) {
        console.error("Error saving note:", err);
        res.status(400).json({ error: "Invalid request" });
    }
});


app.delete("/api", csrfProtection, async (req, res) => {
    try {
        await prisma.note.deleteMany({ where: { userId: req.user.id } });
        res.status(200).send("Server notes cleared successfully");
    } catch (err) {
        console.error("DELETE /api error:", err);
        res.status(500).send("Internal server error");
    }
});


app.delete("/api/:id", csrfProtection, async (req, res) => {
    try {
        await prisma.note.deleteMany({ where: { id: parseInt(req.params.id), userId: req.user.id } });
        res.sendStatus(204);
    } catch {
        res.status(400).json({ error: "Invalid ID" });
    }
});

app.patch("/api/:id", csrfProtection, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: "Text is required" });
        }

        const note = await prisma.note.updateMany({
            where: { id: parseInt(req.params.id), userId: req.user.id },
            data: { text: text.trim() },
        });
        if (note.count === 0) return res.status(404).json({ error: "Note not found." });



        if (!note) return res.status(404).json({ error: "Note not found." });

        res.json({ status: "Updated", note });
    } catch (err) {
        console.error("PATCH /api/:id error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});
