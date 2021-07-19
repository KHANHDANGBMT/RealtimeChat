export const getToken = () => {
  const caToken = JSON.parse(localStorage.getItem("ca.token"));
  return Boolean(caToken?.token);
};

export const getUsername = () => {
  const caToken = JSON.parse(localStorage.getItem("ca.token"));
  return caToken.userInfo.username;
};
