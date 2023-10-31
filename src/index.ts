import express from "express";
import { config } from "dotenv";

// Load up .env file
config({ path: __dirname + "/../.env" });

// Routes
import authRoutes from "./routes/authRoutes";
import dbRoutes from "./routes/dbRoutes";

const app = express();
const port = 3000;

app.use("/users", authRoutes);
app.use("/db", dbRoutes);

app.listen(port, () => console.log(`Express app running on port ${port}!`));