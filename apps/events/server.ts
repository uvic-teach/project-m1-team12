import { createClient } from '@supabase/supabase-js';
import { AddEvent, Event } from './EventsInterface';
import * as dotenv from 'dotenv';

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8081;
const cors = require('cors');

app.use(cors());

app.use(
    cors({
      origin: ["http://localhost:3000", process.env.ORIGIN],
    })
  );

app.get('/', (req: any, res: any) => {
    res.send('Hello, World!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(express.json());
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'API_URL';
const supabaseKey = process.env.SUPABASE_PASSWORD || 'API_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Adds an event to the database
export async function addEvent(eventData: AddEvent): Promise<void> {
    console.log("Adding event!!!")
    const { data, error } = await supabase
        .from('Events')
        .insert([eventData]);
    
    if (error) {
        console.log('Error inserting event: ', error.message);
    }
    console.log('Event inserted successfully:', data);
}

export async function deleteEvent(event: Event): Promise<void> {
    const { data, error } = await supabase
        .from('Events')
        .delete()
        .eq('event_id', event.event_id);

    if (error) throw new Error(`Error deleting event: ${error.message}`);
    console.log('Event deleted successfully:', data);
}

export async function getDayEvents(day: string): Promise<Event[]> {
    const { data, error } = await supabase
        .from('Events')
        .select()
        .gte('start_date_time', new Date(`${day}T00:00:00.000Z`).toISOString())
        .lt('start_date_time', new Date(`${day}T23:59:59.999Z`).toISOString());

    if (error) throw new Error(`Error fetching events for day ${day}: ${error.message}`);
    return data || [];
}

// Gets all events in month from database
export async function getMonthEvents(month: string): Promise<Event[]> {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(`${month}-31T23:59:59.999Z`);

    const { data, error } = await supabase
        .from('Events')
        .select()
        .gte('start_date_time', startDate.toISOString())
        .lt('start_date_time', endDate.toISOString());

    if (error) throw new Error(`Error fetching events for month ${month}: ${error.message}`);
    return data || [];
}

// Gets all events in week from database
export async function getWeekEvents(week: string): Promise<Event[]> {
    const startDate = new Date(week);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const { data, error } = await supabase
        .from('Events')
        .select()
        .gte('start_date_time', startDate.toISOString())
        .lt('start_date_time', new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());

    if (error) throw new Error(`Error fetching events for week ${week}: ${error.message}`);
    return data || [];
}

// Modifies an event in the database
export async function modifyEvent(oldEvent: Event, updatedEvent: Event): Promise<void> {
    const { error } = await supabase
        .from('Events')
        .upsert([updatedEvent])
        .eq('event_id', oldEvent.event_id);

    if (error) throw new Error(`Error modifying event: ${error.message}`);
}

// Routes
app.post('/events', async (req: any, res: any) => {
    console.log(`Received data, ${req.body}`);
    const eventData = req.body; // Assuming the client sends event data in the request body
    try {
        await addEvent(eventData);
        res.json({ message: 'Event added successfully' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

