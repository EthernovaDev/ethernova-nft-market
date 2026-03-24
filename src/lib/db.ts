import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://blockscout:112d53fd2b2b4398ae87b8c037375e7e@127.0.0.1:7432/nftmarket",
});

export default pool;
