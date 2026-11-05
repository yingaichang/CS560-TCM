'use client'

import { createContext, useContext, type ReactNode } from 'react'

const LocalClerkBypassContext = createContext(false)

export function LocalClerkBypassProvider({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) {
  return (
    <LocalClerkBypassContext.Provider value={enabled}>
      {children}
    </LocalClerkBypassContext.Provider>
  )
}

export function useLocalClerkBypass() {
  return useContext(LocalClerkBypassContext)
}
