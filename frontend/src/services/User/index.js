import request from "../../utils/request/request";

const createUser = params => {
  return new Promise((rs, rj) => {
    request()
      .post(`/create-user`, {
        username: params.username,
        password: params.password,
      })
      .then(res => rs(res.data));
  });
};

const loginUser = params => {
  return new Promise((rs, rj) => {
    request()
      .post(`/login`, {
        username: params.username,
        password: params.password,
      })
      .then(res => rs(res.data))
      .catch(error => rj(error));
  });
};
const api = { createUser, loginUser };
export default api;
