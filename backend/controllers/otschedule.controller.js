import Doctor from "../models/Doctor.model.js";
import Patient from "../models/Patient.model.js";
import OTSchedule from "../models/OTSchedule.model.js";

const createSchedule = async (req, res) => {
    try {
        const {
            date,
            otNumber,
            anesthesiaType,
            anesthesiologist,
            surgeon,
            assistantSurgeon,
            nurses,
            patient,
            requiredResources
        } = req.body;
        const patientExists = await Patient.findById(patient);
        if (!patientExists) {
            res.status(404).json({ message: "Patient not found" });
        }
        const surgeonExists = await Doctor.findById(surgeon);
        if (!surgeonExists) {
            res.status(404).json({ message: "Surgeon not found" });
        }
        const conflict = await OTSchedule.findOne({
            date,
            otNumber,
            status: { $ne: "Cancelled" }
        });
        if (conflict) {
            return res.status(400).json({
                message: "This OT is already booked for this time"
            });
        }
        const schedule = await OTSchedule.create({
            date,
            otNumber,
            anesthesiaType,
            anesthesiologist,
            surgeon,
            assistantSurgeon,
            nurses,
            patient,
            requiredResources
        });
        res.status(201).json({ success: true, message: "Surgery scheduled successfully", schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllSchedules = async (req, res) => {
    try {
        const schedules = await OTSchedule.find()
            .populate("patient")
            .populate("surgeon")
            .populate("assistantSurgeon")
            .populate("anesthesiologist")
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: schedules.length,
            schedules
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getScheduleById = async (req, res) => {
    try {
        const schedule = await OTSchedule.findById(req.params.id)
            .populate("patient")
            .populate("surgeon")
            .populate("assistantSurgeon")
            .populate("anesthesiologist");

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        res.status(200).json(schedule);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const schedule = await OTSchedule.findById(req.params.id);

        const newDate = req.body.date || schedule.date;
        const newOT = req.body.otNumber || schedule.otNumber;

        const existing = await OTSchedule.findOne({
            _id:{$ne:req.params.id},
            date:newDate,
            otNumber:newOT,
            status:{$ne:"Cancelled"}
        })
        if (existing) {
            return res.status(400).json({
                message: "This OT is already booked at the selected date and time"
            });
        }

        const updatedSchedule = await OTSchedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Schedule updated",
            schedule: updatedSchedule
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelSchedule = async (req, res) => {
    try {
        const schedule = await OTSchedule.findByIdAndUpdate(
            req.params.id,
            { status: "Cancelled" },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        res.status(200).json({
            message: "Surgery cancelled",
            schedule
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const completeSchedule = async (req, res) => {
    try {
        const { postOpNotes, remarks } = req.body;

        const schedule = await OTSchedule.findByIdAndUpdate(
            req.params.id,
            {
                status: "Completed",
                postOpNotes,
                remarks
            },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        res.status(200).json({
            message: "Surgery marked as completed",
            schedule
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    completeSchedule,
    cancelSchedule,
    updateSchedule,
    getScheduleById,
    getAllSchedules,
    createSchedule,
}