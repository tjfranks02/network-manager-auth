import express from "express";
import { config } from "dotenv";
import fs from "fs";

import authRoutes from "./routes/authRoutes";
import dbRoutes from "./routes/dbRoutes";

// Load up .env file
config({ path: __dirname + "/../.env" });

const app = express();
const port = 3000;

app.use("/users", authRoutes);
app.use("/db", dbRoutes);

app.listen(port, () => console.log(`Express app running on port ${port}!`));