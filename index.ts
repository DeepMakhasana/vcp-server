// Import required modules
const serverless = require("serverless-http");
import app from "./src/app";
import config from "./src/config";

// Start server
if (config.port === "development") {
    const PORT = config.port || 8000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} else {
    module.exports.handler = serverless(app);
}
