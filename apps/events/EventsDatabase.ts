import { createClient } from '@supabase/supabase-js';
import { AddEventsInterface, EventsInterface } from './EventsInterface';

const supabaseUrl = 'https://igfaeuwzpmjmcbfwstzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZmFldXd6cG1qbWNiZndzdHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgyNzIzOTUsImV4cCI6MjAxMzg0ODM5NX0.mnmXiwnQSlT7XXcT6V4YhsaWmQsj23VwBgcFF9EBxtc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Adds an event to the database
// Currently only this one works :/
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
          .gte('start_date_time', new Date(`${day}T00:00:00.000Z`))
          .lt('start_date_time', new Date(`${day}T23:59:59.999Z`));

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

async function addSampleEvents() {
  const sampleEvent1: AddEventsInterface = {
      event_name: 'Sample Event 1',
      start_date_time: '2023-11-01T10:00:00Z', // Updated to ISO 8601 format
      end_date_time: '2023-11-01T12:00:00Z', // Updated to ISO 8601 format
      is_meal_event: false,
  };

  const sampleEvent2: AddEventsInterface = {
      event_name: 'Sample Event 2',
      start_date_time: '2023-11-01T14:00:00Z', // Updated to ISO 8601 format
      end_date_time: '2023-11-01T16:00:00Z', // Updated to ISO 8601 format
      is_meal_event: false,
  };

  await addEvent(sampleEvent1);
  await addEvent(sampleEvent2);

  console.log('Sample events added.');
}

// Call the function to add sample events
addSampleEvents();
// Replace with the actual day for which you want to retrieve events
const dayToRetrieve: string = '2023-11-01'; // Replace with your desired date

// Call the function to retrieve events for the specified day
const dayEvents = getDayEvents(dayToRetrieve);

// Log the events to the console for verification
dayEvents.then((events) => {
  console.log('Events on', dayToRetrieve, ':', events);
}).catch((error) => {
  console.error('Error:', error);
});



// Deletes an event from the database
// export async function deleteEvent(event: EventsInterface): Promise<void> {
//     try {
//         const { error } = await supabase
//             .from('Events')
//             .delete()
//             .eq('event_id', event.event_id);

//         if (error) {
//             throw new Error(`Error deleting event: ${error.message}`);
//         }
//     } catch (error: any) {
//         throw new Error(`Error: ${error.message}`);
//     }
// }

// // Gets all events in month from database
// export async function getMonthEvents(month: string): Promise<EventsInterface[]> {
//     try {
//         const { data, error } = await supabase
//             .from('Events')
//             .select()
//             .gte('start_date_time', new Date(month))
//             .lt('start_date_time', new Date(`${month}-31T23:59:59.999Z`));

//         if (error) {
//             throw new Error(`Error fetching events for month ${month}: ${error}`);
//         }

//         return data || [];
//     } catch (error: any) {
//         throw new Error(`Error: ${error}`);
//     }
// }

// // Gets all events in week from database
// export async function getWeekEvents(week: string): Promise<EventsInterface[]> {
//     const startDate = new Date(week);
//     startDate.setDate(startDate.getDate() - startDate.getDay());
//     const endDate = new Date(startDate);
//     endDate.setDate(endDate.getDate() + 6);

//     try {
//         const { data, error } = await supabase
//             .from('Events')
//             .select()
//             .gte('start_date_time', startDate)
//             .lt('start_date_time', new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1));

//         if (error) {
//             throw new Error(`Error fetching events for week ${week}: ${error.message}`);
//         }

//         return data || [];
//     } catch (error: any) {
//         throw new Error(`Error: ${error.message}`);
//     }
// }

// // Gets all events in day from database
// export async function getDayEvents(day: string): Promise<EventsInterface[]> {
//     try {
//         const { data, error } = await supabase
//             .from('Events')
//             .select()
//             .gte('start_date_time', new Date(day))
//             .lt('start_date_time', new Date(`${day}T23:59:59.999Z`));

//         if (error) {
//             throw new Error(`Error fetching events for day ${day}: ${error.message}`);
//         }

//         return data || [];
//     } catch (error: any) {
//         throw new Error(`Error: ${error.message}`);
//     }
// }

// // Modifies an event in the database
// export async function modifyEvent(oldEvent: EventsInterface, updatedEvent: EventsInterface): Promise<void> {
//     try {
//         const { error } = await supabase
//             .from('Events')
//             .upsert([updatedEvent])
//             .eq('event_id', oldEvent.event_id);

//         if (error) {
//             throw new Error(`Error modifying event: ${error.message}`);
//         }
//     } catch (error: any) {
//         throw new Error(`Error: ${error.message}`);
//     }
// }