import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import QRCode from "qrcode";

const app = express();
const port = 3000;
app.use(express.json());

// const db = new sqlite3.Database("invoice.db");

app.get("/generate-qr", async (req: Request<any>, res: any) => {
  const amount = parseFloat(req.params.amount) || 500;
  console.log("AMOUNT IS", amount, req.params.amount);
  if (isNaN(amount)) {
    return res.status(400).json({ status: "error", message: "Invalid amount" });
  }
  let formstrLud16 = process.env.FORMSTR_LUD16;
  if (!formstrLud16) {
    return res
      .status(500)
      .json({ status: "error", message: "Server not configured" });
  }
  let [name, domain] = formstrLud16.split("@");

  let requestEndpoint = new URL(
    `/.well-known/lnurlp/${name}`,
    `https://${domain}`
  ).toString();
  const zaprequestUrl =
    requestEndpoint + `?amount=${Number(req.params.amount) * 1000}`;

  const paymentRequest = await fetch(zaprequestUrl);
  const request = await paymentRequest.json();
  const lightningUrl = "lightning:" + request.pr;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(lightningUrl);
    res.json({
      status: "success",
      message: "QR code generated successfully",
      invoice: request.pr,
      qr: qrCodeDataUrl,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to generate QR code" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
