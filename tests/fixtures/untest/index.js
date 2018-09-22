/* eslint-disable no-unused-vars */
import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route, Link } from 'react-router-dom';

import { render } from '@untool/core';
import { Import, ImportPlaceholder, Miss } from '@untool/react';

const Home = Import('./home');
const About = Import('./about', 'About');

class Placeholder extends ImportPlaceholder {
  render() {
    const { Component, props, error, loading } = this.state;
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!!!</p>;
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
