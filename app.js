import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routers/users.router";
import AuthRouter from "./routers/auth.router";
import DocumentsRouter from "./routers/documents.router";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3020;

app.use(express.json());
app.use(cookieParser());
app.use("/api", [UsersRouter, AuthRouter, DocumentsRouter]);
