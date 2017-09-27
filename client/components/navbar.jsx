"use strict";

import React from "react";

import {
  Nav,
  Navbar,
  NavItem
} from "react-bootstrap";

import { LinkContainer } from "react-router-bootstrap";

import "./app.css";
import { Branding } from "./branding.jsx";

export const NavBar = ({ isAuth }) => {

  let conditionalMenu = isAuth ?
      ["all books", "trades", "profile", "sign out"] :
      ["all books", "sign up", "sign in"];

  return (
      <Navbar
          id="navbar"
          className="shadow"
          collapseOnSelect
          fluid
      >
        <Navbar.Header>
          <Branding/>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            {conditionalMenu.map((name, index) =>
                <LinkContainer key={name} to={"/" + name.split(" ").join("")}>
                  <NavItem eventKey={index}>{name}</NavItem>
                </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
  )
};