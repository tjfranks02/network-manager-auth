import fs from "fs";
import bcrypt from "bcrypt";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

import { JWT_EXPIRY_TIME, JWT_SIGNING_ALGO } from "../config/tokenConfig";

/**
 * Get the options used to sign and verify JWT tokens.
 */
const getJWTSigningOptions = (): SignOptions => {
  let signingOptions: SignOptions = {
    algorithm: JWT_SIGNING_ALGO,
    expiresIn: JWT_EXPIRY_TIME
  };

  return signingOptions;
};

/**
 * Get the private key used to sign JWT tokens.
 */
const getJWTSigningKey = (): Buffer => {
  let privateKey = fs.readFileSync(__dirname + "/../secrets/private_key.pem"); 
  return privateKey;
};

/**
 * Get the public key used to verify JWT tokens.
 */
const getJWTPublicKey = (): Buffer => {
  let publicKey = fs.readFileSync(__dirname + "/../secrets/public_key.pem"); 
  return publicKey;
};  

/**
 * Create a JWT token for a user based on their ID.
 * 
 * Params:
 *   id - the ID of the user to create a token for.
 * 
 * Returns:
 *   string - the JWT token.
 */
export const createToken = (id: string): string => {
  let payload: JwtPayload = { 
    sub: id
  };

  return jwt.sign(payload, getJWTSigningKey(), getJWTSigningOptions());
};

/**
 * Generate a hash of a plaintext password using bcrypt.
 * 
 * Params:
 *   password - the plaintext password to hash.
 * 
 * Returns:
 *   A promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  let saltRounds = 10;

  let salt = await bcrypt.genSalt(saltRounds);
  let hash = await bcrypt.hash(password, salt);
  return hash;
};

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};