require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "*",
  NODE_ENV: process.env.NODE_ENV || "development",
};