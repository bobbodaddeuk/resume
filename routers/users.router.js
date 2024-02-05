import express from "express";
import { prisma } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 회원가입 API
router.post("/sign-up", async (req, res, next) => {
   try {
      const { email, name, password, confirmPassword } = req.body;

      const isExistUser = await prisma.users.findFirst({
         where: { email },
      });
      if (!email) {
         return res.status(400).json({ message: "이메일은 입력해주세요." });
      }
      if (!password) {
         return res.status(400).json({ message: "비밀번호를 입력해주세요." });
      }
      if (!confirmPassword) {
         return res
            .status(400)
            .json({ message: "비밀번호 확인을 입력해주세요." });
      }
      if (!name) {
         return res.status(400).json({ message: "이름을 입력해주세요" });
      }
      if (isExistUser)
         return res
            .status(409)
            .json({ message: "이미 존재하는 사용자입니다." });
      if (password.length < 6) {
         return res
            .status(400)
            .json({ message: "비밀번호는 6자 이상이어야 합니다." });
      }
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
                  name,
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
         email,
         name,
      });
   } catch (err) {
      next(err);
   }
});

// 로그인 API
router.post("/sign-in", async (req, res, next) => {
   const { email, password } = req.body;
   const user = await prisma.users.findFirst({ where: { email } });
   if (!email) {
      return res.status(400).json({ message: "이메일은 입력해주세요." });
   }
   if (!password) {
      return res.status(400).json({ message: "비밀번호를 입력해주세요." });
   }

   if (!user)
      return res.status(412).json({ message: "존재하지 않는 이메일입니다." });
   if (!(await bcrypt.compare(password, user.password)))
      return res.status(412).json({ message: "비밀번호가 일치하지 않습니다." });

   const accessToken = jwt.sign(
      {
         userId: user.userId,
      },
      process.env.SECRET_KEY,
      {
         expiresIn: "12h",
      }
   );
   res.cookie("Authorization", `Bearer ${accessToken}`);

   return res.status(200).json({ accessToken });
});

// 내 정보 조회 API
router.get("/users", authMiddleware, async (req, res, next) => {
   const { userId } = req.user;

   const user = await prisma.users.findFirst({
      where: { userId: +userId },
      select: {
         userId: true,
         email: true,
         createdAt: true,
         updatedAt: true,
         userInfos: {
            select: {
               name: true,
               age: true,
               gender: true,
               profileImage: true,
            },
         },
      },
   });
   return res.status(200).json({ data: user });
});

export default router;
