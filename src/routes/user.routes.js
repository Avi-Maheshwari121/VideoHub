import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();    //just used a variable, just like const app = express();

userRouter.route("/register").post(
    //executing the multer middleware to upload images on the server just before sending the request to the registerUser controller.
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

export default userRouter;
