import React from "react";
import { Booking } from "../../../pages/bookings";
import "./bookingsChart.scss";
// const BarChart = require("react-chartjs");
type BookingsBucket = { [key: string]: { min: number; max: number } };

const BOOKINGS_BUCKETS: BookingsBucket = {
  Cheap: {
    min: 0,
    max: 100
  },
  Normal: {
    min: 100,
    max: 200
  },
  Expensive: {
    min: 200,
    max: 10000
  }
};

export interface BookingsChartProps {
  bookings: Booking[];
}

const BookingsChart: React.StatelessComponent<BookingsChartProps> = props => {
  const { bookings } = props;

  const output: BookingsBucket = {};

  for (const bucket in BOOKINGS_BUCKETS) {
    const filteredBookingsCount = bookings.reduce(
      (prev: number, current: Booking) => {
        if (
          current.event.price > BOOKINGS_BUCKETS[bucket].min &&
          current.event.price < BOOKINGS_BUCKETS[bucket].max
        ) {
          return prev + 1;
        } else {
          return prev;
        }
      },
      0
    );
    (output[bucket] as any) = filteredBookingsCount;
  }
  return <div></div>;
};

export default BookingsChart;
