import { v4 as uuid } from "uuid";

import type { PoolClient } from "pg";

/**
 * Register a refresh token in the database.
 * 
 * Params:
 *   refreshToken - the refresh token to register.
 *   userId - the ID of the user the refresh token belongs to.
 */
export const insertRefreshToken = async (connection: PoolClient, refreshToken: string, 
  userId: string) => {

  // Register refresh token in the database
  await connection.query(
    "INSERT INTO refresh_tokens (id, user_id, token, date_created) VALUES ($1, $2, $3, $4)", 
    [uuid(), userId, refreshToken, new Date()]
  );
};