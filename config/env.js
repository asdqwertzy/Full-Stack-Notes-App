require("dotenv").config();

const requiredVariables = [
    "DATABASE_URL",
    "JWT_SECRET",
    "REFRESH_SECRET"
];

for (const variable of requiredVariables) {
    if (!process.env[variable]) {
        throw new Error(`${variable} is missing`);
    }
}

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_SECRET: process.env.REFRESH_SECRET
};