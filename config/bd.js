import mongoose from "mongoose";
import dotenv from "dotenv";
import process from "process";
import dns from "dns";

dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  const dbURL = process.env.MONGO_URI;
  const fallbackURL = process.env.MONGO_URI_FALLBACK;
  const candidates = [dbURL, fallbackURL].filter(Boolean);

  if (candidates.length === 0) {
    console.warn(
      "MONGO_URI non défini. Le backend continuera sans base de données.",
    );
    return false;
  }

  for (const url of candidates) {
    try {
      await mongoose.connect(url, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      });
      console.log("MongoDB connectée");
      return true;
    } catch (error) {
      console.warn(`Échec de connexion MongoDB avec ${url}:`, error.message);
    }
  }

  console.warn("MongoDB non disponible, le serveur continue en mode dégradé.");
  return false;
};

export default connectDB;
