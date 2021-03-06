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
    // await updateAllListingsToHavePropertyType(db);

    // delete listing
    // await deleteListingByName(db, "Cozy Cottage II");

    // delete listings scraped before date
    // await deleteListingsScrappedBeforeDate(db, new Date("2019-02-15"));

    // search listings
    await getCheapestSuburbs(db, "Australia", "Sydney", 10);
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

/**
 * Delete a listing
 */
async function deleteListingByName(db, listingName) {
  const result = await db
    .collection("listingsAndReviews")
    .deleteOne({ name: listingName });

  console.log(result.deletedCount);
}

/**
 * Delete many listings
 */
async function deleteListingsScrappedBeforeDate(db, date) {
  const result = await db
    .collection("listingsAndReviews")
    .deleteMany({ last_scraped: { $lt: date } });

  console.log(result.deletedCount);
}

/**
 * Aggregation Pipeline
 */
async function getCheapestSuburbs(db, country, market, maxNumber) {
  const pipeline = [
    {
      $match: {
        bedrooms: 1,
        "address.country": country,
        "address.market": market,
        "address.suburb": {
          $exists: 1,
          $ne: "",
        },
        room_type: "Entire home/apt",
      },
    },
    {
      $group: {
        _id: "$address.suburb",
        averagePrice: {
          $avg: "$price",
        },
      },
    },
    {
      $sort: {
        averagePrice: 1,
      },
    },
    {
      $limit: maxNumber,
    },
  ];

  const aggCursor = await db
    .collection("listingsAndReviews")
    .aggregate(pipeline);

  await aggCursor.forEach((listing) => {
    console.log(`${listing._id} : ${listing.averagePrice}`);
  });
}
