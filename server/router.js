"use strict";

import path from "path";

import { userCtrl } from "./userctrl";
import { bookCtrl } from "./bookctrl";

export default function router (app, passport) {

  app.post("/user/signup", (req, res) => userCtrl.signup(req, res));
  app.post("/user/signin", (req, res) => userCtrl.signin(req, res, passport));
  app.post("/user/update", (req, res) => userCtrl.update(req, res, passport));

  app.get("/book/get", (req, res) => bookCtrl.get(req, res));
  app.post("/book/add", (req, res) => bookCtrl.add(req, res, passport));
  app.post("/book/update", (req, res) => bookCtrl.update(req, res, passport));
  app.post("/book/delete", (req, res) => bookCtrl.delete(req, res, passport));

  app.get("/*/", (req, res) => res.sendFile(path.resolve("./public/index.html")));

};