import { Router } from "express";

import { checkUser, getAllUsers, loginUser, onBoardUser } from "../controllers/AuthController.js";
import auth from "../middlewares/AuthMiddleware.js";

const router = new Router();

router.post("/check-user", checkUser);
router.post("/onboard", onBoardUser);
router.post("/login-user", loginUser);
router.get("/get-all-users", auth,getAllUsers);

export default router;
