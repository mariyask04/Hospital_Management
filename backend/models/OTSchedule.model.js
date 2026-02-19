import mongoose from "mongoose";

const otScheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    otNumber: {
        type: Number,
        required: true
    },
    anesthesiaType: {
        type: String,
        required: true
    },
    anesthesiologist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    surgeon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    assistantSurgeon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
    },
    nurses: {
        type: [String]
    },
    patient: {
        type: mongoose.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    preOpNotes: {
        type: String
    },
    postOpNotes: {
        type: String
    },
    remarks: {
        type: String
    },
    status: {
        type: String,
        enum: ["Scheduled", "Cancelled", "Postponed", "Emergency", "Completed"],
        default: "Scheduled"
    },
    requiredResources: {
        drugs: [String],
        instruments: [String],
        materials: [String]
    }
}, { timestamps: true });

export default mongoose.model("OTSchedule", otScheduleSchema)