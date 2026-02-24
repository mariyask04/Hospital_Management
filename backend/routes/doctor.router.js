import express from "express";
import {
    addDoctor, getAllDoctors, getDoctorById, deleteDoctor,
} from "../controllers/doctor.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyToken, authorizeRoles("admin"), addDoctor);
router.get("/getAll", verifyToken, authorizeRoles("admin"), getAllDoctors);
router.get("/get/:id", verifyToken, authorizeRoles("admin"), getDoctorById);
router.delete("/delete/:id", verifyToken, authorizeRoles("admin"), deleteDoctor);

export default router;