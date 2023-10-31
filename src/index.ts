import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";

// Load up .env file
dotenv.config();

const app = express();
const port = 3000;

app.use("/users", authRoutes);

app.listen(port, () => console.log(`Express app running on port ${port}!`));