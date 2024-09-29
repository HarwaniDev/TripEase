import express from 'express';
import { User, Chat } from './schema';
import { groq } from './prompt';
import { Middleware } from './middleware';

export const chatRouter = express();

chatRouter.post("/newchat", Middleware, async (req, res) => {
  const email = req.headers['email'];
  const user = await User.findOne({ email: email });
  if(!user){
    return res.status(404).send({
      message: "user not authenticated"
    })
  }
  const newChat = new Chat({ sender: user?._id });
  await newChat.save();

  user?.chats.push(newChat._id);
  await user?.save();

  return res.status(200).json({
    id: newChat._id
  })
});

chatRouter.post("/send", Middleware, async (req, res) => {
  const { message } = req.body;
  const chatId = req.query.id;
  const email = req.headers["email"];
  const user = await User.findOne({email: email});
  if(!user){
    return res.status(404).send({
      message: "user not authenticated"
    })
  }
  const chat = await Chat.findById({ _id: chatId });

  chat?.messages.push({
    "role": "user",
    "content": message as string
  });

  const chatCompletion = await groq.chat.completions.create({
    "messages": chat?.messages,
    "model": "llama3-70b-8192",
    "temperature": 1,
    "max_tokens": 1024,
    "top_p": 1,
    "stream": true,
    "stop": null
  });

  var ans = [];
  for await (const chunk of chatCompletion) {
    ans.push(chunk.choices[0]?.delta?.content || '');
  }
  var readableAns = ans.join("");
  chat?.messages.push({
    "role": "assistant",
    content: readableAns
  });

  await chat?.save();

  return res.status(200).json({
    message: "done",
    response: readableAns
  })
})

chatRouter.get("/gethistory", Middleware, async (req, res) => {
  const email = req.headers['email'];
  const user = await User.findOne({ email: email });
  const chats = await Chat.find({sender: user?._id})
  if(!user){
    return res.status(404).send({
      message: "user not authenticated"
    })
  }
  return res.status(200).json({
    status: 200,
    history: chats
  })
})

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