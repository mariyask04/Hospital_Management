import OTSchedule from "../models/OTSchedule.model.js";
import Patient from "../models/Patient.model.js";
import Report from "../models/Report.model.js";

const createReport = async (req, res) => {
    try {
        const { otSchedule, patient, reportType, content } = req.body;

        const scheduleExists = await OTSchedule.findById(otSchedule);
        if (!scheduleExists) {
            return res.status(404).json({ message: "OT Schedule not found." })
        }
        const patientExists = await Patient.findById(patient);
        if (!patientExists) {
            return res.status(404).json({ message: "Patient not found." })
        }
        const report = await Report.create({
            otSchedule,
            patient,
            reportType,
            content,
            createdBy: req.user._id
        });
        res.status(201).json({
            success: true,
            message: "Report created successfully",
            report
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating report", error });
    }
}

const getReportsBySurgery = async (req, res) => {
    try {
        const reports = await Report.find({ otSchedule: req.params.scheduleId })
            .populate("patient", "name age gender")
            .populate("otSchedule", "date otNumber")
        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: "Error fetching reports", error });
    }
}

const getReportsByPatient = async (req, res) => {
    try {
        const reports = await Report.find({ patient: req.params.patientId })
            .populate("otSchedule", "date otNumber status")
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reports", error });
    }
}

const updateReport = async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.status(200).json({
            message: "Report updated successfully",
            report
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating report", error });
    }
}

const deleteReport = async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.status(200).json({
            message: "Report deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting report", error });
    }
}

const addAttachment = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        report.attachments.push({
            fileName: req.file.filename,
            fileUrl: `/uploads/reports/${req.file.filename}`
        })
        await report.save();
        res.status(200).json({
            message: "File uploaded successfully",
            report
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export {
    createReport,
    getReportsBySurgery,
    getReportsByPatient,
    updateReport,
    deleteReport,
    addAttachment
}