import "dotenv/config";
import multerConfig from "./config/multer.js";
console.log("Storage engine name:", multerConfig.storage.constructor.name);
process.exit(0);
