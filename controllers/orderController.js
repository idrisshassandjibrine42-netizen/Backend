import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    console.log("DONNEES RECUES :", req.body);

    const { fullName, phone, city, adresse, items } = req.body;

    if (!fullName || !phone || !city || !adresse) {
      return res.status(400).json({
        success: false,
        message: "Toutes les informations de livraison sont obligatoires.",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Le panier est vide.",
      });
    }

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Produit introuvable.",
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageKey: product.imageKey,
      });
    }

    const totalPrice = orderItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const order = await Order.create({
      customer: {
        fullName,
        phone,
        city,
        adresse,
      },

      items: orderItems,

      totalPrice,

      status: "en_attente",
    });

    console.log("COMMANDE CREEE :", order._id);

    res.status(201).json({
      success: true,
      message: "Commande créée avec succès.",
      order,
    });
  } catch (error) {
    console.error("ERREUR CREATION COMMANDE :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de la commande.",
      error: error.message,
    });
  }
};
