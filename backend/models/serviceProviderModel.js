// models/serviceProviderModel.js
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs'; // Changed to bcryptjs for consistency

const serviceProviderSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        required: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessAddress: {
        type: String,
        required: true
    },
    businessDescription: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
serviceProviderSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcryptjs.genSalt(10); // Changed to bcryptjs
        this.password = await bcryptjs.hash(this.password, salt); // Changed to bcryptjs
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
serviceProviderSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password); // Changed to bcryptjs
};

const serviceProviderModel = mongoose.model('ServiceProvider', serviceProviderSchema);

export default serviceProviderModel;