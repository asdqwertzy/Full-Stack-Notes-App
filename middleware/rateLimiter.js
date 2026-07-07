const rateLimit = require("express-rate-limit")

const loginLimiter = rateLimit ({
    windowMs: 15*60*1000,
    max: 5,
    message: { error: "Too many login attempts" }
});

module.exports = loginLimiter;
