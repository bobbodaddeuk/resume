import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routers/users.router.js";
import ResumeRouter from "./routers/resume.router.js";
import errorHandlingMiddleware from "./middlewares/errorHandlingMiddleware.js";
import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import options from "./swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.DATABASE_PORT;

app.use(express.json());
app.use(cookieParser());

const specs = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api", [UsersRouter, ResumeRouter]);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
   console.log(PORT, "포트로 서버가 열렸어요!");
});
