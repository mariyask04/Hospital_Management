import express from "express";
import {
    addDoctor, getAllDoctors, getDoctorById, deleteDoctor,
} from "../controllers/doctor.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyToken, addDoctor);
router.get("/getAll", verifyToken, getAllDoctors);
router.get("/get/:id", verifyToken, getDoctorById);
router.delete("/delete/:id", verifyToken, deleteDoctor);

export default router;