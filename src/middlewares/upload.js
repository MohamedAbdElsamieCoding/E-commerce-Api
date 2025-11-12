import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype))
    return cb(
      new AppError("Only images is allowed"),
      400,
      httpStatusText.ERROR
    );
  cb(null, true);
};

const upload = multer({ storage, fileFilter });
export default upload;
