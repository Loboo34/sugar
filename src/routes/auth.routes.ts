import { Router } from "express";
import { register, login, getUserProfile, updateUserProfile } from "../controllers/auth.controller";
import { validate, schemas } from "../middleware/validation.middleware";

const router = Router();

router.post("/register", validate(schemas.register), register);
router.post("/login", validate(schemas.login), login);

router.get("/profile", getUserProfile);
router.put("/profile", validate(schemas.updateProfile), updateUserProfile);

export default router;