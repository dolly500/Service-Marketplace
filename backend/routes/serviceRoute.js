import express from 'express';
import multer from 'multer';
import { 
    addService, 
    listService, 
    listAllServices,
    getServicesByProvider,
    listServicesByCategory, 
    updateService,
    deleteService,
    removeService 
} from '../controllers/serviceController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const serviceRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Admin routes (require authentication - assuming authMiddleware validates admin)
serviceRouter.post("/add", upload.single("image"), addService);
serviceRouter.put("/update", upload.single("image"), updateService);
serviceRouter.post("/delete", deleteService); // Soft delete
serviceRouter.post("/remove", removeService); // Hard delete
serviceRouter.get("/all", listAllServices); // Admin view - all services

// Public routes (no authentication required)
serviceRouter.get("/list", listService); // Active services only
serviceRouter.get("/category/:category", listServicesByCategory);
serviceRouter.get("/provider/:providerId", getServicesByProvider); // Services by specific provider

export default serviceRouter;