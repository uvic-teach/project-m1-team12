import Link from "@mui/material/Link";
import loadCustomRoutes from "next/dist/lib/load-custom-routes";

const mockContacts = [
    {
        name: "John Doe",
        lastMessage: "Hello World",
        lastMessageTime: "12:00",
        unreadCount: 1
    },
    {
        name: "Jane Doe",
        lastMessage: "Hello World",
        lastMessageTime: "12:00",
        unreadCount: 0
    },
    {
        name: "Toby Murray",
        lastMessage: "Wanna hold hands?",
        lastMessageTime: "1:00",
        unreadCount: 1
    },
    {
        name: "John Doe",
        lastMessage: "Hello World",
        lastMessageTime: "12:00",
        unreadCount: 0
    },
    {
        name: "John Doe",
        lastMessage: "Hello World",
        lastMessageTime: "12:00",
        unreadCount: 0
    },
]

type ContactProps = {
    name: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export default function Messaging() {
    
    return (
        <div className="w-screen min-h-screen p-8 bg-orange-100 flex flex-col justify-start gap-8">
            <input type="text" defaultValue="Search..." className="border-2 border-gray-400 rounded-md text-gray-600 px-4" />
            <div className="flex flex-col w-full h-100 rounded-lg bg-white gap-2 divide-y-2">
                {mockContacts.map(contact => {
                    return <Contact key={contact.name} {...contact} />
                })}
            </div>
        </div>
    )
}

const Contact = ({ name, lastMessage, lastMessageTime, unreadCount }: ContactProps) => {
    return (
        <Link href={`/messaging/${name}`} underline="none" className="text-black">
            <div className="flex justify-between items-center px-1 m-1">
                <div className="flex flex-col gap-1">
                    <h1 className="text-lg font-semibold">{name}</h1>
                    <p className={unreadCount > 0 ? "font-bold text-gray-600" : "text-gray-400"}>{lastMessage}</p>
                </div>
                <div className="">
                    <p>{lastMessageTime}</p>
                </div>
            </div>
        </Link>
    )
}