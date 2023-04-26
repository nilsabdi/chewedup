import Image from 'next/image'
import { Inter } from 'next/font/google'
import Scoreboard from '@/components/Scoreboard'
import { ControlBar } from '@/components/ControlBar'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className='bg-gray-100 pb-10 min-h-screen'>
      <Scoreboard />
      <ControlBar />
    </main>
  )
}
