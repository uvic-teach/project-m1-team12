/**
 * Message structure based on Ably's documentation.
 */
interface Message {
    name?: string;  // The name of the message.
    data: string;  // The contents or payload of the message.
    id: string;  // A unique ID assigned by Ably to each message.
    clientId?: string;  // The ID of the client that published the message.
    connectionId?: string;  // The ID of the connection used to publish the message.
    timestamp: number;  // The timestamp when the message was received by Ably, in milliseconds since the Unix epoch.
    extras?: Record<string, unknown>;  // A JSON object of arbitrary key-value pairs, possibly containing metadata.
    encoding?: string;  // Encoding information, typically empty as messages are automatically decoded by Ably.
  }
  
  /**
   * Interface encapsulating core messaging operations.
   */
  interface MessagingMicroservice {
    publish(channel: string, message: Message): Promise<void>;  // Publishes a message to a specified channel.
    subscribe(channel: string, onMessage: (message: Message) => void): Promise<Subscription>;  // Subscribes to a specified channel to receive messages.
    unsubscribe(subscription: Subscription): Promise<void>;  // Unsubscribes from a specified channel.
    history(channel: string, limit?: number): Promise<Message[]>;  // Retrieves message history for a specified channel.
    presence(channel: string): Promise<PresenceData[]>;  // Retrieves presence data to track who is online in a channel.
  }
  
  /**
   * Interface encapsulating subscription details.
   */
  interface Subscription {
    channel: string;  // The name of the channel to which the subscription belongs.
    unsubscribe: () => Promise<void>;  // Method to unsubscribe from the channel.
  }
  
  /**
   * Interface encapsulating presence data of clients in a channel.
   */
  interface PresenceData {
    clientId: string;  // The ID of the client.
    status: 'online' | 'offline';  // The status of the client, either 'online' or 'offline'.
    timestamp: Date;  // The timestamp of the last status update.
  }
  