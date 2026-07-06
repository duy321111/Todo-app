import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

//DB
connectDB();

const PORT = process.env.PORT || 5000;

// Start the API server.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


