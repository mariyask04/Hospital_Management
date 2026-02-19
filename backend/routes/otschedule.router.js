import express from "express";
import {
    completeSchedule, cancelSchedule, updateSchedule, getScheduleById, getAllSchedules, createSchedule,
} from "../controllers/otschedule.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyToken, createSchedule);
router.get("/getAll", getAllSchedules);
router.get("/get/:id", getScheduleById);
router.put("/update/:id", verifyToken, updateSchedule);
router.patch("/:id/cancel", verifyToken, cancelSchedule);
router.patch("/:id/complete", verifyToken, completeSchedule);

export default router;