import React, { Component } from 'react';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';
// import Moment from 'react-moment';
import _ from 'lodash';
import NumberFormat from 'react-number-format';

class Stats extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dependencies: [],
      sum: 0
    }
  }

  componentWillMount() {
    axios.get(`${process.env.REACT_APP_API_URL}/api/stats`).then(response => {
      this.setState({
        loading: false,
        dependencies: response.data.dependencies,
        sum: _.sumBy(response.data.dependencies, 'count')
      })
    })
  }


    render() {
      return (
        <section className="section">
          <div className="container">
            <div className="content">
              <h1 className='title'>Statistics</h1>
              <p>
                  This page contains live statistics mentioned in the paper: 
              </p>
              <p>
                Erik Wittern, Philippe Suter, Shriram Rajagopalan "A Look at the Dynamics of the JavaScript Package Ecosystem", <em>2016 IEEE/ACM 13th Working Conference on Mining Software Repositories</em> (2016).
                [DOI: <a href='https://doi.org/10.1145/2901739.2901743'>10.1145/2901739.2901743</a>]
              </p>
              {!this.state.loading ? 
                <div>
                  <h2 className='subtitle is-4'>Dependencies</h2>
                  <ul>
                    {this.state.dependencies.map(d => {
                              return (
                              <li key={d._id}>
                                <span><strong><NumberFormat value={d.count} displayType={'text'} thousandSeparator={true} /> ({Number(d.count * 100.0/this.state.sum).toFixed(2)}%)</strong> packages have <strong>{d._id}</strong> {d._id === 1 ? <span>dependency</span>:<span>dependencies</span>}</span>
                              </li>
                              );
                          })}
                      </ul>
                </div> 
                : 
                <div className='has-text-centered'>
                  <BeatLoader color={'black'} />
                </div>
              }
            </div>
          </div>
        </section>
      );
    }
  }
  
  export default Stats;