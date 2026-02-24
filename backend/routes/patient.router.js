import express from "express";
import {
    addPatient, getAllPatients, getPatientById, updatePatient, deletePatient,
} from "../controllers/patient.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/add", verifyToken, authorizeRoles("admin"), addPatient);
router.get("/getAll", verifyToken, authorizeRoles("admin", "user"), getAllPatients);
router.get("/get/:id", verifyToken, authorizeRoles("admin", "user"), getPatientById);
router.put("/update/:id", verifyToken, authorizeRoles("admin"), updatePatient);
router.delete("/delete/:id", verifyToken, authorizeRoles("admin"), deletePatient);

export default router;