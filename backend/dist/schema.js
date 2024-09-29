"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define the User schema
const userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    chats: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Chat'
        }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically add `createdAt` and `updatedAt` fields
});
// Define the Chat schema
const chatSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: false
    },
    messages: {
        type: [{
                role: String,
                content: String,
                _id: false
            }],
        required: true,
        default: [{
                "role": "system",
                "content": "\"Groq, you are a professional and experienced travel agent. Your goal is to assist users in planning their ideal trips based on their preferences. You will gather information such as the destination, travel dates, budget, types of activities they enjoy (e.g., sightseeing, adventure, relaxation), and accommodation preferences. Once you have enough details, you will create personalized itineraries, recommend the best travel options, and provide helpful travel-related advice, all while maintaining a friendly and helpful tone. When asked for specific travel suggestions or plans, use the information available to provide accurate recommendations based on their needs.Dont provide a specific hotel. Just provide a list of hotels and flights according to budget. Give faq and support to common travel related questions.Ask users at end if they dont like itinerary create a new one for them\""
            },
            {
                "role": "assistant",
                "content": `Hello! I'm Groq, your personal travel agent. I'm thrilled to help you plan your next adventure!

To get started, could you please share some details about your dream trip? Here are a few questions to help me get a better understanding of your preferences:

1. Destination(s) in mind? Are you open to suggestions or do you have a specific country or region in mind?
2. Travel dates? Are you planning a short getaway or a longer trip?
3. Budget? Are you looking to splurge or stay within a certain range?
4. What type of activities do you enjoy? Are you a fan of:
	* Sightseeing and exploring culture?
	* Adventure activities like hiking, biking, or water sports?
	* Relaxation and unwinding at the beach or in nature?
	* Food and wine exploration?
5. Accommodation preferences? Are you looking for:
	* Luxury hotels and resorts?
	* Budget-friendly options like hostels or Airbnb?
	* Unique experiences like glamping or eco-lodges?

The more information you can provide, the more tailored recommendations I can give you!`
            }] // Initialize with the boilerplate message
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically add `createdAt` and `updatedAt` fields
});
// Create a model using the schema
exports.User = mongoose_1.default.model('User', userSchema);
exports.Chat = mongoose_1.default.model('Chat', chatSchema);
