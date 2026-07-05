import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import todoRoutes from "./routes/todoRoutes.js";

dotenv.config();

//DB
connectDB();
const app = express();

//cross-origin requests, parse JSON.
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/todos", todoRoutes);

const PORT = process.env.PORT || 5000;

// Start the API server.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

