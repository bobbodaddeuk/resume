import express from "express";
import { prisma } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

const router = express.Router();

// 회원가입 API
router.post("/sign-up", async (req, res, next) => {
   try {
      const { email, name, password, confirmPassword } = req.body;

      const isExistUser = await prisma.users.findFirst({
         where: { email },
      });
      if (isExistUser)
         return res
            .status(409)
            .json({ message: "이미 존재하는 사용자입니다." });

      if (password !== confirmPassword)
         return res
            .status(412)
            .json({ message: "비밀번호가 일치하지 않습니다." });
      const hashedPassword = await bcrypt.hash(password, 10);
      const [user, userInfo] = await prisma.$transaction(
         async (tx) => {
            const user = await tx.users.create({
               data: {
                  email,
                  password: hashedPassword,
               },
            });
            const userInfo = await tx.userInfos.create({
               data: {
                  userId: user.userId,
                  name,
               },
            });
            return [user, userInfo];
         },
         {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
         }
      );
      return res.status(201).json({
         message: "회원가입이 완료되었습니다.",
      });
   } catch (err) {
      next(err);
   }
});

export default router;
