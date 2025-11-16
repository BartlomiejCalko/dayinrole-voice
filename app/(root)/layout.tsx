import { ReactNode } from 'react'
import { auth } from '@clerk/nextjs/server'
import { Navbar } from '@/components/shared/navbar'
import DashboardSidebar from '@/components/shared/dashboard-sidebar'


const RootLayout = async ({ children }: { children: ReactNode }) => {
  const { userId } = await auth()
  
  return (
    <div className='min-h-screen bg-transparent relative'>
      <Navbar />
      <main className='root-layout'>
        <div className="flex">
          {userId && <DashboardSidebar />}
          <section className="flex min-h-screen flex-1 flex-col px-4 sm:px-6 lg:px-10 pb-2 pt-6 ">
            <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default RootLayout