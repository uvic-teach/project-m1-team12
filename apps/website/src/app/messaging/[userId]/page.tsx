export default function Message({ params }: { params: { userId: string } }) {
    const mockMessages  = [
        {
            id: 1,
            text: 'Hello!',
            sender: 'me',
        },
        {
            id: 2,
            text: 'Hi!',
            sender: 'them',
        },
        {
            id: 3,
            text: 'How are you?',
            sender: 'me',
        },
        {
            id: 4,
            text: 'I\'m good, how are you?',
            sender: 'them',
        },
        {
            id: 5,
            text: 'I am horrible, thanks!',
            sender: 'me',
        }
    ]

    return (
        <div className="w-screen h-screen p-6 gap-8 bg-orange-100 flex flex-col justify-between">
            <h1 className="text-center text-xl h-min">{params.userId}</h1>
            <div className="flex flex-col w-full h-full rounded-lg bg-white gap-2 p-2">
                {mockMessages.map(message => {
                    if (message.sender === 'me') {
                        return meMessage(message.text)
                    } else {
                        return themMessage(message.text)
                    }
                })}
            </div>
            <form className="w-100 h-16 flex flex-row gap-4">
                <input type="text" defaultValue="Send Chat..." className="w-full border-2 border-gray-400 rounded-md text-gray-600 px-4" />
                <button type="submit" className="bg-blue-500 rounded text-white py-2 px-4 font-bold">Send</button>
            </form>
        </div>
    )
}

const meMessage = (text: string) => {
    return (
        <div className="flex justify-end">
            <div className="bg-blue-200 rounded-md p-2">
                <p>{text}</p>
            </div>
        </div>
    )
}

const themMessage = (text: string) => {
    return (
        <div className="flex justify-start">
            <div className="bg-gray-200 rounded-md p-2">
                <p>{text}</p>
            </div>
        </div>
    )
}