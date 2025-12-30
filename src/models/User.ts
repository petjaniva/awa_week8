import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  email: string;
  password: string;
  username: string;
  isAdmin: boolean;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: false },
  isAdmin: { type: Boolean, default: false },
});

const User = mongoose.model<IUser>("User", UserSchema);
export { type IUser, User };
