import { createContext, useState } from "react";

export const sidebarContext = createContext()

export default function SidebarContextFunction({ children }) {
    const [isOpen, setIsOpen] = useState(true)
    const [selectedChat ,setSelectedChat ] = useState({
    id: 4,
    name: "My AI Assistant",
    status: "Active now",
    bgColor: "bg-gradient-to-r from-indigo-500 to-purple-500",
    isAI: true,
  })
  const [isLastScreenClosed , setIsLastScreenClosed ] = useState(false)
    const data = {
        isOpen, setIsOpen,selectedChat ,setSelectedChat ,isLastScreenClosed , setIsLastScreenClosed 
    }
    return(
        <sidebarContext.Provider value={data} >
        {children}
    </sidebarContext.Provider>
    )
    
}