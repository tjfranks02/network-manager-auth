import getConnection from "../services/db/connection";

import type { Request, Response } from "express";
import type { PoolClient } from "pg";
import { randomUUID } from "crypto";

export const setupDB = async (req: Request, res: Response) => {
  const createUsersTable = `
    CREATE TABLE users(
      id UUID NOT NULL PRIMARY KEY,
      email text NOT NULL, 
      password text NOT NULL
    )
  `;
  
  const createRefreshTokensTable = `
    CREATE TABLE refresh_tokens(
      id UUID NOT NULL PRIMARY KEY,
      user_id UUID NOT NULL,
      token text NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  const createTestUser = `INSERT INTO users (id, email, password) VALUES ($1, $2, $3)`;

  let client: PoolClient = await getConnection();

  await client.query(createUsersTable);
  await client.query(createRefreshTokensTable);
  await client.query(createTestUser, [randomUUID(), "test@test.com", "password12"]);
  client.release();

  return res.status(200).json({ message: "DB setup successful!" })
};  

export const deleteDB = async (req: Request, res: Response) => {
  const dropUsersTable = `DROP TABLE users`;
  const dropRefreshTokensTable = `DROP TABLE refresh_tokens`;

  let client: PoolClient = await getConnection();
  await client.query(dropUsersTable);
  await client.query(dropRefreshTokensTable);

  return res.status(200).send({ message: "DB deleted successfully!" });
};  