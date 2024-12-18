// Import required modules
import app from "./src/app";
import config from "./src/config";

// Start server
const PORT = config.port || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
