import mongoose from "mongoose";
let Schema = mongoose.Schema;

let MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  },

  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
