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

const backendUrl = 'https://messaging-microservice.fly.dev'; 
// const backendUrl = 'http://localhost:8080'; 


export default function Home() {
  const [userName, setUserName] = useState(''); 
  const [announcements, setAnnouncements] = useState([]);
  
  useEffect (() =>{
    const name = localStorage.getItem('username')
      if (name) {
        setUserName(name);
      }else{
        window.location.href = '/login'
      }

      async function fetchHistory() {
        try {
            const response = await fetch(`${backendUrl}/announcements`);
            const data = await response.json();
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching history:', error);
            throw error;
        }
      }

      fetchHistory();
  }, [])

  return (
    <main className="w-screen h-screen p-8 md:px-24 md:py-12 bg-gray-900 text-white flex flex-col">
      { announcements.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-xl">Announcements</h2>
          <ul className="list-disc list-inside">
            {announcements.map((announcement: any) => (
              <li key={announcement.message}>{announcement.data}</li>
            ))}
          </ul>
        </div>
      ) : <h2 className='text-xl'>No new announcements</h2>}
      <button className='absolute top-1 right-1 h-10 w-20 rounded p-2 bg-green-700 border-green-900 hover:scale-[102%] hover:bg-green-600/90'  onClick={removeToken}>
        LogOut
      </button>
      <div className="grid md:grid-cols-2 gap-4 md:gap-8 h-full w-full">
        <HomeButton to='/menu' title='menu'/>
        <HomeButton to='/members' title='Members'/>
        <HomeButton to='/calendar' title='Calendar'/>
        <HomeButton to='/messaging' title='Messaging'/>
      </div>
    </main>
  )
}

const removeToken = () => {
  localStorage.clear();
  window.location.reload();
};

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
