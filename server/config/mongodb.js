import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const localUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/Fitness";

  if (!uri && !localUri) {
    throw new Error(
      "MongoDB connection URI is missing. Set MONGO_URI or MONGODB_URI in your environment variables."
    );
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    const tryConnect = async (targetUri, label) => {
      const inst = await mongoose.connect(targetUri, opts);
      console.log(`[MongoDB] Connected successfully to ${label}`);
      return inst;
    };

    cached.promise = (async () => {
      try {
        if (uri) {
          return await tryConnect(uri, "MongoDB Cluster / Atlas");
        }
      } catch (primaryErr) {
        if (localUri && localUri !== uri) {
          console.log("[MongoDB] Attempting fallback to local MongoDB Compass (Fitness)...");
          try {
            return await tryConnect(localUri, "Local MongoDB Compass (Fitness)");
          } catch (localErr) {
            console.error("[MongoDB] Fallback to local MongoDB also failed:", localErr.message);
            throw primaryErr;
          }
        }
        throw primaryErr;
      }
      return await tryConnect(localUri, "Local MongoDB Compass (Fitness)");
    })().catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

export default connectDB;