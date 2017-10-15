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
        pairedBook = this.props.pairedBook || {},
        userTrade = this.props.trades,
        bookData, pairedBookData;

    if (tradeType === "add trade") {

      if (userTrade.indexOf(_state.book._id) === -1) {
        userTrade.push(_state.book._id);
      }

      if (_state.book.trades.indexOf(this.props.userId) === -1) {
        _state.book.trades.push(this.props.userId);
      }

      bookData = { trades: _state.book.trades };
    }

    if (tradeType === "remove trade") {
      _state.book.trades.splice(
          _state.book.trades.indexOf(this.props.userId), 1);
      userTrade.splice(userTrade.indexOf(_state.book._id), 1);
      bookData = { trades: _state.book.trades };
    }

    if (tradeType === "accept with this book") {

      if (userTrade.indexOf(_state.book._id) === -1) {
        userTrade.push(_state.book._id);
      }

      if (pairedBook.trades.indexOf(this.props.userId) === -1) {
        pairedBook.trades.push(this.props.userId);
      }

      if (_state.book.trades.indexOf(pairedBook.owner) === -1) {
        _state.book.trades.push(pairedBook.owner);
      }

      _state.book.accepted = pairedBook.owner + "," + pairedBook._id;
      pairedBook.accepted = _state.book.owner + "," + _state.book._id;

      bookData = {
        accepted: _state.book.accepted,
        trades: _state.book.trades
      };

      pairedBookData = {
        accepted: pairedBook.accepted,
        trades: pairedBook.trades
      };
    }

    if (tradeType === "reject trade") {

      _state.book.trades.splice(
          _state.book.trades.indexOf(pairedBook.owner), 1);

      pairedBook.trades.splice(
          pairedBook.trades.indexOf(this.props.userId), 1);

      userTrade.splice(userTrade.indexOf(_state.book._id), 1);
      _state.book.accepted = "";
      pairedBook.accepted = "";

      bookData = {
        accepted: "",
        trades: _state.book.trades
      };

      pairedBookData = {
        accepted: "",
        trades: pairedBook.trades
      };
    }

    Promise.all([
        this.updateBook(bookData),
        this.updateBook(pairedBookData, pairedBook._id),
        this.props.updateUser({ trades: userTrade })
    ])

    .then(() => {
      if (this._isMounted) {
        this.setState(_state);
      }
      if (tradeType === "accept with this book"
          || tradeType === "reject trade") {
        this.props.pairedBookSetState({ book: pairedBook });
      }
    })
    .catch(err => console.log(err));
  };

  updateBook = (newBookData, bookId = this.state.book._id) => { // ◄------------

    if (!newBookData) {
      return new Promise (() => {return { message: "book data updated" }})
    }

    return (
        axios.post("/book/update",
            { book: { _id: bookId, ...newBookData } },
            { headers: { "Authorization": this.props.token } }
        )
        .then(result => {
          return { message: result.data.message }
        })
        .catch(err => console.log(err.message))
    )
  };

  pairedBookSetState = (data) => { // ◄-----------------------------------------
    if (this._isMounted) {
      this.setState(data);
    }
  };

  renderModalTrades = () => { // ◄----------------------------------------------

    let acceptrejact = this.state.book.accepted ?
          "reject the trade with this user" :
          "accept with a book of this user",

        oneInterested = (one, index) => {
          if (!this.state.book.accepted
              || this.state.book.accepted.split(",")[0] === one) {
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
                  <span>
                    &nbsp; &nbsp; {acceptrejact}
                  </span>
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
                        pairedBook={this.state.book}
                        pairedBookSetState={this.pairedBookSetState}
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
        </Button> : null,

        deleteButton = this.state.book.trades.length ?
            null :
            <Button
                className="bookbutton shadow"
                bsSize="small"
                bsStyle="warning"
                onClick={() => this.props.deleteBook(this.state.book)}
            >
              delete
            </Button>;

    if (this.props.owner
        && this.props.userId === this.state.book.owner) {
      return (
          <div>
            {tradesButton}
            {deleteButton}
          </div>
      )
    } else {
      if (this.props.userId
          && this.props.userId !== this.state.book.owner
          && !this.state.book.accepted) {

        let tradeType = "add trade";

        if (this.state.book.trades.indexOf(this.props.userId) !== -1) {
          tradeType = "remove trade"
        }

        if (this.props.pairedBook && !this.props.pairedBook.accepted) {
          tradeType = "accept with this book"
        }

        return (
            <Button
                className="bookbutton shadow"
                bsSize="small"
                bsStyle="success"
                onClick={() => this.handleTrade(tradeType)}
            >
              {tradeType}
            </Button>
        )
      }
    }
  };

  render() { // ◄---------------------------------------------------------------
    let accepted = null;

    if (this.props.userId && this.state.book.accepted) {
      if (this.state.book.accepted.split(",")[0] === this.props.userId) {
        accepted = this.props.pairedBook ? <Button
                className="shadow"
                onClick={() => this.handleTrade("reject trade")}
                id="rejectaccepted"
            >
              <b>reject accepted trade</b>
            </Button>
            : <Well
                className="text-center"
                bsSize="small"
                id="rejectaccepted">
              <b>trade is accepted</b>
            </Well>
      }
    }

    return (
        <Col
            id="bookcol"
            xs={10} sm={5} md={4}
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