// require('dotenv').config({path: './env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

const portListen = process.env.PORT || 8000;

connectDB()   //since it is a async function then it will return a promise hence has to be resolved.
  .then(() => {
    //listening to errors before app.listen
    app.on("error", (err) => {
      console.log("ERRR: ", err);
      throw err;
    }); // just a precheck if there is error or not.

    app.listen(portListen, () => {
      console.log(`Server is running at port: ${portListen}`);
    });
  })
  .catch((err) => {
    console.log("DB CONNECTION FAILED!!", err);
  });

/* import express from "express";

const app = express();

//connection code with database

//we can write like this
function connectDB() {}

connnectDB()


//but use iife for a better production grade code.
;(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (err) => {
      console.log("ERRR: ", err);
      throw err;
    });

    app.listen(process.env.PORT, () => {
      console.log(`app is listening on ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("ERROR: ", err);
    throw err;
  }
})(); //iffes, putting parenthesis just after the function to execute it.
 */
