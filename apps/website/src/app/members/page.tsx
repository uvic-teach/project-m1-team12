'use client'

import React, {ButtonHTMLAttributes, useEffect, useState} from 'react'
import Link from "next/link";


export default function Members() {
    const [id, getID] = useState('')
    const [name, setName] = useState('')
    const [email, getEmail] = useState('')
    const rows = [];
    const columns = [];
    const [password, getPassword] = useState('')
    const [buttonDisabled, setButtonDisabled] = useState(true)
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


    async function checkAdmin(){
        if (localStorage.getItem('usertype') === 'Admin') {
            setButtonDisabled(false);
            console.log("Admin Priveledges found");
            return true;
        }
        else{
            console.log("Not an Admin");
            return false
        }
    }


    async function deleteUser(name: string) {
        setButtonDisabled(true)

        const response = await fetch('https://resident-management.fly.dev/deleteUser', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
            }),
        })

        if (await checkAdmin() || 1){
            setButtonDisabled(true)
            const data = await response.json()
            if (data.status == "ok") {
                alert('User has been deleted.')
            }else{
                alert('Deletion unsuccessful. Please contact a developer.')
            }
            console.log(data)
            setButtonDisabled(false)
        }
        window.location.reload();

    }

    interface UserRowProps {
        id: string;
        name: string;
        email: string;
    }

    const userRow: React.FC<UserRowProps> = ({id, name, email}) => (
            <tr key={id} className="border-b dark:border-neutral-600">
                <td className="whitespace-nowrap px-6 py-4 font-medium">{name}</td>
                <td className="whitespace-nowrap px-6 py-4 font-medium">{email}</td>
                <td className="justify-end">
                    <button className="bg-red-900 hover:bg-red-950 text-white font-bold py-2 px-4 rounded"
                            onClick={() => deleteUser(name)}>
                        delete {name}
                    </button>
                </td>
            </tr>
    )

    return (
        <main className='bg-gray-900 text-gray-300 w-screen min-h-screen flex flex-col items-center gap-4 py-8'>
            <div>
                <h2 className='text-3xl'>Members</h2>
            </div>
            <div>
                <Link href='/' className="bg-indigo-800 p-2 mx-1 rounded-3xl">Home</Link>
                <Link href='/registration' className="bg-indigo-800 p-2 mx-1 rounded-3xl">Add User</Link>
            </div>
            <div
                className="flex flex-col overflow-x-auto sm:-mx-6 lg:-mx-8 inline-block min-w-full py-2 sm:px-6 lg:px-8 overflow-hidden">
                <table className=' min-w-full text-left text-sm font-light'>
                    <thead className="border-b font-medium dark:border-neutral-300">
                    <tr className="">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Delete User</th>
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
