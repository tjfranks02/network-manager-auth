import { Request, Response } from "express";
import { PoolClient, QueryResult } from "pg";
import { v4 as uuid } from "uuid";

import { createToken, hashPassword, verifyPassword } from "../utils/token";
import getConnection from "../services/db/connection";
import { handlePostgresError } from "../utils/pgErrorHandlers";

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

export const getUserById = (req: Request, res: Response) => {

};