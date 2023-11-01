import { Response } from "express";

const DUPLICATE_KEY_ERROR = "23505";

export const handlePostgresError = (e: any, res: Response) => {
  switch (e.code) {
    case DUPLICATE_KEY_ERROR:
      return res.status(422).json({ error: "Email is in use" });
    default:
      return res.status(422).json({ error: "Postgres database error" });
  }
};