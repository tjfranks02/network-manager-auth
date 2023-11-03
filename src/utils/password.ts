import bcrypt from "bcrypt";

/**
 * Generate a hash of a plaintext password using bcrypt.
 * 
 * Params:
 *   password - the plaintext password to hash.
 * 
 * Returns:
 *   A promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  let saltRounds = 10;

  let salt = await bcrypt.genSalt(saltRounds);
  let hash = await bcrypt.hash(password, salt);
  return hash;
};

/**
 * Verify that a plaintext password matches a hash. Used for comparing the database entry for a user
 * with the password provided by the user when signing in.
 * 
 * Params:
 *   password - the plaintext password to verify.
 *   hash - the hash to compare the password to.
 * 
 * Returns:
 *   A promise that resolves to true if the password matches the hash, and false otherwise.
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};