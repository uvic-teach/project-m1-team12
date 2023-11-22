'use client'

import { useState } from "react";
import { Button, TextField, FormControl, FormControlLabel, Checkbox, InputLabel } from '@mui/material';
import Box from "@mui/material/Box";
import './calendarStyles.css'

const backendUrl = 'https://events-microservice.fly.dev'; // when running locally: 'http://localhost:8081'

function formatDate(input: string): string {
    const date = new Date(input);
    return date.toISOString().split('.')[0] + 'Z';
}

function EventForm() {
    const [eventName, setEventName] = useState('');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [isMealtime, setIsMealtime] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let missingFields = [];

        if (!eventName) missingFields.push("event name");
        if (!startDateTime) missingFields.push("start date & time");
        if (!endDateTime) missingFields.push("end date & time");

        if (missingFields.length) {
            setErrorMessage(`Please fill the following fields: ${missingFields.join(", ")}.`);
            return;
        }

        const formattedStartDateTime = formatDate(startDateTime);
        const formattedEndDateTime = formatDate(endDateTime);

        // Check if start date is before the current date
        if (new Date(formattedStartDateTime) < new Date()) {
            setErrorMessage('Start date & time must be after the current date & time');
            return;
        }

        // Check if start date is after the end date
        if (new Date(formattedStartDateTime) > new Date(formattedEndDateTime)) {
            setErrorMessage('Start date & time must be before end date & time');
            return;
        }

        const eventData = {
            event_name: eventName,
            start_date_time: formattedStartDateTime,
            end_date_time: formattedEndDateTime,
            is_meal_event: isMealtime,
        };

        try {
            console.log(eventData);
            const response = await fetch(`${backendUrl}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                throw new Error(`${response.statusText}`);
            }

            setEventName('');
            setStartDateTime('');
            setEndDateTime('');
            setIsMealtime(false);
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage(`Error adding event: ${error}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <Box mb={2}>
                <FormControl fullWidth margin="normal" className="mui-form-control">
                    <InputLabel shrink>Event Name</InputLabel>
                    <TextField value={eventName} onChange={(e) => setEventName(e.target.value)} />
                </FormControl>
                <FormControl fullWidth margin="normal" className="mui-form-control">
                    <InputLabel shrink>Start Date & Time</InputLabel>
                    <TextField
                        type="datetime-local"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        InputProps={{ inputProps: { placeholder: '' } }}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal" className="mui-form-control">
                    <InputLabel shrink>End Date & Time</InputLabel>
                    <TextField
                        type="datetime-local"
                        value={endDateTime}
                        onChange={(e) => setEndDateTime(e.target.value)}
                        InputProps={{ inputProps: { placeholder: '' } }}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal" className="mui-form-control">
                    <FormControlLabel className="mui-checkbox-label" control={<Checkbox checked={isMealtime} onChange={(e) => setIsMealtime(e.target.checked)} />} label="Is Mealtime?" />
                </FormControl>
            </Box>
            {errorMessage && <div style={{ color: 'red', marginBottom: '16px' }}>{errorMessage}</div>}
            <Button type="submit" variant="contained" color="primary" className="mui-btn-primary">Submit</Button>
        </form>
    );
}

export default function Calendar() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="w-screen min-h-screen text-xl flex flex-col items-center justify-center gap-8">
            {!showForm && <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#3f51b5', color: '#fff' }}>Add Event</Button>}

            {showForm && <EventForm />}
        </div>
    );
}
