require("dotenv").config();
const { MongoClient } = require("mongodb");

(async function main() {
  // mongo db uri
  const uri = process.env.MONGODB_URI;

  // db name
  const dbName = "sample_airbnb";

  // instantiate a new client
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    // establish a connection to the database
    await client.connect();

    const db = client.db(dbName);

    // get list of all databases
    // await listDatabases(db);

    // create listing
    // await createListing(db, {
    //   name: "Lovely Loft XXX",
    //   summary: "A charming loft in Paris",
    //   bedroom: 1,
    //   bathroom: 1,
    // });

    // create multiple listings
    // await createMultipleListings(db, [
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
    // await findOneListingByName(db, "Lovely Loft I");

    // find listing by filter
    // await findListings(db, {
    //   minBedrooms: 4,
    //   minBathrooms: 2,
    //   maxResults: 5,
    // });

    // update listing by name
    // await updateListingByName(db, "Lovely Loft I", {
    //   bedrooms: 6,
    //   beds: 8,
    // });

    // upsert listing
    // await upsertListingByName(db, "Cozy Cottage II", {
    //   name: "Cozy Cottage II",
    //   bedrooms: 2,
    //   bathrooms: 1,
    // });

    // update all listings
    await updateAllListingsToHavePropertyType(db);
  } catch (err) {
    console.error(err);
  } finally {
    // close the database connection
    await client.close();
  }
})();

/**
 * List Databases
 */
async function listDatabases(db) {
  const dbList = await db.admin().listDatabases();

  dbList.databases.forEach((db) => {
    console.log(`- ${db.name}`);
  });
}

/**
 * Create a Listing
 */
async function createListing(db, newListing) {
  const result = await db
    .collection("listingsAndReviews")
    .insertOne(newListing);

  console.log(result.insertedId);
}

/**
 * Create multiple listings
 */
async function createMultipleListings(db, newListings) {
  const result = await db
    .collection("listingsAndReviews")
    .insertMany(newListings);

  console.log(result.insertedCount);
  console.log(result.insertedIds);
}

/**
 * Retrieve a listing
 */
async function findOneListingByName(db, listingName) {
  const result = await db
    .collection("listingsAndReviews")
    .findOne({ name: listingName });

  if (result) {
    console.log(result);
  } else {
    console.log(`${listingName} listing found`);
  }
}

/**
 * Retrieve multiple listings
 */
async function findListings(
  db,
  {
    minBedrooms = 0,
    minBathrooms = 0,
    maxResults = Number.MAX_SAFE_INTEGER,
  } = {}
) {
  const cursor = await db
    .collection("listingsAndReviews")
    .find({
      bedrooms: { $gte: minBedrooms },
      bathrooms: { $gte: minBathrooms },
    })
    .sort({ last_review: -1 })
    .limit(maxResults);

  const results = await cursor.toArray();

  if (results.length > 0) {
    results.forEach((result, i) => {
      console.log(`${i + 1}. ${result.name}`);
    });
  }
}

/**
 * Update listing
 */
async function updateListingByName(db, listingName, updatedListing) {
  const result = await db
    .collection("listingsAndReviews")
    .updateOne({ name: listingName }, { $set: updatedListing });

  console.log(result.matchedCount);
  console.log(result.modifiedCount);
}

/**
 * Upsert listing
 */
async function upsertListingByName(db, listingName, updatedListing) {
  const result = await db
    .collection("listingsAndReviews")
    .updateOne(
      { name: listingName },
      { $set: updatedListing },
      { upsert: true }
    );

  console.log(result.matchedCount);
  console.log(result.upsertedCount);
  console.log(result.upsertedId);
}

/**
 * Update listings to have a property/field type
 */
async function updateAllListingsToHavePropertyType(db) {
  const result = await db
    .collection("listingsAndReviews")
    .updateMany(
      { propertyType: { $exists: false } },
      { $set: { propertyType: "Unknown" } }
    );

  console.log(result.matchedCount);
  console.log(result.modifiedCount);
}
