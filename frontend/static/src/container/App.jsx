import React, { Component } from 'react';
import JobTable from '../components/JobTable.jsx';
import JobForm from '../components/JobForm.jsx';


class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      loaded: false,
      placeholder: 'Loading...',
      jobs: []
    };
  }

  componentDidMount(){
    // For development we will run django AND npm start
    // Django will run on port 8000 while react will run on port 3000
    // We need our API calls to point to django, so we will use process.env.REACT_APP_API_HOST
    // process.env.REACT_APP_API_HOST is set using a .env.development file.
    // https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables

    fetch(`${process.env.REACT_APP_API_HOST}/api/job/`).then((response) => {
      if (response.status !== 200) {
        return this.setState({placeholder: "Something went wrong"});
      }

      return response.json();
    }).then((data) => {
      this.setState({jobs: data, loaded: true});
    });
  }

  addJob = (job) => {
    // Optimistically add the job to the jobs array on the state
    // const {jobs} = this.state;
    // jobs.push(job);
    // this.setState({jobs: jobs});

    const conf = {
      method: "post",
      body: JSON.stringify(job),
      headers: new Headers({"Content-Type": "application/json"})
    };

    fetch(`${process.env.REACT_APP_API_HOST}/api/job/`, conf).then((response) => {
      if (response.status !== 201) {
        // There was an error so roll back the state
        // var jobs = this.state.jobs;
        // jobs.pop();
        // return this.setState({placeholder: "Something went wrong", jobs: jobs});

        return this.setState({placeholder: "Something went wrong"});
      }

      return response.json();
    }).then((job) => {
      const {jobs} = this.state;
      jobs.push(job);
      this.setState({jobs: jobs});
    });
  };

  render() {
    if(!this.state.loaded){
      var loadingMessage = <p className="alert-danger">{this.state.placeholder}</p>;
    }else{
      var loadingMessage = null;
    }

    return (
      <div className="App">

        {loadingMessage}

        <h1>Print Jobs</h1>

        <JobForm addJob={this.addJob}/>

        <hr/>

        <h2>Create a Print Job</h2>

        <h2>Print Queue</h2>

        <JobTable jobs={this.state.jobs}/>
      </div>
    );
  }
}

export default App;
