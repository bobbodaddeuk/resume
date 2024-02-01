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

// 이력서 수정 API
router.patch("/resume/:resumeId", authMiddleware, async (req, res, next) => {
   try {
      const { resumeId } = req.params;
      const modifyData = req.body;

      const isExistResume = await prisma.resume.findFirst({
         where: { resumeId: +resumeId },
      });
      if (!isExistResume)
         return res
            .status(404)
            .json({ message: "이력서 조회에 실패하였습니다." });
      if (isExistResume.userId !== req.user.userId)
         return res
            .status(401)
            .json({ message: "이력서를 수정할 권한이 없습니다." });

      const status = [
         "APPLY",
         "DROP",
         "PASS",
         "INTERVIEW1",
         "INTERVIEW2",
         "FINAL_PASS",
      ];
      if (!modifyData.status)
         return res
            .status(412)
            .json({ message: "이력서의 상태를 입력하세요." });

      const modifiedData = await prisma.resume.update({
         data: { ...modifyData },
         where: { resumeId: +resumeId },
      });
      return res
         .status(200)
         .json({ message: "이력서가 수정되었습니다.", data: modifiedData });
   } catch (err) {
      next(err);
   }
});

// 이력서 삭제 API
router.delete("/resume/:resumeId", authMiddleware, async (req, res, next) => {
   try {
      const { resumeId } = req.params;
      const isExistResume = await prisma.resume.findFirst({
         where: { resumeId: +resumeId },
      });
      if (!isExistResume)
         return res
            .status(404)
            .json({ message: "이력서 조회에 실패하였습니다." });
      if (isExistResume.userId !== req.user.userId)
         return res
            .status(401)
            .json({ message: "이력서를 삭제할 권한이 없습니다." });

      await prisma.resume.delete({
         where: { resumeId: +resumeId },
      });
      return res.status(200).json({ message: "이력서를 삭제하였습니다." });
   } catch (err) {
      next(err);
   }
});

export default router;
