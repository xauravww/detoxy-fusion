import { createContext, useState } from "react";

export const sidebarContext = createContext()

export default function SidebarContextFunction({ children }) {
    const [isOpen, setIsOpen] = useState(true)
    const [selectedChat ,setSelectedChat ] = useState()
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