'use client'

import React, { useState } from 'react' 


export default function Registration() {
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
		
		if (data.user == true) {
			localStorage.setItem('username', data.name);
			localStorage.setItem('userId', data?.id || 1);
			window.location.href = '/'
		}else{
			localStorage.removeItem('username')
			localStorage.removeItem('userId')
			alert('Login Unsuccessful. Please check your username or password and try again')
		}
		setButtonDisabled(false)
		console.log(data)

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
					<br />
					{buttonDisabled ?
						<input type="submit" value="Logging In..." className='mx-auto w-48 rounded p-2 bg-gray-800 border-gray-700 cursor-not-allowed'/>
						:
						<input type="submit" value="Login" className='mx-auto w-48 rounded p-2 bg-green-700 border-green-900 hover:scale-[102%] hover:bg-green-600/90'/>
					}
			</form>
		</main>
    )
}