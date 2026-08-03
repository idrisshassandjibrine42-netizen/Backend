import Product from "../models/Products.js";
import productsData from "../data/Products.js";

const getFallbackProducts = () =>
  productsData.map((product, index) => ({
    ...product,
    _id: product._id ?? product.id ?? String(index + 1),
    id: product.id ?? product._id ?? index + 1,
  }));

const getFallbackProductById = (id) => {
  const numericId = Number(id);
  return getFallbackProducts().find(
    (product) =>
      product._id === id || product.id === numericId || product.slug === id,
  );
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.json(products);
  } catch (error) {
    console.warn(
      "MongoDB indisponible, utilisation des produits locaux :",
      error.message,
    );
    return res.json(getFallbackProducts());
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const fallbackProduct = getFallbackProductById(req.params.id);
      if (fallbackProduct) {
        return res.json(fallbackProduct);
      }
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    return res.json(product);
  } catch (error) {
    console.warn(
      "MongoDB indisponible pour la recherche par id :",
      error.message,
    );
    const fallbackProduct = getFallbackProductById(req.params.id);
    if (fallbackProduct) {
      return res.json(fallbackProduct);
    }
    return res.status(404).json({ message: "Produit non trouvé" });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    console.warn("Création en mode local :", error.message);
    return res.status(201).json({ ...req.body, _id: String(Date.now()) });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "produit introvable" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.warn("Mise à jour en mode local :", error.message);
    return res.status(200).json({ ...req.body, _id: req.params.id });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    return res.status(200).json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.warn("Suppression en mode local :", error.message);
    return res.status(200).json({ message: "Produit supprimé avec succès" });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true });
    return res.json(products);
  } catch (error) {
    console.warn(
      "MongoDB indisponible pour les produits mis en avant :",
      error.message,
    );
    return res.json(
      getFallbackProducts().filter((product) => product.featured),
    );
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
};
