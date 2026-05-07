interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export default function PageLayout({ children, className = '', noPadding = false }: PageLayoutProps) {
  return (
    <main
      className={`flex-1 w-full max-w-2xl md:max-w-4xl mx-auto ${noPadding ? 'md:pt-20' : 'px-4 md:px-8 md:pt-20'} pb-24 md:pb-16 ${className}`}
    >
      {children}
    </main>
  )
}
