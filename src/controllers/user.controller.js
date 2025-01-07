import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend.
  //validation - not empty.
  //check if user already exists: username, email
  //check for images, check for avatar
  // upload them to cloudinary, avatar(properly upload?), extract url from the response
  // create user object - create entry in db.
  // remove password and refresh token field from response, since when we create an object in mongodb, it return back and we dont want to show that to user
  //check for user creation
  //return response

  const { username, fullName, email, password } = req.body;
  console.log("username: ", username);
  console.log("email: ", email)


  //TO VALIDATE THAT EACH FIELD is not empty, we can either use if's like below for every field OR Use SOME METHOD which returns true if any element of array satisfy the condition.
  // if(fullName === "") {
  //   throw new ApiError(400, "fullname is requried")
  // }

  if(
    [fullName, username, email, password].some((field) => (
      field?.trim() === ""))
    ) {
      throw new ApiError(400, "All fields are compulsory")
    }

    //To check if the username or email already exists in the database or not.

    const existUser = User.findOne({
      $or: [{ username }, { email }]
    })

    if(existUser){
      throw new ApiError(409, "Username or email already exists")
    }


    //multer gives us req.files ka access

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath)
    {
      throw new ApiError(400, "Avatar image should be uploaded compulsorily")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar)
    {
      throw new ApiError(400, "Avatar file not uploaded properly")
    }

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
    })

    const CreatedUser = await User.findById(user._id).select(
      "-password -refreshToken"                      //jo jo field nhi chahiye while finding or selecting the user object.
    );

    if(!CreatedUser)
    {
      throw new ApiError(500, "Something went wrong while register the user")
    }


    return res.status(201).json(
      new ApiResponse(200, CreatedUser, "User registered Successfully")
    )
    
});

export { registerUser };
