import express from "express";
import cors from "cors";
import { requestLogger } from "./src/middlewares/requestLogger.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import authRouter from "./src/modules/auth/routes/auth.route.js";
import userRouter from "./src/modules/users/routes/user.route.js";
const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.use(errorHandler);

export default app;
