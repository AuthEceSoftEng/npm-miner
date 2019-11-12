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
                                    <td>{this.state.package.github && this.state.package.github.repository ? this.state.package.github.repository : 'No GitHub repo identified'}</td>
                                </tr>
                                <tr>
                                    <td>GitHub Stars</td>
                                    <td>{this.state.package.github && this.state.package.github.stars ? this.state.package.github.stars : 'No GitHub repo identified'}</td>
                                </tr>
                                <tr>
                                    <td>Downloads (Last 30 days when analyzed)</td>
                                    <td>{this.state.package.npmsjs ? this.state.package.npmsjs.downloads : 'NA'}</td>
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
                                        _.keys(this.state.package.dependencies).length
                                      }
                                    </td>
                                </tr>
                                <tr>
                                    <td>Number of devDependencies</td>
                                    <td>
                                      {
                                      _.keys(this.state.package.devDependencies).length
                                      }
                                      </td>
                                </tr>
                                <tr>
                                    <td>npms.io Maintenance</td>
                                    <td>{this.state.package.npmsio_analysis && this.state.package.npmsio_analysis.score ? Number(100*this.state.package.npmsio_analysis.score.detail.maintenance).toFixed(2) : 'NA'}</td>
                                </tr>
                                <tr>
                                    <td>npms.io Popularity</td>
                                    <td>{this.state.package.npmsio_analysis && this.state.package.npmsio_analysis.score ? Number(100*this.state.package.npmsio_analysis.score.detail.popularity).toFixed(2) : 'NA'}</td>
                                </tr>
                                <tr>
                                    <td>npms.io Quality</td>
                                    <td>{this.state.package.npmsio_analysis && this.state.package.npmsio_analysis.score ? Number(100*this.state.package.npmsio_analysis.score.detail.quality).toFixed(2) : 'NA'}</td>
                                </tr>
                                <tr>
                                    <td>npms.io Overall</td>
                                    <td>{this.state.package.npmsio_analysis && this.state.package.npmsio_analysis.score ? Number(100*this.state.package.npmsio_analysis.score.final).toFixed(2) : 'NA'}</td>
                                </tr>
                            </tbody>
                          </table>
                          {this.state.package.github_repository ?
                          <div>
                            <h2 className="subtitle is-6">Directory analysis</h2>
                            <ul>
                              <li>Maximum directory depth: {!isNaN(this.state.package.maxDirDepth) ? this.state.package.maxDirDepth : 'NA'}</li>
                              <li>Minimum directory depth: {!isNaN(this.state.package.minDirDepth) ? this.state.package.minDirDepth : 'NA'}</li>
                            </ul>
                            <h2 className="subtitle is-6">eslint</h2>
                            {this.state.package.eslint ?
                            <ul>
                              <li>Errors: {this.state.package.eslint.errorCount || 'NA'}</li>
                              <li>Warnings: {this.state.package.eslint.warningCount || 'NA'}</li>
                              <li>Details:</li>
                              <ul>{Object.entries(this.state.package.eslint.typesAndCounts).map(([key, val]) => ({ key, val })).map(issue => {
                                return <li key={issue.key}>{issue.key}: {issue.val}</li>
                                })}
                              </ul>
                            </ul> : <p>No eslint analysis</p>}
                            <h2 className="subtitle is-6">escomplex</h2>
                            {this.state.package.escomplex ?
                            <ul>
                              <li>Cyclomatic Complexity: {Number(this.state.package.escomplex.cyclomatic).toFixed(2) || 'NA'}</li>
                              <li>Maintainability Index: {Number(this.state.package.escomplex.maintainability).toFixed(2) || 'NA'}</li>
                              <li>Parameters: {Number(this.state.package.escomplex.params).toFixed(2) || 'NA'}</li>
                              <li>Effort: {Number(this.state.package.escomplex.effort).toFixed(2) || 'NA'}</li>
                              <li>Total Lines of Code Logical: {this.state.package.escomplex.tlocl || 'NA'}</li>
                              <li>Total Lines of Code Physical: {this.state.package.escomplex.tlocp || 'NA'}</li>
                            </ul> : <p>No escomplex analysis</p>}
                            <p className="is-size-7 has-text-grey">Metrics from ES5 js files only</p>
                            <h2 className="subtitle is-6">npm audit</h2>
                            {this.state.package.npmaudit ?
                            <p>Vulnerabilities: {this.state.package.npmaudit.results.actions.length}</p>
                            : <p>No npm audit analysis</p>}
                            <h2 className="subtitle is-6">jsinspect</h2>
                            {this.state.package.jsinspect ?
                            <div>
                              <p>Duplicates: {this.state.package.jsinspect.duplicates}</p>
                              <p className="is-size-7 has-text-grey">Threshold was set to 30.</p>
                            </div>
                            : <p>No jsinspect analysis</p>}
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