import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs"; 
import mongoose from "mongoose";
import serviceProviderModel from "../models/serviceProviderModel.js";
import fs from 'fs';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otps = {}; // Temporary in-memory storage for OTPs

export const requestOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps[email] = otp;

  // Print OTP to console for debugging
  console.log("=============================================");
  console.log(`OTP SENT TO ${email}: ${otp}`);
  console.log("=============================================");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Homease",
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP" });
    }
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  });
};

export const signUp = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // Validate inputs
    if (!email || !password || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, password and OTP are required" 
      });
    }

    console.log(`Attempting to sign up user with email: ${email}`);

    // Normalize email (convert to lowercase)
    const normalizedEmail = email.toLowerCase();
    console.log(`Normalized email: ${normalizedEmail}`);

    // Validate OTP
    if (otps[email] !== otp) {
      console.log(`Invalid OTP for ${email}. Expected: ${otps[email]}, Received: ${otp}`);
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Skip the MongoDB lookup and just try to create the user directly
    // We'll rely on the unique index to reject duplicates
    console.log(`Creating new user with email ${normalizedEmail}...`);

    // Create new user with explicit userCode to avoid null values
    const hashedPassword = await bcryptjs.hash(password, 10); // Changed to bcryptjs
    const userCode = new mongoose.Types.ObjectId().toString();
    
    // Check if there are any users already
    const usersCount = await userModel.countDocuments();
    console.log(`Current user count in database: ${usersCount}`);
    
    try {
      // Use insertMany for better error reporting
      const newUser = await userModel.create({
        email: normalizedEmail, 
        password: hashedPassword,
        userCode: userCode,
        phone: null, // Explicitly set to null instead of empty string
        role: 'user',
        createdAt: new Date(),
        cartData: {}
      });
      
      console.log(`Successfully created user with email ${normalizedEmail} and ID ${newUser._id}`);

      // Generate token for newly created user
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Clean up OTP
      delete otps[email];
      
      // Return success response
      return res.status(201).json({ 
        success: true, 
        message: "User created successfully",
        token
      });
      
    } catch (duplicateError) {
      // If we get here, it's likely a duplicate key error
      console.error("Error during user creation:", duplicateError);
      
      if (duplicateError.code === 11000) {
        // Log the exact duplicate key error for debugging
        console.error(`Duplicate key error details:`, JSON.stringify(duplicateError.keyValue || {}));
        
        // Check if it's a phone-related duplicate key error
        if (duplicateError.keyValue && 'phone' in duplicateError.keyValue) {
          return res.status(400).json({
            success: false,
            message: "Internal database error. Please try again or contact support."
          });
        }
        
        return res.status(400).json({
          success: false,
          message: "Email already in use. Please try a different email address."
        });
      }
      
      throw duplicateError; // rethrow for the outer catch block to handle
    }
    
  } catch (error) {
    console.error("Error during signup:", error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      // Log the exact duplicate key error for debugging
      console.error(`Duplicate key error details:`, JSON.stringify(error.keyValue || {}));
      
      // Check if it's a phone-related duplicate key error
      if (error.keyValue && 'phone' in error.keyValue) {
        return res.status(400).json({
          success: false,
          message: "Internal database error. Please try again or contact support."
        });
      }
      
      return res.status(400).json({
        success: false,
        message: "Email already in use. Please try a different email address."
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      message: "Error creating user. Please try again later."
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const isMatch = await bcryptjs.compare(password, user.password); // Changed to bcryptjs
  if (!isMatch) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.status(200).json({ success: true, token });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps[email] = otp;

  // Print reset password OTP to console for debugging
  console.log("=============================================");
  console.log(`PASSWORD RESET OTP SENT TO ${email}: ${otp}`);
  console.log("=============================================");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP" });
    }
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (otps[email] !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10); // Changed to bcryptjs
  user.password = hashedPassword;
  await user.save();

  delete otps[email];
  res
    .status(200)
    .json({ success: true, message: "Password reset successfully" });
};



// SERVICE PROVIDERS


// Register service provider

const registerServiceProvider = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            businessName,
            businessAddress,
            businessDescription
        } = req.body;

        console.log('Registration attempt for email:', email);
        console.log('Password received:', password);

        // Check if all required fields are provided
        if (!name || !email || !password || !phone || !businessName || !businessAddress || !businessDescription) {
            if (req.file) {
                fs.unlink(`uploads/${req.file.filename}`, () => {});
            }
            return res.json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if service provider already exists
        const existingProvider = await serviceProviderModel.findOne({ 
            email: email.toLowerCase().trim() 
        });
        if (existingProvider) {
            if (req.file) {
                fs.unlink(`uploads/${req.file.filename}`, () => {});
            }
            return res.json({
                success: false,
                message: "Service provider with this email already exists"
            });
        }

        // Validate password strength
        if (password.length < 6) {
            if (req.file) {
                fs.unlink(`uploads/${req.file.filename}`, () => {});
            }
            return res.json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Create new service provider - Let pre-save middleware handle hashing
        const serviceProvider = new serviceProviderModel({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password, 
            phone,
            businessName: businessName.trim(),
            businessAddress,
            businessDescription,
            profileImage: req.file ? req.file.filename : null
        });

        console.log('Saving service provider...');
        await serviceProvider.save();
        console.log('Service provider saved successfully');

        // Generate token
        const token = generateToken(serviceProvider._id);

        // Remove password from response
        const providerResponse = serviceProvider.toObject();
        delete providerResponse.password;

        res.json({
            success: true,
            message: "Service provider registered successfully",
            data: {
                serviceProvider: providerResponse,
                token
            }
        });

    } catch (error) {
        console.log('Registration error:', error);
        if (req.file) {
            fs.unlink(`uploads/${req.file.filename}`, () => {});
        }
        res.json({
            success: false,
            message: "Error registering service provider"
        });
    }
};

// Login service provider
const loginServiceProvider = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for email:', email); // Add debugging

        // Check if email and password are provided
        if (!email || !password) {
            return res.json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find service provider by email (case-insensitive)
        const serviceProvider = await serviceProviderModel.findOne({ 
            email: email.toLowerCase().trim() 
        });
        
        console.log('Service provider found:', serviceProvider ? 'Yes' : 'No'); // Add debugging
        
        if (!serviceProvider) {
            return res.json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if account is active
        if (!serviceProvider.isActive) {
            return res.json({
                success: false,
                message: "Your account has been deactivated. Please contact support."
            });
        }

        // Compare password
        console.log('Comparing passwords...'); // Add debugging
        const isPasswordValid = await serviceProvider.comparePassword(password);
        console.log('Password valid:', isPasswordValid); // Add debugging
        
        if (!isPasswordValid) {
            return res.json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token
        const token = generateToken(serviceProvider._id);

        // Remove password from response
        const providerResponse = serviceProvider.toObject();
        delete providerResponse.password;

        res.json({
            success: true,
            message: "Login successful",
            data: {
                serviceProvider: providerResponse,
                token
            }
        });

    } catch (error) {
        console.log('Login error:', error);
        res.json({
            success: false,
            message: "Error logging in"
        });
    }
};

// Get service provider profile
const getProfile = async (req, res) => {
    try {
        const serviceProvider = await serviceProviderModel.findById(req.serviceProvider.id).select('-password');
        
        if (!serviceProvider) {
            return res.json({
                success: false,
                message: "Service provider not found"
            });
        }

        res.json({
            success: true,
            data: serviceProvider
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error fetching profile"
        });
    }
};

// Update service provider profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, businessName, businessAddress, businessDescription } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (businessName) updateData.businessName = businessName;
        if (businessAddress) updateData.businessAddress = businessAddress;
        if (businessDescription) updateData.businessDescription = businessDescription;

        // If new profile image is uploaded
        if (req.file) {
            const serviceProvider = await serviceProviderModel.findById(req.serviceProvider.id);
            if (serviceProvider && serviceProvider.profileImage) {
                // Remove old profile image
                fs.unlink(`uploads/${serviceProvider.profileImage}`, () => {});
            }
            updateData.profileImage = req.file.filename;
        }

        const serviceProvider = await serviceProviderModel.findByIdAndUpdate(
            req.serviceProvider.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!serviceProvider) {
            return res.json({
                success: false,
                message: "Service provider not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: serviceProvider
        });

    } catch (error) {
        console.log(error);
        if (req.file) {
            fs.unlink(`uploads/${req.file.filename}`, () => {});
        }
        res.json({
            success: false,
            message: "Error updating profile"
        });
    }
};

export {
    registerServiceProvider,
    loginServiceProvider,
    getProfile,
    updateProfile
};