import { Request, Response } from "express";
import { createToken } from "../utils/token";

export const signIn = (req: Request, res: Response) => { 
  res.json({ token: createToken("asdfasdjfh") })
};

export const getUserById = (req: Request, res: Response) => {

};