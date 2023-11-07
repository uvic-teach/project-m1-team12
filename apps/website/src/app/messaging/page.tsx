'use client'

import Link from "@mui/material/Link";
import { useState } from "react";

const mockContacts = [
    {
        name: "John Doe",
        id: 1
    },
    {
        name: "Jane Doe",
        id: 2
    },
    {
        name: "Toby Murray",
        id: 3
    }
];

const Contacts = () => {
    const [contacts, setContacts] = useState(mockContacts);

    return (
        <div className="w-screen min-h-screen p-8 bg-gradient-to-r from-slate-800 via-gray-800 to-indigo-950 flex flex-col justify-start gap-8">
            <div className="mx-auto flex flex-col w-full h-100 rounded-lg bg-gray-100 border gap-2 divide-y-2 max-w-lg">
                {contacts.map(contact => (
                    <Link key={contact.id} href={`/messaging/${contact.id}`} underline="none" className="text-black">
                        <div className="flex justify-between items-center px-1 m-1">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-lg font-semibold hover:underline">{contact.name}</h1>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Contacts;
