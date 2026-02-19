import express from "express";
import {
    addPatient, getAllPatients, getPatientById, updatePatient, deletePatient,
} from "../controllers/patient.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/add", verifyToken, addPatient);
router.get("/getAll", verifyToken, getAllPatients);
router.get("/get/:id", verifyToken, getPatientById);
router.put("/update/:id", verifyToken, updatePatient);
router.delete("/delete/:id", verifyToken, deletePatient);

export default router;