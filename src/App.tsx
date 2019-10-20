import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import "./App.css";
import AuthPage from "./pages/auth";
import BookingsPage from "./pages/bookings";
import EventsPage from "./pages/events";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Redirect path="/" from="/" to="/auth" exact />
        <Route path="/auth" component={AuthPage} />
        <Route path="/events" component={EventsPage} />
        <Route path="/bookings" component={BookingsPage} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
