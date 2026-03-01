import mongoose from "mongoose";

let connectPromise: Promise<typeof mongoose> | null = null;

export async function connect() {
  const uri = process.env.DBHOST;
  if (!uri) throw new Error("DBHOST environment variable is not defined");

  if (mongoose.connection.readyState === 1) return;

  if (mongoose.connection.readyState === 2 && connectPromise) {
    await connectPromise;
    return;
  }

  // ✅ Fail fast if MongoDB is unreachable (no infinite waiting)
  connectPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await connectPromise;

    if (!mongoose.connection.db) throw new Error("Database connection is not established");
    await mongoose.connection.db.admin().command({ ping: 1 });
  } finally {
    connectPromise = null;
  }
}

export async function disconnect() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
}

export async function testConnection() {
  await connect();
  console.log("Database connection test completed");
}