import bcrypt from "bcrypt";

/**
 * Generate a hash of a plaintext secret using bcrypt.
 * 
 * Params:
 *   secret - the plaintext secret to hash.
 * 
 * Returns:
 *   A promise that resolves to the hashed secret.
 */
export const hashSecret = async (secret: string): Promise<string> => {
  let saltRounds = 10;

  let salt = await bcrypt.genSalt(saltRounds);
  let hash = await bcrypt.hash(secret, salt);
  return hash;
};

/**
 * Verify that a plaintext secret matches a hash. Used for comparing the database entry for a user
 * with the secret provided by the user when signing in.
 * 
 * Params:
 *   secret - the plaintext secret to verify.
 *   hash - the hash to compare the secret to.
 * 
 * Returns:
 *   A promise that resolves to true if the secret matches the hash, and false otherwise.
 */
export const verifySecret = async (secret: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(secret, hash);
};