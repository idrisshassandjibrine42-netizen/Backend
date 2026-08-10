import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Products.js";

export const createOrder = async (req, res) => {
  try {
    const { fullName, phone, city, adresse, items } = req.body;

    // Vérification des informations client
    if (!fullName?.trim()) {
      return res.status(400).json({
        message: "Nom complet obligatoire",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        message: "Téléphone obligatoire",
      });
    }

    if (!city?.trim()) {
      return res.status(400).json({
        message: "Ville obligatoire",
      });
    }

    if (!adresse?.trim()) {
      return res.status(400).json({
        message: "Adresse obligatoire",
      });
    }

    // Vérification du panier
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Le panier est vide",
      });
    }

    // Vérifier les produits MongoDB
    const productIds = items.map((item) => item.productId);

    const validIds = productIds.every((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );

    if (!validIds) {
      return res.status(400).json({
        message: "Identifiant produit invalide",
      });
    }

    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== items.length) {
      return res.status(400).json({
        message: "Un ou plusieurs produits sont introuvables",
      });
    }

    // Construire les articles de la commande
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Produit introuvable`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: "Quantité invalide",
        });
      }

      // Vérifier le stock
      if (product.countInStock < quantity) {
        return res.status(400).json({
          message: `Stock insuffisant pour ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        imageKey: product.imageKey,
      });
    }

    // Calcul du total côté serveur
    const totalPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    // Créer la commande
    const order = await Order.create({
      customer: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        adresse: adresse.trim(),
      },

      items: orderItems,

      totalPrice,

      status: "en_attente",
    });

    // Diminuer le stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          countInStock: -item.quantity,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Commande créée avec succès",
      order,
    });
  } catch (error) {
    console.error("Erreur création commande :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de la commande",
    });
  }
};
