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
        <div className="w-screen min-h-screen p-8 bg-orange-100 flex flex-col justify-start gap-8">
            <div className="flex flex-col w-full h-100 rounded-lg bg-white gap-2 divide-y-2">
                {contacts.map(contact => (
                    <Link key={contact.id} href={`/messaging/${contact.id}`} underline="none" className="text-black">
                        <div className="flex justify-between items-center px-1 m-1">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-lg font-semibold">{contact.name}</h1>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Contacts;
