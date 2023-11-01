'use client'

import React, { useState } from 'react' 


export default function Registration() {
    const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')


    async function registerUser(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const response = await fetch('https://resident-management.fly.dev/user/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name,
				email,
				password,
			}),
		})

		const data = await response.json()

		if (data.status === 'ok') {
			console.log(data)
		}
	}

    return (
        <form className="flex flex-col gap-2 mx-auto max-w-md mt-10 " onSubmit={registerUser}>
           <input
					value={name}
					onChange={(e) => setName(e.target.value)}
					type="text"
					placeholder="Name"
				/>
				<br />
				<input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="email"
					placeholder="Email"
				/>
				<br />
				<input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					placeholder="Password"
				/>
				<br />
				<input type="submit" value="Register" />
        </form>
    )
}