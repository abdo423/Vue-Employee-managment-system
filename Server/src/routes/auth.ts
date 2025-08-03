import express from "express";
import {handleRefreshToken, userLogin, userRegister} from "../controllers/user";

const router = express.Router();

router.post('/login', userLogin);
router.post('/register', userRegister);
router.post("/refresh-token",handleRefreshToken);
export default router;