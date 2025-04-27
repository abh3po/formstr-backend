import express from "express";
import path from "path";
import { initDb } from "./models/shortLink";
import shortLinkRoutes from "./routes/shortLink";

const app = express();
const port = 5000;

app.use(express.json());

// Serve static files for test client
app.use(express.static(path.join(__dirname, "../public")));

// Serve test client HTML
app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Initialize database
initDb();

// Routes
app.use("/api", shortLinkRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Test client available at http://0.0.0.0:${port}/test`);
});
