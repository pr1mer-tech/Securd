import { Client } from "pg";

export default async function handler(req: any, res: any) {
  const client = new Client({
    database: process.env.POSTGRES_DATABASE as string,
    user: process.env.POSTGRES_USER as string,
    host: process.env.POSTGRES_HOST as string,
    password: process.env.POSTGRES_PASSWORD as string,
    port: Number(process.env.POSTGRES_PORT),
  });
  await client.connect();

  try {
    const tableName = req.query.tableName;
    const query = `SELECT address FROM ${tableName}`;
    const dbRes = await client.query(query);
    const addresses = dbRes.rows.map((row) => row.address);
    res.status(200).json(addresses);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error loading data from table:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.end();
  }
}
