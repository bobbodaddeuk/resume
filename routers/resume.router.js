import express from "express";
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

// 이력서 상세 조회 API
router.get("/resume/:resumeId", authMiddleware, async (req, res, next) => {
   try {
      const { resumeId } = req.params;
      var resume = {};
      const data = await prisma.users.findFirst({
         where: {
            userId: +req.user.userId,
         },
         select: {
            userInfos: {
               select: {
                  name: true,
                  gender: true,
                  age: true,
                  profileImage: true,
               },
            },
            resume: {
               where: {
                  resumeId: 1,
               },
               select: {
                  userId: true,
                  title: true,
                  selfIntroduction: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
               },
            },
         },
      });

      resume = Object.assign({}, data.userInfos, ...data.resume);

      if (!resume)
         return res
            .status(404)
            .json({ message: "이력서가 존재하지 않습니다." });
      if (resume.userId !== req.user.userId)
         return res
            .status(401)
            .json({ message: "이력서를 조회할 권한이 없습니다." });

      return res.status(200).json({ data: resume });
   } catch (err) {
      next(err);
   }
});

// 모든 이력서 목록 조회
router.get("/resume", authMiddleware, async (req, res, next) => {
   const resume = await prisma.resume.findMany({
      select: {
         resumeId: true,
         userId: true,
         title: true,
         createdAt: true,
         updatedAt: true,
         user: {
            select: {
               name: true,
            },
         },
      },
      orderBy: {
         createdAt: "desc",
      },
   });
   return res.status(200).json({ data: resume });
});

export default router;
