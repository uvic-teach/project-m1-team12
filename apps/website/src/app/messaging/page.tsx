'use client'

import Link from "next/link";
import { useEffect, useState } from "react";

const mockContacts = [
    {
        name: "Mock User 1",
        id: 1
    },
    {
        name: "Mock User 2",
        id: 2
    },
    {
        name: "Mock User 3",
        id: 3
    },
    {
        name: "Mock User 4",
        id: 4
    }
];

const Contacts = () => {
    const [contacts, setContacts] = useState(mockContacts);

    return (
        <div className="w-screen min-h-screen p-8 bg-gray-900 flex flex-col justify-start gap-8">
            <h2 className="text-3xl text-white mx-auto">Contacts</h2>
            <div className="mx-auto flex flex-col w-full h-100 rounded-lg gap-2 max-w-lg">
                {contacts.map(contact => (
                    <Link key={contact.id} href={`/messaging/${contact.id}`} className="rounded-md underline-none hover:scale-[101%] text-gray-300 text-center w-full bg-gray-800 border-2 border-gray-700">
                        <div className="flex justify-between items-center p-4 w-full">
                                <h1 className="text-lg font-semibold hover:underline text-center w-full">{contact.name}</h1>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Contacts;
