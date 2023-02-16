import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PageContent from './common/PageContent';
import PageToolbar from './common/PageToolbar';

import { api } from '../api/api';
import {validators} from './forms/validation';
import {useFormFactory} from './forms/formFactory';

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    height: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginCard: {
    padding: '15px 25px',
    [theme.breakpoints.up('sm')]: {
      padding: '30px 50px',
    }
  },
  loginInputsWrapper: {
    marginTop: 25
  },
  loginInputs: {
    width: 300,
    [theme.breakpoints.up('sm')]: {
      width: 400,
    }
  },
  loginInputSubmit: {
    width: 300,
    marginTop: 20,
    [theme.breakpoints.up('sm')]: {
      width: 400,
    }
  },
  subContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  textColor: {
    color: theme.palette.secondary.main,
  },
  loginButton: {
    color: '#fff',
    background: theme.palette.primary.main,
    marginTop: 30,
    padding: '10px 20px',
    '&:hover': {
      color: theme.palette.primary.main,
    }
  },
  registerPromptText: {
    marginTop: 30
  },
  registerPromptLink: {
    color: theme.palette.primary.main
  }
}));

const Unauthorized = ({className, auth, role, handleLogin}) => {
  const classes = useStyles();

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const queryParams = Object.fromEntries((new URLSearchParams(window.location.search)).entries());
  const loginRedirect = !!(
    queryParams.client_id &&
    queryParams.idp_client_id &&
    queryParams.login_id &&
    queryParams.login_state &&
    queryParams.server_id &&
    queryParams.tenant_url
  );

  const formFactory = useFormFactory({
    id: 'create-user',
    data: {},
    formIsActive: loginRedirect
  });

  const handleSubmitLogin = (formData) => {
    const payload = {
      ...formData,
      loginId: queryParams.login_id,
      loginState: queryParams.login_state
    };

    api.identifierPasswordLogin(payload)
      .then(res => {
        res.redirect_to
          ? window.location.href = res.redirect_to
          : window.alert('There was a problem logging in. Please try again.')
      })
      .catch((err) => {
        console.log('Login error', err);
        window.alert('There was a problem logging in. Please try again.');
      });
  };

  const handleSubmitRegister = (formData) => {
    const payload = {
      identifiers: [
        {
          identifier: formData.identifier,
          type: 'email'
        }
      ],
      payload: {
        given_name: formData.firstName,
        family_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`
      },
      verifiable_addresses: [
        {
          address: formData.identifier,
          status: 'active',
          type: 'email',
          verified: false
        }
      ],
      metadata: null,
      status: 'new',
      credentials: []
    };

    api.selfRegisterUser(payload)
      .then(() => {
        setRegistrationSuccess(true);
      })
      .catch((err) => {
        console.log('Register error', err);
        window.alert('There was a problem registering. Please try again.');
      });
  };

  return (
    <div style={{ position: 'relative' }}>
      <PageToolbar
        mode="dialog"
        authorizationServerURL={'authorizationServerURL'}
        authorizationServerId={'authorizationServerId'}
        tenantId={'tenantId'}
      />
      <PageContent>
        {auth === null && <div>Loading...</div>}
        {auth === false && (
          <div className={classes.mainContainer}>
            <Card className={classes.loginCard}>
              <div className={classes.subContainer}>
                <div className={`${classes.subContainer} ${classes.textColor}`}>
                  <Typography variant="h5" component="h2">
                    {role === 'register'
                      ? (registrationSuccess ? 'Check your email' : 'Let\'s get started')
                      : 'Welcome!'
                    }
                  </Typography>
                  <Typography>
                    {role === 'register'
                      ? (registrationSuccess ? 'An activation link has been sent to the email you provided.' : 'You\'re just a couple steps from creating your account.')
                      : 'Log in to manage your account.'
                    }
                  </Typography>
                </div>
                {role === 'register' ? (
                  <>
                    {registrationSuccess ? (
                      <Button color="primary" onClick={handleLogin} className={classes.loginButton}>
                        Back to Login
                      </Button>
                    ) : (
                      <div className={classes.loginInputsWrapper}>
                        {formFactory.createRequiredField({
                          name: 'firstName',
                          label: 'First Name',
                          validate: {},
                          className: classes.loginInputs,
                          type: 'text'
                        })}
                        {formFactory.createRequiredField({
                          name: 'lastName',
                          label: 'Last Name',
                          validate: {},
                          className: classes.loginInputs,
                          type: 'text'
                        })}
                        {formFactory.createRequiredField({
                          name: 'identifier',
                          label: 'Email',
                          validate: {
                            validEmail: validators.validEmail({ label: 'Input' }),
                          },
                          className: classes.loginInputs
                        })}

                        <div style={{marginBottom: 20}}>
                          {formFactory.createFormFooter({
                            onSubmit: handleSubmitRegister,
                            submitText: 'Submit',
                            align: 'center',
                            className: classes.loginInputSubmit
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {loginRedirect ? (
                      <div className={classes.loginInputsWrapper}>
                        {formFactory.createRequiredField({
                          name: 'identifier',
                          label: 'Email',
                          validate: {
                            validEmail: validators.validEmail({ label: 'Input' }),
                          },
                          className: classes.loginInputs
                        })}
                        {formFactory.createRequiredField({
                          name: 'password',
                          label: 'Password',
                          toggleVisibility: true,
                          defaultVisibility: false,
                          validate: {},
                          className: classes.loginInputs
                        })}

                        <div style={{marginBottom: 20}}>
                          {formFactory.createFormFooter({
                            onSubmit: handleSubmitLogin,
                            submitText: 'Login',
                            align: 'center',
                            className: classes.loginInputSubmit
                          })}
                        </div>
                        <div className={classes.registerPromptText}>
                          <span>No account? </span>
                          <Link className={classes.registerPromptLink} to={'/register'} reloadDocument>Sign up here</Link>
                        </div>
                      </div>
                    ) : (
                      <Button color="primary" onClick={handleLogin} className={classes.loginButton}>
                        Continue
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
        {auth && <Navigate to='/authorized' />}
      </PageContent>
    </div>
  );
};

export default Unauthorized;
