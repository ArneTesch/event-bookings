import { autobind } from "core-decorators";
import React from "react";
import Backdrop from "../components/Backdrop/backdrop";
import EventList from "../components/Events/eventList/eventList";
import Modal from "../components/Modal/modal";
import Spinner from "../components/Spinner/spinner";
import AuthContext from "../context/auth-context";
import "./events.scss";

export interface EventsPageProps {}

export interface EventsPageState {
  creating: boolean;
  isLoading: boolean;
  selectedEvent: Event | null | undefined;
  events: Event[];
}

export interface User {
  _id: string;
  email?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  price: number;
  date: string;
  creator?: User;
}

@autobind
class EventsPage extends React.Component<EventsPageProps, EventsPageState> {
  private titleRef: React.RefObject<HTMLInputElement>;
  private priceRef: React.RefObject<HTMLInputElement>;
  private dateRef: React.RefObject<HTMLInputElement>;
  private descriptionRef: React.RefObject<HTMLTextAreaElement>;

  // Makes this.context available through the component
  static contextType = AuthContext;

  isActive: boolean = true;

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

  componentWillUnmount() {
    this.isActive = false;
  }

  public state: EventsPageState = {
    creating: false,
    isLoading: false,
    selectedEvent: null,
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
        mutation CreateEvent ($title: String!, $price: Float!, $date: String!, $description: String!){
          createEvent(eventInput: { title: $title, price: $price, date: $date, description: $description}) {
            _id
            title
            description
            price
            date
          }
        }
      `,
      // left side refers to the args in the mutation CreateEvent (...)
      variables: {
        title: title,
        price: price,
        date: date,
        description: description
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
          throw new Error("Failed to add event");
        }
        this.setState({ creating: false });
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedEvents = [...prevState.events];
          console.log({ resData });
          updatedEvents.push({
            _id: resData.data.createEvent._id,
            title: resData.data.createEvent.title,
            description: resData.data.createEvent.description,
            price: resData.data.createEvent.price,
            date: resData.data.createEvent.date,
            creator: {
              _id: this.context.userId
            }
          });
          return { events: updatedEvents };
        });
      })
      .catch(err => {
        console.error(err, "Failed to add event");
      });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  bookEventHandler = () => {
    const { selectedEvent } = this.state;

    if (!selectedEvent) {
      return;
    }

    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }

    const requestBody = {
      query: `
        mutation BookEvent ($id: ID!){
          bookEvent(eventId: $id) {
            _id
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        id: this.state.selectedEvent && this.state.selectedEvent._id
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
          throw new Error("Failed to add booking");
        }
        this.setState({ creating: false });
        return res.json();
      })
      .then(resData => {
        console.log({ resData });
        this.setState({ selectedEvent: null });
      })
      .catch(err => {
        console.error(err, "Failed to add booking");
      });
  };

  fetchEvents() {
    this.setState({
      isLoading: true
    });
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
        const events = resData.data.events;
        if (this.isActive) {
          this.setState({ events: events, isLoading: false });
        }
      })
      .catch(err => {
        console.error(err, "Failed to get events");
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  }

  showDetailHandler = (eventId: string) => {
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(e => eventId === e._id);
      return { selectedEvent: selectedEvent };
    });
  };

  render() {
    const { creating, events, selectedEvent } = this.state;

    return (
      <React.Fragment>
        {(creating || selectedEvent) && <Backdrop />}
        {creating && (
          <Modal
            title="Add event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirm"
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
        {selectedEvent && (
          <Modal
            title={selectedEvent.title}
            canCancel
            canConfirm
            confirmText={this.context.token ? "Book!" : "Confirm"}
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
          >
            <h1>{selectedEvent.title}</h1>
            <h2>
              ${selectedEvent.price} -{" "}
              {new Date(selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{selectedEvent.description}</p>
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
          {this.state.isLoading ? <Spinner /> : false}
          <EventList
            onViewDetail={this.showDetailHandler}
            authUserId={this.context.userId}
            events={events}
          />
        </section>
      </React.Fragment>
    );
  }
}

export default EventsPage;
