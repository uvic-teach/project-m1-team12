import { createClient } from '@supabase/supabase-js';
import { AddEventsInterface, EventsInterface } from './EventsInterface';

const supabaseUrl = 'https://igfaeuwzpmjmcbfwstzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZmFldXd6cG1qbWNiZndzdHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgyNzIzOTUsImV4cCI6MjAxMzg0ODM5NX0.mnmXiwnQSlT7XXcT6V4YhsaWmQsj23VwBgcFF9EBxtc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Adds an event to the database
export async function addEvent(eventData: AddEventsInterface): Promise<void> {
    const { data, error } = await supabase
        .from('Events')
        .insert([eventData]);

    if (error) throw new Error(`Error inserting event: ${error.message}`);
    console.log('Event inserted successfully:', data);
}

export async function deleteEvent(event: EventsInterface): Promise<void> {
    const { data, error } = await supabase
        .from('Events')
        .delete()
        .eq('event_id', event.event_id);

    if (error) throw new Error(`Error deleting event: ${error.message}`);
    console.log('Event deleted successfully:', data);
}

export async function getDayEvents(day: string): Promise<EventsInterface[]> {
    const { data, error } = await supabase
        .from('Events')
        .select()
        .gte('start_date_time', new Date(`${day}T00:00:00.000Z`).toISOString())
        .lt('start_date_time', new Date(`${day}T23:59:59.999Z`).toISOString());

    if (error) throw new Error(`Error fetching events for day ${day}: ${error.message}`);
    return data || [];
}

// Gets all events in month from database
export async function getMonthEvents(month: string): Promise<EventsInterface[]> {
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
export async function getWeekEvents(week: string): Promise<EventsInterface[]> {
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
export async function modifyEvent(oldEvent: EventsInterface, updatedEvent: EventsInterface): Promise<void> {
    const { error } = await supabase
        .from('Events')
        .upsert([updatedEvent])
        .eq('event_id', oldEvent.event_id);

    if (error) throw new Error(`Error modifying event: ${error.message}`);
}
