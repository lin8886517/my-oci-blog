import oracledb from "oracledb";
import path from "path";

oracledb.fetchAsString = [oracledb.CLOB];

let pool: oracledb.Pool | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export async function getPool(): Promise<oracledb.Pool> {
  if (pool) return pool;

  const walletLocation = getRequiredEnv("DB_WALLET_LOCATION");

  pool = await oracledb.createPool({
    user: getRequiredEnv("DB_USER"),
    password: getRequiredEnv("DB_PASSWORD"),
    connectionString: getRequiredEnv("DB_CONNECTION_STRING"),
    walletLocation: path.resolve(walletLocation),
    walletPassword: getRequiredEnv("DB_WALLET_PASSWORD"),
    configDir: path.resolve(walletLocation),
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
  });

  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  binds: oracledb.BindParameters = [],
): Promise<T[]> {
  const p = await getPool();
  const conn = await p.getConnection();
  try {
    const result = await conn.execute<T>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    return (result.rows as T[]) ?? [];
  } finally {
    await conn.close();
  }
}