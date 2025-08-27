import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    image: { 
        type: String, 
        required: true 
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'category' 
    },
    location: {
        city: { 
            type: String, 
            required: false 
        },
        country: { 
            type: String, 
            required: false 
        },
        coordinates: {
            latitude: { 
                type: Number, 
                required: false 
            },
            longitude: { 
                type: Number,  
                required: false 
            }
        }
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

serviceSchema.index({ 
    'location.coordinates': '2dsphere' 
});

// Update updatedAt before saving
serviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Register model with capitalized name 'Service'
const Service = mongoose.model("Service", serviceSchema);

export default Service;