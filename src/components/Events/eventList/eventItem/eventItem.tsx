import React from "react";
import { Event } from "../../../../pages/events";
import "./eventItem.scss";

export interface EventItemProps {
  event: Event;
  authUserId: string;
  onDetailClick(id: string): void;
}

const EventItem: React.StatelessComponent<EventItemProps> = props => {
  const { event, authUserId, onDetailClick } = props;
  const { creator } = event;

  if (!creator) {
    return <div>Something went wrong!</div>;
  }

  return (
    <li key={event._id} className="event__list-item">
      <div>
        <h1>{event.title}</h1>
        <h2>
          ${event.price} - {new Date(event.date).toLocaleDateString()}
        </h2>
      </div>
      <div>
        {authUserId === creator._id ? (
          <p>{event.description}</p>
        ) : (
          <button className="btn" onClick={() => onDetailClick(event._id)}>
            View Details
          </button>
        )}
      </div>
    </li>
  );
};

export default EventItem;
