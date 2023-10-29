import express from "express";
import authRoutes from "./routes/authRoutes";

const app = express();
const port = 3000;

app.use("/test", authRoutes);
// app.get("/", (req, res) => res.send("hello"));

app.listen(port, () => console.log(`Express app running on port ${port}!`));