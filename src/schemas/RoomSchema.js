import mongoose from "mongoose";

const Schema = mongoose.Schema;

let RoomSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);
