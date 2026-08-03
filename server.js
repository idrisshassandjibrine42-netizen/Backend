import express from "express";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoute.js";
import userRoutes from "./routes/userRoute.js";
import connectDB from "./config/bd.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Bienvenue sur le serveur Express !");
});

const startServer = async () => {
  await connectDB();
  const port = process.env.PORT || 5001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
