import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000
});

// ------------------------------------------------------------
// REQUEST INTERCEPTOR
// ------------------------------------------------------------

api.interceptors.request.use(
  (config) => {
    /*
     * Do not force Content-Type globally.
     *
     * Axios/browser should automatically set the correct
     * multipart boundary for FormData uploads.
     */

    if (
      config.data instanceof FormData
    ) {
      delete config.headers[
        'Content-Type'
      ];
    } else if (
      config.data &&
      !config.headers['Content-Type']
    ) {
      config.headers[
        'Content-Type'
      ] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------
// RESPONSE INTERCEPTOR
// ------------------------------------------------------------

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      'API Error:',
      error?.response?.data ||
        error?.message ||
        'Unknown API error'
    );

    return Promise.reject(error);
  }
);

export default api;