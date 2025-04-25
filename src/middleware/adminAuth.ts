import { Request, Response, NextFunction } from "express";
import { schnorr } from "@noble/curves/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";

// Hardcoded admin nsec (replace with your own secure nsec)
// nsec for hardcoded npub in hex is: 35b86497dbaf6b573959adc949ff7850c8136e6161343fbcf9141e632fd8a4e2
const ADMIN_PUBKEY =
  "74359764570c0a0130eee5e20558ce0ae31d249d508348f2dd23d7a3a8e2f72c";

export const restrictToAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nostrPubkey = (req as any).nostrPubkey;
  if (!nostrPubkey || nostrPubkey !== ADMIN_PUBKEY) {
    return res
      .status(403)
      .json({ error: "Unauthorized: Only admin can perform this action" });
  }
  next();
};
