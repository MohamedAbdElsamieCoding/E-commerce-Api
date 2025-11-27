import express from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import categoryRouter from "./routes/category.route.js";
import cartRouter from "./routes/cart.route.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use("/uploads", express.static("uploads"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/cart", cartRouter);

app.use(errorHandler);

export default app;
