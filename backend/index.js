import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { dbConnect } from "./db/db.js";
import { server } from "./app.js";
const port = process.env.PORT || 5000;

dbConnect()
  .then(() => {
    console.log("connected to db");
    server.on("error", (error) => {
      console.log(error);
    });
    server.listen(port,() => {
      console.log(`server is running on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
    throw error;
  });
