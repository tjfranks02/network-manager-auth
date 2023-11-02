import { Request, Response } from "express";
import { PoolClient, QueryResult } from "pg";
import { v4 as uuid } from "uuid";

import { createToken, hashPassword } from "../utils/token";
import getConnection from "../services/db/connection";
import { handlePostgresError } from "../utils/pgErrorHandlers";

/**
 * Create an account for a new user with an email and password
 */
export const signUp = async (req: Request, res: Response) => {
  let email: string | null = req.body.email;
  let password: string | null = req.body.password;

  if (!email || !password) {
    return res.status(422).json({ error: "You must provide an email and password" });
  }

  // Check if user with email already exists
  let connection: PoolClient = await getConnection();
  let existingUserRes: QueryResult = await connection.query(
    "SELECT * FROM users WHERE email = $1", 
    [email]
  );

  if (existingUserRes.rows.length > 0) {
    return res.status(422).json({ error: "Email is in use" });
  }

  // Create new user
  let userId = uuid();
  
  try {
    let hashedPassword = await hashPassword(password);

    await connection.query(
      "INSERT INTO users (id, email, password) VALUES ($1, $2, $3)", 
      [userId, email, hashedPassword]
    );
  } catch (e) {
    return handlePostgresError(e, res);
  }

  return res.status(200).json({ token: createToken(userId) });
};

export const signIn = (req: Request, res: Response) => { 
  res.json({ token: createToken("asdfasdjfh") })
};

export const getUserById = (req: Request, res: Response) => {

};