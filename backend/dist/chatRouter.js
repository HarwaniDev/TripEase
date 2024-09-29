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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = __importDefault(require("express"));
const schema_1 = require("./schema");
const prompt_1 = require("./prompt");
const middleware_1 = require("./middleware");
exports.chatRouter = (0, express_1.default)();
exports.chatRouter.post("/newchat", middleware_1.Middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.headers['email'];
    const user = yield schema_1.User.findOne({ email: email });
    if (!user) {
        return res.status(404).send({
            message: "user not authenticated"
        });
    }
    const newChat = new schema_1.Chat({ sender: user === null || user === void 0 ? void 0 : user._id });
    yield newChat.save();
    user === null || user === void 0 ? void 0 : user.chats.push(newChat._id);
    yield (user === null || user === void 0 ? void 0 : user.save());
    return res.status(200).json({
        id: newChat._id
    });
}));
exports.chatRouter.post("/send", middleware_1.Middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d, _e;
    const { message } = req.body;
    const chatId = req.query.id;
    const email = req.headers["email"];
    const user = yield schema_1.User.findOne({ email: email });
    if (!user) {
        return res.status(404).send({
            message: "user not authenticated"
        });
    }
    const chat = yield schema_1.Chat.findById({ _id: chatId });
    chat === null || chat === void 0 ? void 0 : chat.messages.push({
        "role": "user",
        "content": message
    });
    const chatCompletion = yield prompt_1.groq.chat.completions.create({
        "messages": chat === null || chat === void 0 ? void 0 : chat.messages,
        "model": "llama3-70b-8192",
        "temperature": 1,
        "max_tokens": 1024,
        "top_p": 1,
        "stream": true,
        "stop": null
    });
    var ans = [];
    try {
        for (var _f = true, chatCompletion_1 = __asyncValues(chatCompletion), chatCompletion_1_1; chatCompletion_1_1 = yield chatCompletion_1.next(), _a = chatCompletion_1_1.done, !_a; _f = true) {
            _c = chatCompletion_1_1.value;
            _f = false;
            const chunk = _c;
            ans.push(((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || '');
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_f && !_a && (_b = chatCompletion_1.return)) yield _b.call(chatCompletion_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var readableAns = ans.join("");
    chat === null || chat === void 0 ? void 0 : chat.messages.push({
        "role": "assistant",
        content: readableAns
    });
    yield (chat === null || chat === void 0 ? void 0 : chat.save());
    return res.status(200).json({
        message: "done",
        response: readableAns
    });
}));
exports.chatRouter.get("/gethistory", middleware_1.Middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.headers['email'];
    const user = yield schema_1.User.findOne({ email: email });
    const chats = yield schema_1.Chat.find({ sender: user === null || user === void 0 ? void 0 : user._id });
    if (!user) {
        return res.status(404).send({
            message: "user not authenticated"
        });
    }
    return res.status(200).json({
        status: 200,
        history: chats
    });
}));
// import express from 'express';
// import { User, Chat } from './schema';
// import { groq } from './prompt';
// import { Middleware } from './middleware';
// export const chatRouter = express();
// chatRouter.post("/newchat", Middleware, async (req, res) => {
//   const email = req.headers['email'];
//   const user = await User.findOne({ email: email });
//   const newChat = new Chat({ sender: user?._id });
//   await newChat.save();
//   user?.chats.push(newChat._id);
//   await user?.save();
//   return res.status(200).json({
//     id: newChat._id
//   })
// });
// chatRouter.post("/send", Middleware, async (req, res) => {
//   const { message } = req.body;
//   const chatId = req.query.id;
//   const chat = await Chat.findById({ _id: chatId });
//   chat?.messages.push({
//     "role": "user",
//     "content": message as string
//   });
//   const chatCompletion = await groq.chat.completions.create({
//     "messages": chat?.messages,
//     "model": "llama3-70b-8192",
//     "temperature": 1,
//     "max_tokens": 1024,
//     "top_p": 1,
//     "stream": true,
//     "stop": null
//   });
//   var ans = [];
//   for await (const chunk of chatCompletion) {
//     ans.push(chunk.choices[0]?.delta?.content || '');
//   }
//   var readableAns = ans.join("");
//   // Add this section to extract the ticket ID for train or flight bookings
//   let ticketID = '';
//   console.log(readableAns);
//   // Check if it's a train booking confirmation
//   if (readableAns.includes("Train Booking Confirmation:")) {
//     const trainReferenceRegex = /Booking Reference:\[\s\S]?(\d+[A-Z]*)/;
//     const trainMatch = readableAns.match(trainReferenceRegex);
//     if (trainMatch) {
//       ticketID = trainMatch[1];
//       console.log(`Train Ticket ID: ${ticketID}`);
//     }
//   }
//   // Check if it's a flight booking confirmation
//   if (readableAns.includes("Flight Booking Confirmation:")) {
//     const flightReferenceRegex = /Booking Reference:\[\s\S]?(\w+)/;
//     const flightMatch = readableAns.match(flightReferenceRegex);
//     if (flightMatch) {
//       ticketID = flightMatch[1];
//       console.log(`Flight Ticket ID: ${ticketID}`);
//     }
//   }
//   // Save assistant's response to the chat
//   chat?.messages.push({
//     "role": "assistant",
//     "content": readableAns
//   });
//   await chat?.save();
//   return res.status(200).json({
//     message: "done",
//     response: readableAns,
//     ticketID: ticketID  // Return the extracted ticketID if found
//   });
// });
// chatRouter.get("/gethistory", Middleware, async (req, res) => {
//   const email = req.headers['email'];
//   const user = await User.findOne({ email: email });
//   const chats = await Chat.find({sender: user?._id});
//   return res.status(200).json({
//     status: 200,
//     history: chats
//   });
// });
