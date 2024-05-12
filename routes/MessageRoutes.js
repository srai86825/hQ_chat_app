import { Router } from "express";
import {
  addMessage,
  getInitialUsersWithMessages,
  getMessages,
} from "../controllers/MessageController.js";
import auth from "../middlewares/AuthMiddleware.js";

const router = new Router();

router.get("/get-initial-users/:userId", auth, getInitialUsersWithMessages);
router.post("/add-message", auth, addMessage);
router.get("/get-messages/:from/:to", auth, getMessages);

export default router;
