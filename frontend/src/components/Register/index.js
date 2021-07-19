import React from "react";
import "./register.css";
import api from "../../services/User";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Redirect } from "react-router-dom";
import { getToken } from "../../utils/user";
class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      confirmPassword: "",
    };
  }
  componentDidMount() {}

  handleSubmit = event => {
    if (this.state.username) {
      if (this.state.password === this.state.confirmPassword) {
        api
          .createUser({
            username: this.state.username,
            password: this.state.password,
          })
          .then(res => {
            if (res.token) {
              let caToken = {
                token: res.token,
                userInfo: { username: this.state.username },
              };
              localStorage.setItem("ca.token", JSON.stringify(caToken));
              this.props.history.push("/chat", { state: "sample data" });
              // this.props.setUsername(res.username);
            }
          });
      } else {
        toast.error("Password not match", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } else {
      toast.error("Please enter username", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    event.preventDefault();
  };
  handleChangeUsername = event => {
    this.setState({ username: event.target.value });
  };
  handleChangePassword = event => {
    this.setState({ password: event.target.value });
  };
  handleConfirmPassword = event => {
    this.setState({ confirmPassword: event.target.value });
  };
  render() {
    return (
      <div className="login">
        {getToken() ? <Redirect from="/register" to="/chat" exact /> : ""}
        <ToastContainer />
        <form onSubmit={this.handleSubmit}>
          <h3>Register</h3>

          <div className="form-group">
            <label>Username</label>
            <input
              type="username"
              className="form-control"
              placeholder="Enter username"
              value={this.state.username}
              onChange={this.handleChangeUsername}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={this.state.password}
              onChange={this.handleChangePassword}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={this.state.confirmPassword}
              onChange={this.handleConfirmPassword}
            />
          </div>

          <button
            type="button"
            className="btn btn-dark btn-lg btn-block"
            onClick={this.handleSubmit}
            style={{ marginTop: "40px" }}
          >
            Register
          </button>
        </form>
      </div>
    );
  }
}

export default Register;
