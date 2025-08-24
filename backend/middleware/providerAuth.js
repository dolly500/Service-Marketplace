// middleware/providerAuth.js
import jwt from "jsonwebtoken";
import serviceProviderModel from "../models/serviceProviderModel.js";

export const protectProvider = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token, not authorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find provider by ID from token
    const provider = await serviceProviderModel.findById(decoded.id).select("-password");
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    req.provider = provider; // attach provider to request
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
