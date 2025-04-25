import { Router } from "express";
import {
  createShortLinkHandler,
  getShortLinkHandler,
} from "../controllers/shortLinkController";
import { validateNostrAuth } from "../middleware/nostrAuth";
import { restrictToAdmin } from "../middleware/adminAuth";

const router = Router();

// Public GET route (no authentication)
router.get("/shortlink/:name", getShortLinkHandler);

// Admin-only POST route (requires Nostr auth and admin pubkey)
router.post(
  "/shortlink",
  validateNostrAuth,
  restrictToAdmin,
  createShortLinkHandler
);

export default router;
