'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

const features = [
  "Plan your dream vacation",
  "Discover hidden gems",
  "Connect with fellow travelers",
  "Customize your itinerary"
]

export function AuthPageComponent() {
  const { toast } = useToast();
  const router = useRouter();

  //login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //signup states
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signipEmail, setSignupEmail] = useState("");

  const [featureIndex, setFeatureIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  
  async function Login(){
    await fetch("http://localhost:3000/user/login", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((res) => {
      res.json().then((data) => {
        localStorage.setItem('token', data.token);
        if(data.status !== 200){
          // console.log(data.message);
          if(data.message.message){
            toast({
              title: "error",
              description: data.message.message,
              variant: 'destructive'
            })
          }
          else{
            toast({
              title: "error",
              description: data.message,
              variant: 'destructive'
            })
          }
        }
        else{
          
          router.push("/plan");
        }
      })
    })
  }

  async function Signup(){
    await fetch("http://localhost:3000/user/signup", {
      method: "POST",
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: signipEmail,
        password: signupPassword
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((res) => {
      res.json().then((data) => {
        localStorage.setItem('token', data.token);
        if(data.status !== 200){
          if(data.message.message){
            toast({
              title: "error",
              description: data.message.message,
              variant: 'destructive'
            })
          }
          else {
            toast({
              title: "error",
              description: data.message,
              variant: 'destructive'
            })
          }
        }
        else{
          router.push("/plan");
        }
      })
    })
  }

  // typewriter effect
  useEffect(() => {
    const feature = features[featureIndex]
    let i = 0
    const typingInterval = setInterval(() => {
      if (i < feature.length) {
        setDisplayText(feature.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setFeatureIndex((prevIndex) => (prevIndex + 1) % features.length)
        }, 2000) // Wait 2 seconds before starting the next feature
      }
    }, 100) // Adjust typing speed here

    return () => clearInterval(typingInterval)
  }, [featureIndex])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Left partition */}
      <div className="md:w-1/2 bg-gray-800 text-white p-8 flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold mb-6">TripEase</h1>
        <div className="h-16 text-xl text-center">
          {displayText}
        </div>
      </div>

      {/* Right partition */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <div className="space-y-4 bg-white p-6 rounded-lg shadow">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="Enter your email" onChange={(e) => {
                    setEmail(e.target.value);
                  }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="Enter your password" onChange={(e) => {
                    setPassword(e.target.value);
                  }}/>
                </div>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" onClick={Login}>Log In</Button>
              </div>
            </TabsContent>
            <TabsContent value="signup">
              <div className="space-y-4 bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">First Name</Label>
                    <Input id="firstname" placeholder="Enter first name" onChange={(e) => {
                      setFirstname(e.target.value);
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input id="lastname" placeholder="Enter last name" onChange={(e) => {
                      setLastname(e.target.value);
                    }}/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="Enter your email" onChange={(e) => {
                    setSignupEmail(e.target.value);
                  }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="Create a password" onChange={(e) => {
                    setSignupPassword(e.target.value);
                  }}/>
                </div>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" onClick={Signup}>Sign Up</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}