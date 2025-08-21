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

    // Check if all required fields are provided
    if (!name || !email || !password || !phone || !businessName || !businessAddress || !businessDescription) {
      if (req.file) {
        fs.unlink(`uploads/${req.file.filename}`, () => {});
      }
      return res.status(400).json({
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
      return res.status(400).json({
        success: false,
        message: "Service provider with this email already exists"
      });
    }

    // Validate password strength
    if (password.length < 6) {
      if (req.file) {
        fs.unlink(`uploads/${req.file.filename}`, () => {});
      }
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Create new service provider
    const serviceProvider = new serviceProviderModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Password will be hashed by pre-save middleware
      phone,
      businessName: businessName.trim(),
      businessAddress,
      businessDescription,
      profileImage: req.file ? req.file.filename : null,
      isApproved: false // Set to false, pending admin approval
    });

    console.log('Saving service provider...');
    await serviceProvider.save();
    console.log('Service provider saved successfully');

    // Email to Admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New Service Provider Awaiting Approval",
      text: `A new service provider has registered:\n\n
             Name: ${name}\n
             Email: ${email}\n
             Business: ${businessName}\n
             Please review and approve/reject this provider.`
    };

    // Email to Provider
    const providerMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Registration Received - Pending Approval",
      text: `Hello ${name},\n\n
Thank you for registering as a service provider on Servicity.\n
Your business "${businessName}" has been submitted for review.\n
Our admin team will verify your details and notify you once your account is approved.\n\n
Best regards,\nThe Team`
    };

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(providerMailOptions)
    ]).catch(err => console.error("Email sending error:", err));

    // ✅ Respond with provider info
    res.status(201).json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      provider: {
        id: serviceProvider._id,
        name: serviceProvider.name,
        email: serviceProvider.email,
        businessName: serviceProvider.businessName
      }
    });
  } catch (error) {
    console.log('Registration error:', error);
    if (req.file) {
      fs.unlink(`uploads/${req.file.filename}`, () => {});
    }
    res.status(500).json({
      success: false,
      message: "Error registering service provider"
    });
  }
};


// Approve Service Provider Endpoint
const approveServiceProvider = async (req, res) => {
  try {
    const { providerId, isApproved } = req.body;

    // Check if required fields are provided
    if (!providerId || typeof isApproved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Provider ID and approval status are required"
      });
    }

    // Find service provider
    const serviceProvider = await serviceProviderModel.findById(providerId);
    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found"
      });
    }

    // Update approval status
    serviceProvider.isApproved = isApproved;
    await serviceProvider.save();

    // Send notification email to provider
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: serviceProvider.email,
      subject: isApproved ? "Service Provider Approval" : "Service Provider Application Update",
      text: `Hello ${serviceProvider.name},\n\n
        Your service provider application for "${serviceProvider.businessName}" has been ${isApproved ? 'approved' : 'rejected'}. you can now login as a provider.\n
        ${isApproved ?
          'You can now log in and start offering your services on Servicity.' : 
          'Please contact our support team for more information.'}\n\n
        Best regards,\nThe Team`
    };

    await transporter.sendMail(mailOptions).catch(err => 
      console.error("Email sending error:", err)
    );

    res.status(200).json({
      success: true,
      message: `Service provider ${isApproved ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({
      success: false,
      message: "Error processing approval request"
    });
  }
};

// Service Provider Login Endpoint
const loginServiceProvider = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all required fields are
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find service provider
    const serviceProvider = await serviceProviderModel.findOne({
      email: email.toLowerCase().trim()
    });

    if (!serviceProvider) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if approved
    if (!serviceProvider.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Account is pending approval"
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, serviceProvider.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: serviceProvider._id,
        email: serviceProvider.email,
        role: 'serviceProvider'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      provider: {
        id: serviceProvider._id,
        name: serviceProvider.name,
        email: serviceProvider.email,
        businessName: serviceProvider.businessName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Error logging in service provider"
    });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const providers = await serviceProviderModel.find({}, 'name email businessName isApproved _id');
    res.json({
      success: true,
      count: providers.length,
      providers: providers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
export {
    registerServiceProvider,
    loginServiceProvider,
    approveServiceProvider,
    getAllProviders,
};