import { createContext, useContext, useState } from 'react'

interface TestModalContextType {
  isOpen: boolean
  openTest: () => void
  closeTest: () => void
}

const TestModalContext = createContext<TestModalContextType>({
  isOpen: false,
  openTest: () => {},
  closeTest: () => {},
})

export function TestModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <TestModalContext.Provider value={{
      isOpen,
      openTest: () => setIsOpen(true),
      closeTest: () => setIsOpen(false),
    }}>
      {children}
    </TestModalContext.Provider>
  )
}

export function useTestModal() {
  return useContext(TestModalContext)
}
