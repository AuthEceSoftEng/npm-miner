import React, { Component } from 'react';
// import axios from 'axios';
// import { BeatLoader } from 'react-spinners';
// import Moment from 'react-moment';
// import _ from 'lodash';

class Stats extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    }
  }

  componentWillMount() {
    // axios.get(`${process.env.REACT_APP_API_URL}/api/stats`).then(response => {
    //   console.log(response.data);
    //   this.setState({
    //     loading: false
    //   })
    // })
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
              {!this.state.loading ? <div></div> : <div></div>}
            </div>
          </div>
        </section>
      );
    }
  }
  
  export default Stats;