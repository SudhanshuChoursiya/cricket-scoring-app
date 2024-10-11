import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = async (file) => {
  try {
    const response = await cloudinary.uploader.upload(file?.path, {
      folder: "files",
      allowed_formats: ["jpg", "jpeg", "png"],
      public_id: `${Date.now()}_${file?.originalname}`,
      unique_filename: true,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

const removeFromCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export { uploadToCloudinary, removeFromCloudinary };
