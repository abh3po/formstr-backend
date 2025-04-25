const path = require("path");

module.exports = {
  entry: "./public/client.js",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  },
  mode: "production",
  resolve: {
    extensions: [".js"],
  },
};
