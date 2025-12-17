import express, { Response } from "express";
import { UserModel } from "./db.js";
import cors from "cors";
import { authMiddleware } from "./middleware.js";
import type { AuthRequest } from "./middleware.js";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// --------------------------------------------------
// ✅ CREATE USER (Called from Auth Service at signup)
// --------------------------------------------------
app.post("/api/v1/users", async (req, res) => {
  try {
    const { userId, username, email, role } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ message: "userId and username are required" });
    }

    const existing = await UserModel.findOne({ userId });
    if (existing) {
      return res
        .status(409)
        .json({ message: "User already exists in User Service" });
    }

    const user = await UserModel.create({
      userId,
      username,
      email,
      role: role || "customer",  // ✔ FIXED (use role from Auth Service)
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("Create User Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------------------
// ✅ GET LOGGED-IN USER PROFILE
// --------------------------------------------------
app.get(
  "/api/v1/users/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      // ✔ FIX: Only validate userId and username
      if (!req.userId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      let user = await UserModel.findOne({ userId: req.userId });

      // ✔ SELF-HEAL: if no profile exists, create it
      if (!user) {
        user = await UserModel.create({
  userId: req.userId,
  username: req.username || "UnknownUser",
  role: req.role || "customer",
  email: ""
});
      }

      res.json(user);
    } catch (err) {
      console.error("Get Me Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// --------------------------------------------------
// ✅ UPDATE LOGGED-IN USER PROFILE
// --------------------------------------------------

app.put(
  "/api/v1/users/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      // ❌ Prevent restricted fields
      if (req.body.email !== undefined) {
        return res.status(400).json({ message: "Email cannot be updated" });
      }

      if (req.body.role !== undefined) {
        return res.status(400).json({ message: "Role cannot be changed" });
      }

      // Allow only safe fields
      const allowedUpdates: any = {};

      if (req.body.username) allowedUpdates.username = req.body.username;
      if (req.body.address) allowedUpdates.address = req.body.address;
      if (req.body.phone) allowedUpdates.phone = req.body.phone;

      // IMPORTANT: use userId field, not _id
      const updatedUser = await UserModel.findOneAndUpdate(
        { userId: req.userId },
        allowedUpdates,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found in UserService" });
      }

      // 🔥 SYNC USERNAME WITH AUTH SERVICE
      if (req.body.username) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ message: "Authorization header missing" });
        }

        await axios.put(
          "http://auth:3000/api/v1/auth/update-username",
          {
            userId: req.userId,
            username: req.body.username,
          },
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
      }

      res.json(updatedUser);
    } catch (err) {
      console.error("Update Me Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


// --------------------------------------------------
// ✅ DELETE ACCOUNT (Sync with Auth Service)
// --------------------------------------------------
app.delete(
  "/api/v1/users/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      const deletedUser = await UserModel.findOneAndDelete({
        userId: req.userId,
      });

      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
      }

      if (!process.env.AUTH_SERVICE_URL) {
        throw new Error("AUTH_SERVICE_URL not defined in .env");
      }

      // ✔ Sync delete to Auth Service
      await axios.delete(
        `${process.env.AUTH_SERVICE_URL}/api/v1/auth/delete-user`,
        {
          headers: {
            Authorization: authHeader,
          },
        }
      );

      res.json({ message: "Account deleted successfully ✅" });

    } catch (err) {
      console.error("Delete Account Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.listen(process.env.PORT || 4000, () => {
  console.log(`✅ User Service running on port ${process.env.PORT || 4000}`);
});
