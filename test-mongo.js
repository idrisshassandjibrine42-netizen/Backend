import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error(
    "Aucune variable MONGO_URI trouvée. Ajoutez-la dans le fichier .env.",
  );
  process.exit(1);
}

const run = async () => {
  try {
    console.log("Test de connexion MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 15000,
      family: 4,
    });
    console.log("✅ Connexion MongoDB réussie.");
  } catch (error) {
    console.error("❌ Échec de connexion MongoDB :");
    console.error(error.message);
    if (error.reason) {
      console.error(error.reason);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
