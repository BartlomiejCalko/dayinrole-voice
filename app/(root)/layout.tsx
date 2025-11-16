import { ReactNode } from 'react'
import { Navbar } from '@/components/shared/navbar'


const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='min-h-screen bg-transparent relative'>
      <Navbar />
      <main className='root-layout'>
        <div className="flex">
          {/* <DashboardSidebar /> */}
          <section className="flex min-h-screen flex-1 flex-col px-4 sm:px-6 lg:px-10 pb-2 pt-6 ">
            <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default RootLayout