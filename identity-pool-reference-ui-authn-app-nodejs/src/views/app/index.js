// Simple, bare-bones Login UI Example
(() => {
  const queryParams = Object.fromEntries((new URLSearchParams(window.location.search)).entries());
  console.log(queryParams);

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitButton = document.getElementById('login-submit');

  const handleFetchResponse = (response) => {
    return response.json()
    .then(json => {
      if (response.ok) {
        return json;
      }
      if (response.status === 401) {
        return Promise.reject({error: ERRORS.UNAUTHORIZED});
      }
      return Promise.reject({error: ERRORS.ERROR, message: json.error_description || 'Unknown error'});
    });
  };

  const submitLogin = (identifier, password) => {
    const body = {
      identifier: identifier || '',
      password: password || '',
      loginId: queryParams.login_id || '',
      loginState: queryParams.login_state || '',
    };

    return window.fetch('/identifierpassword', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(handleFetchResponse)
    .then(data => {
      console.log('data', data)
      data.redirect_to
        ? location.href = data.redirect_to
        : window.alert('There was a problem logging in. Please try again.')
    })
    .catch(err => {
      console.log('Login error:', err);
    });
  };

  submitButton.addEventListener('click', () => {
    console.log('input values', emailInput.value, passwordInput.value);
    submitLogin(emailInput.value, passwordInput.value)
  }, false);

})(window);
