"use strict";

import React from "react";
import {
  Button,
  Form,
  FormControl,
  FormGroup,
  Panel
} from "react-bootstrap";

import "./app.css";

export default class Profile extends React.Component {

  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      name: this.props.details.name || "",
      city: this.props.details.city || "",
      state: this.props.details.state || "",
      serviceMessage: "\u2063", // invisible separator for non empty div
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  formHandler = () => { // ◄----------------------------------------------------
    if (this.state.name !== this.props.details.name
        || this.state.city !== this.props.details.city
        || this.state.state !== this.props.details.state) {

      this.props.updateUser({
        details: {
          name: this.state.name,
          city: this.state.city,
          state: this.state.state
        }
      })

      .then(result => {
        if (this._isMounted) {
          this.setState({ serviceMessage: result.message });
        }
      })
    }
  };

  handleInputChange = (event) => { // ◄-----------------------------------------
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    return (
        <Panel
            bsStyle="primary"
            className="component shadow"
            header={"details for account " + this.props.email}
        >
          <div>
            <Form
                className="forminput"
                horizontal
                name="profileform"
            >
              {["name", "city", "state"].map(item =>
                  <FormGroup key={item}>
                      <FormControl
                          name={item}
                          onChange={this.handleInputChange}
                          placeholder={"you can specify your " + item}
                          type="text"
                          value={this.state[item]}
                      />
                    <div className="text-center">
                      {item}
                    </div>
                  </FormGroup>
              )}
            </Form>
            <div className="text-center">
              <span id="profilemessage">
                {this.state.serviceMessage}
              </span>
            </div>
            <Button
                className="pull-right shadow"
                bsStyle="primary"
                onClick={this.formHandler}
            >
              update
            </Button>
          </div>
        </Panel>
    )
  }
}