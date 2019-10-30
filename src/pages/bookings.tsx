import React, { Component } from "react";
import BookingsControl from "../components/Bookings/bookingControl/bookingsControl";
import BookingsChart from "../components/Bookings/bookingsChart/bookingsChart";
import BookingList from "../components/Bookings/bookingsList";
import Spinner from "../components/Spinner/spinner";
import AuthContext from "../context/auth-context";
import { Event, User } from "./events";

export interface Booking {
  _id: string;
  event: Event;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface BookingState {
  isLoading: boolean;
  outputType: "list" | "chart";
  bookings: Booking[];
}

class BookingsPage extends Component {
  public state: BookingState = {
    isLoading: false,
    outputType: "list",
    bookings: []
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
        query {
          bookings {
            _id
            event {
              _id
              title
              date
              price
            }
            createdAt
          }
        }
      `
    };

    const token = this.context.token;

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed to fetch bookings");
        }
        this.setState({ isLoading: false });
        return res.json();
      })
      .then(resData => {
        console.log({ resData });
        const bookings = resData.data.bookings;
        this.setState({ bookings: bookings, isLoading: false });
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleDeleteBooking = (bookingId: string) => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
        mutation CancelBooking($id: ID!) {
          cancelBooking(bookingId: $id) {
            _id
            title
        }
      }
      `,
      variables: {
        id: bookingId
      }
    };

    const token = this.context.token;

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed to delete booking");
        }
        this.setState({ isLoading: false });
        return res.json();
      })
      .then(resData => {
        console.log({ resData });
        this.setState((prevState: BookingState) => {
          const updatedBookings = prevState.bookings.filter(
            (booking: Booking) => {
              return booking._id !== bookingId;
            }
          );

          return { bookings: updatedBookings, isLoading: false };
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  changeOutputTypeHandler = (outputType: string) => {
    if (outputType === "list") {
      this.setState({
        outputType: "list"
      });
    } else {
      this.setState({
        outputType: "chart"
      });
    }
  };

  render() {
    const { isLoading, bookings, outputType } = this.state;
    let content = <Spinner />;
    if (!isLoading) {
      content = (
        <React.Fragment>
          <BookingsControl
            changeOutputTypeHandler={this.changeOutputTypeHandler}
            activeOutputType={outputType}
          />
          <div>
            {outputType === "list" ? (
              <BookingList
                bookings={bookings}
                handleCancelBooking={this.handleDeleteBooking}
              />
            ) : (
              <BookingsChart bookings={bookings} />
            )}
          </div>
        </React.Fragment>
      );
    }
    return <React.Fragment>{content}</React.Fragment>;
  }
}

export default BookingsPage;
