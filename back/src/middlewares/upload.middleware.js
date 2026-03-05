const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rootDir = path.join(process.cwd(), "public", "uploads");
    let dir = rootDir;

    if (file.fieldname === "videoUrl") {
      dir = path.join(rootDir, "videos");
    } else if (file.fieldname === "imageUrl") {
      dir = path.join(rootDir, "not");
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 500 }, // 500MB
});

module.exports = upload;