import getConnection from "../services/db/connection";

import type { Request, Response } from "express";
import type { PoolClient } from "pg";

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
      date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  let client: PoolClient = await getConnection();
    
  await client.query(createUsersTable);
  await client.query(createRefreshTokensTable);
  client.release();

  return res.status(200).json({ message: "DB setup successful!" })
};  

export const deleteDB = async (req: Request, res: Response) => {
  const dropUsersTable = `DROP TABLE users CASCADE`; 
  const dropRefreshTokensTable = `DROP TABLE refresh_tokens`;

  let client: PoolClient = await getConnection();
  await client.query(dropUsersTable);
  await client.query(dropRefreshTokensTable);

  client.release();
  return res.status(200).send({ message: "DB deleted successfully!" });
};  