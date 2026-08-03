import dotenv from "dotenv";
import connectDB from "./config/bd.js";
import Product from "./models/Products.js";
import products from "./data/Products.js";

dotenv.config();
await connectDB();

await Product.deleteMany();
await Product.insertMany(products);

console.log("Données de produits insérées avec succès !");
process.exit();
