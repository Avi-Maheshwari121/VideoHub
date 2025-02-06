import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

//since generating refresh and access token will be used multiple times we can define it as a method
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    //save this generated refresh token in the database of the document user.
    user.refreshToken = refreshToken;
    //below we are saving the updated user.. but when we save we have to provide all the required fields again hence to avoid that we pass a parameter validateBeforeSave: false which ignores validation before saving....
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Refresh and Access Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //steps to be done in the registerUser Controller...
  //get user details from frontend.
  //validation - not empty.
  //check if user already exists: username, email
  //check for coverimages, check for avatar
  // upload them to cloudinary, avatar(properly upload?), extract url from the response
  // create user object - create entry in db.
  // remove password and refresh token field from response, since when we create an object in mongodb, it return back and we dont want to show that to user
  //check for user creation
  //return response

  //Step 1: get user details from frontend/postman.. at the moment only asking N extracting the required fields(data handling)
  const { username, fullName, email, password } = req.body;
  console.log("username: ", username);
  console.log("email: ", email);

  //TO VALIDATE THAT EACH FIELD is not empty, we can either use if's like below for every field OR Use SOME METHOD which returns true if any element of array satisfy the condition.
  // if(fullName === "") {
  //   throw new ApiError(400, "fullname is requried")
  // }

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are compulsory");
  }

  //To check if the username or email already exists in the database or not. using the or operator $ to check if any of those 2 exist

  const existUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  //multer gives us req.files ka access just how express gives us the excess of req.body

  const avatarLocalPath = req.files?.avatar[0]?.path; //handled array below.
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  //we cannot use the above method to extract the path of the current image because if it is undefined then it will excess .path of undefined which will throw a error. optional chaining. use classic if-else

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image should be uploaded compulsorily");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file not uploaded properly");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const CreatedUser = await User.findById(user._id).select(
    "-password -refreshToken" //jo jo field nhi chahiye while returing (finding or selecting) the user object.
  );

  if (!CreatedUser) {
    throw new ApiError(500, "Something went wrong while register the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, CreatedUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //TODOS
  //req body -> data
  //username or email based entry
  //find the user
  //password check
  //access and refresh token
  //send secure cookie and response

  const { username, password, email } = req.body;

  // console.log(req.body);

  //either the user has to give email or username to login
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  //running mongodb query to find the user either by email or username as entered by the user.
  const userexist = await User.findOne({
    $or: [{ username }, { email }],
  });

  //if userdoesnt exist
  if (!userexist) {
    throw new ApiError(404, "User doesn't exist");
  }

  //checking user Password:
  const isPasswordValid = await userexist.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    userexist._id
  );

  //here the reference userexist still have still have empty referesh token because we have not updated it... the refresh token has been saved in the database for the userexist document but its reference in this code has still not recieved it so we can either update it or make another database query call to get the updated document object.

  const loggedInUser = await User.findOne(userexist._id).select(
    " -password -refreshToken"
  ); // we dont want to get password ....and refresh token is already accessible and available here so no need to get it back.

  //sending the access token as cookies

  //HTTP-Only Cookie: Cannot be accessed by JavaScript(FrontEnd) (more secure).. only modifiable by the server
  //setting up the options for the type of cookies.
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) //setting up accessTokens as cookies
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          userexist: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});


//LOGOUT LOGIC
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});


//generating new access and refresh token 
const refreshAccessToken = asyncHandler(async(req,res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken)
  {
    throw new ApiError(
      401, "anauthorised request"
    )
  }

 try {
   const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
 
   const user = await User.findById(decodedToken?._id)
 
   if(!user) {
     throw new ApiError(401, "Invalid Refresh Token")
   }
 
   if(incomingRefreshToken != user?.refreshToken)
   {
     throw new ApiError(401, "Refresh token is expired or used")
   }
 
   const options = {
     httpOnly: true,
     secure: true,
   };
 
   const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
 
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", newRefreshToken, options)
   .json (
     new ApiResponse(
       200,
       {
         accessToken, refreshToken: newRefreshToken
       },
       "Access token refreshed"
     )
   )
 } catch (error) {
  throw new ApiError(401, error?.message||"Invalid refresh Token")
 }

})





export { registerUser, loginUser, logoutUser, refreshAccessToken };
