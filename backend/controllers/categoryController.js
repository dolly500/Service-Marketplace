import categoryModel from "../models/categoryModel.js";


// Add new category
const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file ? req.file.filename : null;

        // Check if category already exists
        const existingCategory = await categoryModel.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });

        if (existingCategory) {
            return res.json({
                success: false,
                message: "Category already exists"
            });
        }

        // Validate required fields
        if (!name || !description || !image) {
            return res.json({
                success: false,
                message: "Name, description, and image are required"
            });
        }

        const category = new categoryModel({
            name: name.trim(),
            description: description.trim(),
            image
        });

        await category.save();
        res.json({
            success: true,
            message: "Category added successfully",
            data: category
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error adding category"
        });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id, name, description, isActive } = req.body;
        const image = req.file ? req.file.filename : undefined;

        // Check if another category with the same name exists
        if (name) {
            const existingCategory = await categoryModel.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: id }
            });

            if (existingCategory) {
                return res.json({
                    success: false,
                    message: "Category name already exists"
                });
            }
        }

        const updateData = {
            updatedAt: Date.now()
        };

        if (name) updateData.name = name.trim();
        if (description) updateData.description = description.trim();
        if (image) updateData.image = image;
        if (typeof isActive !== 'undefined') updateData.isActive = isActive;

        const category = await categoryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!category) {
            return res.json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error updating category"
        });
    }
};

// Get all categories
const listCategories = async (req, res) => {
  try {
    const categories = await categoryModel.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: "services", 
          localField: "_id",
          foreignField: "category", 
          as: "services"
        }
      },
      {
        $addFields: {
          serviceCount: { $size: "$services" }
        }
      },
      {
        $project: {
          services: 0 
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error fetching categories"
    });
  }
};


// Get all categories (including inactive ones) - for admin panel
const listAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({})
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error fetching categories"
        });
    }
};

// Delete category (soft delete - set isActive to false)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;

        const category = await categoryModel.findByIdAndUpdate(
            id,
            { 
                isActive: false,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!category) {
            return res.json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error deleting category"
        });
    }
};

// Permanently remove category (hard delete)
const removeCategory = async (req, res) => {
    try {
        const { id } = req.body;

        const category = await categoryModel.findByIdAndDelete(id);

        if (!category) {
            return res.json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({
            success: true,
            message: "Category permanently removed"
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error removing category"
        });
    }
};

export {
    addCategory,
    listCategories,
    listAllCategories,
    updateCategory,
    deleteCategory,
    removeCategory
};