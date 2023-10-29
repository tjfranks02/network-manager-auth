import { Router } from "express";

let router = Router();

router.get("/", (req, res) => res.send("HI THERE AUTH ROUTES"));

export default router;