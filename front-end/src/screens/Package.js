import React, { Component } from 'react';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';
import Moment from 'react-moment';
import _ from 'lodash';

class Package extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      packageName: '',
      package: {}
    }
  }

  componentWillMount() {
    const packageName = this.props.location.pathname.split('/package/')[1];
    this.setState(
      {
        packageName
      }
    )
    axios.get(`${process.env.REACT_APP_API_URL}/api/packages/${packageName}`).then(response => {
      console.log(response.data);
      this.setState({
        package: response.data,
        loading: false
      })
    })
  }


    render() {
      return (
        <section className="section">
          <div className="container">
            <div className="content">
              <h1 className='title'>{this.state.packageName}</h1>
              {!this.state.loading ? (
                      <div>
                      {this.state.package ? (
                        <div>
                          <span>This package was investigated on <strong><Moment format="D MMM YYYY" unix>{this.state.package.processing_date/1000}</Moment></strong>.</span>
                          <h2 className="subtitle is-6">Metadata</h2>
                          <table className="table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>GitHub Repo</td>
                                    <td>{this.state.package.github_repository ? this.state.package.github_repository : 'No GitHub repo identified'}</td>
                                </tr>
                                <tr>
                                    <td>GitHub Stars</td>
                                    <td>{this.state.package.stars ? this.state.package.stars : 'No GitHub repo identified'}</td>
                                </tr>
                                <tr>
                                    <td>Number of Files</td>
                                    <td>{this.state.package.numOfFiles}</td>
                                </tr>
                                <tr>
                                    <td>Number of Lines</td>
                                    <td>{this.state.package.numOfLines}</td>
                                </tr>
                                <tr>
                                    <td>Number of Dependencies</td>
                                    <td>
                                      {
                                        _.keys(this.state.package.latest_package_json.dependencies).length
                                      }
                                    </td>
                                </tr>
                                <tr>
                                    <td>Number of devDependencies</td>
                                    <td>
                                      {
                                      _.keys(this.state.package.latest_package_json.devDependencies).length
                                      }
                                      </td>
                                </tr>
                                <tr>
                                    <td>npms.io Maintenance</td>
                                    <td>{this.state.package.npmsio ? Number(100*this.state.package.npmsio.score.detail.maintenance).toFixed(2) : 'NA'}</td>
                                </tr>
                                <tr>
                                    <td>npms.io Popularity</td>
                                    <td>{this.state.package.npmsio ? Number(100*this.state.package.npmsio.score.detail.popularity).toFixed(2) : 'NA'}</td>
                                </tr>
                                <tr>
                                    <td>npms.io Quality</td>
                                    <td>{this.state.package.npmsio ? Number(100*this.state.package.npmsio.score.detail.quality).toFixed(2) : 'NA'}</td>
                                </tr>
                                <tr>
                                    <td>npms.io Overall</td>
                                    <td>{this.state.package.npmsio ? Number(100*this.state.package.npmsio.score.final).toFixed(2) : 'NA'}</td>
                                </tr>
                            </tbody>
                          </table>
                          {this.state.package.github_repository ?
                          <div>
                            <h2 className="subtitle is-6">eslint</h2>
                            <p className="is-size-7 has-text-grey">Runs the basic setup and the plugins: </p>
                            <h2 className="subtitle is-6">sonarjs</h2>
                            <h2 className="subtitle is-6">npm audit</h2>
                            <h2 className="subtitle is-6">jsinspect</h2>
                            <p className="is-size-7 has-text-grey">Threshold was set to 30.</p>
                            <h2 className="subtitle is-6">escomplex</h2>
                            <p className="is-size-7 has-text-grey">Metrics from ES5 js files only</p>
                          </div> : <div></div> }
                        </div>
                      ) :
                      (
                        <h5>This package was not crawled</h5>
                      )}
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
  
  export default Package;