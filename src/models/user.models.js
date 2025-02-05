import mongoose from 'mongoose'
import jwt from "jsonwebtoken" //for the refresh and access token
import bcrypt from "bcrypt"   //for hashing the password


const userSchema = new mongoose.Schema({
    username: {
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true     // helps to make any field searchable... if we want to search in our database using a particular field, we make its index as true.
    }, 
    email: {
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    }, 
    fullName: {
        type:String,
        required: true,
        trim: true,
        index: true
    }, 
    avatar : {
        type: String, // cloudinary url
        required: true
    },
    coverImage : {
        type: String //cloudinary url
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String,
    }
}, {timestamps: true})



//using a pre hook of mongoose... can be applied on various events such as validate, save, remove, UpdateOne etc.... syntax similar to app.get/app.use

//in mongoose Middleware (also called pre and post hooks) are functions which are passed control during execution of asynchronous functions. so before saving we will be going through these middlewares.

userSchema.pre("save", async function(next) {        //use normal functions and not arrow functions because we have to use this keyword, and arrow function does not support this keyword.
    if(!this.isModified("password")) return next();    //next transfers the control to the next middleware
    this.password = await bcrypt.hash(this.password, 10);
    next();
})


//defining custom methods in mongoose 

//defining a method to ensure the password given by the user is correct.
userSchema.methods.isPasswordCorrect = async function    
(password) {
    return await bcrypt.compare(password, this.password) //password argument is the clear text password send by the user, now which is being compared to the original hased password. 
}


//defining a method to generate tokens

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);
//this User will be imported and other files and will act as a SPOC for other files to communicate with the model in the database.