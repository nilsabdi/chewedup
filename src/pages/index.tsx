import Image from 'next/image'
import { Inter } from 'next/font/google'
import Scoreboard from '@/components/Scoreboard'
import { ControlBar } from '@/components/ControlBar'
import RoundWins from '@/components/RoundWins'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className='bg-gray-100 pb-10 min-h-screen'>
      <div className='p-8'>
        <RoundWins />
      </div>
      <div className='px-8'>
        <Scoreboard />
      </div>
      <ControlBar />
    </main>
  )
}
