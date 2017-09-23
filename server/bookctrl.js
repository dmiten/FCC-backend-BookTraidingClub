"use strict";

import axios from "axios";

import { serverLog } from "./server";
import Book from "./bookmodel";

export const bookCtrl = {};

bookCtrl.get = (req, res) => { // ◄------------------- get books with pagination
  let params = JSON.parse(req.query.params);
  Book.paginate(params.query, params.options, (err, result) => {
    if (err) {
      serverLog("error", "bookCtrl.get - Book.paginate - " + err.message);
      res.json({ message: "error getting books" });
    } else {
      res.json({
        books: result.docs,
        message: "ok",
        total: result.total
      });
      serverLog("info", "bookCtrl.get - getting books ok");
    }
  });
};

bookCtrl.add = (req, res, passport) => { // ◄---------------------- add new book
  passport.authenticate("jwt", (err, user) => {

    if (err) {
      serverLog("error", "bookCtrl.add - error adding new book");
      res.json({ message: "error adding new book" });
    }

    if (user) {
      axios.get("https://www.googleapis.com/books/v1/volumes?q=isbn:"
          + req.body.isbn)
      .then(googRes => {
        if (googRes.data.items) {
          let thumbnail = googRes.data.items[0].volumeInfo.imageLinks ?
              googRes.data.items[0].volumeInfo.imageLinks.thumbnail : "",
          book = new Book({
            accepted: "",
            details: {
              authors: googRes.data.items[0].volumeInfo.authors,
              description: googRes.data.items[0].volumeInfo.description,
              googleId: googRes.data.items[0].id,
              isbn: googRes.data.items[0].volumeInfo.industryIdentifiers,
              publisher: googRes.data.items[0].volumeInfo.publisher,
              publisherDate: googRes.data.items[0].volumeInfo.publisherDate,
              thumbnail: thumbnail,
              title: googRes.data.items[0].volumeInfo.title
            },
            owner: user._id,
            listed: true,
            trades: []
          });

          book.save((err, book) => {
            if (err) {
              serverLog("error", "bookCtrl.add - book.save - " + err.message);
              res.json({ message: "error adding new book" });

            } else {
              serverLog("info", "bookCtrl.add - book.save - new book added");
              res.json({
                message: "new book added",
                book: book
              });
            }
          });

        } else {
          res.json({ message: "google know nothing about this isbn" });
        }
      })
      .catch(err => {
        res.json({ message: err.message });
        serverLog("error", "bookCtrl.add - axios - " + err.message);
      });

    } else {
      serverLog("error", "bookCtrl.add - unauthorized");
      res.json({ message: "unauthorized" });
    }
  })(req, res);
};

bookCtrl.update = (req, res, passport) => {
  passport.authenticate("jwt", (err, user) => {

    if (err) {
      serverLog(
          "error", "bookCtrl.update - passport.authenticate - " + err.message);
      res.json({message: "error updating book"});
    }

    if (user) {
      Book.findOne({ _id: req.body.book._id }, (err, book) => {

        if (err) {
          serverLog("error", "bookCtrl.update - Book.findOne - " + err.message);
          res.json({ message: "error updating book" });

        } else {
          book.accepted = req.body.book.accepted !== undefined ?
              req.body.book.accepted : book.accepted;

          book.trades = req.body.book.trades ?
              req.body.book.trades : book.trades;

          book.save(err => {

            if (err) {
              serverLog("error", "bookCtrl.update - book.save - " + err.message);
              res.json({ message: "error updating book" });

            } else {
              serverLog("info", "bookCtrl.update - book.save - book data updated");
              res.json({ message: "book data updated" });
            }
          });
        }
      });

    } else {
      serverLog("error", "bookCtrl.update - unauthorized");
      res.json({ message: "unauthorized" });
    }
  })(req, res);
};

bookCtrl.delete = (req, res, passport) => { // ◄-------------------- delete book
  passport.authenticate("jwt", (err, user) => {

    if (err) {
      serverLog("error", "bookCtrl.delete - error deleting book");
      res.json({ message: "error deleting book" });
    }

    if (user) {
      Book.findOne({ _id: req.body.bookId }, (err, book) => {

        if (err) {
          serverLog("error", "bookCtrl.delete - " + err.message);
          res.json({ message: "deleting error" });

        } else {

          if (user._id.toString() === book.owner.toString()) {
            book.remove();
            res.json({ message: "book deleted" });
            serverLog("info", "bookCtrl.delete - book deleted");

          } else {
            res.json({ message: "isn't your book" });
            serverLog("error", "bookCtrl.delete - other owner");
          }
        }
      });

    } else {
      res.json({ message: "unauthorized" });
      serverLog("error", "bookCtrl.delete - unauthorized");
    }
  })(req, res);
};