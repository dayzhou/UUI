import './layout.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { signOut } from '../reducer';

function isPermissive(privilege, user) {
  return !privilege || (user && user.privilege >= privilege);
}

class Menubar extends Component {
  constructMenuTree = (menu) => {
    const { user } = this.props;

    return menu.map(({ type, name, URI, entries }, index) => {
      if (type === 'item') {
        if (URI) {
          return (
            <LinkContainer key={index} to={URI}>
              <NavItem eventKey={index}>{ name }</NavItem>
            </LinkContainer>
          );
        } else {
          return (
            <NavItem key={index} eventKey={index}>{name}</NavItem>
          );
        }
      } else if (type === 'submenu') {
        return (
          <NavDropdown key={index}
            eventKey={index}
            title={name}
            id={'dropdown-' + index}
          >{
            entries.map(({ type, name, URI, privilege }, index) => {
              if (isPermissive(privilege, user)) {
                if (type === 'item') {
                  if (URI) {
                    return (
                      <LinkContainer key={index} to={URI}>
                        <MenuItem eventKey={index}>{name}</MenuItem>
                      </LinkContainer>
                    );
                  } else {
                    return (
                      <MenuItem eventKey={index}>{name}</MenuItem>
                    );
                  }
                } else {
                  // Intentionally not handle this case
                  // We don't allow menu depth deeper than 2
                }
              }
            })
          }</NavDropdown>
        )
      }
    });
  };

  render() {
    const { menu, user, signOut, children } = this.props;

    const leftMenuTree = this.constructMenuTree(menu.filter(({ pullRight, privilege }) => {
      return !pullRight && isPermissive(privilege, user);
    }));

    const rightMenuTree = this.constructMenuTree([
      ...menu.filter(({ pullRight, privilege }) => {
        return pullRight && isPermissive(privilege, user);
      }),
      {
        type: 'item',
        name: user && user.email
      }
    ]);
    if (this.props.showSignin) {
      rightMenuTree.push(user ?
        <NavItem key={-1} eventKey={-1} onClick={signOut}>
          登出
        </NavItem>
        :
        <LinkContainer key={-1} to="/signin">
          <NavItem eventKey={-1}>登录</NavItem>
        </LinkContainer>
      );
    }

    return (
      <div className="menubar">
        <Navbar inverse fixedTop fluid>
          <Navbar.Header>
            { user ?
              <Link to="/">
                <Navbar.Brand>{this.props.title}</Navbar.Brand>
              </Link>
              :
              <Navbar.Brand>{this.props.title}</Navbar.Brand>
            }
          </Navbar.Header>

          <Navbar.Collapse>
            <Nav>{ leftMenuTree }</Nav>

            <Nav pullRight>{ rightMenuTree }</Nav>
          </Navbar.Collapse>
        </Navbar>

        <div className="padding"></div>

        <div>{ children }</div>
      </div>
    );
  }
}

export default (title, showSignin) => connect(
  (state) => ({
    menu: state._UUI_.menu,
    user: state._UUI_.user,
    title,
    showSignin,
  }),
  { signOut }
)(Menubar);
