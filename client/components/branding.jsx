"use strict";

import React from "react";

import "./app.css";

export const Branding = () => { // ◄--------------------------------------------

  return (
      <div id="header">
        <div id="name">
          bouquiniste&nbsp;|&nbsp;
          <span id="discribe">
              <sub>
                book trading club
              </sub>
            </span>
        </div>
        <div id="copyright">
          <span>
                dmiten |&nbsp;
            <a href="https://github.com/dmiten/FCC-backend-BookTraidingClub"
               target="blank">
                <span className="fa fa-github"/>
              </a>
          </span>
          &nbsp;2017
        </div>
        <br />
      </div>
  )
};