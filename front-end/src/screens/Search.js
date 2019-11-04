import React, { Component } from 'react';
import { BeatLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import queryString from 'query-string'
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons'

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      npmPackages: [],
      query: ''
    };
  }

  componentWillMount() {
    const query = queryString.parse(this.props.location.search).q
    this.setState(
      {query}
    );
    axios.get(`${process.env.REACT_APP_API_URL}/api/search?q=${query}`).then(response => {
      this.setState(
        {
          npmPackages: response.data,
          loading: false
        }
      )
    })
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="content">
              <h1 className='title'>Results</h1>
              <span className='subtitle'>npm registry search results for query: {this.state.query}</span>
              {!this.state.loading ? (
                  <div>
                  {this.state.npmPackages.length > 0 ?
                      <ul>
                          {this.state.npmPackages.map(v => {
                              return (
                              <li key={v.name}>
                                  <span>{ v.crawled ?<FontAwesomeIcon icon={faCheckCircle} color="green"/>:<FontAwesomeIcon icon={faTimesCircle} color="red"/>} </span>
                                  <Link to={`/package/${v.name}`}><span>{v.name}</span></Link>
                                  <span> - </span>
                                  <span>{v.description}</span>
                              </li>
                              );
                          })}
                      </ul> : <p className="has-text-centered">Nothing found</p> }
                  </div>
                  ) : (
                      <div className='has-text-centered'>
                          <BeatLoader
                              color={'black'} 
                          />
                      </div>
                  )}
          </div>
        </div>
      </section>
    );
  }
}
  
  export default Search;