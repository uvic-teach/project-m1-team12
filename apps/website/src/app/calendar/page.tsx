import { ExampleFetch } from "../components/ExampleFetch";

export default function Calendar() {
    return (
        <div className="w-screen min-h-screen text-xl flex flex-col items-center justify-center gap-8">
            <ExampleFetch url="https://events-microservice.fly.dev" />
        </div>
    )
}