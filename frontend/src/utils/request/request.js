import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 20000,
  headers: {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

const request = option => {
  return instance;
};

export default request;
