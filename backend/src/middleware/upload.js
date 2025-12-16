import multer from "multer";

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/webp"||
    file.mimetype==="image/gif"||
       file.mimetype=== "image/svg+xml"   // Add SVG if needed

  ) {
    cb(null, true);
  } else {
cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`));  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter,
}); 