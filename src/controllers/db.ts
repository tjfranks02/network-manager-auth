import { Request, Response } from "express";
import getConnection from "../services/db/connection";
import { PoolClient } from "pg";

export const setupUsersDB = async (req: Request, res: Response) => {
  const createUsersTable = `
    CREATE TABLE users(
      userId UUID NOT NULL,
      email text NOT NULL, 
      sessionlife integer NOT NULL
    );
  `;

  let client: PoolClient = await getConnection();

  await client.query(createUsersTable);
  client.release();

  return res.status(200).json({ message: "DB setup successful!" })
};  