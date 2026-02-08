import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
    },
    role: {
        type: String,
        enum: ["Surgeon", "Anesthesiologist", "Assistant Surgeon"]
    },
    availability: [{
        day: String,
        shift: String
    }]
}, { timestamps: true });

export default mongoose.model("Doctor", doctorSchema);