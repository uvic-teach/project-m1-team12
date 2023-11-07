export type Event = {
  event_id: number;
  event_name: string;
  start_date_time: string;
  end_date_time: string;
  is_meal_event: boolean;
}

export type AddEvent = {
  event_name: string;
  start_date_time: string;
  end_date_time: string;
  is_meal_event: boolean;
}
