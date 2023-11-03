import { Router } from "express";
import { setupDB, deleteDB } from "../controllers/db";

import type { Request, Response } from "express";

let router = Router();

router.post("/setupdb", (req: Request, res: Response) => setupDB(req, res));
router.post("/deletedb", (req: Request, res: Response) => deleteDB(req, res));

export default router;