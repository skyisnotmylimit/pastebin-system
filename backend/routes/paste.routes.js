import express from "express";
const router = express.Router();
import { createPaste, getPaste } from "../controllers/paste.controller.js";

router.post("/create-paste", createPaste);
router.get("/:hash", getPaste);

export default router;
