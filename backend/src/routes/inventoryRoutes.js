import express from "express";
import { decrementLow, getInventory } from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getInventory);
router.post("/decrement-low", decrementLow);

export default router;
