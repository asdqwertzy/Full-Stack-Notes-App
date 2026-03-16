function csrfProtection(req, res, next) {
    const tokenFromHeader = req.headers['x-csrf-token'];
    const tokenFromCookie = req.cookies?.csrfToken;
    console.log("CSRF middleware hit:", req.path);
    if (!tokenFromHeader) return res.status(403).json({ error: "CSRF token missing" });
    if (!tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
        return res.status(403).json({ error: "Invalid CSRF token" });
    }
    next();
}

module.exports = csrfProtection;
