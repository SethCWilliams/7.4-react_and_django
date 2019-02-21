import React from "react";
import PropTypes from "prop-types";


function JobTable(props){
  var jobs = props.jobs;

  return !jobs.length ? (
    <p>No jobs</p>
  ) : (
    <div className="column">
      <h2 className="subtitle">
        Showing <strong>{jobs.length} items</strong>
      </h2>

      <table className="table is-striped">
        <thead>
          <tr>
            {Object.entries(jobs[0]).map(el => <th key={el[0]}>{el[0]}</th>)}
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              {Object.entries(job).map(el => <td key={`${job.id}-${el[0]}`}>{el[1]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

JobTable.propTypes = {
  jobs: PropTypes.array.isRequired
};

export default JobTable;
