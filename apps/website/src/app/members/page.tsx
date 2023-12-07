'use client'

import React, {useEffect, useState} from 'react'


export default function Members() {
    const [id, getID] = useState('')
    const [name, getName] = useState('')
    const [email, getEmail] = useState('')
    const rows = [];
    const columns = [];
    const [password, getPassword] = useState('')
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [userData, setUserData] = useState([])


    useEffect (() =>{
        const fetchData = async () => {
            const response = await fetch('https://resident-management.fly.dev/usersList')
            const data = await response.json()
            if (data.status == "ok") {
                setUserData(data.users);
                console.log(data.users);
            } else {

            }
        }
        fetchData();
    }, [])

    const userRow = ({id, name, email}) => (
        <div >
            <tr key={id} className="border-b dark:border-neutral-500">
                <td className="whitespace-nowrap px-6 py-4 font-medium">{name}</td>
                <td className="whitespace-nowrap px-6 py-4 font-medium">{email}</td>
                <button className="bg-red-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={deleteUser}>
                    delete User
                </button>
            </tr>
        </div>
    )

    async function deleteUser(event: React.MouseEventHandler<HTMLButtonElement>) {
        setButtonDisabled(true)

        const response = await fetch('https://resident-management.fly.dev/deleteUser', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
            }),
        })

        if (localStorage.getItem('usertype') === 'Admin'){
            setButtonDisabled(false)
            const data = await response.json()
            if (data.status == "ok") {
                alert('User has been deleted.')
            }else{
                localStorage.removeItem('username')
                localStorage.removeItem('userId')
                alert('Deletion unsuccessful. Please contact a developer.')
            }
            console.log(data)
        }







    }


    return (
        <main className='bg-gray-900 text-gray-300 w-screen min-h-screen flex flex-col items-center gap-4 py-8'>
            <h2 className='text-3xl'>Members</h2>
            <div className="flex flex-col overflow-x-auto sm:-mx-6 lg:-mx-8 inline-block min-w-full py-2 sm:px-6 lg:px-8 overflow-hidden">
                <table className='min-w-full text-left text-sm font-light'>
                    <thead className="border-b font-medium dark:border-neutral-500">
                        <tr className="">
                            <th scope="col" className="px-6 py-4">Name</th>
                            <th scope="col" className="px-6 py-4">Email</th>
                        </tr>
                    </thead>
                    <tbody className="justify-center">
                    {userData.map(userRow)}
                    </tbody>
                </table>
            </div>

        </main>
    )
}
