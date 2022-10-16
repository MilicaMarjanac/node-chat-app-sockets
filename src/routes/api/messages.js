import { Router } from "express";
import Message from "../../schemas/MessageSchema.js";
const router = Router();

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  const newMessage = {
    sender: req.body.sender,
    content: req.body.content,
    room: req.body.room,
  };
  Message.create(newMessage)
    .then(async (message) => {
      message = await message.populate("sender");
      message = await message.populate("room");
      res.status(201).send(message);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

router.get("/room/:id", async (req, res, next) => {
  Message.find({
    room: req.params.id,
  })
    .populate("sender")
    .populate("room")
    .then((message) => {
      res.status(200).send(message);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

router.get("/:id", async (req, res, next) => {
  Message.findById({
    _id: req.params.id,
  })
    .populate("sender")
    .populate("room")
    .then((message) => {
      res.status(200).send(message);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

export default router;
