import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    otSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OTSchedule",
        required: true
    },

    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },

    reportType: {
        type: String,
        enum: [
            "Pre-Operative Report",
            "Operative Report",
            "Post-Operative Report",
            "Anesthesia Report",
            "Discharge Summary"
        ],
        required: true
    },

    content: {
        type: String
    },

    attachments: [
        {
            fileName: String,
            fileUrl: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

export default mongoose.model("Report", reportSchema);