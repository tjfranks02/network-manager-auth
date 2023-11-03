import { Router } from "express";
import type { Request, Response } from "express";

import { getPublicKey } from "../controllers/jwt";

let router = Router();

router.get("/pubkey/:tokenId", (req: Request, res: Response) => getPublicKey(req, res));

export default router;