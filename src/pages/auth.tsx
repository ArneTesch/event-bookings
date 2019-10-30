import { autobind } from "core-decorators";
import React from "react";
import AuthContext from "../context/auth-context";
import "./auth.scss";

export interface AuthPageProps {}

export interface AuthPageState {
  isLogin: boolean;
}

@autobind
class AuthPage extends React.Component<AuthPageProps, AuthPageState> {
  private emailElRef: React.RefObject<HTMLInputElement>;
  private passwordElRef: React.RefObject<HTMLInputElement>;
  static contextType = AuthContext;

  constructor(props: AuthPageProps) {
    super(props);
    this.emailElRef = React.createRef<HTMLInputElement>();
    this.passwordElRef = React.createRef<HTMLInputElement>();
  }

  state: AuthPageState = {
    isLogin: true
  };

  submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email =
      this.emailElRef &&
      this.emailElRef.current &&
      this.emailElRef.current.value;
    const password =
      this.passwordElRef &&
      this.passwordElRef.current &&
      this.passwordElRef.current.value;

    if (
      (email && email.trim().length === 0) ||
      (password && password.trim().length === 0)
    ) {
      return;
    }

    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: email,
        password: password
      }
    };

    if (!this.state.isLogin) {
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: { email: $email, password: $password}) {
              _id
              email
            }
          }
        `,
        variables: {
          email: email,
          password: password
        }
      };
    }

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        if (resData.data.login && resData.data.login.token) {
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration
          );
        } else if (resData.data.createUser && resData.data.createUser) {
          // TODO: handle user creation
          console.log("Created User::", resData.data.createUser);
        }
      })
      .catch(err => {
        console.error(err);
      });
  };

  switchModeHandler = () => {
    this.setState(prevState => {
      return {
        isLogin: !prevState.isLogin
      };
    });
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-control">
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" ref={this.emailElRef} />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={this.passwordElRef} />
        </div>
        <div className="form-actions">
          <button type="submit">
            {this.state.isLogin ? "Login" : "Signup"}
          </button>
          <button type="button" onClick={this.switchModeHandler}>
            Switch to {this.state.isLogin ? "Signup" : "Login"}
          </button>
        </div>
      </form>
    );
  }
}

export default AuthPage;
