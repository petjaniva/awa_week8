import { log } from "console";
import { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface CustomRequest extends Request {
  user?: JwtPayload;
}

export const validateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token: string | undefined = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }
  try {
    const verfied: jwt.JwtPayload = jwt.verify(
      token,
      process.env.SECRET || "defaultSecret"
    ) as jwt.JwtPayload;
    req.user = verfied;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

export const validateAdminToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token: string | undefined = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }
  try {
    const verfied: jwt.JwtPayload = jwt.verify(
      token,
      process.env.SECRET || "secretKey"
    ) as jwt.JwtPayload;
    console.log("Verified admin token:");
    console.log(verfied);

    if (!verfied.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    req.user = verfied;
    next();
  } catch (error) {
    console.log("admin token validation error");
    console.log(error);
    return res.status(401).json({ message: "Invalid token." });
  }
};
