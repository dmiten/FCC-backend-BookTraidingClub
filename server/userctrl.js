"use strict";

import jwt from "jsonwebtoken";

import User from "./usermodel";
import { serverLog } from "./server";

export const userCtrl = {};

let generateToken = (user) => {
  return (
      jwt.sign({
        id: user.id,
        iat: Date.now(),
        exp: Date.now() + 1000 * 60 * 60 * 72
      }, process.env.JWT_SECRET)
  );
};

userCtrl.signup = (req, res) => { // ◄----------------------------------- signup
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      serverLog("error", "userCtrl.signup - User.findOne - " + err.message);
    }
    if (user) {
      res.json({ message: "email already used" });
      serverLog("info", "userCtrl.signup - email already used");
    } else {
      User.create({
        details: {
          name: "",
          city: "",
          state: ""
        },
        email: req.body.email,
        trades: [],
        password: req.body.password
      }, (err, user) => {
        if (err) {
          serverLog("error", "userCtrl.signup - User.create - " + err.message);
        } else {
          res.json({
            message: "new user " + user.email + "  logged in",
            user: {
              details: user.details,
              email: user.email,
              token: "JWT " + generateToken(user),
              trades: user.trades,
              userId:  user._id
            }
          });
          serverLog("info", "userCtrl.signup - new user " + user.email
              + " added");
        }
      });
    }
  });
};

userCtrl.signin = (req, res, passport) => { // ◄-------------------------- login
  passport.authenticate("local", (err, user) => {
    if (err) {
      serverLog("error", "userCtrl.signin - passport.authenticate - "
          + err.message);
    } else {
      if (!user) {
        res.json({ message: "login failed" });
        serverLog("info", "userCtrl.signin - login failed");
      } else {
        res.json({
          message: "user " + user.email + "  signed in",
          user: {
            details: user.details,
            email: user.email,
            token: "JWT " + generateToken(user),
            trades: user.trades,
            userId:  user._id
          }
        });
        serverLog("info", "userCtrl.signin - user " + user.email
            + " signed in");
      }
    }
  })(req, res);
};

userCtrl.update = (req, res, passport) => { // ◄--------------- update user data

  passport.authenticate("jwt", (err, user) => {
    if (err) {
      serverLog("error", "userCtrl.update - passport.authenticate "
          + err.message);
    }
    if (user) {
      user.update(req.body.user, (err, user) => {
        if (err) {
          res.json({ message: "updating error" });
          serverLog("info", "userCtrl.update - updating error - "
              + err.message);
        } else {
          res.json({ message: "user data updated" });
          serverLog("info", "userCtrl.update - user data updated");
        }
      });
    } else {
      res.status(401).json({ message: "unauthorized" });
      serverLog("info", "userCtrl.update - unauthorized");
    }
  })(req, res);
};