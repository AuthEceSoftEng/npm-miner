import React, { Component } from 'react';
import Header from './Header';
import Footer from './Footer';
import NotFound from './screens/NotFound';
import About from './screens/About';
import Main from './screens/Main';
import Search from './screens/Search';
import Package from './screens/Package';
import { Route, Switch } from 'react-router-dom';
import withTracker from './withTracker';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
          <Header/>
          <div id='main'>
            <Switch>
              <Route exact path='/' component={withTracker(Main)} />
              <Route exact path='/about' component={withTracker(About)} />
              <Route exact path='/search' component={withTracker(Search)} />
              <Route path='/package/:packagename' component={withTracker(Package)} />
              <Route component={withTracker(NotFound)} />
            </Switch>
          </div>
          <Footer/>
      </div>
    );
  }
}

export default App;
