import React from "react";
import "./login.css";
import api from "../../services/User";
import { getToken } from "../../utils/user";
import { Redirect } from "react-router-dom";
import { toast } from "react-toastify";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      rememberMe: false,
    };
  }

  handleSubmit = event => {
    api
      .loginUser({
        username: this.state.username,
        password: this.state.password,
      })
      .then(res => {
        if (res.token) {
          this.props.setToken(res.token);
          let caToken = {
            token: res.token,
            userInfo: { username: this.state.username },
          };
          localStorage.setItem("ca.token", JSON.stringify(caToken));
          this.props.history.push("/chat", { state: "sample data" });
        }
      })
      .catch(error => {
        // console.log(error.response.status);
        if (error.response.status === 403) {
          console.log("error toast");
          toast.error("Invalid Username or Password", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      });
    // event.preventDefault();
  };

  handleChangeUsername = event => {
    this.setState({ username: event.target.value });
  };

  handleChangePassword = event => {
    this.setState({ password: event.target.value });
  };

  handleChangeRememberMe = event => {
    this.setState({ rememberMe: event.target.checked });
  };

  render() {
    return (
      <div className="login">
        {getToken() ? <Redirect from="/login" to="/chat" exact /> : ""}
        <form onSubmit={this.handleSubmit}>
          <h3>Log in</h3>

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
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck1"
                onChange={this.handleChangeRememberMe}
              />
              <label className="custom-control-label" htmlFor="customCheck1">
                Remember me
              </label>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-dark btn-lg btn-block"
            onClick={this.handleSubmit}
          >
            Log in
          </button>
        </form>
        <a href="/register" style={{ display: " block", marginTop: "10px" }}>
          Register
        </a>
      </div>
    );
  }
}

export default Login;
