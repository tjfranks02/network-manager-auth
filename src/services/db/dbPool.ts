import { Pool, PoolConfig } from "pg";

const poolConfig: PoolConfig = {
  user: process.env.PGUSER, // default process.env.PGUSER || process.env.USER
  password: process.env.PGPASSWORD, //default process.env.PGPASSWORD
  host: process.env.PGHOST, // default process.env.PGHOST
  database: process.env.PGDATABASE, // default process.env.PGDATABASE || user
  port: Number(process.env.PGPORT), // default process.env.PGPORT
  max: Number(process.env.MAX_CONNECTIONS) // Max number of connectinos in the pool
};

const pool = new Pool(poolConfig);

export default pool;