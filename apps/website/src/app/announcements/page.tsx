'use client'

import React, { useState } from 'react' 


export default function Announcement() {
    const [announcement, setAnnouncement] = useState('')

    async function sendAnnouncement(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const response = await fetch('https://messaging-microservice.fly.dev/announce', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ message: { data: announcement, clientId: 0} })
		})

		const status = await response.status

		if (status === 200) {
			window.location.href = '/'
			
		}else{
			alert('An error has occured. Please try again')
		}
	}

    return (
        <main className='bg-gray-900 text-gray-300 w-screen min-h-screen flex flex-col items-center gap-4 justify-center'>
			<h2 className='text-3xl'>Broadcast</h2>
			<form className="flex flex-col mx-auto max-w-md w-full" onSubmit={sendAnnouncement}>
                <label htmlFor="Name">Announcement</label>					
                <input
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    type="textarea"
                    placeholder="Type your announcement here"
                    className='rounded p-2 bg-gray-800 border-2 border-gray-700 mb-8'

                />
                <input type="submit" value="Send Announcement" className='mx-auto w-48 rounded p-2 bg-green-700 border-green-900 hover:scale-[102%] hover:bg-green-600/90'/>
			</form>
		</main>
    )
}