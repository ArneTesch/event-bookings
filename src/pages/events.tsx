import { autobind } from "core-decorators";
import React from "react";
import Backdrop from "../components/Backdrop/Backdrop";
import Modal from "../components/Modal/Modal";
import AuthContext from "../context/auth-context";
import "./events.scss";

export interface EventsPageProps {}

export interface EventsPageState {
  creating: boolean;
  events: Event[];
}

export interface User {
  _id: string;
  email: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  price: number;
  date: string;
  creator: User;
}

@autobind
class EventsPage extends React.Component<EventsPageProps, EventsPageState> {
  private titleRef: React.RefObject<HTMLInputElement>;
  private priceRef: React.RefObject<HTMLInputElement>;
  private dateRef: React.RefObject<HTMLInputElement>;
  private descriptionRef: React.RefObject<HTMLTextAreaElement>;

  constructor(props: EventsPageProps) {
    super(props);
    this.titleRef = React.createRef();
    this.descriptionRef = React.createRef();
    this.priceRef = React.createRef();
    this.dateRef = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();
  }

  // Makes this.context available through the component
  static contextType = AuthContext;

  public state: EventsPageState = {
    creating: false,
    events: [
      {
        _id: "",
        title: "",
        description: "",
        price: 0,
        date: "",
        creator: {
          _id: "",
          email: ""
        }
      }
    ]
  };
  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = () => {
    this.setState({ creating: true });

    const title = this.titleRef.current && this.titleRef.current.value;
    const price = this.priceRef.current && +this.priceRef.current.value;
    const date = this.dateRef.current && this.dateRef.current.value;
    const description =
      this.descriptionRef.current && this.descriptionRef.current.value;

    if (
      (title && title.trim().length === 0) ||
      (description && description.trim().length === 0) ||
      (date && date.trim().length === 0) ||
      (price && price <= 0)
    ) {
      console.log("Form not ok!");
    }

    const requestBody = {
      query: `
        mutation {
          createEvent(eventInput: { title: "${title}", price: ${price}, date: "${date}", description: "${description}"}) {
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
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
          throw new Error("Failed to add event");
        }
        return res.json();
      })
      .then(resData => {
        console.log({ resData });
        this.fetchEvents();
      })
      .catch(err => {
        console.error(err, "Failed to add event");
      });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false });
  };

  fetchEvents() {
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
          }
        }
      `
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed to get events");
        }
        return res.json();
      })
      .then(resData => {
        console.log({ resData });
        const events = resData.data.events;
        this.setState({ events: events });
      })
      .catch(err => {
        console.error(err, "Failed to get events");
      });
  }

  render() {
    const { creating, events } = this.state;

    const eventList =
      events &&
      events.map(event => {
        return (
          <li key={event._id} className="events__list-item">
            {event.title}
          </li>
        );
      });

    console.log({ eventList });
    return (
      <React.Fragment>
        {creating && <Backdrop />}
        {creating && (
          <Modal
            title="Add event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
          >
            <form className="events-form">
              <div className="form-control">
                <label htmlFor="title">Title:</label>
                <input type="text" id="title" ref={this.titleRef} />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price:</label>
                <input type="number" id="price" min="0" ref={this.priceRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date:</label>
                <input type="datetime-local" id="date" ref={this.dateRef} />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description:</label>
                <textarea rows={4} id="description" ref={this.descriptionRef} />
              </div>
            </form>
          </Modal>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>Share your own events!</p>
            <button className="btn" onClick={this.startCreateEventHandler}>
              Create event
            </button>
          </div>
        )}
        <section className="events">
          <ul className="events__list">{eventList}</ul>
        </section>
      </React.Fragment>
    );
  }
}

export default EventsPage;
