import type { PoolClient } from "pg";

import { hashSecret } from "../../utils/secrets";

/**
 * Register a refresh token in the database.
 * 
 * Params:
 *   connection - the database connection to use to make the query.
 *   refreshToken - the refresh token to register.
 *   jwtId - uuid of this refresh token.
 *   userId - the ID of the user the refresh token belongs to.
 */
export const insertRefreshToken = async (connection: PoolClient, jwtId: string, 
  refreshToken: string, userId: string) => {
  
  let hashedRefreshToken: string = await hashSecret(refreshToken);

  // Register refresh token in the database
  await connection.query(
    "INSERT INTO refresh_tokens (id, user_id, token, date_created) VALUES ($1, $2, $3, $4)", 
    [jwtId, userId, hashedRefreshToken, new Date()]
  );
};