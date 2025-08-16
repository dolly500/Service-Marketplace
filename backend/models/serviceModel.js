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

// Update updatedAt before saving
serviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const serviceModel = mongoose.model("service", serviceSchema);

export default serviceModel;
