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
import { validateToken, validateAdminToken } from "./validateToken.js";
import mongoose from "mongoose";
import { type IUser, User } from "./models/User.js";
import { type ITopic, Topic } from "./models/Topic.js";
import {
  sanitazeEmail,
  sanitazeUsername,
  checkPasswordStrength,
} from "./validators/inputValidators.js";
import { validationResult } from "express-validator";
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
router.post(
  "/user/register",
  sanitazeEmail(),
  sanitazeUsername(),
  checkPasswordStrength(),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("user registeration request");
    console.log(req.body);
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(403).json({ email: "Email already in use" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let username: string;
    let isAdmin: boolean;
    if (req.body.username) {
      username = req.body.username;
    } else {
      username = email.split("@")[0];
    }
    if (req.body.isAdmin) {
      isAdmin = req.body.isAdmin;
    } else {
      isAdmin = false;
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser: IUser = new User({
      email: email,
      password: passwordHash,
      username: username,
      isAdmin: isAdmin,
    });
    try {
      await newUser.save();
      return res.status(200).json(newUser);
    } catch (error) {
      console.error("Error saving user:", error);
      return res.status(500).json({ message: "Error saving user." });
    }
  }
);
router.post(
  "/user/login",
  sanitazeEmail(),
  sanitazeUsername(),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("user login request");
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
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
  }
);
router.get("/topics/", (req: Request, res: Response) => {
  console.log("public topics request");
  const topics: Array<ITopic> = [];
  Topic.find()
    .then((foundTopics) => {
      foundTopics.forEach((topic) => {
        topics.push(topic);
      });
      return res.status(201).json(topics);
    })
    .catch((err) => {
      console.error("Error fetching topics:", err);
      return res.status(500).json({ message: "Error fetching topics." });
    });
});
router.post("/topic/", validateToken, async (req: Request, res: Response) => {
  console.log("create topic request");
  console.log(req.body);
  console.log((req as any).user);
  const { name, content } = req.body;
  const username = (req as any).user.username;
  console.log(
    "Username read from req.user.username: " + (req as any).user.username
  );

  if (!name || !content || !username) {
    return res
      .status(400)
      .json({ message: "Topic name, content, and username are required." });
  }
  const newTopic: ITopic = new Topic({
    name,
    content,
    username,
  });
  try {
    await newTopic.save();
    return res.status(201).json(newTopic);
  } catch (error) {
    console.error("Error saving topic:", error);
    return res.status(500).json({ message: "Error saving topic." });
  }
});

router.delete(
  "/topic/:id",
  validateAdminToken,
  async (req: Request, res: Response) => {
    console.log("delete topic request");
    const topicId = req.params.id;
    try {
      const deletedTopic = await Topic.findByIdAndDelete(topicId);
      if (!deletedTopic) {
        return res.status(404).json({ message: "Topic not found." });
      }
      return res.status(200).json({ message: "Topic deleted successfully." });
    } catch (error) {
      console.error("Error deleting topic:", error);
      return res.status(500).json({ message: "Error deleting topic." });
    }
  }
);

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
