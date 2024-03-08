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
    const { tableName, address } = req.body;
    const currentDate = new Date().toISOString();
    const query = `INSERT INTO ${tableName} (address, date) VALUES ($1, $2)`;
    await client.query(query, [address, currentDate]);
    res.status(200).json({ message: "Address added successfully" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error adding address to table:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.end();
  }
}
