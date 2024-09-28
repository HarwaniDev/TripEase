import express from 'express';
import jwt from 'jsonwebtoken';
import { loginTypes, signupTypes } from './types';
import {Chat, User} from './schema';
export const userRouter = express();

//add encryption to password

userRouter.post("/signup", async(req,res) => {
    
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    const parsedInput = signupTypes.safeParse({firstName, lastName, email, password});

    if(!parsedInput.success){   
        return res.status(404).json({
            status: 404,
            message: parsedInput.error.issues[0]
        });
    }
    
    const user = await User.findOne({email});
    if(user){
        return res.status(405).json({
            status: 405,
            message: "This email is already registered with us"
        });
    }

    const newUser = new User({firstName: parsedInput.data.firstName, lastName: parsedInput.data.lastName, email: parsedInput.data.email, password: parsedInput.data.password});
    await newUser.save();
    
    return res.status(200).json({
        status: 200,
        token: jwt.sign(parsedInput.data.email, process.env.JWT_SECRET as string)
    });    
});

userRouter.post("/login", async(req,res) => {
    const {email, password} = req.body;
    
    const parsedInput = loginTypes.safeParse({email, password});
    if(!parsedInput.success){
        return res.status(404).json({
            status: 404,
            message: parsedInput.error.issues[0]
        });
    }

    const findUser = await User.findOne({email:parsedInput.data.email, password: parsedInput.data.password});
    if(!findUser){
        return res.status(411).json({
            status: 411,
            message: "No user found with given credentials"
        })
    }
    return res.status(200).json({
        status: 200,
        token: jwt.sign(parsedInput.data.email, process.env.JWT_SECRET as string)
    });
});
