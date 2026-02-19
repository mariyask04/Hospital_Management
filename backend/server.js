import express from "express";
import cors from "cors";
import connectDB from "./config/db.config.js";
import dotenv from "dotenv";

import adminRouter from "./routes/admin.router.js";
import doctorRouter from "./routes/doctor.router.js";
import patientRouter from "./routes/patient.router.js";
import otscheduleRouter from "./routes/otschedule.router.js";
import reportRouter from "./routes/report.router.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

app.use("/uploads",express.static(path.join(__dirname,"uploads")));

app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/patient", patientRouter);
app.use("/api/otschedule", otscheduleRouter);
app.use("/api/report", reportRouter);

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});