const jwt = require("jsonwebtoken");
const JWT_SECRET = "hashkey123";


module.exports = function authenticate(req, res, next) {
    console.log("Authenticate middleware triggered");
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        console.log("AUTH middleware hit:", req.path);
        if (err) return res.sendStatus(401);
        if (payload.type !== "access") return res.sendStatus(403);
        req.user = payload;
        next();
    })
}