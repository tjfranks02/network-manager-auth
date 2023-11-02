import { v4 as uuid } from "uuid";
import { createToken, hashPassword, verifyPassword, decodeJWT } from "../utils/token";
import getConnection from "../services/db/connection";
import { handlePostgresError } from "../utils/pgErrorHandlers";

import type { JwtPayload } from "jsonwebtoken";
import type { PoolClient, QueryResult } from "pg";
import type { Request, Response } from "express";

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
    let existingUserRes: QueryResult = await connection.query(
      "SELECT * FROM users WHERE email = $1", 
      [email]
    );

    if (existingUserRes.rows.length > 0) {
      return res.status(422).json({ error: "Email is in use" });
    }

    let hashedPassword = await hashPassword(password);
    
    // Create new user
    let userId = uuid();

    await connection.query(
      "INSERT INTO users (id, email, password) VALUES ($1, $2, $3)", 
      [userId, email, hashedPassword]
    );

    connection.release();

    return res.status(200).json({ token: createToken(userId) });
  } catch (e) {
    console.log(e);
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
    let existingUserRes: QueryResult = await connection.query(
      "SELECT * FROM users WHERE email = $1", 
      [email]
    );

    if (existingUserRes.rows.length === 0) {
      return res.status(422).json({ error: "Email not found" });
    }

    let user = existingUserRes.rows[0];

    // Check if password is correct
    let isPasswordCorrect = await verifyPassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(422).json({ error: "Invalid password" });
    }

    connection.release();
    return res.status(200).json({ token: createToken(user.id) });
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
export const getUserById = async (req: Request, res: Response) => {
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
  let decodedToken: string | JwtPayload | null = decodeJWT(token);

  if (!decodedToken || id !== decodedToken.sub) {
    return res.status(401).send({ error: "You must be logged in" });
  }

  try {
    // Check if user with id exists
    let connection: PoolClient = await getConnection();
    let existingUserRes: QueryResult = await connection.query(
      "SELECT id, email FROM users WHERE id = $1", 
      [id]
    );

    if (existingUserRes.rows.length === 0) {
      return res.status(422).json({ error: "User not found" });
    }

    return res.status(200).send(existingUserRes.rows[0]);
  } catch (e) {
    return handlePostgresError(e, res);
  }
};