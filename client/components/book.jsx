"use strict";

import axios from "axios";
import React from "react";
import {
  Button,
  Col,
  Label,
  Modal,
  Panel,
  Thumbnail,
  Well
} from "react-bootstrap";

import "./app.css";
import List from "./list.jsx";

export default class Book extends React.Component {

  constructor(props) {
    super(props);
    this._isMounted = false;
    this.src = this.props.book.details.thumbnail ?
        this.props.book.details.thumbnail.replace("http:", "https:") :
        "noimagestub.jpg";
    this.state = {
      book: this.props.book,
      descriptionOpen: false,
      showPanel: Array(this.props.book.trades.length).fill(false),
      showModal: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleTrade = (tradeType) => { // ◄-------------------------------------------
    let _state = Object.assign({}, this.state),
        userTrade = this.props.trades;

    if (tradeType === "add") {
      _state.book.trades.push(this.props.userId);
      userTrade.push(_state.book._id);
    }

    if (tradeType === "remove") {
      _state.book.trades.splice(
          _state.book.trades.indexOf(this.props.userId), 1);
      userTrade.splice(userTrade.indexOf(_state.book._id), 1);
    }

    Promise.all([
        this.updateBook({ trades: _state.book.trades }),
        this.props.updateUser({ trades: userTrade })
    ])
    .then(result => {
      if (result[0].message === "book data updated"
          && result[1].message === "user data updated") {
        this.setState(_state);
      } else {
        console.log(result);
      }
    })
    .catch(err => console.log(err));
  };

  handleTrades = (type, index) => {
    let _book = {...this.state.book};

    if (type === "accept") {
      _book.accepted = _book.trades[index];
    }

    if (type === "reject") {
      _book.accepted = "";
    }

    this.updateBook(_book)
    .then(result =>{
      if (result.message === "book data updated") {
        this.setState({ book: _book });
      } else {
        console.log(result.message)
      }
    })
  };

  updateBook = (newBookData) => { // ◄------------------------------------------
    return (
        axios.post("/book/update",
            { book: {_id: this.state.book._id, ...newBookData} },
            { headers: { "Authorization": this.props.token } }
        )
        .then(result => {
          return { message: result.data.message }
        })
        .catch(err => console.log(err.message))
    )
  };

  renderModalTrades = () => { // ◄----------------------------------------------
    let type = this.state.book.accepted ? "reject" : "accept",
        oneInterested = (one, index) => {
          if (!this.state.book.accepted || this.state.book.accepted === one) {
            return (
                <div
                    id="oneinterested"
                    key={one}
                >
                  <Button
                      bsStyle="primary"
                      className="shadow"
                      onClick={() => {
                        let showPanel = [...this.state.showPanel];
                        showPanel[index] = !showPanel[index];
                        this.setState({ showPanel: showPanel })
                      }}
                  >
                    {index + 1}
                  </Button>
                  <Button
                      onClick={() => this.handleTrades(type, index)}
                  >
                    {type}
                  </Button>
                  <Panel
                      bsStyle="primary"
                      className="shadow bookmodal"
                      collapsible
                      expanded={this.state.showPanel[index]}
                  >
                    <div className="panelheader">
                      can choose from {index + 1} user
                    </div>
                    <List
                        {...this.props}
                        owner={one}
                    />
                  </Panel>
                </div>
            )
          }
        };

    return (
        <Modal
            dialogClassName="xlargemodal"
            show={this.state.showModal}
            onHide={() => this.setState({ showModal: false })}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <div className="text-center">
                <span className="fa fa-users" />
                &nbsp;
                are interested in this book
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              {this.state.book.trades.map(
                  (one, index) => oneInterested(one, index))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
                className="shadow"
                onClick={() => this.setState({ showModal: false })}
            >
              close
            </Button>
          </Modal.Footer>
        </Modal>
    );
  };

  conditionalDescription = () => { // ◄-----------------------------------------

    let button = <Button
                    bsSize="xsmall"
                    bsStyle="info"
                    className="shadow"
                    hidden={!this.state.book.details.description}
                    id="descriptionbutton"
                    onClick={() =>
                        this.setState({
                          descriptionOpen: !this.state.descriptionOpen
                        })
                    }
                >
                  description
                </Button>,

        label = <Label bsStyle="default">
                  {"trades: " + this.state.book.trades.length}
                </Label>,

        panel = <Panel
                    bsStyle="primary"
                    className="transparent"
                    collapsible
                    expanded={this.state.descriptionOpen}
                    id="desctiptionpanel"
                >
                  {this.state.book.details.description}
                </Panel>,

        emptyPanel = <div id="emptypanel" />;


    return (
        <div id="description">
          {this.state.book.details.description ? button : null}
          {label}
          {this.state.book.details.description ? panel : emptyPanel}
        </div>
    )
  };

  conditionalButtons = () => { // ◄---------------------------------------------
    let bsStyle = "success",
        trades = "trades";
    if (this.state.book.accepted) {
      bsStyle = "danger";
      trades = "accepted";
    }
    let tradesButton = this.state.book.trades.length ?
        <Button
            className="bookbutton shadow"
            bsSize="small"
            bsStyle={bsStyle}
            onClick={() => this.setState({ showModal: true })}
        >
          {trades}
        </Button> : null;

    if (this.props.owner && this.props.userId === this.state.book.owner) {
      return (
          <div>
            {tradesButton}
            <Button
                className="bookbutton shadow"
                bsSize="small"
                bsStyle="warning"
                onClick={() => this.props.deleteBook(this.state.book)}
            >
              delete
            </Button>
          </div>
      )
    } else {
      if (this.props.userId
          && !this.state.book.accepted
          && this.props.userId !== this.state.book.owner) {

        let tradeType = "add";

        if (this.state.book.trades.indexOf(this.props.userId) !== -1) {
          tradeType = "remove"
        }

        return (
            <Button
                className="bookbutton shadow"
                bsSize="small"
                bsStyle="success"
                onClick={() => this.handleTrade(tradeType)}
            >
              {tradeType + " trade"}
            </Button>
        )
      }
    }
  };

  render() { // ◄---------------------------------------------------------------
    let accepted = (this.props.userId
                    && this.state.book.accepted === this.props.userId) ?
          <Well
              bsSize="small"
              className="text-center"
              id="acceptedwell"
          >
            <b>your trade is accepted</b>
          </Well>: null;

    return (
        <Col
            id="bookcol"
            xs={6} md={4}
        >
          <Thumbnail
              className="scrollable shadow"
              id="bookthumb"
              src={this.src}
          >
            <b>{this.state.book.details.title}</b>
            <p>{this.state.book.details.authors.join(", ")}</p>
            {this.conditionalDescription()}
            {this.conditionalButtons()}
            {accepted}
          </Thumbnail>
          {this.renderModalTrades()}
        </Col>
    )
  }
}