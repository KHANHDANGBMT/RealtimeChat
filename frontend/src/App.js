import React from "react";
import "./App.css";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";

import Login from "./components/Login";
import Chat from "./components/Chat";
import Background from "./components/Background";
import Register from "./components/Register";
import { getToken } from "./utils/user";
import { ToastContainer } from "react-toastify";
import Chats from "./components/Chats";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.wrapper = React.createRef();

    this.state = {
      token: "",
    };
  }
  changeModalShow() {
    this.setState({ modalShow: false });
  }
  componentDidMount() {
    const token = localStorage.getItem("ca.token");
    this.setState({ token });
  }

  setToken = token => {
    this.setState({ token });
  };

  render() {
    if (!getToken()) {
      return (
        <div>
          <ToastContainer />
          <Switch>
            <Route path="/login" exact>
              <Background>
                <Login setToken={this.setToken} history={this.props.history} />
              </Background>
            </Route>
            <Route path="/register" exact>
              <Background>
                <Register history={this.props.history} setToken={this.token} />
              </Background>
            </Route>
            <Redirect from="/" to="/login" exact />
          </Switch>
        </div>
      );
    } else {
      return (
        <div>
          <ToastContainer />
          <Switch>
            <Route path="/login" exact>
              <Background>
                <Login history={this.props.history} setToken={this.setToken} />
              </Background>
            </Route>
            <Route path="/chat" exact>
              <Background>
                <Chat token={this.state.token} history={this.props.history} />
              </Background>
            </Route>
            {/* <Route path="/chats" exact>
              <Background>
                <Chats token={this.state.token} history={this.props.history} />
              </Background>
            </Route> */}
            <Route path="/register" exact>
              <Background>
                <Register history={this.props.history} setToken={this.token} />
              </Background>
            </Route>

            <Redirect from="/" to="/chat" exact />
          </Switch>
        </div>
      );
    }
  }
}
export default withRouter(App);
