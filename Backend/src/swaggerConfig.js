const fs = require("fs"); // Import the File System module
const swaggerUi = require("swagger-ui-express"); // Import Swagger UI for Express

// Load the OpenAPI (Swagger) JSON file generated from Postman
const swaggerDocument = JSON.parse(fs.readFileSync("src/openapi.json", "utf8"));

module.exports = (app) => {
  // Serve Swagger UI at `/api-docs`
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
