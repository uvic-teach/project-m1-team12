'use client'

import React, { useState } from 'react' 


export default function Registration() {
    const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [usertype, setUsertype] = useState('')



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
				usertype
			}),
		})

		const data = await response.json()
		console.log('here')

		if (data.status === 'ok') {
			alert('user created successfully')
			console.log(data)
			
		}else{
			alert('User creation unsuccessful. Name or Email already exists')
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
				<label >Select User type</label>
				<select value={usertype} onChange={(e) => setUsertype(e.target.value)}>
					<option value="Resident">Resident</option>
					<option value="Admin">Admin</option>
				</select>
				
				<br />
				<input type="submit" value="Register" />
        </form>
    )
}