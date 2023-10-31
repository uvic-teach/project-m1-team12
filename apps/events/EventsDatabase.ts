import { createClient } from '@supabase/supabase-js';
import { AddEventsInterface, EventsInterface } from './EventsInterface';

const supabaseUrl = 'https://igfaeuwzpmjmcbfwstzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZmFldXd6cG1qbWNiZndzdHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgyNzIzOTUsImV4cCI6MjAxMzg0ODM5NX0.mnmXiwnQSlT7XXcT6V4YhsaWmQsj23VwBgcFF9EBxtc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Adds an event to the database
export async function addEvent(eventData: AddEventsInterface) {
    try {
        const { data, error } = await supabase
            .from('Events')
            .insert([eventData]);

        if (error) {
            console.error('Error inserting event:', error);
        } else {
            console.log('Event inserted successfully:', data);
        }
    } catch (error: any) {
        console.error('Error:', error);
    }
}

export async function deleteEvent(event: EventsInterface): Promise<void> {
  try {
      const { data, error } = await supabase
          .from('Events')
          .delete()
          .eq('event_id', event.event_id);

      if (error) {
          console.error('Error deleting event:', error);
      } else {
          console.log('Event deleted successfully:', data);
      }
  } catch (error: any) {
      console.error('Error:', error);
  }
}

export async function getDayEvents(day: string): Promise<EventsInterface[]> {
  try {
      const { data, error } = await supabase
          .from('Events')
          .select()
          .gte('start_date_time', new Date(`${day}T00:00:00.000Z`).toISOString())
          .lt('start_date_time', new Date(`${day}T23:59:59.999Z`).toISOString());

      if (error) {
          console.error('Error fetching events for day:', error);
      } else {
          console.log('Events for', day, ':', data);
      }

      return data || [];
  } catch (error: any) {
      console.error('Error:', error);
      return [];
  }
}

// Gets all events in month from database
export async function getMonthEvents(month: string): Promise<EventsInterface[]> {
    try {
        const startDate = new Date(`${month}-01T00:00:00.000Z`);
        const endDate = new Date(`${month}-31T23:59:59.999Z`);
        
        console.log('Start Date:', startDate.toISOString());
        console.log('End Date:', endDate.toISOString());

        const { data, error } = await supabase
            .from('Events')
            .select()
            .gte('start_date_time', startDate.toISOString())
            .lt('start_date_time', endDate.toISOString());

        if (error) {
            throw new Error(`Error fetching events for month ${month}: ${error.message}`);
        }

        return data || [];
    } catch (error: any) {
        throw new Error(`Error: ${error.message}`);
    }
}


// Gets all events in week from database
export async function getWeekEvents(week: string): Promise<EventsInterface[]> {
    const startDate = new Date(week);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    try {
        const { data, error } = await supabase
            .from('Events')
            .select()
            .gte('start_date_time', startDate.toISOString())
            .lt('start_date_time', new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());

        if (error) {
            throw new Error(`Error fetching events for week ${week}: ${error.message}`);
        }

        return data || [];
    } catch (error: any) {
        throw new Error(`Error: ${error.message}`);
    }
}

// Modifies an event in the database
export async function modifyEvent(oldEvent: EventsInterface, updatedEvent: EventsInterface): Promise<void> {
    try {
        const { error } = await supabase
            .from('Events')
            .upsert([updatedEvent])
            .eq('event_id', oldEvent.event_id);

        if (error) {
            throw new Error(`Error modifying event: ${error.message}`);
        }
    } catch (error: any) {
        throw new Error(`Error: ${error.message}`);
    }
}

async function addSampleEvents() {
    const sampleEvent1: AddEventsInterface = {
        event_name: 'Sample Event 1',
        start_date_time: new Date('2023-11-01T10:00:00Z').toISOString(), 
        end_date_time: new Date('2023-11-01T12:00:00Z').toISOString(), 
        is_meal_event: false,
    };
  
    const sampleEvent2: AddEventsInterface = {
        event_name: 'Sample Event 2',
        start_date_time: '2023-11-01T14:00:00Z', 
        end_date_time: '2023-11-01T16:00:00Z', 
        is_meal_event: false,
    };

    const sampleEvent3: AddEventsInterface = {
        event_name: 'Sample Event 3',
        start_date_time: '2023-12-01T14:00:00Z', 
        end_date_time: '2023-12-01T16:00:00Z', 
        is_meal_event: false,
    };

    const sampleEvent4: AddEventsInterface = {
        event_name: 'Sample Event 4',
        start_date_time: '2023-12-01T14:00:00Z', 
        end_date_time: '2023-12-01T16:00:00Z', 
        is_meal_event: false,
    };

    const sampleEvent5: AddEventsInterface = {
        event_name: 'Sample Event 5',
        start_date_time: new Date('2024-01-01T10:00:00Z').toISOString(), 
        end_date_time: new Date('2024-01-01T12:00:00Z').toISOString(), 
        is_meal_event: false,
    };
  
    const sampleEvent6: AddEventsInterface = {
        event_name: 'Sample Event 6',
        start_date_time: '2024-01-02T14:00:00Z', 
        end_date_time: '2024-01-02T16:00:00Z', 
        is_meal_event: false,
    };

    const sampleEvent7: AddEventsInterface = {
        event_name: 'Sample Event 7',
        start_date_time: '2024-01-03T14:00:00Z', 
        end_date_time: '2024-01-03T16:00:00Z', 
        is_meal_event: false,
    };

    const sampleEvent8: AddEventsInterface = {
        event_name: 'Sample Event 8',
        start_date_time: '2024-01-04T14:00:00Z', 
        end_date_time: '2024-01-04T16:00:00Z', 
        is_meal_event: false,
    };
  
    await addEvent(sampleEvent1);
    await addEvent(sampleEvent2);
    await addEvent(sampleEvent3);
    await addEvent(sampleEvent4);
    await addEvent(sampleEvent5);
    await addEvent(sampleEvent6);
    await addEvent(sampleEvent7);
    await addEvent(sampleEvent8);
  
    console.log('Sample events added.');
  }

// Add async to the function to use await
addSampleEvents().then(async () => {
    // Replace with the actual day for which you want to retrieve events
    const dayToRetrieve: string = '2023-11-01'; // Replace with your desired date
    const monthToRetrieve: string = '2023-12'; // Replace with your desired date
    const weekToRetrieve: string = '2024-01'; // Replace with your desired date
    
    // Call the function to retrieve events for the specified day
    const dayEvents = await getDayEvents(dayToRetrieve); // Await the Promise here
    const weekEvents = await getWeekEvents(weekToRetrieve); // Await the Promise here
    const monthEvents = await getMonthEvents(monthToRetrieve); // Await the Promise here
    
    // Log the events to the console for verification
    console.log('DAY EVENTS: Events on', dayToRetrieve,':', dayEvents);
    console.log('WEEK EVENTS: Events on', weekToRetrieve, ':', weekEvents);
    console.log('MONTH EVENTS: Events on', monthToRetrieve, ':', monthEvents);

    // Modify the event
    if (dayEvents.length > 0) {
        const updatedEvent: EventsInterface = {
            event_id: dayEvents[0].event_id,
            event_name: 'MODIFIED!!!!!!!!!!!!!!!',
            start_date_time: dayEvents[0].start_date_time,
            end_date_time: dayEvents[0].end_date_time,
            is_meal_event: dayEvents[0].is_meal_event,
        };
        await modifyEvent(dayEvents[0], updatedEvent);
        console.log('Event modified successfully.');
    }
});
