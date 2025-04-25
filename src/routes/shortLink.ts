import { Router } from "express";
import { validateNostrAuth } from "../middleware/nostrAuth";
import {
  createShortLinkHandler,
  getShortLinkHandler,
} from "../controllers/shortLinkController";

const router = Router();

router.post("/shortlink", validateNostrAuth, createShortLinkHandler);
router.get("/shortlink/:name", validateNostrAuth, getShortLinkHandler);

export default router;
