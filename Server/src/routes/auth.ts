import express from "express";
import {userLogin, userRegister} from "../controllers/user";

const router = express.Router();

router.post('/login',
    express.json(), // Body parser middleware
    userLogin
);
router.post('/register',
    express.json(),
    userRegister
);

export default router;