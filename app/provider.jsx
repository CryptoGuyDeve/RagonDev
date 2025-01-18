'use client'

import AppSidebar from "@/components/custom/AppSideBar"
import Header from "@/components/custom/Header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MessagesContext } from "@/context/MessagesContext"
import { UserDetailContext } from "@/context/UserDetailContext"
import { api } from "@/convex/_generated/api"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { useConvex } from "convex/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect, useState } from "react"

function Provider({children}) {
    // Correctly initialize the messages state
    const [messages, setMessages] = useState();
    const [userDetail, setUserDetail] = useState();
    const convex = useConvex();

    useEffect(() => {
        isAuthenticated();
    },[])

    const isAuthenticated = async () => {
        if(typeof window !== 'undefined') {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                // Fetch user details from the database
                const result = await convex.query(api.users.GetUser, {
                    email: user?.email
                });
                setUserDetail(result);
                console.log(result);
            }
        }
    }

    return (
        <div>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID_KEY}>
                <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
                    <MessagesContext.Provider value={{messages, setMessages}}>
                        <NextThemesProvider
                            attribute="class"
                            defaultTheme="dark"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <Header />
                            <SidebarProvider className="gap-5" defaultOpen={true} >
                                <AppSidebar/>
                            {children}
                            </SidebarProvider>
                        </NextThemesProvider>
                    </MessagesContext.Provider>
                </UserDetailContext.Provider>
            </GoogleOAuthProvider>
        </div>
    )
}

export default Provider
