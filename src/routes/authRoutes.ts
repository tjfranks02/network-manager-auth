import { Router } from "express";

import { signIn, signUp, getUserRecord, refreshToken } from "../controllers/users";

let router = Router();

router.post("/signup", (req, res) => signUp(req, res));
router.post("/signin", (req, res) => signIn(req, res));
router.get("/refreshtoken", (req, res) => refreshToken(req, res));
router.get("/:id", (req, res) => getUserRecord(req, res));

export default router;