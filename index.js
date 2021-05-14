require("dotenv").config();
const { MongoClient } = require("mongodb");

async function main() {
  // mongo db uri
  const uri = process.env.MONGODB_URI;

  // instantiate a new client
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    // establish a connection to the database
    await client.connect();

    // get list of all databases
    // await listDatabases(client);

    // create listing
    // await createListing(client, {
    //   name: "Lovely Loft",
    //   summary: "A charming loft in Paris",
    //   bedroom: 1,
    //   bathroom: 1,
    // });

    // create multiple listings
    // await createMultipleListings(client, [
    //   {
    //     name: "Lovely Loft I",
    //     summary: "A charming loft in Paris",
    //     bedroom: 1,
    //     bathroom: 1,
    //   },
    //   {
    //     name: "Lovely Loft II",
    //     summary: "A charming loft in Paris",
    //     bedroom: 1,
    //     bathroom: 1,
    //   },
    // ]);

    // get listing
    await findOneListingByName(client, "Lovely Loft I");
  } catch (err) {
    console.error(err);
  } finally {
    // close the database connection
    await client.close();
  }
}

main().catch(console.error);

/**
 * List Databases
 */
async function listDatabases(client) {
  const dbList = await client.db().admin().listDatabases();

  dbList.databases.forEach((db) => {
    console.log(`- ${db.name}`);
  });
}

/**
 * Create a Listing
 */
async function createListing(client, newListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertOne(newListing);

  console.log(result.insertedId);
}

/**
 * Create multiple listings
 */
async function createMultipleListings(client, newListings) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertMany(newListings);

  console.log(result.insertedCount);
  console.log(result.insertedIds);
}

/**
 * Retrieve a listing
 */

async function findOneListingByName(client, listingName) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .findOne({ name: listingName });

  if (result) {
    console.log(result);
  } else {
    console.log(`${listingName} listing found`);
  }
}
