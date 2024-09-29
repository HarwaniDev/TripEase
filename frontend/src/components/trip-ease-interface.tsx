"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Menu, MessageSquare, Settings, Sun, Moon, LogOut } from 'lucide-react'
import { addDays } from 'date-fns'
import { useRouter } from 'next/navigation'

type ChatHistory = {
  _id: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

type Message = {
  id: string
  content: string
  role: 'user' | 'bot'
  isStreaming?: boolean
}

export function TripEaseInterfaceComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [initialChatId, setInitialChatId] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const router = useRouter();

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  async function getInitialChatId() {
    const authorization = localStorage.getItem('token');
    const headers = {
      "Content-Type": "application/json",
      ...(authorization && { "authorization": authorization }),
    };
    try {
      // First, try to fetch the chat history
      const historyResponse = await fetch('http://localhost:3000/chat/gethistory', {
        headers: headers,
      });
      const historyData = await historyResponse.json();
      
      if (historyData.status === 200 && historyData.history.length > 0) {
        // If there's existing chat history, use the most recent chat
        const mostRecentChat = historyData.history[0];
        setInitialChatId(mostRecentChat._id);
        setSelectedChatId(mostRecentChat._id);
        setChatHistory(historyData.history);
      } else {
        // If no chat history, create a new chat
        const newChatResponse = await fetch("http://localhost:3000/chat/newchat", {
          method: "POST",
          headers: headers,
        });
        const newChatData = await newChatResponse.json();
        setInitialChatId(newChatData.id);
        setSelectedChatId(newChatData.id);
        setChatHistory([{
          _id: newChatData.id,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  }

  useEffect(() => {
    getInitialChatId();
  }, [])

  const createNewChat = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:3000/chat/newchat', {
        method: 'POST',
        headers: {
          'authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.status === 200) {
        console.log(data.id);
        
        const newChat: ChatHistory = {
          _id: data.id,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setChatHistory(prev => [...prev, newChat])
        setSelectedChatId(newChat._id)
        setMessages([])
        setFrom('')
        setTo('')
        setStartDate(undefined)
        setEndDate(undefined)
        setInputMessage('')
        setInitialChatId(newChat._id)  // Update the initialChatId
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  // const handleNewChat = () => {
  //   createNewChat
  // }
  const handleChatSelect = async (chatId: string) => {
    setSelectedChatId(chatId)
    const selectedChat = chatHistory.find(chat => chat._id === chatId)
    if (selectedChat) {
      // Omit the first two messages
      setMessages(selectedChat.messages.slice(2))
    } else {
      const token = localStorage.getItem('token')
      try {
        const response = await fetch(`http://localhost:3000/chat/getchat?id=${chatId}`, {
          headers: {
            'authorization': `${token}`
          }
        })
        const data = await response.json()
        if (data.status === 200) {
          // Omit the first two messages
          setMessages(data.chat.messages.slice(2))
          setChatHistory(prev => prev.map(chat => 
            chat._id === chatId ? { ...chat, messages: data.chat.messages } : chat
          ))
        }
      } catch (error) {
        console.error('Error fetching chat:', error)
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push("/");
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isDateDisabled = (date: Date) => {
    return date < today
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    if (date && endDate && date > endDate) {
      setEndDate(addDays(date, 1))
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    if (date && startDate && date < startDate) {
      setStartDate(addDays(date, -1))
    }
    setEndDate(date)
  }

  const generateBotResponse = async (userMessage: string) => {
    const authorization = localStorage.getItem('token');
    const headers = {
      "Content-Type": "application/json",
      ...(authorization && { "authorization": authorization }),
    };
    try {
      const response = await fetch(`http://localhost:3000/chat/send?id=${initialChatId}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          message: userMessage
        })
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error generating bot response:", error);
      return "Sorry, I couldn't process your request. Please try again.";
    }
  }

  const getChatTitle = (chat: ChatHistory) => {
    const firstUserMessage = chat.messages.find(msg => msg.role === 'user')
    return firstUserMessage ? firstUserMessage.content.slice(0, 30) + '...' : 'New Chat'
  }

  const simulateBotResponse = async (userMessage: string, chatId: string) => {
    setIsStreaming(true)
    var botResponse = await generateBotResponse(userMessage);
    // Convert lines starting with * into HTML list items
    botResponse = botResponse.replace(/^\*\s*(.*)$/gm, '<li>$1</li>');

    // Wrap list items with <ul> tags
    botResponse = `<ul>${botResponse}</ul>`;

    // Replace *text* with <strong>text</strong> for bold formatting
    botResponse = botResponse.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

    // Replace line breaks with <br> for HTML rendering
    botResponse = botResponse.replace(/\n/g, '<br>');

    const newMessage: Message = { id: Date.now().toString(), content: '', role: 'bot', isStreaming: true }
    setMessages(prev => [...prev, newMessage])

    if (botResponse && typeof botResponse === 'string') {
      for (let i = 0; i < botResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)) // Adjust the delay as needed
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id
              ? { ...msg, content: botResponse.slice(0, i + 1) }
              : msg
          )
        )
      }
    }

    setMessages(prev =>
      prev.map(msg =>
        msg.id === newMessage.id
          ? { ...msg, isStreaming: false }
          : msg
      )
    )

    setIsStreaming(false)
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return
    const userMessage: Message = { id: Date.now().toString(), content: inputMessage, role: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Update the chat history
    setChatHistory(prev => prev.map(chat => 
      chat._id === selectedChatId 
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ))
    await simulateBotResponse(inputMessage, selectedChatId!)
  }



  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
    {/* Sidebar */}
    <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <div className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
          <Menu className="h-6 w-6" />
        </Button>
        <Button variant="outline" size="lg" onClick={createNewChat}>
          New chat
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-2">
          {chatHistory.map((chat) => (
            <Button
              key={chat._id}
              variant="ghost"
              className={`w-full justify-start text-left text-wrap ${chat._id === selectedChatId ? 'bg-blue-500 text-white' : ''}`}
              onClick={() => handleChatSelect(chat._id)}
            >
              <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>{getChatTitle(chat)}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>

    {/* Main content */}
    <div className="flex-1 flex flex-col">
      {/* Top bar */}
      <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
        {!sidebarOpen && (
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <div className="flex items-center">
          <span className="font-bold text-2xl">TripEase</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              aria-label="Toggle dark mode"
            />
            <Moon className="h-4 w-4" />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40">
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-grow overflow-hidden relative">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="max-w-2xl mx-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="text-center">
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full p-4 inline-block mb-4`}>
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Plan your trip with TripEase</h2>
                  </div>
                <div className="flex space-x-4 w-full">
                  <Input placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} className={`flex-1 ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}`} />
                  <Input placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} className={`flex-1 ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}`} />
                </div>
                <div className="flex space-x-4 w-full">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`flex-1 ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100'}`}>
                        {startDate ? startDate.toDateString() : "Start Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                        disabled={isDateDisabled}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`flex-1 ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100'}`}>
                        {endDate ? endDate.toDateString() : "End Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateChange}
                        disabled={(date) => isDateDisabled(date) || (startDate ? date <= startDate : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : darkMode
                          ? 'bg-gray-700 text-gray-100'
                          : 'bg-gray-200 text-gray-900'
                        }`}
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    >
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
        <div className="max-w-3xl mx-auto relative">
          <Textarea
            placeholder="Message TripEase..."
            className={`w-full pr-10 ${darkMode ? 'bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-100' : 'bg-white border-gray-300 focus:border-gray-400 text-gray-900'}`}
            rows={1}
            onChange={(e) => {
              if (from.length > 0 && to.length > 0 && startDate && endDate) {
                var msg = `plan a trip from ${from} to ${to} between ${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()} and ${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}. Give details of flights and hotels.`
                setInputMessage(msg + " " + e.target.value)
              }
              else {
                setInputMessage(e.target.value)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            size="icon"
            variant="ghost"
            onClick={handleSendMessage}
            disabled={isStreaming}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="none"
              className="h-4 w-4 m-1 md:m-0"
              strokeWidth="2"
            >
              <path
                d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z"
                fill="currentColor"
              ></path>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  </div>
  )
}