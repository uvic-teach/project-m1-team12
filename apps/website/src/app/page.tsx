'use client'
import Box from '@mui/material/Box';
import Link from 'next/link';
// import Card from '@mui/material/Card';
// import Typography from '@mui/material/Typography';
// import Link from '@mui/material/Link';
import React, { useEffect, useState } from 'react'

interface HomeButtonProps {
  to: string;
  title: string;
}

export default function Home() {
  const [userName, setUserName] = useState(''); 
  
  useEffect (() =>{
    const name = localStorage.getItem('username')
      if (name) {
        setUserName(name);
      }else{
        window.location.href = '/login'
      }
  }, [])

  return (
    <main className="w-screen h-screen p-8 md:px-24 md:py-12 bg-gray-900 text-white">
      <div className="grid md:grid-cols-2 gap-4 md:gap-8 h-full w-full">
        <HomeButton to='/menu' title='Menu' />
        <HomeButton to='/emergency' title='Emergency' />
        <HomeButton to='/calendar' title='Calendar' />
        <HomeButton to='/messaging' title='Messaging' />
      </div>
    </main>
  )
}

const HomeButton = ({to, title}: HomeButtonProps) => {
  // I removed the material UI components because it was slowing the load time to > 800ms
  // Feel free to add back if you can figre out why it took so long to load
  return (
    <Link href={to} className='h-full'>
      <div className="rounded-lg w-full h-full p-8 flex grid items-center border-2 border-gray-700 bg-gray-800 hover:scale-[101%] hover:bg-gray-800/90">
        <p className="text-center text-3xl text-white">{title}</p>
      </div>
    </Link>
  )
}