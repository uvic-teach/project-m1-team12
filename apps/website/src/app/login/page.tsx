'use client'

import React, { useState } from 'react' 


export default function Registration() {
    const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')


    async function login(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()

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
			console.log(data)

	}

    return (
        <form className="flex flex-col gap-2 mx-auto max-w-md mt-10 " onSubmit={login}>
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
				<input type="submit" value="Login" />
        </form>
    )
}