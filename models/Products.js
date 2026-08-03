import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  brand: String,
  category: String,
  categoryLabelFr: String,
  movement: String,
  movementLabelFr: String,
  description: String,
  price: Number,
  rating: Number,
  countInStock: Number,
  imageKey: String,
  accent: String,
  caseSize: String,
  strap: String,
  strapLabelFr: String,
  featured: { type: Boolean, default: true },
  detailOverviewFr: String,
  detailStoryFr: String,
  specsFr: Array,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
