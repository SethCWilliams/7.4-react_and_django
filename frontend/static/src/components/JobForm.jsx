import React, {Component} from "react";
import PropTypes from "prop-types";


class JobForm extends Component {
  state = {
    status: "",
    name: "",
    message: ""
  };

  handleChange = e => {
    this.setState({[e.target.name]: e.target.value});
  };

  handleSubmit = e => {
    e.preventDefault();

    const {status, name, message} = this.state;
    const job = {status, name, message};

    this.props.addJob(job);
    this.setState({status: '', name: '', message: ''});
  };

  render() {
    const {status, name, message} = this.state;

    return (
      <div className="column">
        <form onSubmit={this.handleSubmit}>

          <div className="field">
            <label className="label">Status</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="status"
                onChange={this.handleChange}
                value={status}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="name"
                onChange={this.handleChange}
                value={name}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Message</label>
            <div className="control">
              <textarea
                className="textarea"
                type="text"
                name="message"
                onChange={this.handleChange}
                value={message}
                required
              />
            </div>
          </div>

          <div className="control">
            <button type="submit" className="button is-info">
              Send message
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default JobForm;