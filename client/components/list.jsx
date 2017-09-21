"use strict";

import axios from "axios";
import React from "react";
import {
  Button,
  Col
} from "react-bootstrap";

import "./app.css";
import Book from "./book.jsx";

export default class List extends React.Component {

  constructor(props) {
    super(props);
    this._isMounted = false;
    this.booksOnPage = 20; // ◄---------------------------------- books @ a page
    this.state = {
      books: [],
      page: this.props.page || 1,
      total: 0
    };
  }

  componentWillMount() {
    this.getBooksListToState();
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.flasher !== nextProps.flasher) {
      this.getBooksListToState();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      this.getBooksListToState();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.props.savePage) {
      this.props.savePage(this.state.page);
    }
  }

  getBooksListToState = () => { // ◄--------------------------------------------
    let forServer = {};
    forServer.options = {
      page: this.state.page,
      limit: this.booksOnPage
    };

    if (this.props.owner) {
      forServer.query = { owner: this.props.owner };
    } else {
      forServer.query = { accepted: "" }
    }

    if (this.props.booksIds) {
      forServer.query = { _id: this.props.booksIds };
    }

    this.getBooks(forServer)
    .then(result => {
      if (result.data.books && this._isMounted) {
        this.setState({
          books: result.data.books,
          total: result.data.total
        });
      }
    })
    .catch(err => console.log(err.message));
  };

  getBooks = (params) => { // ◄--------- {params} will pass to mongoose-paginate
    return (
        axios.get("/book/get?params=" + JSON.stringify(params))
        .then(result => result)
        .catch(err => console.log(err.message))
    );
  };

  handlePager = (delta) => { // ◄-----------------------------------------------
    this.setState({ page: this.state.page + delta });
  };

  renderPager = () => { // ◄----------------------------------------------------

    if (this.state.total < this.booksOnPage) {
      return null;
    }

    let disabledPrevious = this.state.page === 1,
        disabledNext = this.state.page * this.booksOnPage >= this.state.total;

    return (
        <Col sm={12} md={12}>
          <div id="buttonsinlistdiv">
            <Button
                className="text-center shadow buttonsinlist"
                disabled={disabledPrevious}
                onClick={() => this.handlePager(-1)}
            >
              <span className="fa fa-arrow-left"/>
            </Button>
            <Button
                className="text-center shadow buttonsinlist"
                disabled={disabledNext}
                onClick={() => this.handlePager(1)}
            >
              <span className="fa fa-arrow-right"/>
            </Button>
          </div>
        </Col>
    )
  };

  render() { // ◄---------------------------------------------------------------
    return (
      <div id="list">
        {this.state.books.map(book =>
            <Book
                {...this.props}
                book={book}
                key={book._id}
            />)}
        {this.renderPager()}
      </div>
    )
  }
}