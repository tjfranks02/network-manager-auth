import fs from "fs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import type  { SignOptions, JwtPayload, VerifyOptions, Jwt } from "jsonwebtoken";
import type { Response, CookieOptions } from "express";

import { JWT_EXPIRY_TIME, JWT_SIGNING_ALGO, REFRESH_TOKEN_EXPIRY_TIME } from "../config/tokenConfig";

/**
 * Get the options used to sign JWT tokens.
 */
const getJWTSigningOptions = (): SignOptions => {
  let signingOptions: SignOptions = {
    algorithm: JWT_SIGNING_ALGO,
    expiresIn: JWT_EXPIRY_TIME,
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
    maxAge: JWT_EXPIRY_TIME,
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
 * 
 * Returns:
 *   string - the JWT token.
 */
export const createToken = (id: string, expiresIn: string): { jwtId: string, token: string } => {
  let payload: JwtPayload = { 
    sub: id
  };

  let jwtId: string = uuid();

  let signingOptions: SignOptions = {
    algorithm: JWT_SIGNING_ALGO,
    expiresIn: JWT_EXPIRY_TIME,
    keyid: "1",
    jwtid: jwtId
  };

  return { jwtId, token: jwt.sign(payload, getJWTSigningKey(1), signingOptions) };
};

/**
 * Generate JWT with a 7-day expiry time to act as a refresh token.
 * 
 * Params:
 *   id - the ID of the user to create a refresh token for.
 * 
 * Returns:
 *   string - the refresh token.
 */
export const createRefreshToken = (id: string): string => {
  let payload: JwtPayload = { 
    sub: id
  };

  return jwt.sign(
    payload, 
    getJWTSigningKey(1), 
    {...getJWTSigningOptions(), expiresIn: REFRESH_TOKEN_EXPIRY_TIME}
  );
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
 * Set the refresh and access tokens returned after authenticating as a cookie on the express 
 * response.
 * 
 * Params:
 *   res - the express response object.
 *   accessToken - the access token to set as a cookie.
 *   refreshToken - the refresh token to set as a cookie.
 */
export const setAccessTokensAsCookies = (res: Response, accessToken: string, 
  refreshToken: string) => {

  let cookieConfig: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.cookie("accessToken", accessToken, cookieConfig);
  res.cookie("refreshToken", refreshToken, cookieConfig);
};