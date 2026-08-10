import Order from "../models/Order.js";
import Product from "../models/Products.js";

export const createOrder = async (req, res) => {
  try {
    console.log("========== NOUVELLE COMMANDE ==========");
    console.log("Content-Type :", req.headers["content-type"]);
    console.log("DONNEES RECUES :", req.body);

    // Vérifier que le body existe
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Aucune donnée reçue.",
      });
    }

    const { fullName, phone, city, adresse, items } = req.body;

    // Vérifier les informations client
    if (!fullName || !phone || !city || !adresse) {
      return res.status(400).json({
        success: false,
        message: "Toutes les informations de livraison sont obligatoires.",
      });
    }

    // Vérifier le panier
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Le panier est vide.",
      });
    }

    const orderItems = [];

    // Récupérer les produits depuis MongoDB
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produit introuvable : ${item.productId}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: Number(item.quantity),
        imageKey: product.imageKey,
      });
    }

    // Calcul du total côté serveur
    const totalPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    // Enregistrer la commande
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

    console.log("✅ COMMANDE CREEE :", order._id);

    return res.status(201).json({
      success: true,
      message: "Commande créée avec succès.",
      order,
    });
  } catch (error) {
    console.error("❌ ERREUR CREATION COMMANDE :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de la commande.",
      error: error.message,
    });
  }
};
