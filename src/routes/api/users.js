import { Router } from "express";
import User from "../../schemas/UserSchema.js";
const router = Router();

router.post("/", async (req, res, next) => {
  let user = await User.findOne({
    username: req.body.username,
    room: req.body.room,
  }).catch(() => {
    res.status(200).send("Something went wrong.");
  });
  if (user == null) {
    await User.create(req.body).then(async (result) => {
      user = result;
    });
  }
  res.status(200).send(user);
});

export default router;
