"use strict";

import axios from "axios";
import React from "react";
import {
  Button,
  Form,
  FormControl,
  InputGroup,
  FormGroup,
  Modal,
  Panel
} from "react-bootstrap";

import "./app.css";
import List from "./list.jsx";

export default class Trades extends React.Component {

  constructor(props) { // ◄-----------------------------------------------------
    super(props);
    this._isMounted = false;
    this.bookForDelete = null;
    this.state = {
      addBookPanel: false,
      flasher: false,
      inputValue: "",
      ownBooksPanel: true,
      serviceMessageAdd: "\u2063",
      serviceMessageModal: "",
      showModal: false,
      tradesPanel: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleInputChange = (event) => { // ◄-----------------------------------------
    this.setState({
      inputValue: event.target.value,
      serviceMessageAdd: "\u2063"
    });
  };

  addClickHandler = () => { // ◄------------------------------------------------
    if (this.state.inputValue) {

      let isbn = this.state.inputValue.split("-").join("");

      if (isbn.length !== 10 && isbn.length !== 13) {
        this.setState({ serviceMessageAdd: "wrong ISBN length" });

      } else {
        this.addBook(isbn)
        .then(result => {
          this.setState({
            flasher: !this.state.flasher,
            serviceMessageAdd: result.message
          });
        })
        .catch(err => console.log(err.message));
      }
    }
  };

  addBook = (isbn) => { // ◄----------------------------------------------------
    return (
        axios.post("/book/add",
            { isbn: isbn },
            { headers: { "Authorization": this.props.token } }
        )
        .then(resAdd => {
          return { message: resAdd.data.message };
        })
        .catch(err => console.log(err.message))
    );
  };

  deleteButtonHandler = (book) => { // ◄----------------------------------------
    let message = "you are going to delete this book";
    this.bookForDelete = book;

    if (book.trades.length !== 0) {
      message = "you can't delete the book with trades";
    }

    this.setState({
      serviceMessageModal: message,
      showModal: true
    });
  };

  deleteBook = (bookId) => { // ◄-----------------------------------------------
    axios.post("/book/delete",
        { bookId: bookId },
        { headers: { "Authorization": this.props.token } }
    )
    .then(result => {
      let _state = Object.assign({}, this.state);

      if (result.data.message === "book deleted") {
        _state.flasher = !_state.flasher;
      }
      _state.serviceMessageModal = result.data.message;
      this.setState(_state);
    })
    .catch(err => console.log(err));
  };

  renderModalConfirmation = () => { // ◄----------------------------------------
    let buttonDelete = null;
    if (this.state.serviceMessageModal === "you are going to delete this book") {
      buttonDelete = (
          <Button
              className="shadow"
              bsStyle="danger"
              onClick={() => this.deleteBook(this.bookForDelete._id)}
          >
            delete
          </Button>
      )
    }

    return (
        <Modal
            show={this.state.showModal}
            onHide={() => this.setState({
              serviceMessageModal: "you are going to delete this book",
              showModal: false
            })}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <div className="text-center">
                <span className="fa fa-trash-o" />
                &nbsp;
                confermation needed
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <div className="text-center">
              <span id="modalmessage">
                {this.state.serviceMessageModal}
              </span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
                className="shadow"
                onClick={() => this.setState({
                  serviceMessageModal: "you are going to delete this book",
                  showModal: false
                })}
            >
              close
            </Button>
            {buttonDelete}
          </Modal.Footer>
        </Modal>
    );
  };

  render() { // ◄---------------------------------------------------------------
    return (
        <div>
          <Button
              bsStyle="primary"
              className="shadow"
              onClick={() =>
                  this.setState({ addBookPanel: !this.state.addBookPanel })
              }
          >
            add new book
          </Button>
          <Button
              bsStyle="primary"
              className="shadow"
              onClick={() =>
                  this.setState({ ownBooksPanel: !this.state.ownBooksPanel })
              }
          >
            my books
          </Button>
          <Button
              bsStyle="primary"
              className="shadow"
              onClick={() =>
                  this.setState({ tradesPanel: !this.state.tradesPanel })
              }
          >
            wanted
          </Button>
          <Panel
              bsStyle="primary"
              className="shadow"
              collapsible
              expanded={this.state.addBookPanel}
              id="addbookpanel"
          >
            <Form
                horizontal
                name="addnewbookform"
            >
              <FormGroup>
                <InputGroup className="forminput">
                  <FormControl
                      name="isbn"
                      onChange={this.handleInputChange}
                      placeholder="add new book by ISBN code"
                      type="text"
                  />
                  <InputGroup.Button>
                    <Button
                        bsStyle="primary"
                        onClick={this.addClickHandler}
                    >
                      <i aria-hidden="true"
                         className="fa fa-plus-circle"
                      />
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </Form>
            <div className="text-center">
              <span id="addnewbookemessage">
                {this.state.serviceMessageAdd}
              </span>
            </div>
          </Panel>
          <Panel
              bsStyle="primary"
              className="shadow"
              collapsible
              expanded={this.state.ownBooksPanel}
              id="ownbookspanel"
          >
            <div className="panelheader">
              my books
            </div>
            <List
                {...this.props}
                deleteBook={this.deleteButtonHandler}
                flasher={this.state.flasher}
                owner={this.props.userId}
            />
          </Panel>
          <Panel
              bsStyle="primary"
              className="shadow"
              collapsible
              expanded={this.state.tradesPanel}
              id="tradespanel"
          >
            <div className="panelheader">
              wanted
            </div>
            <List
                {...this.props}
                booksIds={this.props.trades}
                flasher={this.state.flasher}
            />
          </Panel>
          {this.renderModalConfirmation()}
        </div>
    )
  }
}