import express from "express";
import cors from "cors";
import connectDB from "./config/db.config.js";
import dotenv from "dotenv";

import adminRouter from "./routes/admin.router.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRouter)

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});