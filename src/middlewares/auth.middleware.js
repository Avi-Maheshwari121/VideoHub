//middleware to find out if the user is authenticated or not i.e. logged in or not.

import { User } from "../models/user.models";
import { ApiError } from "../utils/ApiErrors";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async(req, _ , next) => {
try {
        const token = req.cookies?.accessToken  || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token) {
            throw new ApiError(
                401, "Unauthorized Request"
            )
        }
    
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")   //because access token contains the id of user... look at the userModel.
    
        if(!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next();

} catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
}

})