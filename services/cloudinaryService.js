import cloudinary, { cloudinaryConfig } from "../config/cloudinary.js";

export const signUpload = ({ category, timestamp = Math.floor(Date.now() / 1000) }) => {
  const params = {
    timestamp,
    folder: `${cloudinaryConfig.folder}/${category}`,
    upload_preset: cloudinaryConfig.uploadPreset || undefined,
  };
  const signature = cloudinary.utils.api_sign_request(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)),
    cloudinaryConfig.apiSecret
  );
  return {
    timestamp,
    signature,
    apiKey: cloudinaryConfig.apiKey,
    cloudName: cloudinaryConfig.cloudName,
    folder: params.folder,
    uploadPreset: params.upload_preset,
  };
};

export const fetchResource = (publicId) => cloudinary.api.resource(publicId);

export const destroy = (publicId) => cloudinary.uploader.destroy(publicId);

export const buildUrl = (publicId, { width, height, crop = "fill", quality = "auto", format = "auto" } = {}) =>
  cloudinary.url(publicId, { secure: true, transformation: [{ width, height, crop, quality, fetch_format: format }] });