import fs from "fs";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

import { JWT_EXPIRY_TIME, JWT_SIGNING_ALGO } from "../config/tokenConfig";

export const createToken = (id: string): string => {
  let privateKey = fs.readFileSync("../secrets/id_rsa");
  
  let payload: JwtPayload = { 
    sub: id
  };

  let signingOptions: SignOptions = {
    algorithm: JWT_SIGNING_ALGO,
    expiresIn: JWT_EXPIRY_TIME
  };

  return jwt.sign(payload, privateKey, signingOptions);
};