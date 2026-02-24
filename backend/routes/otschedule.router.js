import express from "express";
import {
    completeSchedule, cancelSchedule, updateSchedule, getScheduleById, getAllSchedules, createSchedule,
} from "../controllers/otschedule.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyToken, authorizeRoles("admin"), createSchedule);
router.get("/getAll", verifyToken, authorizeRoles("admin", "user"), getAllSchedules);
router.get("/get/:id", verifyToken, authorizeRoles("admin", "user"), getScheduleById);
router.put("/update/:id", verifyToken, authorizeRoles("admin"), updateSchedule);
router.patch("/:id/cancel", verifyToken, authorizeRoles("admin"), cancelSchedule);
router.patch("/:id/complete", verifyToken, authorizeRoles("admin"), completeSchedule);

export default router;