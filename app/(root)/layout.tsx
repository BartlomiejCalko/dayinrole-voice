import { ReactNode } from 'react'
import { Navbar } from '@/components/shared/navbar'

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='root-layout'>
        {children}
      </main>
    </div>
  )
}

export default RootLayout