import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.model.js";

//1. auth controllers
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create admin user
    const admin = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Admin registered successfully",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find admin
    const existing = await User.findOne({ email });
    if (!existing) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, existing.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: existing._id, email: existing.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Admin login successful",
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//2. doctor management controllers
const addDoctor = async (req, res) => {
  try {
    const { name, specialization, role, availability } = req.body;
    const doctor = await Doctor.create({
      name,
      specialization,
      role,
      availability
    });
    res.status(201).json({ success: true, message: "Doctor added successfully", doctor })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: doctors.length, doctors })
  } catch (error) {

  }
}

const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

export {
  register,
  login,

  addDoctor,
  getAllDoctors,
  getDoctorById,
  deleteDoctor
}