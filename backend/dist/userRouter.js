"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("./types");
const schema_1 = require("./schema");
exports.userRouter = (0, express_1.default)();
//add encryption to password
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const parsedInput = types_1.signupTypes.safeParse({ firstName, lastName, email, password });
    if (!parsedInput.success) {
        return res.status(404).json({
            status: 404,
            message: parsedInput.error.issues[0]
        });
    }
    const user = yield schema_1.User.findOne({ email });
    if (user) {
        return res.status(405).json({
            status: 405,
            message: "This email is already registered with us"
        });
    }
    const newUser = new schema_1.User({ firstName: parsedInput.data.firstName, lastName: parsedInput.data.lastName, email: parsedInput.data.email, password: parsedInput.data.password });
    yield newUser.save();
    return res.status(200).json({
        status: 200,
        token: jsonwebtoken_1.default.sign(parsedInput.data.email, process.env.JWT_SECRET)
    });
}));
exports.userRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const parsedInput = types_1.loginTypes.safeParse({ email, password });
    if (!parsedInput.success) {
        return res.status(404).json({
            status: 404,
            message: parsedInput.error.issues[0]
        });
    }
    const findUser = yield schema_1.User.findOne({ email: parsedInput.data.email, password: parsedInput.data.password });
    if (!findUser) {
        return res.status(411).json({
            status: 411,
            message: "No user found with given credentials"
        });
    }
    return res.status(200).json({
        status: 200,
        token: jsonwebtoken_1.default.sign(parsedInput.data.email, process.env.JWT_SECRET)
    });
}));
