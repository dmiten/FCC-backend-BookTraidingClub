"use strict";

import fs from "fs";

import { serverLog } from "../server";

export function getCredentials() { // ◄-----------------------------------------
  return (
      Promise.all([
        readFilePromisified("./server/.data/cert.pem"),
        readFilePromisified("./server/.data/key.pem")
      ])
      .then(result => {
        serverLog("info", "credentials - getCredentials ok");
        return ({
          cert: result[0],
          key: result[1]
        });
      })
      .catch(err => {
        serverLog("error", "credentials - getCredentials " + err.message);
      })
  );
}

function readFilePromisified(filename) { // ◄-----------------------------------
  return new Promise(
      (resolve, reject) => {
        fs.readFile(filename, {encoding: "utf8"},
            (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
      });
}