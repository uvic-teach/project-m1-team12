interface Message {
    name?: string;
    data: string;
    id: string;
    clientId?: string;
    connectionId?: string;
    timestamp: number;
    extras?: Record<string, unknown>;
    encoding?: string;
}

interface Subscription {
    subscriptionId: string;
    channel: string;
}

interface PresenceData {
    clientId: string;
    status: 'online' | 'offline';
    timestamp: Date;
}

interface MessagingMicroservice {
    publish(channel: string, message: Message): Promise<void>;
    subscribe(channel: string, onMessage: (message: Message) => void): Promise<Subscription>;
    unsubscribe(subscriptionID: string): Promise<void>;
    history(channel: string, limit?: number): Promise<Message[]>;
    presence(channel: string): Promise<PresenceData[]>;
}

export { Message, Subscription, PresenceData, MessagingMicroservice };