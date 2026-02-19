import express from "express";
import {
    createReport, getReportsBySurgery, getReportsByPatient, updateReport, deleteReport, addAttachment
} from "../controllers/report.controller.js";
import verifyToken from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createReport);
router.get("/schedule/:scheduleId", verifyToken, getReportsBySurgery);
router.get("/patient/:patientId", verifyToken, getReportsByPatient);
router.put("/:id", verifyToken, updateReport);
router.delete("/:id", verifyToken, deleteReport);
router.patch("/:id/attachment", verifyToken, upload.single("file"), addAttachment);

export default router;