import Inventory from "../models/Inventory.js";

export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reduce quantity by `decrement` for all items with quantity <= threshold
export const decrementLow = async (req, res) => {
  try {
    const { threshold = 5, decrement = 2 } = req.body || {};
    const lowItems = await Inventory.find({ quantity: { $lte: threshold } });

    const updates = [];
    for (const item of lowItems) {
      item.quantity = Math.max(0, item.quantity - decrement);
      updates.push(item.save());
    }

    const result = await Promise.all(updates);
    res.json({ updated: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Seed initial inventory if empty
export const seedInitialData = async () => {
  try {
    const count = await Inventory.countDocuments();
    if (count > 0) return;

    const initial = [
      { name: "Valve, pressure", partNumber: "VLV-1001", quantity: 12, orderedQuantity: 0, orderedStatus: "None" },
      { name: "Filter cartridge", partNumber: "FLT-2203", quantity: 3, orderedQuantity: 3, orderedStatus: "Pending" },
      { name: "O-ring set", partNumber: "OR-330", quantity: 0, orderedQuantity: 10, orderedStatus: "Not received" },
      { name: "Bearing 6204", partNumber: "BR-6204", quantity: 20, orderedQuantity: 0, orderedStatus: "None" },
    ];

    await Inventory.insertMany(initial);
    console.log("Inventory seeded");
  } catch (error) {
    console.error("Seeding inventory failed:", error);
  }
};
