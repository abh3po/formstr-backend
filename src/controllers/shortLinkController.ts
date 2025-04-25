import { Request, Response } from "express";
import { createShortLink, getShortLink, ShortLink } from "../models/shortLink";

export const createShortLinkHandler = async (req: Request, res: Response) => {
  try {
    const { name, url } = req.body;
    const pubkey = (req as any).nostrPubkey;

    if (!name || !url) {
      return res.status(400).json({ error: "Name and URL are required" });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const link: ShortLink = { name, url, owner: pubkey };
    await createShortLink(link);
    res.status(201).json({ name, url });
  } catch (error: any) {
    console.error("Create shortlink error:", error);
    if (error.message === "Short link name already exists") {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getShortLinkHandler = async (req: Request, res: Response) => {
  try {
    const link = await getShortLink(req.params.name);
    if (!link) {
      return res.status(404).json({ error: "Short link not found" });
    }
    res.json({ name: link.name, url: link.url });
  } catch (error) {
    console.error("Get shortlink error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
