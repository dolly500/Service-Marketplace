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
    removeService,
    getServiceDetail,
    searchServices
} from '../controllers/serviceController.js';


const serviceRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Admin routes (require authentication)
serviceRouter.post("/add", upload.single("image"), addService);
serviceRouter.put("/update", upload.single("image"), updateService);
serviceRouter.post("/delete", deleteService); 
serviceRouter.post("/remove", removeService); 
serviceRouter.get("/all", listAllServices); 

// Public routes (no authentication required)
serviceRouter.get("/list", listService);
serviceRouter.get("/detail/:id", getServiceDetail); 
serviceRouter.get("/category/:category", listServicesByCategory);
serviceRouter.get("/provider/:providerId", getServicesByProvider);
serviceRouter.get("/search", searchServices);

export default serviceRouter;