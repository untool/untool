/* eslint-disable no-unused-vars */
import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route, Link } from 'react-router-dom';

import { render } from '@untool/core';
import { Import, Miss } from '@untool/react';

const Home = Import('./home');
const About = Import('./about');

class Placeholder extends Component {
  constructor({ load }) {
    super();
    this.state = { Component: () => <p>Loading...</p> };
    new Promise((resolve) => setTimeout(resolve, 500)).then(() =>
      load().then(
        ({ default: Component }) => this.setState({ Component }),
        () => this.setState({ Component: () => <p>Error...</p> })
      )
    );
  }
  render() {
    const { props, state } = this;
    const { Component } = state;
    return <Component {...props} />;
  }
}

const App = () => (
  <Fragment>
    <Helmet>
      <title>Untest</title>
    </Helmet>
    <Link to="/">Home</Link> <Link to="/about">About</Link>
    <Switch>
      <Route exact path="/" component={Home} />} />
      <Route path="/about" render={() => <About placeholder={Placeholder} />} />
      <Miss />
    </Switch>
  </Fragment>
);

export default render(<App />);
