import { v4 as uuid } from "uuid";
import { createToken, decodeJWT, createRefreshToken } from "../utils/jwt";
import { verifySecret } from "../utils/secrets";
import getConnection from "../services/db/connection";
import { handlePostgresError } from "../utils/pgErrorHandlers";
import { JWT_EXPIRY_TIME, REFRESH_TOKEN_EXPIRY_TIME } from "../config/tokenConfig";

import type { JwtPayload } from "jsonwebtoken";
import type { PoolClient } from "pg";
import type { Request, Response } from "express";
import { insertRefreshToken } from "../services/queries/jwt";
import { createUser, getUserByEmail, getUserById } from "../services/queries/users";
import { User } from "../models/users";

/**
 * Create an account for a new user with an email and password.
 * 
 * If the user already exists, return an error.
 * 
 * Request params:
 *   email: string - the email of the user to create
 *   password: string - the password of the user to create
 */
export const signUp = async (req: Request, res: Response) => {
  let email: string | null = req.body.email;
  let password: string | null = req.body.password;

  if (!email || !password) {
    return res.status(422).json({ error: "You must provide an email and password" });
  }

  try {
    // Check if user with email already exists
    let connection: PoolClient = await getConnection();
    let existingUserRes: User = await getUserByEmail(connection, email);

    if (existingUserRes) {
      return res.status(422).json({ error: "Email is in use" });
    }
    
    // Create new user
    let userId = uuid();
    await createUser(connection, userId, email, password);

    let { token: accessToken } = createToken(userId, JWT_EXPIRY_TIME);
    let { jwtId: refreshTokenId, token: refreshToken } = createToken(
      userId, REFRESH_TOKEN_EXPIRY_TIME);

    // Register refresh token in the database
    await insertRefreshToken(connection, refreshTokenId, refreshToken, userId);

    connection.release();

    return res.status(200).json({ 
      token: accessToken,
      refreshToken: refreshToken
    });
  } catch (e) {
    return handlePostgresError(e, res);
  }
};

/**
 * Sign in a user with an email and password.
 * 
 * Request params:
 *   email: string - the email of the user to sign in
 *   password: string - the password of the user to sign in
 */
export const signIn = async (req: Request, res: Response) => { 
  let email: string = req.body.email;
  let password: string = req.body.password;

  if (!email || !password) {
    return res.status(422).json({ error: "You must provide an email and password" });
  }

  try {
    // Check if user with email already exists
    let connection: PoolClient = await getConnection();
    let user: User = await getUserByEmail(connection, email);

    if (user === null) {
      return res.status(422).json({ error: "Email not found" });
    }

    // Check if password is correct
    let isPasswordCorrect = await verifySecret(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid password" });
    }

    let { token: accessToken } = createToken(user.id, JWT_EXPIRY_TIME);
    let { jwtId: refreshTokenId, token: refreshToken } = createToken(
      user.id, REFRESH_TOKEN_EXPIRY_TIME);

    await insertRefreshToken(connection, refreshTokenId, refreshToken, user.id);

    connection.release();

    return res.status(200).json({ 
      token: accessToken, 
      refreshToken: refreshToken
    });
  } catch (e) {
    return handlePostgresError(e, res);
  }
};

/**
 * Get a user's information with their ID.
 * 
 * Request params:
 *   id: string - the ID of the user to get
 * 
 * Request headers:
 *   Authorization: string - the JWT token of the user making the request.
 *
 * Response:
 *   200 - Success, return the user's information
 *   401 - Unauthorized, the user is not logged in
 *   422 - Unprocessable Entity, the request is missing a required parameter  
 */
export const getUserRecord = async (req: Request, res: Response) => {
  let id: string = req.params.id;
  let authHeader: string | undefined = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).send({ error: "You must be logged in" });
  }

  if (!id) {
    return res.status(422).send({ error: "You must provide a user id" });
  }

  // Extract and decode token
  let token = authHeader.split(" ")[1];
  let decodedToken: JwtPayload | null = decodeJWT(token);

  if (!decodedToken || id !== decodedToken.payload.sub) {
    return res.status(401).send({ error: "You must be logged in" });
  }

  try {
    // Check if user with id exists
    let connection: PoolClient = await getConnection();
    let existingUserRes = await getUserById(connection, id);

    if (existingUserRes === null) {
      return res.status(422).json({ error: "User not found" });
    }
    
    connection.release();
    return res.status(200).send(existingUserRes);
  } catch (e) {
    return handlePostgresError(e, res);
  }
};

/**
 * Refresh a user's JWT token.
 * 
 * Request headers:
 *   Authorization: string - the JWT token of the user making the request.
 * 
 * Response:
 *   200 - Success, return the new JWT token
 *   401 - Unauthorized, the user is not logged in
 */
export const refreshToken = async (req: Request, res: Response) => {
  let authHeader: string | undefined = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).send({ error: "You must be logged in" });
  }

  let token = authHeader.split(" ")[1];

  try {
    let decodedToken: JwtPayload | null = decodeJWT(token);

    if (!decodedToken) {
      return res.status(401).send({ error: "You must be logged in" });
    }
    
    let { token: accessToken } = createToken(decodedToken.payload.sub, JWT_EXPIRY_TIME);

    return res.status(200).json({ accessToken });
  } catch (e) {
    return res.status(401).send({ error: "You must be logged in" });
  }
};