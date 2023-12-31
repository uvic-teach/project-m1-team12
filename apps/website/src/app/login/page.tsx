'use client'

import Link from 'next/link'
import React, { useState } from 'react' 


export default function Login() {
    const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [buttonDisabled, setButtonDisabled] = useState(false)


    async function login(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setButtonDisabled(true)

		const response = await fetch('https://resident-management.fly.dev/user/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password,
			}),
		})

		const data = await response.json()
		
		if (data.status == "ok") {
			localStorage.setItem('username', data.name);
			localStorage.setItem('userId', data?.user?._id || 1);
			localStorage.setItem('usertype', data?.usertype || 1); //remove or 1 later
			window.location.href = '/'
		}else{
			localStorage.removeItem('username')
			localStorage.removeItem('userId')
			localStorage.removeItem('usertype')
			alert('Login Unsuccessful. Please check your username or password and try again')
		}
		setButtonDisabled(false)

	}

    return (
		<main className='bg-gray-900 text-gray-300 w-screen min-h-screen flex flex-col items-center gap-4 justify-center'>
			<h2 className='text-3xl'>Log In</h2>
			<form className="flex flex-col mx-auto max-w-md w-full" onSubmit={login}>
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
					className='rounded p-2 bg-gray-800 border-2 border-gray-700'
				/>
				<br/>
				{buttonDisabled ?
					<input type="submit" value="Logging In..."
						   className='mx-auto w-48 rounded p-2 bg-gray-800 border-gray-700 cursor-not-allowed'/>
					:
					<input type="submit" value="Login"
						   className='mx-auto w-48 rounded p-2 bg-green-700 border-green-900 hover:scale-[102%] hover:bg-green-600/90'/>
				}
			</form>
			<Link href='/registration' className='mx-auto w-48 rounded p-2 bg-green-700 border-green-900 hover:scale-[102%] hover:bg-green-600/90 text-center' >
			Not Registered?
			</Link>
		</main>
    )
}
