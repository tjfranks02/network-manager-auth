import type { Request, Response } from "express";
import { getJWTPublicKey } from "../utils/jwt";

export const getPublicKey = async (req: Request, res: Response) => {
  const tokenId: string = req.params.tokenId;

  if (!tokenId) {
    return res.status(422).json({ error: "You must provide the ID of the public key." });
  }

  let publicKey: Buffer | null = getJWTPublicKey(tokenId);

  if (!publicKey) {
    return res.status(404).json({ error: "Invalid public key ID." });
  }

  return res.status(200).json({ publicKey: publicKey.toString() });
};