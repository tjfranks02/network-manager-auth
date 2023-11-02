import fs from "fs";
import bcrypt from "bcrypt";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

import { JWT_EXPIRY_TIME, JWT_SIGNING_ALGO } from "../config/tokenConfig";

export const createToken = (id: string): string => {
  let privateKey = fs.readFileSync(__dirname + "/../secrets/private_key.pem"); 

  let payload: JwtPayload = { 
    sub: id
  };

  let signingOptions: SignOptions = {
    algorithm: JWT_SIGNING_ALGO,
    expiresIn: JWT_EXPIRY_TIME
  };

  return jwt.sign(payload, privateKey, signingOptions);
};

export const hashPassword = async (password: string) => {
  let saltRounds = 10;

  let salt = await bcrypt.genSalt(saltRounds);
  let hash = await bcrypt.hash(password, salt);
  return hash;
};