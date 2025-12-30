import mongoose from "mongoose";

interface ITopic extends mongoose.Document {
  name: string;
  content: string;
  username: string;
  createdAt: Date;
}
const topicSchema = new mongoose.Schema<ITopic>({
  name: { type: String, required: true },
  content: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Topic = mongoose.model<ITopic>("Topic", topicSchema);

export { type ITopic, Topic };
