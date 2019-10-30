import React from "react";
import { Event } from "../../../pages/events";
import EventItem from "./eventItem/eventItem";
import "./eventList.scss";

export interface EventListProps {
  events: Event[];
  authUserId: string;
  onViewDetail(eventId: string): void;
}

const EventList: React.StatelessComponent<EventListProps> = props => {
  const events = props.events.map(event => {
    return (
      <EventItem
        onDetailClick={props.onViewDetail}
        authUserId={props.authUserId}
        key={event._id}
        event={event}
      />
    );
  });

  return <ul className="event__list">{events}</ul>;
};

export default EventList;
