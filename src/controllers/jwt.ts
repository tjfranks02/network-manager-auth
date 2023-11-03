import type { Request, Response } from "express";
import { getJWTPublicKey } from "../utils/jwt";

/**
 * Get the public key for a given JWT token ID.
 * 
 * Request params:
 *   tokenId - the ID of the public key to get.
 *  
 * Response:
 *   200 - the public key.
 *   404 - the public key ID is invalid and the public key can't be found.
 *   422 - the request is missing the public key ID.
 */
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