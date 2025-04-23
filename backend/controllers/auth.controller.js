import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        
        // heck existing user
        const existingUser = await User.findOne({ username });
        if(existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }
        const existingEmail = await User.findOne({ email });
        if(existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        //check password length
        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        //hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        //create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
        });

        if(newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg, 
                // bio: newUser.bio,
                // link: newUser.link,
                followers: newUser.followers,
                following: newUser.following,
            })
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        //check if user exists
        const user = await User.findOne({ username });
        if(!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        };

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid username or password" });
        };

        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            profileImg: user.profileImg,
            coverImg: user.coverImg, 
            // bio: user.bio,
            // link: user.link,
            followers: user.followers,
            following: user.following,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 0, // Set maxAge to 0 to delete the cookie immediately
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}