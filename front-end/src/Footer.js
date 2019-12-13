import React from 'react'
import GitHubButton from 'react-github-btn'

const Footer = () => (
    <footer className="footer">
        <div className="container">
            <div className="content has-text-centered">
                <p>Maintainer: <a href='https://github.com/kyrcha'>Kyriakos Chatzidimitriou</a> | <a href='https://github.com/kyrcha/npm-miner/issues'>Issues</a></p>
                <p><GitHubButton href="https://github.com/kyrcha/npm-miner" data-icon="octicon-star" data-show-count="true" aria-label="Star kyrcha/npm-miner on GitHub">Star</GitHubButton></p>
            </div>
        </div>
    </footer>
)

export default Footer
