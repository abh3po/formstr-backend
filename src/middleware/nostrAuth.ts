import { Request, Response, NextFunction } from "express";
import { base64 } from "@scure/base";
import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils"; // Import bytesToHex

export const validateNostrAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Nostr ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    // Decode base64 event
    const encodedEvent = authHeader.replace("Nostr ", "");
    const decodedBytes = base64.decode(encodedEvent);
    const decodedString = new TextDecoder().decode(decodedBytes); // Convert Uint8Array to string
    console.log("Decoded String:", decodedString);
    const event = JSON.parse(decodedString);
    // Validate event structure
    if (event.kind !== 27235) {
      return res.status(401).json({ error: "Invalid event kind" });
    }

    // Validate timestamp (within 60 seconds)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(event.created_at - now) > 60) {
      return res
        .status(401)
        .json({ error: "Event timestamp outside valid window" });
    }

    // Validate URL
    const urlTag = event.tags.find((tag: string[]) => tag[0] === "u");
    const requestUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    if (!urlTag || urlTag[1] !== requestUrl) {
      return res.status(401).json({ error: "Invalid URL tag" });
    }

    // Validate method
    const methodTag = event.tags.find((tag: string[]) => tag[0] === "method");
    if (!methodTag || methodTag[1] !== req.method) {
      return res.status(401).json({ error: "Invalid method tag" });
    }

    // Validate payload for POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const payloadTag = event.tags.find(
        (tag: string[]) => tag[0] === "payload"
      );
      if (payloadTag) {
        const bodyString = JSON.stringify(req.body);
        const bodyHash = bytesToHex(sha256(bodyString)); // Use bytesToHex
        if (payloadTag[1] !== bodyHash) {
          return res.status(401).json({ error: "Invalid payload hash" });
        }
      }
    }

    // Validate signature
    const eventHash = bytesToHex(
      sha256(
        JSON.stringify([
          0,
          event.pubkey,
          event.created_at,
          event.kind,
          event.tags,
          event.content,
        ])
      )
    ); // Use bytesToHex

    if (event.id !== eventHash) {
      return res.status(401).json({ error: "Invalid event ID" });
    }

    const isValid = schnorr.verify(event.sig, event.id, event.pubkey);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Attach pubkey to request
    (req as any).nostrPubkey = event.pubkey;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};
