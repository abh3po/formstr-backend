// Client-side Nostr utilities (bundled with Webpack)
import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

async function generateNostrEvent(privateKey, method, url, payload = null) {
  const pubkey = bytesToHex(schnorr.getPublicKey(privateKey));
  const created_at = Math.floor(Date.now() / 1000);
  const kind = 27235;
  const tags = [
    ["u", url],
    ["method", method],
  ];
  if (payload) {
    const payloadHash = bytesToHex(sha256(JSON.stringify(payload)));
    tags.push(["payload", payloadHash]);
  }
  const content = "";

  const event = {
    pubkey,
    created_at,
    kind,
    tags,
    content,
  };

  const serialized = JSON.stringify([
    0,
    pubkey,
    created_at,
    kind,
    tags,
    content,
  ]);
  const id = bytesToHex(sha256(serialized));
  const sig = bytesToHex(schnorr.sign(id, privateKey));

  return { ...event, id, sig };
}

async function createShortLink() {
  const name = document.getElementById("createName").value;
  const url = document.getElementById("createUrl").value;
  const privateKey = document.getElementById("privateKey").value;
  const responseDiv = document.getElementById("response");

  if (!name || !url || !privateKey) {
    responseDiv.textContent =
      "Error: All fields are required for creating a short link.";
    return;
  }

  try {
    const event = await generateNostrEvent(
      privateKey,
      "POST",
      "http://localhost:5000/api/shortlink",
      { name, url }
    );

    const res = await fetch("/api/shortlink", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Nostr ${btoa(JSON.stringify(event))}`,
      },
      body: JSON.stringify({ name, url }),
    });

    const data = await res.json();
    responseDiv.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    responseDiv.textContent = `Error: ${error.message}`;
  }
}

async function getShortLink() {
  const name = document.getElementById("getName").value;
  const responseDiv = document.getElementById("response");

  if (!name) {
    responseDiv.textContent = "Error: Short name is required.";
    return;
  }

  try {
    const res = await fetch(`/api/shortlink/${name}`, {
      method: "GET",
    });

    const data = await res.json();
    responseDiv.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    responseDiv.textContent = `Error: ${error.message}`;
  }
}

// Attach event listeners to buttons
document
  .getElementById("createButton")
  .addEventListener("click", createShortLink);
document.getElementById("getButton").addEventListener("click", getShortLink);
