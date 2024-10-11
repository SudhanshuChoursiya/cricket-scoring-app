//multer middleware
import multer from "multer";

const storage = multer.diskStorage({});

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    req.fileValidationError = "file type is invalid";
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
