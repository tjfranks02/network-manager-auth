import { Router } from "express";
import { setupUsersDB } from "../controllers/db";

import type { Request, Response } from "express";

let router = Router();

router.post("/setupdb", (req: Request, res: Response) => setupUsersDB(req, res));

export default router;