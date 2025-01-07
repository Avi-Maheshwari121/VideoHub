import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//telling express, where and what kind of the datas can come from:
app.use(express.json({ limit: "20kb" })); //middleware done to accept json format data, but we put a upperbound limit on data to be accepted.

app.use(express.urlencoded({ extended: true, limit: "20kb" })); // a middleware in Express.This middleware is used to parse incoming requests with application/x-www-form-urlencoded payloads. It is typically used to handle data submitted via HTML forms. The parsed data is then accessible in req.body. like in some URL + is used while in some %20 is used etc.. the true helps to parse nested objects.

app.use(express.static("public")); // helps to keep/store public assets like images, fevicons, here we are keeping it in the public folder.
app.use(cookieParser());



//routes import


import userRouter from "./routes/user.routes.js";

//routes declaration

app.use("/api/v1/users", userRouter);         //this route will act as prefix... http://localhost:8000/api/v1/users/register.
//we just need to include the above route and all other routes for users can be written without changing anything here.




export default app;
