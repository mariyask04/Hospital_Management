import express from "express";
import {
    register, login,
    addDoctor, getAllDoctors, getDoctorById, deleteDoctor
} from "../controllers/admin.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

//1. auth routes
router.post("/register", register);
router.post("/login", login);

//2. doctor management
router.post("/add-doctor", verifyToken, addDoctor);
router.get("/all-doctors", verifyToken, getAllDoctors);
router.get("/doctor/:id", verifyToken, getDoctorById);
router.delete("/doctor/:id", verifyToken, deleteDoctor)

export default router;