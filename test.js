const express = require("express");
const app = express();

app.get("/ping", (req, res) => {
    res.send("pong");
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

setInterval(() => {}, 10000);
