import Equipment from "../models/Equipment.js";

// GET all
export const getEquipment = async (req, res) => {
  try {
    const items = await Equipment.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET one
export const getEquipmentById = async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create
export const createEquipment = async (req, res) => {
  try {
    const item = new Equipment(req.body);
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update
export const updateEquipment = async (req, res) => {
  try {
    const item = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
export const deleteEquipment = async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
