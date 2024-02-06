import { prisma } from "../models/index.js";
import jwt from "jsonwebtoken";

export default async function (req, res, next) {
   try {
      const { authorization } = req.headers;
      if (!authorization) throw new Error("인증 정보가 일치하지 않습니다.");

      const [tokenType, token] = authorization.split(" ");
      if (tokenType !== "Bearer")
         throw new Error("인증 정보가 올바르지 않습니다.");
      if (!token) throw new Error("인증 정보가 올바르지 않습니다.");

      const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

      const userId = decodedToken.userId;
      const user = await prisma.users.findFirst({ where: { userId: +userId } });
      if (!user) throw new Error("토큰 사용자가 존재하지 않습니다.");
      req.user = user;

      next();
   } catch (err) {
      if (err.name === "TokenExpiredError")
         return res.status(401).json({ message: "토큰이 만료되었습니다." });
      if (err.name === "JsonWebTokenError")
         return res.status(401).json({ message: "토큰이 조작되었습니다." });
      return res.status(400).json({ message: err.message });
   }
}
