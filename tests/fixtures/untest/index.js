/* eslint-disable no-unused-vars */
import React, { Fragment } from 'react';
import { Switch, Route, Link } from 'react-router-dom/es';

import { Import, Miss, render } from 'untool';

const Home = Import('./home');
const About = Import('./about', 'About');

const preload = ({ Component, error, loading, ...props }) => {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!!!</p>;
  return <Component {...props} />;
};

const App = () => (
  <Fragment>
    <Link to="/">Home</Link> <Link to="/about/">About</Link>
    <Switch>
      <Route exact path="/" component={Home} />} />
      <Route path="/about/" render={() => <About render={preload} />} />
      <Miss />
    </Switch>
  </Fragment>
);

export default render(<App />);
