import { PROD_ENV } from "features/base/constants";

export const urlProtocol = (url) => {
  let theUrl = new URL(url);
  if (process.env.REACT_APP_NODE_ENV === PROD_ENV) {
    theUrl.protocol = "https:";
  }
  return theUrl;
};
