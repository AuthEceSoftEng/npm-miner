import React from 'react'
import { Link } from 'react-router-dom';

const TopTen = (props) => (
    <div className="card">
        <header className="card-header has-text-centered">
            <p className="card-header-title">
            Top 10 Starred GitHub Repos
            </p>
        </header>
        <div className="card-content">
            <div className="content is-size-7 p-5">
                <table className="table">
                    <thead>
                        <tr>
                            <th><abbr title="Position">#</abbr></th>
                            <th>Package Name</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        { 
                            props.packages.map((p, index) => {
                            return <tr key={p._id}>
                                        <th>{(index + 1)}</th>
                                        <td><Link to={`/package/${p.name}`}><span>{p.name}</span></Link></td>
                                        <td>{p.stars}</td>
                                    </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
)

export default TopTen