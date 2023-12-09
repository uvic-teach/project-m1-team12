'use client'

import React, { useState } from 'react'
import Link from "next/link";


export default function Registration() {
    const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [usertype, setUsertype] = useState('')
	const [buttonDisabled, setButtonDisabled] = useState(false)



    async function registerUser(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setButtonDisabled(true)

		const response = await fetch('https://resident-management.fly.dev/user/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name,
				email,
				password,
				usertype
			}),
		})

		const data = await response.json()

		if (data.status === 'ok') {
			alert('user created successfully')
			window.location.href = '/login'
			console.log(data)
			
		}else{
			alert('User creation unsuccessful. Name or Email already exists')
		}
		setButtonDisabled(false)
	}

    return (
        <main className='bg-gray-900 text-gray-300 w-screen min-h-screen flex flex-col items-center gap-4 justify-center'>
			<h2 className='text-3xl'>Register</h2>
			<form className="flex flex-col mx-auto max-w-md w-full" onSubmit={registerUser}>
					<label htmlFor="Name">Name</label>					
					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						type="text"
						placeholder="Name"
						className='rounded p-2 bg-gray-800 border-2 border-gray-700 mb-8'
						/>
					<label htmlFor="Email">Email</label>					
					<input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						placeholder="Email"
						className='rounded p-2 bg-gray-800 border-2 border-gray-700 mb-8'
						/>
					<label htmlFor="Password">Password</label>					
					<input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						placeholder="Password"
						className='rounded p-2 bg-gray-800 border-2 border-gray-700 mb-8'
						/>
					<label >Select User type</label>
					<select className="rounded p-2 bg-gray-800 border-2 border-gray-700 mb-8" value={usertype} onChange={(e) => setUsertype(e.target.value)}>
						<option value="Resident">Resident</option>
						<option value="Admin">Admin</option>
					</select>
					{buttonDisabled ?
						<input type="submit" value="..." className='mx-auto w-48 rounded p-2 bg-gray-800 border-gray-700 cursor-not-allowed'/>
						:
						<input type="submit" value="Register" className='mx-auto w-48 rounded p-2 bg-green-700 border-green-900 hover:scale-[102%] hover:bg-green-600/90'/>
					}
			</form>
			<Link href='/login' className='mx-auto w-48 rounded p-2 bg-green-700 border-green-900 hover:scale-[102%] hover:bg-green-600/90 text-center' >
				Already Registered?
			</Link>
		</main>
    )
}
