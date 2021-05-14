require("dotenv").config();
const { MongoClient } = require("mongodb");

async function main() {
  const uri = process.env.MONGODB_URI;

  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();

    await listDatabases(client);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

async function listDatabases(client) {
  const dbList = await client.db().admin().listDatabases();

  dbList.databases.forEach((db) => {
    console.log(`- ${db.name}`);
  });
}
