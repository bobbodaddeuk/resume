import express from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../models/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 이력서 생성 API
router.post("/resume", authMiddleware, async (req, res, next) => {
   try {
      const { userId } = req.user;
      const { title, selfIntroduction } = req.body;
      const resume = await prisma.resume.create({
         data: {
            userId: +userId,
            title,
            selfIntroduction,
         },
      });
      return res.status(201).json({ message: "이력서가 작성되었습니다." });
   } catch (err) {
      next(err);
   }
});

export default router;
