/* eslint-disable no-unused-vars */
import React, { Fragment } from 'react';
import { Switch, Route, Link } from 'react-router-dom/es';

import { Miss, render, importComponent } from 'untool';

const Home = importComponent('./components/home');
const About = importComponent('./components/about', 'About');

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
