import { Router } from "express";

import { signIn } from "../controllers/users";

let router = Router();

router.post("/signin", (req, res) => signIn(req, res));
router.get("/:id", (req, res) => res.send(`id: ${req.params.id}`));

export default router;