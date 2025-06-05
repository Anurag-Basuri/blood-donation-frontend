import dotenv from "dotenv";
import { connectDB } from "./database/index.js";
import { app } from "./app.js";
dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is runing at port : ${process.env.PORT}`);
    });
    console.log(`app is listening at http://localhost:${process.env.PORT}`);
  })
  .catch((err) => {
    console.log("MOngo db connection failed :", err);
  });
