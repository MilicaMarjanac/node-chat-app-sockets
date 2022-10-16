import { Router } from "express";
import Room from "../../schemas/RoomSchema.js";
const router = Router();

router.post("/", async (req, res, next) => {
  let users = [];
  users.push(req.body.user);
  const roomData = {
    name: req.body.room,
    users: users,
  };

  Room.create(roomData)
    .then(async (results) => {
      results = await results.populate("users");
      res.status(200).send(results);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

router.get("/", async (req, res, next) => {
  let rooms = await Room.find()
    .populate("users")
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
  res.status(200).send(rooms);
});

router.put("/:id", async (req, res, next) => {
  Room.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(async (results) => {
      results = await results.populate("users");
      res.status(200).send(results);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

export default router;
