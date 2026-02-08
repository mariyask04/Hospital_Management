import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    diagnosis: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model("Patient", patientSchema);