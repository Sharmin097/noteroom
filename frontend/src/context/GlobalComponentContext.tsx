import React, { createContext, ReactNode, useContext, useState } from "react";

type TGlobalToastType = { show: boolean, data: { message: string } }
type TGlobalComponentControllerType = {
    scrollPosition: [number, React.Dispatch<React.SetStateAction<number>>],
    toast: [TGlobalToastType, React.Dispatch<React.SetStateAction<TGlobalToastType>>]
}
export const GlobalComponentControllerContext = createContext<TGlobalComponentControllerType | any>({})

export default function GlobalComponentControllerProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [feedScrollPosition, setFeedScrollPosition] = useState<number>(0)
    const [toast, setToast] = useState<TGlobalToastType>({ show: false, data: { message: "" } })

    return (
        <GlobalComponentControllerContext.Provider value={{ scrollPosition: [feedScrollPosition, setFeedScrollPosition], toast: [toast, setToast] }}>
            {children}
        </GlobalComponentControllerContext.Provider>
    )
}

export function useGlobalComponentController() {
    return useContext(GlobalComponentControllerContext)
}
