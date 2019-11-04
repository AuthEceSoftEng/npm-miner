import React from 'react'
import { Link } from 'react-router-dom';
import NumberFormat from 'react-number-format';

const TopTen = (props) => (
    <div className="card">
        <header className="card-header has-text-centered">
            <p className="card-header-title">
            {props.title}
            </p>
        </header>
        <div className="card-content">
            <div className="content is-size-7 p-5">
                <table className="table">
                    <thead>
                        <tr>
                            <th><abbr title="Position">#</abbr></th>
                            <th>{props.name}</th>
                            <th>{props.score}</th>
                        </tr>
                    </thead>
                    <tbody>
                        { 
                            props.packages.map((p, index) => {
                            return <tr key={p._id}>
                                        <th>{(index + 1)}</th>
                                        <td><span>{p.name}</span></td>
                                        <td><NumberFormat value={p.score} displayType={'text'} thousandSeparator={true} /></td>
                                    </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
)

export default TopTen