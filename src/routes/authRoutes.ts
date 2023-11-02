import { Router } from "express";

import { signIn, signUp, getUserById } from "../controllers/users";

let router = Router();

router.post("/signup", (req, res) => signUp(req, res));
router.post("/signin", (req, res) => signIn(req, res));
router.get("/:id", (req, res) => getUserById(req, res));


export default router;