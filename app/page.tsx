import { Hero } from '@/components/sections/Hero'
import { Navbar } from '@/components/shared/navbar'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
    </div>
  )
}

export default HomePage 