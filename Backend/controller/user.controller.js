import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user.schema.js';  
import Role from '../model/role.schema.js'; 

export const signup = async (req, res) => {
    try {
        const { fullname, email, password, role } = req.body;

        // Validate input
        if (!fullname || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Find role by name
        const foundRole = await Role.findOne({ role_Name: role });
        if (!foundRole) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create and save user
        const createdUser = new User({
            fullname,
            email,
            password: hashedPassword,
            role: foundRole._id, // Save the ObjectId reference to the Role
        });
        await createdUser.save();

        // Respond with user details and role_Name
        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: createdUser._id,
                fullname: createdUser.fullname,
                email: createdUser.email,
                role: foundRole.role_Name, // Include the role name in the response
            },
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        console.log("Login Request Body:", req.body);
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // Find user by email and populate the role
        const user = await User.findOne({ email }).populate('role');
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    role: user.role.role_Name
                }
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log("Login Response:", {
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role.role_Name
            }
        });

        // Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role.role_Name
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};