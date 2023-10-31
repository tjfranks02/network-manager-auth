import { Router, Request, Response } from "express";
import { setupUsersDB } from "../controllers/db";

let router = Router();

router.post("/setupdb", (req: Request, res: Response) => setupUsersDB(req, res));

export default router;