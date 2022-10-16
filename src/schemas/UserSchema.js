import mongoose from "mongoose";

const Schema = mongoose.Schema;

let UserSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, unique: false },
    room: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
