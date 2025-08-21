import serviceModel from "../models/serviceModel.js";
import categoryModel from "../models/categoryModel.js";
import fs from 'fs';

// Add service with category validation (Admin Route)
const addService = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.json({
                success: false,
                message: "Image is required"
            });
        }

        let image_filename = req.file.filename;
        
        // Handle the trailing space in the 'name' field
        const name = req.body.name || req.body['name '];
    const description = req.body.description;
    const price = req.body.price;
    const category = req.body.category;
    const city = req.body.city;
    const country = req.body.country;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
       
        
        // Validate required fields
      if (!name || !description || !price || !category || !city || !country) {
      fs.unlink(`uploads/${image_filename}`, () => {});
      return res.json({
        success: false,
        message: "All fields (name, description, price, category, city, country) are required"
      });
    }
        
        // Validate if category exists and is active
        const categoryDoc = await categoryModel.findOne({ 
            name: category, 
            isActive: true 
        });

        if (!categoryDoc) {
            // Remove uploaded image if category is invalid
            fs.unlink(`uploads/${image_filename}`, () => {});
            return res.json({
                success: false,
                message: "Invalid category selected"
            });
        }

      const service = new serviceModel({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: categoryDoc._id,
      image: image_filename,
      location: {
        city: city.trim(),
        country: country.trim(),
        coordinates: {
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined
        }
      }
    });

        await service.save();
        res.json({
            success: true,
            message: "Service added successfully",
            data: service
        });

    } catch (error) {
        console.log(error);
        // Remove uploaded image if there's an error
        if (req.file && req.file.filename) {
            fs.unlink(`uploads/${req.file.filename}`, () => {});
        }
        res.json({
            success: false,
            message: "Error adding service"
        });
    }
};

// Get all services list with optional category filter (Public Route)
const listService = async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        
        // Build query object
        let query = { isActive: true };
        
        // If category is provided, filter by category
        if (category && category !== 'All') {
            // Find category by name
            const categoryDoc = await categoryModel.findOne({ 
                name: category, 
                isActive: true 
            });

            if (!categoryDoc) {
                return res.json({
                    success: false,
                    message: "Category not found"
                });
            }

            query.category = categoryDoc._id;
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Fetch services with pagination
        const services = await serviceModel.find(query)
            .populate('category', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
        
        // Get total count for pagination
        const totalServices = await serviceModel.countDocuments(query);
            
        res.json({
            success: true,
            data: services,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalServices / limit),
                totalServices,
                hasNextPage: skip + services.length < totalServices,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error fetching services"
        });
    }
};


// Get all services (including inactive ones) - for admin panel
const listAllServices = async (req, res) => {
    try {
        const services = await serviceModel.find({})
            .populate('category', 'name')
            .sort({ createdAt: -1 });
            
        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error fetching services"
        });
    }
};

// Get services by service provider (Public Route - for displaying provider's services)
const getServicesByProvider = async (req, res) => {
    try {
        const { providerId } = req.params;

        const services = await serviceModel.find({ 
            serviceProvider: providerId,
            isActive: true 
        }).populate('category', 'name');

        if (!services.length) {
            return res.json({
                success: false,
                message: "No services found for this provider"
            });
        }

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error fetching services by provider"
        });
    }
};


// Get services by category (Public Route) - Updated to remove service provider
const listServicesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        // Validate if category exists and is active
        const categoryExists = await categoryModel.findOne({ 
            name: category, 
            isActive: true 
        });

        if (!categoryExists) {
            return res.json({
                success: false,
                message: "Category not found"
            });
        }

        const services = await serviceModel.find({ 
            category: categoryExists._id,
            isActive: true 
        })
            .populate('category', 'name');
            
        res.json({
            success: true,
            data: services
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error fetching services by category"
        });
    }
};

// Update service (Admin Route)
const updateService = async (req, res) => {
    try {
        const { id, name, description, price, category, isActive } = req.body;

        // Check if service exists
        const existingService = await serviceModel.findById(id);

        if (!existingService) {
            return res.json({
                success: false,
                message: "Service not found"
            });
        }

        // If category is being updated, validate it exists and is active
        if (category) {
            const categoryExists = await categoryModel.findOne({ 
                name: category, 
                isActive: true 
            });

            if (!categoryExists) {
                return res.json({
                    success: false,
                    message: "Invalid category selected"
                });
            }
        }

        const updateData = {
            updatedAt: Date.now()
        };

        if (name) updateData.name = name.trim();
        if (description) updateData.description = description.trim();
        if (price) updateData.price = Number(price);
        if (typeof isActive !== 'undefined') updateData.isActive = isActive;
        
        if (category) {
            const categoryDoc = await categoryModel.findOne({ name: category, isActive: true });
            updateData.category = categoryDoc._id;
        }

        // If new image is uploaded
        if (req.file && req.file.filename) {
            // Remove old image
            if (existingService.image) {
                fs.unlink(`uploads/${existingService.image}`, (err) => {
                    if (err) console.log("Error deleting old image:", err);
                });
            }
            updateData.image = req.file.filename;
        }

        const service = await serviceModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
            .populate('category', 'name');

        res.json({
            success: true,
            message: "Service updated successfully",
            data: service
        });

    } catch (error) {
        console.log(error);
        if (req.file && req.file.filename) {
            fs.unlink(`uploads/${req.file.filename}`, () => {});
        }
        res.json({
            success: false,
            message: "Error updating service"
        });
    }
};

// Delete service (Admin Route - soft delete)
const deleteService = async (req, res) => {
    try {
        const { id } = req.body;

        const service = await serviceModel.findByIdAndUpdate(
            id,
            { 
                isActive: false,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!service) {
            return res.json({
                success: false,
                message: "Service not found"
            });
        }

        res.json({
            success: true,
            message: "Service deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error deleting service"
        });
    }
};

const getServiceDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate if ID is provided
        if (!id) {
            return res.json({
                success: false,
                message: "Service ID is required"
            });
        }

        // Find service by ID and populate category
        const service = await serviceModel.findOne({ 
            _id: id, 
            isActive: true 
        }).populate('category', 'name');

        if (!service) {
            return res.json({
                success: false,
                message: "Service not found or inactive"
            });
        }

        res.json({
            success: true,
            data: service
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error fetching service details"
        });
    }
};

// Remove service (Admin Route - hard delete)
const removeService = async (req, res) => {
    try {
        const { id } = req.body;
        
        const service = await serviceModel.findById(id);
        
        if (!service) {
            return res.json({
                success: false,
                message: "Service not found"
            });
        }

        // Remove image file
        if (service.image) {
            fs.unlink(`uploads/${service.image}`, (err) => {
                if (err) console.log("Error deleting image:", err);
            });
        }

        await serviceModel.findByIdAndDelete(id);
        res.json({
            success: true,
            message: "Service permanently removed"
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error removing service"
        });
    }
};

// Global search for services by location and other filters (Public Route)
const searchServices = async (req, res) => {
    try {
        const { 
            query, 
            category, 
            city, 
            country, 
            minPrice, 
            maxPrice, 
            latitude, 
            longitude, 
            radius, 
            page = 1, 
            limit = 10 
        } = req.query;

        let searchQuery = { isActive: true };

        // Text search for service name or description
        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category && category !== 'All') {
            const categoryDoc = await categoryModel.findOne({ 
                name: category, 
                isActive: true 
            });
            if (categoryDoc) {
                searchQuery.category = categoryDoc._id;
            } else {
                return res.json({
                    success: false,
                    message: "Category not found"
                });
            }
        }

        // Filter by location (city and/or country)
        if (city) {
            searchQuery['location.city'] = { $regex: city, $options: 'i' };
        }
        if (country) {
            searchQuery['location.country'] = { $regex: country, $options: 'i' };
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            searchQuery.price = {};
            if (minPrice) searchQuery.price.$gte = Number(minPrice);
            if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
        }

        // Geospatial search if coordinates and radius are provided
        if (latitude && longitude && radius) {
            searchQuery['location.coordinates'] = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    $maxDistance: Number(radius) * 1000 // Convert km to meters
                }
            };
        }

        const skip = (page - 1) * limit;
        
        const services = await serviceModel.find(searchQuery)
            .populate('category', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalServices = await serviceModel.countDocuments(searchQuery);

        res.json({
            success: true,
            data: services,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalServices / limit),
                totalServices,
                hasNextPage: skip + services.length < totalServices,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error searching services"
        });
    }
};

export {
    addService,
    listService,
    listAllServices,
    getServicesByProvider,
    listServicesByCategory,
    updateService,
    deleteService,
    getServiceDetail,
    removeService,
    searchServices
};