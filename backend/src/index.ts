import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import cors from 'cors';
import { userRouter } from './userRouter';
import { chatRouter } from './chatRouter';
dotenv.config()
const app = express();  
app.use(cors());  
app.use(express.json());
app.use("/user", userRouter);
app.use("/chat", chatRouter);


app.listen(3000, async () => {
    await mongoose.connect(process.env.MONGO_URL as string)
    console.log('listening');
})