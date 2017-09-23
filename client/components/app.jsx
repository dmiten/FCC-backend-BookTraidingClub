"use strict";

import axios from "axios";
import React from "react";
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from "react-router-dom";
import { Panel } from "react-bootstrap";

import "./app.css";
import List from "./list.jsx";
import Modals from "./modals.jsx";
import { NavBar } from "./navbar.jsx";
import Profile from "./profile.jsx";
import Trades from "./trades.jsx";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.page = 1;
    this.state = {
      details: JSON.parse(sessionStorage.getItem("details")) || {},
      email: JSON.parse(sessionStorage.getItem("email")) || "",
      token: JSON.parse(sessionStorage.getItem("token")) || "",
      trades: JSON.parse(sessionStorage.getItem("trades")) || [],
      userId: JSON.parse(sessionStorage.getItem("userId")) || ""
    };
  }

  componentWillMount() {
    this.props.history.replace("/");
  }

  conditionalElements = () => { // ◄--------------------------------------------
    return this.state.userId ?
        <Switch>
          <Route
              path="/profile"
              render={() =>
                  <Profile
                      {...this.state}
                      updateUser={this.updateUser}
                  />
              }
          />
          <Route
              path="/trades"
              render={() =>
                  <Trades
                      {...this.state}
                      updateUser={this.updateUser}
                  />
              }
          />
          <Route
              path="/signout"
              render={() => <Modals {...this.modalParams.signout} />}
          />
        </Switch>
        :
        <Switch>
          <Route
              path="/signup"
              render={() => <Modals {...this.modalParams.signup} />}
          />
          <Route
              path="/signin"
              render={() => <Modals {...this.modalParams.signin} />}
          />
        </Switch>
  };

  updateUser = (newUserData) => { // ◄------------------------------------------
    return (
        axios.post("/user/update",
            { user: newUserData },
            { headers: { "Authorization": this.state.token } }
        )
        .then(res => {
          this.mapUserToStateStorage(newUserData);
          return { message: res.data.message }
        })
        .catch(err => console.log(err.message))
    )
  };

  mapUserToStateStorage = (userData) => {
    this.setState(userData);
    Object.keys(userData).forEach(key =>
        sessionStorage.setItem(key, JSON.stringify(userData[key])));
    return () => ({ message: "user data updated" })
  };

  render() { // ◄---------------------------------------------------------------
    return (
        <div className="transparent" id="main">
          <NavBar isAuth={this.state.userId} />
          <Route exact
                 path="/"
                 render={() => <Redirect to="/allbooks" />}
          />
          <Route
              path="/allbooks"
              render={() =>
                  <Panel>
                    <div className="panelheader">
                      all books
                    </div>
                    <List
                        {...this.state}
                        page={this.page}
                        savePage={page => this.page = page}
                        updateUser={this.updateUser}
                    />
                  </Panel>
              }
          />
          {this.conditionalElements()}
        </div>
    )
  };

  modalParams = { // ◄------------------ props and handlers for different modals

    signup: {
      type: "sign up",
      parentHandler: (params) =>
        axios.post("/user/signup", {
          email: params.email,
          password: params.password
        })
        .then(res => {
          if (res.data.user) {
            this.mapUserToStateStorage(res.data.user);
            this.props.history.replace("/");
          }
          return { message: res.data.message }
        })
        .catch(err => console.log(err.message))
    },

    signin: {
      type: "sign in",
      parentHandler: (params) =>
          axios.post("/user/signin", {
            email: params.email,
            password: params.password
          })
          .then(res => {
            if (res.data.user) {
              this.mapUserToStateStorage(res.data.user);
              this.props.history.replace("/");
            }
            return { message: res.data.message }
          })
          .catch(err => console.log(err.message))
    },

    signout: {
      type: "sign out",
      parentHandler: () => {
        ["details", "email", "token", "trades", "userId"]
        .map(item => sessionStorage.removeItem(item));
        this.setState({
          details: {},
          email: "",
          token: "",
          trades: [],
          userId: ""
        });
        this.props.history.replace("/");
        return new Promise(() => {
          return { message: "signed out" }
        })
      }
    }
  }
}

export default withRouter(App);