import express from "express";
import {
    createReport, getReportsBySurgery, getReportsByPatient, updateReport, deleteReport, addAttachment
} from "../controllers/report.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", verifyToken, authorizeRoles("admin"), createReport);
router.get("/schedule/:scheduleId", verifyToken, authorizeRoles("admin", "user"), getReportsBySurgery);
router.get("/patient/:patientId", verifyToken, authorizeRoles("admin", "user"), getReportsByPatient);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateReport);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteReport);
router.patch("/:id/attachment", verifyToken,authorizeRoles("admin"), upload.single("file"), addAttachment);

export default router;