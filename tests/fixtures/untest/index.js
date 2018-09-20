/* eslint-disable no-unused-vars */
import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route, Link } from 'react-router-dom/es';

import { render } from '@untool/core';
import { Import, Miss } from '@untool/react';

const Home = Import('./home');
const About = Import('./about');

const App = () => (
  <Fragment>
    <Helmet>
      <title>Untest</title>
    </Helmet>
    <Link to="/">Home</Link> <Link to="/about">About</Link>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Miss />
    </Switch>
  </Fragment>
);

export default render(<App />);
