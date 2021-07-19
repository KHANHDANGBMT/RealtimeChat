import { Button, Form, Modal } from "react-bootstrap";
import React from "react";
import "./chat.css";
import { getToken, getUsername } from "../../utils/user";
import { Redirect } from "react-router-dom";
import { io } from "socket.io-client";

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.contentChat = React.createRef();
    this.state = {
      message: "",
      listMessage: [],
      socket: null,
      token: getToken(),
      userList: [],
      currentUserChat: {},
      currentMessage: [],
      username: getUsername(),
      // unReadMessage: [],
      showModelGroup: false,
      memberAddGroup: [],

      showModelCreateGroup: false,
      nameOfNewGroup: "",
      showModelJoinGroup: false,
      nameOfJoinGroup: "",

      listGroup: [],
      currentUserTyping: false,
      isGroupChat: false,
      notificationList: [],
    };
    this.socket = io(`localhost:5000?username=${getUsername()}`);
  }

  componentWillUnmount() {
    this.socket.removeAllListeners();
  }

  componentDidMount() {
    this.socket.emit("userList");
    this.socket.emit("groupList", { username: getUsername() });
    this.contentChat.current.scrollTop = this.contentChat.current.scrollHeight;

    this.socket.on("fetchMessageList", response => {
      if (
        (response.length &&
          this.state.currentUserChat.username === response[0]?.fromUser) ||
        this.state.currentUserChat.username === response[0]?.toUser
      ) {
        this.setState(
          {
            listMessage: response,
          },
          () => {
            this.scrollBottom();
          }
        );
      } else {
        let userCheck =
          response[0].fromUser === getUsername()
            ? response[0].toUser
            : response[0].fromUser;
        this.socket.emit("createNotificationUser", {
          fromUser: userCheck,
          toUser: getUsername(),
          isGroup: false,
          groupName: "",
        });
      }
    });

    this.socket.on("userList", response => {
      let userList = response.userList.filter(
        user => user.username !== this.state.username
      );
      this.setState(
        {
          userList: userList,
          currentUserChat: userList.length ? userList[0] : "",
        },
        () => {
          this.handleClickUserChat(userList.length ? userList[0] : "");
        }
      );
    });

    this.socket.on("groupList", response => {
      this.setState({ listGroup: response });
    });

    this.socket.on("sendMessageGroup", response => {
      this.socket.emit("getMessageGroup", response);
    });

    this.socket.on("getMessageGroup", response => {
      if (response.data.groupName === this.state.currentUserChat?.groupName) {
        this.setState({ listMessage: response.listMessageGroup }, () => {
          this.scrollBottom();
        });
      } else {
        this.socket.emit("createNotification", {
          fromUser: response.data.userSend,
          toUser: getUsername(),
          isGroup: true,
          groupName: response.data.groupName,
        });
      }
    });

    this.socket.emit("fetchNotificationList", {
      username: getUsername(),
    });

    this.socket.on("fetchNotificationList", response => {
      console.log(response.notificationList, "notification response");
      this.setState({ notificationList: response.notificationList });
    });
  }

  handleChangeMessage = event => {
    this.setState({ message: event.target.value });
  };

  handleKeyUp = e => {
    if (e.key === "Enter" || e.keyCode === 13) {
      this.sentMessage();
    }
  };

  sentMessage = async () => {
    if (this.state.currentUserChat?.groupName) {
      console.log(this.state.message, "group send");
      await this.socket.emit("sendMessageGroup", {
        ...this.state.currentUserChat,
        message: this.state.message,
        userSend: getUsername(),
        date: new Date().getTime(),
      });
      await this.setState({
        message: "",
        isGroupChat: true,
      });
    } else {
      await this.socket.emit("sendMessage", {
        message: this.state.message,
        fromUser: this.state.username,
        toUser: this.state.currentUserChat.username,
        toUserId: this.state.currentUserChat._id,
        date: new Date().getTime(),
      });
      await this.setState({ message: "", isGroupChat: false });
    }
  };

  handleClickUserChat = async user => {
    if (user.groupName) {
      await this.socket.emit("getMessageGroup", user);
      this.state.notificationList.forEach(notification => {
        if (notification.groupName === user.groupName) {
          this.socket.emit("turnOffNotification", { notification });
        }
      });
      this.setState({ currentUserChat: user });
    } else {
      console.log("not group");
      if (this.state.currentUserChat.username + "" !== user.username) {
        await this.setState({
          currentUserChat: user,
          listMessage: [],
        });
        await this.state.notificationList.forEach(notification => {
          if (notification.fromUser === user.username) {
            this.socket.emit("turnOffNotification", { notification });
          }
        });
        await this.socket.emit("getMessage", {
          fromUser: getUsername(),
          toUser: user.username,
          message: "",
        });
      }
    }
  };

  logout = () => {
    localStorage.removeItem("ca.token");
    this.props.history.push("/login");
  };

  // scroll to bottom of chat
  scrollBottom = () => {
    this.contentChat.current.scrollTop = this.contentChat.current.scrollHeight;
  };

  showModelGroup = () => {
    this.setState({ showModelGroup: true });
  };

  handleCloseModelGroup = () => {
    this.setState({ showModelGroup: false, memberAddGroup: [] });
  };

  handleClickAddMember = event => {
    console.log(event);
    let listMember = this.state.memberAddGroup;
    if (listMember.indexOf(event.target.id) === -1) {
      listMember.push(event.target.id);
      this.setState({ memberAddGroup: listMember });
    } else {
      listMember.splice(listMember.indexOf(event.target.id), 1);
      this.setState({ memberAddGroup: listMember });
    }
  };

  handleSaveModelGroup = () => {
    console.log(this.state.memberAddGroup);
    this.socket.emit("createGroup", this.state.memberAddGroup, () => {
      this.setState({ memberAddGroup: [], showModelGroup: false });
    });
  };

  handleCreateGroup = () => {
    this.socket.emit("createGroup", {
      groupName: this.state.nameOfNewGroup,
      usernameCreateGroup: getUsername(),
    });
    this.socket.on("createGroup", response => {
      this.socket.emit("groupList", { username: getUsername() });
    });
    this.setState({ nameOfNewGroup: "", showModelCreateGroup: false });
  };

  handleCloseModelGroup = () => {
    this.setState({
      showModelCreateGroup: false,
      nameOfNewGroup: "",
    });
  };

  handleTypeNameOfGroup = event => {
    this.setState({ nameOfNewGroup: event.target.value }, () => {
      console.log(this.state.nameOfNewGroup);
    });
  };

  handleTypeJoinGroup = event => {
    this.setState({ nameOfJoinGroup: event.target.value });
  };

  handleCloseJoinGroup = () => {
    this.setState({ showModelJoinGroup: false, nameOfJoinGroup: "" });
  };

  handleJoinGroup = async () => {
    await this.socket.emit("joinGroup", {
      groupId: this.state.nameOfJoinGroup,
      usernameJoin: getUsername(),
    });
    await this.socket.emit("groupList", { username: getUsername() });
    await this.setState({ nameOfJoinGroup: "", showModelJoinGroup: false });
  };

  render() {
    // Redirect if user  no login
    if (!getToken()) {
      return <Redirect from="/chat" to="/login" exact />;
    }

    // prepare list user
    let listChat;
    let unreadUser;
    if (this.state.userList.length) {
      console.log(this.state.userList, "userList cua list chat");
      console.log(this.state.notificationList, "notification list");
      listChat = this.state.userList.map((user, index) => {
        if (this.state.notificationList.length) {
          this.state.notificationList.forEach(notification => {
            let userCheck =
              notification.fromUser === getUsername()
                ? notification.toUser
                : notification.fromUser;
            if (userCheck === user.username && !notification.isGroup) {
              unreadUser = (
                <div className="notification" style={{ color: "red" }}></div>
              );
            }
          });
        }
        return (
          <div
            className="list-group-item list-group-item-action border-0 wrap-list"
            onClick={() => this.handleClickUserChat(user)}
            key={index}
          >
            {/* {checkUnreadMessage} */}
            {unreadUser}
            <div className="d-flex align-items-start">
              <img
                src="https://bootdey.com/img/Content/avatar/avatar5.png"
                className="rounded-circle mr-1"
                alt="Vanessa Tucker"
                width="40"
                height="40"
              />
              <div className="flex-grow-1 ml-3">
                {user.username}
                <div className="small">
                  <span className="fas fa-circle chat-online"></span> Online
                </div>
              </div>
            </div>
          </div>
        );
      });
    }
    let listGroup;
    if (this.state.listGroup.length) {
      listGroup = this.state.listGroup.map((group, index) => {
        let unreadMessage;
        if (this.state.notificationList.length) {
          this.state.notificationList.map(notification => {
            if (
              notification.groupName === group.groupName &&
              group.groupName !== this.state.currentUserChat.groupName &&
              notification.isGroup
            ) {
              unreadMessage = (
                <div className="notification" style={{ color: "red" }}></div>
              );
            }
          });
        }
        return (
          <div
            className="list-group-item list-group-item-action border-0 wrap-list"
            onClick={() => this.handleClickUserChat(group)}
            key={index}
          >
            {/* {checkUnreadMessage} */}
            {unreadMessage}
            <div className="d-flex align-items-start">
              <img
                src="https://bootdey.com/img/Content/avatar/avatar4.png"
                className="rounded-circle mr-1"
                alt="Vanessa Tucker"
                width="40"
                height="40"
              />
              <div className="flex-grow-1 ml-3">
                {group.groupName}
                <div className="small">
                  <span className="fas fa-circle chat-online"></span> Online
                </div>
              </div>
            </div>
          </div>
        );
      });
    }

    // prepare list chat of each user
    let showListMessage;
    if (this.state.listMessage?.length) {
      showListMessage = this.state.listMessage.map((message, index) => {
        if (message.fromUser === getUsername()) {
          return (
            <div className="chat-message-right pb-4" key={index}>
              <div>
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar1.png"
                  className="rounded-circle mr-1"
                  alt="Chris Wood"
                  width="40"
                  height="40"
                />
                <div className="text-muted small text-nowrap mt-2">
                  {new Date(Number(message.date)).getHours()}:
                  {new Date(Number(message.date)).getMinutes()}
                </div>
              </div>
              <div
                className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3"
                style={{
                  textAlign: "right",
                }}
              >
                <div className="font-weight-bold mb-1">You</div>
                {message.message}
              </div>
            </div>
          );
        } else {
          return (
            <div className="chat-message-left pb-4" key={index}>
              <div>
                <img
                  src="https://bootdey.com/img/Content/avatar/avatar3.png"
                  className="rounded-circle mr-1"
                  alt="Sharon Lessman"
                  width="40"
                  height="40"
                />
                <div className="text-muted small text-nowrap mt-2">
                  {new Date(Number(message.date)).getHours()}:
                  {new Date(Number(message.date)).getMinutes()}
                </div>
              </div>
              <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                <div className="font-weight-bold mb-1">{message.fromUser}</div>
                {message.message}
              </div>
            </div>
          );
        }
      });
    } else {
      showListMessage = [
        <div>
          <p style={{ textAlign: "center" }}>Start chatting now... 😀</p>
        </div>,
      ];
    }
    return (
      <div className="content">
        <Modal
          show={this.state.showModelCreateGroup}
          onHide={() => {
            this.setState({ showModelCreateGroup: false });
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Create new Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              className="form-control my-3"
              placeholder="Type name of new group here..."
              value={this.state.nameOfNewGroup}
              onChange={this.handleTypeNameOfGroup}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleCloseModelGroup}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleCreateGroup}>
              Create group
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={this.state.showModelJoinGroup}
          onHide={() => {
            this.setState({ showModelJoinGroup: false });
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Join Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              className="form-control my-3"
              placeholder="Type ID of group here..."
              value={this.state.nameOfJoinGroup}
              onChange={this.handleTypeJoinGroup}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleCloseJoinGroup}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleJoinGroup}>
              Join group
            </Button>
          </Modal.Footer>
        </Modal>
        <div className="container p-0">
          <div className="header-container">
            <h1 className="title">PSCD</h1>
            <Button onClick={this.logout}>Log out</Button>
          </div>
          <div className="card">
            <div className="row g-0">
              <div
                className="col-12 col-lg-5 col-xl-3 border-right"
                style={{ paddingRight: "0px" }}
              >
                <div className="px-4 d-none d-md-block">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <input
                        type="text"
                        className="form-control my-3"
                        placeholder="Search..."
                      />
                      <button
                        className="group-button"
                        onClick={() =>
                          this.setState({ showModelCreateGroup: true })
                        }
                      >
                        Create group
                      </button>
                      <button
                        className="group-button"
                        onClick={() => {
                          this.setState({ showModelJoinGroup: true });
                        }}
                      >
                        Join group
                      </button>
                    </div>
                  </div>
                </div>
                <div className="list-chat">
                  {listChat} {listGroup}
                </div>
                <hr className="d-block d-lg-none mt-1 mb-0" />
              </div>
              <div
                className="col-12 col-lg-7 col-xl-9"
                style={{ paddingRight: "15px" }}
              >
                <div className="py-2 px-4 border-bottom d-none d-lg-block">
                  <div className="d-flex align-items-center py-1">
                    <div className="position-relative">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar3.png"
                        className="rounded-circle mr-1"
                        alt="Sharon Lessman"
                        width="40"
                        height="40"
                      />
                    </div>
                    <div className="flex-grow-1 pl-3">
                      <strong>
                        {this.state.currentUserChat.username
                          ? this.state.currentUserChat.username
                          : this.state.currentUserChat?.groupName}
                      </strong>
                      <div className="text-muted small">
                        <em>Typing...</em>
                      </div>
                    </div>
                    <div>
                      {this.state.currentUserChat?.groupName ? (
                        <div>{this.state.currentUserChat._id}</div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
                <div className="position-relative">
                  <div
                    className="chat-messages p-4"
                    id="content-chat"
                    ref={this.contentChat}
                    style={{ height: "600px" }}
                  >
                    {showListMessage}
                  </div>
                </div>
                <div className="flex-grow-0 py-3 px-4 border-top">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message"
                      value={this.state.message}
                      onChange={this.handleChangeMessage}
                      onKeyUp={this.handleKeyUp}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={this.sentMessage}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Chat;
