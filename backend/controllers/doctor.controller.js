import Doctor from "../models/Doctor.model.js";

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
    addDoctor,
    getAllDoctors,
    getDoctorById,
    deleteDoctor
}