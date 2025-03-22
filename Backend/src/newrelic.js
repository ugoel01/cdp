require("dotenv").config();

"use strict";
exports.config = {
  app_name: ["Claims Management System"],
  license_key: process.env.LICENSE_KEY,
  logging: {
    level: "info",
  },
};
