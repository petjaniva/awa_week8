import express, {
  type Express,
  Router,
  type Request,
  type Response,
} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import { validateToken } from "./validateToken.js";
import mongoose from "mongoose";
import { type IUser, User } from "./models/User.js";

import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
const router: Router = express.Router();
const users: Array<IUser> = [];
const mongoDB = await mongoose
  .connect("mongodb://127.0.0.1:27017/testdb")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));
router.post("/user/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("user registeration request");
  console.log(req.body);
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(403).json({ email: "Email already in use" });
  }
  const newUser: IUser = new User({
    email: email,
    password: passwordHash,
    username: email.split("@")[0],
  });
  try {
    await newUser.save();
    return res.status(200).json(newUser);
  } catch (error) {
    console.error("Error saving user:", error);
    return res.status(500).json({ message: "Error saving user." });
  }
});
router.post("/user/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("user login request");
  console.log(req.body);
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(404).json({ message: "User does not exist." });
  }
  const isPasswordValid = bcrypt.compareSync(password, existingUser.password);
  if (!isPasswordValid) {
    return res.status(403).json({ message: "Invalid password." });
  }
  const userToken: string = jwt.sign(
    {
      email: existingUser.email,
      id: existingUser._id,
      username: existingUser.username,
      isAdmin: existingUser.isAdmin,
    },

    (process.env.SECRET as string) || "defaultSecret",
    {
      expiresIn: "1h",
    }
  );
  return res.status(200).json({ success: true, token: userToken });
});

router.get("/private/", validateToken, (req: Request, res: Response) => {
  console.log("private request");
  return res.status(201).json({ message: "This is protected secure route!" });
});

router.get("/user/list", (req: Request, res: Response) => {
  console.log("user list request");
  return res.status(201).json(users);
});
app.use(express.json());
app.use("/api", router);
app.use("/", (req: Request, res: Response) => {
  res.send("Hello");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
