import {useState, useEffect} from 'react';

export const useAuth = (auth) => {
  const [authenticated, setAuthentication] = useState(null);

  function removeQueryString() {
    const locationWithQuery = window.location.href.split('?');
    if (locationWithQuery.length > 1 && !(locationWithQuery[0].split('/login').length > 1)) {
      window.history.replaceState({}, document.title, window.location.href.replace(/\?.*$/, ''));
    }
  };

  useEffect(() => {
    auth.getAuth().then((res) => {
      if (res) {
        console.log('auth response:', JSON.stringify(res));
        removeQueryString();
      }
      setAuthentication(true);
    })
    .catch((_authErr) => {
      setAuthentication(false);
      if (window.location.href.split('?error').length > 1) {
        if (authenticated === false) {
          window.alert('The authorization server returned an error.');
        }
      } else {
        removeQueryString();
      }
    });
  });

  return [authenticated];
};
