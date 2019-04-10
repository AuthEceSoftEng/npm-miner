import React, { Component } from 'react';
import Header from './Header';
import Footer from './Footer';
import NotFound from './screens/NotFound';
import About from './screens/About';
import Main from './screens/Main';
import Search from './screens/Search';
import Package from './screens/Package';
import { Route, Switch } from 'react-router-dom';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
          <Header/>
          <div id='main'>
            <Switch>
              <Route exact path='/' component={Main} />
              <Route exact path='/about' component={About} />
              <Route exact path='/search' component={Search} />
              <Route path='/package/:packagename' component={Package} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <Footer/>
      </div>
    );
  }
}

export default App;
