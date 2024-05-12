import { Router } from "express";
import {
  setUserStatusAvailable,
  setUserStatusBusy,
} from "../controllers/UserController.js";
import auth from "../middlewares/AuthMiddleware.js";

const router = new Router();

router.post("/status/available", auth, setUserStatusAvailable);
router.post("/status/busy", auth, setUserStatusBusy);

export default router;
