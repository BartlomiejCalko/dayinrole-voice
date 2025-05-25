import { ReactNode } from 'react'
import { Navbar } from '@/components/shared/navbar'

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='min-h-screen bg-transparent'>
      <Navbar />
      <main className='root-layout bg-transparent'>
        {children}
      </main>
    </div>
  )
}

export default RootLayout