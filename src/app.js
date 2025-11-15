import express from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRouter from "./modules/auth/routes/auth.route.js";
import userRouter from "./modules/users/routes/user.route.js";
import productRouter from "./modules/products/routes/product.route.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);

app.use(errorHandler);

export default app;
