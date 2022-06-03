'use strict';

class ErrorService {

  handleAcpApiError (err) {
    const error = err?.response?.data || (err?.status_code && err?.error && err?.details ? err : {});

    return Promise.reject({
      status_code: error.status_code || 500,
      error: error.error || 'internal server error',
      details: error.details || 'an unexpected error occured'
    });
  }

  sendErrorResponse (err, res) {
    if (!res || typeof res.send !== 'function') {
      throw new Error('Could send response because res.send is not a function!');
    }

    res.status(err.status_code || 500);
    res.send(JSON.stringify({
      status_code: err.status_code || 500,
      error: err.error || '',
      details: err.details
    }));
  }
}

module.exports = new ErrorService();
