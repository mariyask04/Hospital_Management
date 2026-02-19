import Patient from "../models/Patient.model.js";

const addPatient = async (req, res) => {
    try {
        const { name, age, gender, diagnosis, contact } = req.body;
        if (!name || !age || !gender || !contact) {
            res.status(400).json({ success: false, message: "Please provide all required fields" });
        }
        const patient = await Patient.create({
            name,
            age,
            gender,
            diagnosis,
            contact
        });
        res.status(201).json({ success: true, message: "Patient added successfully", patient });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json(patient);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePatient = async (req, res) => {
    try {
        const { updates } = req.body;
        const patientId = req.params.id;
        if (!updates) {
            res.status(400).json({ message: "Please provide updates" });
        }
        const patient = await Patient.findByIdAndUpdate(patientId, updates, { new: true, runValidators: true });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        res.status(200).json({
            success: true,
            message: "Patient updated successfully",
            patient
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({
            success: true,
            message: "Patient deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    addPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient
}