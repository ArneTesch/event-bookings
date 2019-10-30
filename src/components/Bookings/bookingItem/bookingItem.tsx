import React from "react";
import { Booking } from "../../../pages/bookings";

export interface BookingItemProps {
  booking: Booking;
  handleCancelBooking(id: string): void;
}

const BookingItem: React.StatelessComponent<BookingItemProps> = props => {
  const { booking, handleCancelBooking } = props;
  return (
    <li className="bookings__item" key={booking._id}>
      <div className="bookings__item-data">
        <h1>
          {booking.event.title} -{" "}
          {new Date(booking.createdAt).toLocaleDateString()}
        </h1>
      </div>
      <div>
        <button
          onClick={() => {
            handleCancelBooking(booking._id);
          }}
          className="btn bookings__item-cancel"
        >
          Cancel
        </button>
      </div>
    </li>
  );
};

export default BookingItem;
