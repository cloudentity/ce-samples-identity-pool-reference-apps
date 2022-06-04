import superagent from 'superagent';
import authConfig from '../authConfig';

const getTokenFromStore = () => localStorage.getItem(authConfig.accessTokenName);

export const toJson = response => response.text ? JSON.parse(response.text) : {};

const normalize = path => path.replace(/\/\/+/g, '/');

const buildUrl = (origin, base, path) => origin + normalize(base + '/' + path);

const accessTokenHeader = () => ['Authorization', `Bearer ${getTokenFromStore()}`];

const http = (request, origin, baseUrl) => ({
  get: ({url, query = null, responseType = null, callback = toJson}) => request
    .get(buildUrl(origin, baseUrl, url))
    .query(query)
    .responseType(responseType)
    .set(...accessTokenHeader())
    .then(callback),
  post: ({url, body, query}) => request
    .post(buildUrl(origin, baseUrl, url))
    .query(query)
    .send(body)
    .set(...accessTokenHeader())
    .then(toJson),
  put: ({url, body}) => request
    .put(buildUrl(origin, baseUrl, url))
    .send(body)
    .set(...accessTokenHeader())
    .then(toJson),
  delete: ({url, query}) => request
    .delete(buildUrl(origin, baseUrl, url))
    .query(query)
    .set(...accessTokenHeader())
    .then(toJson)
});

export default http(superagent, window.location.origin, '/api');

export const base = http(superagent, window.location.origin, '/api');
export const authAppBase = http(superagent, 'http://localhost:5003', '');
