import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        // Get JWT token from cookies
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No token provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user by id
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            return res.status(401).json({ error: "Unauthorized - User not found" });
        }
        
        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);
        res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
}