// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import serviceProviderModel from '../models/serviceProviderModel.js';

const authMiddleware = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find service provider by ID
        const serviceProvider = await serviceProviderModel.findById(decoded.id).select('-password');

        if (!serviceProvider) {
            return res.json({
                success: false,
                message: "Service provider not found"
            });
        }

        // Check if service provider is active
        if (!serviceProvider.isActive) {
            return res.json({
                success: false,
                message: "Your account has been deactivated. Please contact support."
            });
        }

        // Add service provider to request object
        req.serviceProvider = serviceProvider;
        next();

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Invalid token"
        });
    }
};

export default authMiddleware;
