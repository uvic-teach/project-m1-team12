'use client'

import { ExampleFetch } from "../components/ExampleFetch";
import { useState } from "react";
import { Button, TextField, FormControl, FormControlLabel, Checkbox, InputLabel } from '@mui/material';
import Box from "@mui/material/Box";

function formatDate(input: string): string {
    const date = new Date(input);
    return date.toISOString().split('.')[0] + 'Z';
}

function EventForm() {
    const [eventName, setEventName] = useState('');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [isMealtime, setIsMealtime] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formattedStartDateTime = formatDate(startDateTime);
        const formattedEndDateTime = formatDate(endDateTime);

        console.log({
            event_name: eventName,
            start_date_time: formattedStartDateTime,
            end_date_time: formattedEndDateTime,
            is_meal_event: isMealtime
        });

        setEventName('');
        setStartDateTime('');
        setEndDateTime('');
        setIsMealtime(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box mb={2}>
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>Event Name</InputLabel>
                    <TextField value={eventName} onChange={(e) => setEventName(e.target.value)} />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>Start Date & Time</InputLabel>
                    <TextField
                        type="datetime-local"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        InputProps={{ inputProps: { placeholder: '' } }}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>End Date & Time</InputLabel>
                    <TextField
                        type="datetime-local"
                        value={endDateTime}
                        onChange={(e) => setEndDateTime(e.target.value)}
                        InputProps={{ inputProps: { placeholder: '' } }}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <FormControlLabel control={<Checkbox checked={isMealtime} onChange={(e) => setIsMealtime(e.target.checked)} />} label="Is Mealtime?" />
                </FormControl>
            </Box>
            <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }}>Submit</Button>
        </form>
    );
}

export default function Calendar() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="w-screen min-h-screen text-xl flex flex-col items-center justify-center gap-8">
            <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)}>
                Add Event
            </Button>

            {showForm && <EventForm />}

            <ExampleFetch url="https://events-microservice.fly.dev" />
        </div>
    );
}
