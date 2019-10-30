import React from "react";
import { Booking } from "../../pages/bookings";
import BookingItem from "./bookingItem/bookingItem";
import "./bookingsList.scss";

export interface BookingsListProps {
  bookings: Booking[];
  handleCancelBooking(id: string): void;
}

export const BookingsList: React.StatelessComponent<
  BookingsListProps
> = props => {
  const { bookings, handleCancelBooking } = props;

  return (
    <ul className="bookings">
      {bookings.map(booking => {
        return (
          <BookingItem
            key={booking._id}
            booking={booking}
            handleCancelBooking={handleCancelBooking}
          />
        );
      })}
    </ul>
  );
};

export default BookingsList;
