import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import ngoRouter from "./routes/ngo.routes.js";
import hospitalRouter from "./routes/hospital.routes.js";
import adminRouter from "./routes/admin.routes.js";
import bloodRouter from "./routes/blood.routes.js";
import bloodRequestRouter from "./routes/bloodRequest.routes.js";
import centerRouter from "./routes/center.routes.js";

// routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/ngo", ngoRouter);
app.use("/api/v1/hospital", hospitalRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/blood", bloodRouter);
app.use("/api/v1/blood-request", bloodRequestRouter);
app.use("/api/v1/center", centerRouter);

export { app };
