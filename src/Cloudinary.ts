import dotenv from 'dotenv';
import Cloudinary from "cloudinary";

dotenv.config();
const cloudinary = Cloudinary.v2;

cloudinary.config({
    cloud_name: `${process.env.CLOUDINARY_NAME}`,
    api_key: `${process.env.CLOUDINARY_APIKEY}`,
    api_secret:  `${process.env.CLOUDINARY_SECRET}`
})

export default cloudinary;