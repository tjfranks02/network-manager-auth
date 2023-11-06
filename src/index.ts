import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { CorsOptions } from "cors";
import { config } from "dotenv";

// Load up .env file
config({ path: __dirname + "/../.env" });

// Routes
import authRoutes from "./routes/authRoutes";
import dbRoutes from "./routes/dbRoutes";
import jwtRoutes from "./routes/jwtRoutes";

const app = express();
const port = 3000;

const corsOptions: CorsOptions = {
  origin: "http://localhost:5173",
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/users", authRoutes);
app.use("/db", dbRoutes);
app.use("/jwt", jwtRoutes);

app.listen(port, () => console.log(`Express app running on port ${port}!`));