//this will be the file in which we will write the logic to take file from our local server and upload it to the cloudinary services.

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //file system

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//simply creating a method to get the local file path.. upload it to the cloudinary.
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("path not found");
      return null;
    }
    //if file path exist ,upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",                                   //automatically detecting the type of the file uploaded.
    });
    //file hase been uploaded succesfully
    console.log("file is uploaded on cloudinary ", response.url);

    fs.unlinkSync(localFilePath)  //when the file is successfully upload to the cloudinary.. it will be deleted from the local server...
    
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

console.log(uploadOnCloudinary);

export { uploadOnCloudinary };
