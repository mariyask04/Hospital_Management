import mongoose from "mongoose";

const otScheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
    },
    otNumber: {
        type: Number,
    },
    anesthesiaType: {
        type: String
    },
    anesthesiologist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
    },
    surgeon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
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
        ref: "Patient"
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
        drigs: [String],
        instruments: [String],
        materials: [String]
    }
}, { timestamps: true });

export default mongoose.model("OTSchedule", otScheduleSchema)