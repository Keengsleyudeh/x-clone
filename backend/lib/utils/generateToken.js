import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = async (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });

    res.cookie("jwt", token, {
        httpOnly: true, // HttpOnly flag to prevent client-side access
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict", // CSRF protection
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });
};