"use strict";

import React from "react";
import {
  Button,
  Form,
  FormControl,
  Modal
} from "react-bootstrap";

import "./app.css";

export default class Modals extends React.Component {

  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      body: this.modals[this.props.type.split(" ").join("")].body,
      validator: this.modals[this.props.type.split(" ").join("")].validator,
      serviceMessage: "\u2063", // invisible separator for non empty div
      show: true
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
        <Modal
            show={this.state.show}
            onHide={() => history.back()}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.modals.header()}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.body()}
            {this.modals.serviceMessage()}
          </Modal.Body>
          <Modal.Footer>
            {this.modals.footer()}
          </Modal.Footer>
        </Modal>
    )
  }

  modals = { // ◄---------------------- bodies, validators and other modal staff

    formHandler: () => {
      let isValid = this.state.validator(),
          parentParams = null;

      if (isValid.status) {
        if (this.props.type === "sign up" || this.props.type === "sign in") {
          parentParams = {
            email: this.modals.getValue("email"),
            password: this.modals.getValue("password")
          }
        }
        this.props.parentHandler(parentParams)
        .then(result => {
          if (this._isMounted) {
            this.setState({ serviceMessage: result.message })
          }
        })
        .catch(err => console.log(err.message))
      } else {
        this.setState({ serviceMessage: isValid.message })
      }
    },

    header: () => { // ◄------------------------------------------ shared header
      let faClassName = "";
      if (this.props.type === "sign up") faClassName = "fa fa-user-plus";
      if (this.props.type === "sign in") faClassName = "fa fa-sign-in";
      if (this.props.type === "sign out") faClassName = "fa fa-sign-out";
      return (
          <div className="text-center">
            <span className={faClassName}/>
            &nbsp;
            {this.props.type}
          </div>
      )
    },

    footer: () => { // ◄------------------------------------------ shared footer
      return (
          <div>
            <Button
                className="shadow"
                onClick={() => history.back()}
            >
              close
            </Button>
            <Button
                className="shadow"
                bsStyle="primary"
                onClick={this.modals.formHandler}
            >
              {this.props.type}
            </Button>
          </div>
      )
    },

    serviceMessage: () => { // ◄------------ shared element for service messages
      return (
          <div className="text-center">
            <span id="modalmessage">
              {this.state.serviceMessage}
            </span>
          </div>
      )
    },

    validateEmail: (email) => { // ◄--------------------------------------------
      return (
          new RegExp("^(([^<>()\\[\\]\\\\.,;:\\s@\"]+(\\.[^<>()\\[\\" +
              "]\\\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9" +
              "]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$", "i")
      ).test(email);
    },

    getValue: (name) => document.forms.modalform.elements[name].value, // ◄-----

    signup: { // ◄-------------------------------------------------- signup form
      body: () => (
          <div>
            <Form
                horizontal
                name="modalform"
            >
              <FormControl
                  className="forminput"
                  name="email"
                  placeholder="email"
                  type="email"
              />
              <FormControl
                  className="forminput"
                  name="password"
                  placeholder="password"
                  type="password"
              />
              <FormControl
                  className="forminput"
                  name="confirmpassword"
                  placeholder="confirm password"
                  type="password"
              />
            </Form>
          </div>
      ),

      validator: () => {
        if (!this.modals.getValue("email")
            || !this.modals.getValue("password")
            || !this.modals.getValue("confirmpassword")) {
          return { status: false, message: "fields can't be empty" }
        }
        if (!this.modals.validateEmail(this.modals.getValue("email"))) {
          return { status: false, message: "strange email" }
        }
        if (this.modals.getValue("password") !== this.modals.getValue(
                "confirmpassword")) {
          return { status: false, message: "password not confirmed" }
        }
        return { status: true, message: "\u2063" }
      }
    },

    signin: { // ◄------------------------------------------------- sign in form
      body: () => (
          <div>
            <Form
                horizontal
                name="modalform"
            >
              <FormControl
                  className="forminput"
                  name="email"
                  placeholder="email"
                  type="email"
              />
              <FormControl
                  className="forminput"
                  name="password"
                  placeholder="password"
                  type="password"
              />
            </Form>
          </div>
      ),

      validator: () => {
        if (!this.modals.getValue("email")
            || !this.modals.getValue("password")) {
          return { status: false, message: "fields can't be empty" }
        }
        if (!this.modals.validateEmail(this.modals.getValue("email"))) {
          return { status: false, message: "strange email" }
        }
        return { status: true, message: "\u2063" }
      }
    },

    signout: { // ◄---------------------------------------------- sign out modal
      body: () => (
          <div className="text-center">
            you are going to logout
          </div>
      ),

      validator: () => {
        return { status: true, message: "\u2063" }
      }
    }

  }
}