import express from "express";
import { UserModel } from "./db.js";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";
import type { Response } from "express";
import { authMiddleware } from "./middleware.js";
import type { AuthRequest } from "./middleware.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const JWT_SECRET = process.env.JWT_SECRET as string;

// ---------------------------------------------------
// ✅ SIGNUP — AUTH SERVICE
// ---------------------------------------------------
app.post("/api/v1/auth/signup", async (req, res) => {
  const { username, password, email,role } = req.body;

  // FIXED: Proper duplicate check
  const existingUser = await UserModel.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    username,
    password: hashedPassword,
    email,
     role: role || "customer" 
  });

  try {
    await axios.post("http://users:4000/api/v1/users", {
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    await UserModel.findByIdAndDelete(newUser._id);
    return res.status(500).json({ message: "User service sync failed" });
  }

  res.status(201).json({ message: "Signup successful" });
});

// ---------------------------------------------------
// ✅ SIGNIN
// ---------------------------------------------------
app.post("/api/v1/auth/signin", async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  const existingUser = await UserModel.findOne({
    $or: [
      { username: usernameOrEmail },
      { email: usernameOrEmail }
    ]
  });

  if (!existingUser) {
    return res.status(403).json({ message: "Incorrect credentials" });
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);
  if (!isMatch) {
    return res.status(403).json({ message: "Incorrect credentials" });
  }

  // FIXED: JWT must use "userId"
  const token = jwt.sign(
    {
      userId: existingUser._id,
      username: existingUser.username,
      role: existingUser.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    role: existingUser.role
  });
});

// ---------------------------------------------------
// ✅ CHANGE PASSWORD
// ---------------------------------------------------
app.put("/api/v1/auth/change-password", authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Old and new passwords required" });
      }

      const user = await UserModel.findById(req.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(403).json({ message: "Old password incorrect" });

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (err) {
      console.error("Change Password Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
});

// ---------------------------------------------------
// ✅ DELETE USER — AUTH + USER SERVICE
// ---------------------------------------------------
app.delete("/api/v1/auth/delete-user", authMiddleware, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Invalid token payload" });

    await UserModel.findByIdAndDelete(req.userId);

    res.json({ message: "Auth account deleted" });
  } catch (err) {
    console.error("Auth Delete Error:", err);
    res.status(500).json({ message: "Auth delete failed" });
  }
});


app.put("/api/v1/auth/update-username", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body;  // 🔥 FIXED

    if (!username) {
      return res.status(400).json({ message: "New username required" });
    }

    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username;   // 🔥 UPDATE CORRECT FIELD
    await user.save();

    return res.json({ message: "Username updated in Auth DB" });

  } catch (err) {
    console.error("Auth Sync Error:", err);
    res.status(500).json({ message: "Auth sync failed" });
  }
});




app.listen(process.env.PORT || 3000, () => {
  console.log(`Auth Service running on port ${process.env.PORT || 3000}`);
});
