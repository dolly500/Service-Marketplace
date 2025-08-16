import express from "express";
import multer from 'multer';
import {
  requestOtp,
  signUp,
  login,
  forgotPassword,
  resetPassword,
  registerServiceProvider, 
  loginServiceProvider, 
  getProfile, 
  updateProfile 
} from "../controllers/authController.js";
import authMiddleware from '../middleware/authMiddleware.js';

const authRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Auth service provider routes
authRouter.post("/register-service", upload.single("profileImage"), registerServiceProvider);
authRouter.post("/login-service", loginServiceProvider);
authRouter.get("/profile-service", authMiddleware, getProfile);
authRouter.put("/profile-service", authMiddleware, upload.single("profileImage"), updateProfile);


authRouter.post("/request-otp", requestOtp);
authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
