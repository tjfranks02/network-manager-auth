import { v4 as uuid } from "uuid";

import { hashPassword } from "../../utils/password";
import type { PoolClient } from "pg";
import { User } from "../../models/users";

/**
 * Register a new user in the database.
 * 
 * Params:
 *   connection - the database connection to use to make the query.
 *   id - the ID of the user to register.
 *   email - the email of the user to register.
 *   password - the password of the user to register.
 */
export const createUser = async (connection: PoolClient, id: string, email: string, 
  password: string) => {

  // Hash password
  let hashedPassword = await hashPassword(password);

  // Register user in the database
  await connection.query(
    "INSERT INTO users (id, email, password) VALUES ($1, $2, $3)", [id, email, hashedPassword]
  );
};

/**
 * Get a user from the database by their email.
 * 
 * Params:
 *   connection - the database connection to use to make the query.
 *   email - the email of the user to get.
 * 
 * Returns:
 *   A user object from the database. Null if no user with the given email exists.
 */
export const getUserByEmail = async (connection: PoolClient, email: string): Promise<User> => {
  let userRes = await connection.query(
    "SELECT * FROM users WHERE email = $1", 
    [email]
  );

  return userRes.rowCount > 0 ? userRes.rows[0] : null;
};

/**
 * Get a user from the database by their ID.
 * 
 * Params:
 *   connection - the database connection to use to make the query.
 *   id - the ID of the user to get.
 * 
 * Returns:
 *   A user object from the database. Null if no user with the given ID exists.
 */
export const getUserById = async (connection: PoolClient, id: string): Promise<User> => {
  let userRes = await connection.query(
    "SELECT * FROM users WHERE id = $1", 
    [id]
  );

  return userRes.rowCount > 0 ? userRes.rows[0] : null;
};  