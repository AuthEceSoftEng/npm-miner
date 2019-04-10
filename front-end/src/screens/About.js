import React, { Component } from 'react';

class About extends Component {
  render() {
    return (
        <section className="section">
            <div className="container">
                <div className="content">
                    <h1 className='title'>About</h1>
                    <p className='mb-10'>
                        <em>npm-miner</em>, is a platform that continuously crawls 
                        the <a href='https://www.npmjs.com/'>npm registry</a>, analyzing 
                        the quality of its packages against major quality characteristics 
                        such as maintainability and security, and provides a search engine 
                        for developers to query for specific npm packages and receive 
                        informative responses.
                    </p>
                    <h2 className='title is-6'>Tools and APIs</h2>
                    <p className='mb-10'>We gather data from the following tools and APIs:</p>
                    <ul>
                        <li>eslint</li>
                        <li>escomplex</li>
                        <li>npm audit</li>
                        <li>eslint-security-plugin</li>
                        <li>jsinspect</li>
                        <li>sonarjs</li>
                        <li>npms.io</li>
                        <li>GitHub</li>
                    </ul>
                    <h2 className='title is-6'>Paper &amp; Dataset</h2>
                    <p className='mb-10'>
                        For a more detailed read on the <em>npm-miner</em> one can read the following
                        publication:
                    </p>
                    <p className='mb-10'>
                        Kyriakos C. Chatzidimitriou, Michail Papamichail, Themistoklis Diamantopoulos, 
                        Michail Tsapanos, Andreas L. Symeonidis. "npm-miner: An Infrastructure for Measuring 
                        the Quality of the npm Registry", <em>MSR '18: 15th International Conference on 
                        Mining Software Repositories</em> (2018).
                        [<a href='http://assets.ctfassets.net/c5lel8y1n83c/60yvVyv8ekQqOAs8IICACi/2adf6dbf1160222d717ec3f07c381d30/msr2018.pdf'>PDF</a>] 
                        [<a href='https://doi.org/10.5281/zenodo.1165550'>Dataset</a>]
                        [<a href='https://github.com/AuthEceSoftEng/msr-2018-npm-miner'>Code</a>] 
                        [DOI: <a href='http://dx.doi.org/10.1145/3196398.3196465'>10.1145/3196398.3196465</a>]
                    </p>
                    <p className='mb-10'>
                        We have also built a dataset with 2000 of the most popular npm packages 
                        along with their analysis. The dataset can be found in the link below:
                    </p>
                    <p className='has-text-centered mb-10'>
                        <a href='https://doi.org/10.5281/zenodo.1165550'>https://doi.org/10.5281/zenodo.1165550</a>
                    </p>
                    <h2 className='title is-6'>Acknowledgements</h2>
                    <p className='mb-10'>
                        The project is deployed on the <a href='https://okeanos.grnet.gr/home/'>Okeanos IaaS</a>. 
                        The authors would like to thank <a href='https://grnet.gr/en/'>GRNET</a> for providing 
                        cloud resources to implement this project.
                    </p>
                </div>
            </div>
        </section>
    )}
  }
  
  export default About;