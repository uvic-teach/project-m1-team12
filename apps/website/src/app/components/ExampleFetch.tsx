'use client'

import Link from "next/link"
import { useState } from "react"

export const ExampleFetch = ({url}: {url :string}) => {
    const [data, setData] = useState<string>("")

    const handleClick = () => {
        fetch(url)
            .then(response => response.json())
            .then(data => setData(data))
    }
    
    return (
        <div className="mx-auto text-center">
            <Link href={url} className="text-blue-500 underline hover:text-blue-600">Microservice is hosted at {url}</Link>
        </div>

    ) 
	
}