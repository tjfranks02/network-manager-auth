import fs from "fs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import type  { SignOptions, JwtPayload, VerifyOptions, Jwt } from "jsonwebtoken";
import type { Response, CookieOptions } from "express";

import { 
  JWT_EXPIRY_TIME_SECONDS, 
  JWT_SIGNING_ALGO 
} from "../config/tokenConfig";

/**
 * Get the options used to sign JWT tokens.
 */
const getJWTSigningOptions = (): SignOptions => {
  let signingOptions: SignOptions = {
    algorithm: JWT_SIGNING_ALGO,
    expiresIn: JWT_EXPIRY_TIME_SECONDS,
    keyid: "1"
  };

  return signingOptions;
};

/**
 * Get the options used to verify JWT tokens.
 */
const getJWTVerifyOptions = (): VerifyOptions => {
  let verifyOptions: VerifyOptions = {
    algorithms: [JWT_SIGNING_ALGO],
    maxAge: JWT_EXPIRY_TIME_SECONDS,
    complete: true
  };

  return verifyOptions;
};  

/**
 * Get the private key used to sign JWT tokens.
 * 
 * Params:
 *   privKeyId - the ID of the private key to get. Might change in case of key rotation.
 * 
 * Returns:
 *   The private key.
 */
const getJWTSigningKey = (privKeyId: number): Buffer => {
  let privateKey = fs.readFileSync(__dirname + `/../secrets/${privKeyId}_private_key.pem`); 
  return privateKey;
};

/**
 * Get the KID claim from the header of a given JWT. 
 * 
 * Params:
 *   token - the JWT token to get the KID claim from.
 *   
 * Returns:
 *   The KID claim, or null if the token is invalid.
 */
const getKIDClaim = (token: string): string | null => {
  let decodedToken: Jwt | null = jwt.decode(token, { complete: true });
  let kid = decodedToken ? decodedToken.header.kid : null;
  return kid ? kid : null;
};  

/**
 * Get the public key used to verify JWT tokens.
 * 
 * Params:
 *   pubKeyId - the ID of the public key to get. Might change in case of key rotation. 
 * 
 * Returns:
 *   The public key.
 */
export const getJWTPublicKey = (pubKeyId: string | null): Buffer | null => {
  try {
    return fs.readFileSync(__dirname + `/../secrets/${pubKeyId}_public_key.pem`); 
  } catch (e) {
    return null; 
  }
};  

/**
 * Create a JWT token for a user based on their ID.
 * 
 * Params:
 *   id - the ID of the user to create a token for.
 *   expiresIn - the expiry time of the token.
 *   
 * Returns:
 *   string - the JWT token.
 */
export const createToken = (id: string, expiresIn: number): { jwtId: string, token: string } => {
  let payload: JwtPayload = { 
    sub: id
  };

  let jwtId: string = uuid();

  let signingOptions: SignOptions = {
    algorithm: JWT_SIGNING_ALGO,
    expiresIn: expiresIn,
    keyid: "1",
    jwtid: jwtId
  };

  return { jwtId, token: jwt.sign(payload, getJWTSigningKey(1), signingOptions) };
};

/**
 * Decode a JWT token.
 * 
 * Params:
 *   token - the JWT token to decode.
 * 
 * Returns:
 *   The decoded token, or null if the token is invalid.
 */
export const decodeJWT = (token: string): Jwt | null => {
  let verifiedJwt = null;

  try {
    let pubKey = getJWTPublicKey(getKIDClaim(token));

    if (pubKey) {
      verifiedJwt = jwt.verify(token, pubKey, getJWTVerifyOptions());
    }
  } catch (e) { }

  return verifiedJwt ? <Jwt>verifiedJwt : null;
};

/**
 * Set a value as a secure, http-only cookie.
 * 
 * Params:
 *   res - the response object to set the cookie on.
 *   name - the name of the cookie.
 *   value - the value of the cookie.
 *   expirySeconds - the expiry time of the cookie in seconds.
 */
export const setSecureCookie = (res: Response, name: string, value: string, 
  expirySeconds: number) => {
  
  let cookieConfig: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: expirySeconds * 1000
  };

  res.cookie(name, value, cookieConfig);
}