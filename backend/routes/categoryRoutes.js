import express from "express";
import { 
    addCategory, 
    listCategories, 
    listAllCategories, 
    updateCategory, 
    deleteCategory, 
    removeCategory 
} from "../controllers/categoryController.js";
import multer from "multer";

// Image storage engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const categoryRouter = express.Router();

// Add new category with image
categoryRouter.post("/add", upload.single("image"), addCategory);

// Get active categories (for dropdown/selection)
categoryRouter.get("/list", listCategories);

// Get all categories (for admin management)
categoryRouter.get("/admin/list", listAllCategories);

// Update category with optional image
categoryRouter.put("/update", upload.single("image"), updateCategory);

// Soft delete category
categoryRouter.post("/delete", deleteCategory);

// Hard delete category
categoryRouter.post("/remove", removeCategory);

export default categoryRouter;