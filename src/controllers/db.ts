import getConnection from "../services/db/connection";

import type { Request, Response } from "express";
import type { PoolClient } from "pg";

export const setupUsersDB = async (req: Request, res: Response) => {
  const createUsersTable = `
    CREATE TABLE users(
      id UUID NOT NULL PRIMARY KEY,
      email text NOT NULL, 
      password text NOT NULL
    )
  `;

  let client: PoolClient = await getConnection();

  await client.query(createUsersTable);
  client.release();

  return res.status(200).json({ message: "DB setup successful!" })
};  