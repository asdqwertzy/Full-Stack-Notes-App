const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../prismaClient")
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET



async function login(username, password) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        throw new Error("Invalid credentials -- authService")
    }
    console.log({ username, password, userPassword: user.password })
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error("Invalid credentials -- authService")
    }
    console.log("JWT_SECRET:", JWT_SECRET, "REFRESH_SECRET:", REFRESH_SECRET);

    const accessToken = jwt.sign(
        { id: user.id, type: "access" },
        JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: user.id, type: "refresh" },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );
    try {
        console.log("About to insert refresh token into DB");
        await prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id }
        });
        console.log("Inserted refresh token OK");
    } catch (err) {
        console.error("Failed to insert refresh token:", err);
        throw err; 
    }
    return { accessToken, refreshToken };
}

async function refresh(oldRefreshToken) {
    let payload;

    try {
        payload = jwt.verify(oldRefreshToken, REFRESH_SECRET);
    } catch {
        throw new Error("Invalid refresh token");
    }

    const stored = await prisma.refreshToken.findUnique({
        where: { token: oldRefreshToken }
    });

    if (!stored) {
        throw new Error("Refresh token revoked");
    }

    const newAccessToken = jwt.sign(
        { id: payload.id, type: "access" },
        JWT_SECRET,
        { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
        { id: payload.id, type: "refresh" },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    await prisma.$transaction([
        prisma.refreshToken.delete({
            where: { token: oldRefreshToken }
        }),
        prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: payload.id
            }
        })
    ]);

    return { newAccessToken, newRefreshToken };
}


async function logout(refreshToken) {
    await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
    });
}

module.exports = {
    login,
    refresh,
    logout
}