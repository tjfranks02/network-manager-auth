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

/**
 * Get a refresh token from the database by its ID.
 * 
 * Params:
 *   connection - the database connection to use to make the query.
 *   jwtId - the ID of the refresh token to get.
 * 
 * Returns:
 *   The refresh token. Null if no refresh token with the given ID exists.
 */
export const getRefreshTokenById = async (connection: PoolClient, jwtId: string | undefined) => {
  let refreshTokenRes = await connection.query(
    "SELECT * FROM refresh_tokens WHERE id = $1", 
    [jwtId]
  );

  return refreshTokenRes.rowCount > 0 ? refreshTokenRes.rows[0] : null;
};