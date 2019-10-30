import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import "./App.scss";
import MainNavigation from "./components/navigation/mainNavigation";
import AuthContext from "./context/auth-context";
import AuthPage from "./pages/auth";
import BookingsPage from "./pages/bookings";
import EventsPage from "./pages/events";

export interface AppProps {}

export interface AppState {
  token: string | null;
  userId: string | null;
}

class App extends React.Component<AppProps, AppState> {
  state = {
    token: null,
    userId: null
  };

  login = (token: string, userId: string, tokenExpiration: string) => {
    this.setState({ token, userId });
  };

  logout = () => {
    this.setState({
      token: null,
      userId: null
    });
  };

  render() {
    const { token, userId } = this.state;

    return (
      <BrowserRouter>
        <React.Fragment>
          <AuthContext.Provider
            value={{
              login: this.login,
              logout: this.logout,
              token: token,
              userId: userId
            }}
          >
            <MainNavigation />
            <main className="main-content">
              <Switch>
                {!this.state.token && (
                  <Redirect from="/bookings" to="/auth" exact />
                )}
                {!this.state.token && (
                  <Route path="/auth" component={AuthPage} />
                )}
                {this.state.token && <Redirect from="/" to="/events" exact />}
                {this.state.token && (
                  <Redirect from="/auth" to="/events" exact />
                )}
                {this.state.token && (
                  <Route path="/bookings" component={BookingsPage} />
                )}
                <Route path="/events" component={EventsPage} />
                {!this.state.token && <Redirect to="/auth" exact />}
              </Switch>
            </main>
          </AuthContext.Provider>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
