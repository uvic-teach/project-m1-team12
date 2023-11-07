// Old Test file for EventsDatabase.ts

import {AddEventsInterface, EventsInterface} from "./EventsInterface";
import {addEvent, getDayEvents, getMonthEvents, getWeekEvents, modifyEvent} from "./EventsDatabase";

async function addSampleEvents() :Promise<void> {
    const sampleEvent1: AddEventsInterface = {
        event_name: 'Sample Event 1',
        start_date_time: '2023-11-01T10:00:00Z',
        end_date_time: '2023-11-01T12:00:00Z',
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
addSampleEvents().then(async (): Promise<void> => {
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