import React, { Component } from 'react';
import { BeatLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import TopTen from '../components/TopTen';
import axios from 'axios';

class Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      loading: true,
      loc: 0,
      packages: 0,
      top_stars: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    const path = `/search?q=${this.state.value}`;
    this.context.router.history.push(path)
  }

  componentWillMount() {
    axios.get(`${process.env.API_URL}/api/dashboard`).then(response => {
      this.setState({
        loading: false,
        loc: response.data.loc,
        packages: response.data.packages,
        top_stars: response.data.top_stars
      })
    })
  }

  render() {
    return (
      <div>
        <section className="hero">
          <div className="hero-body">
            <div className="container has-text-centered">
                <h1 className="title">
                Welcome to npm-miner!
                </h1>
                <h2 className="subtitle">
                npm-miner aggregates the results of 
                popular static analysis tools in order 
                to provide insights about the software 
                quality on the npm ecosystem.
                </h2>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="columns">
              <div className="column is-1">
              </div>
              <div className="column">
                <form onSubmit={this.handleSubmit}>
                  <div className="field has-addons">
                    <div className="control is-expanded">
                      <input 
                          className="input is-rounded" 
                          type="text" 
                          placeholder="Search for a package" 
                          value={this.state.value} 
                          onChange={this.handleChange}
                      />
                    </div>
                    <div className="control">
                      <input 
                          type='submit' 
                          className="button is-black is-rounded"
                          value='Search'
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="column is-1">
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container has-text-centered">
            <div className="tile is-ancestor">
              <div className="tile is-parent">
                <article className="tile is-child box">
                  {!this.state.loading ? (
                    <div>
                      <p className="title">{this.state.packages}</p>
                      <p className="subtitle">packages mined</p>
                    </div>
                    ) : (
                      <BeatLoader
                        color={'black'} 
                      />
                    )
                  }               
                </article>
              </div>
              <div className="tile is-parent">
                <article className="tile is-child box">
                  {!this.state.loading ? (
                    <div>
                      <p className="title">{this.state.loc}</p>
                      <p className="subtitle">Lines of Code checked</p>
                    </div>
                  ) : (
                    <BeatLoader
                      color={'black'} 
                    />
                  )
                  }
                </article>
              </div>
              {/* <div className="tile is-parent">
                <article className="tile is-child box">
                  <p className="title">Three</p>
                  <p className="subtitle">Subtitle</p>
                </article>
              </div>
              <div className="tile is-parent">
                <article className="tile is-child box">
                  <p className="title">Four</p>
                  <p className="subtitle">Subtitle</p>
                </article>
              </div> */}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container has-text-centered">
              <div className="columns is-offset-one-half">
                <div className="column is-one-third">
                  {!this.state.loading ? (
                      <TopTen packages={this.state.top_stars} />
                    ) : (
                      <BeatLoader
                        color={'black'} 
                      />
                    )
                  }
                </div>
                {/* <div className="column is-one-third"><TopTen/></div>
                <div className="column is-one-third"><TopTen/></div> */}
              </div>
          </div>
        </section>
      </div>
    );
  }
}

// ask for `router` from context
Main.contextTypes = {
  router: PropTypes.object
};
  
export default Main;