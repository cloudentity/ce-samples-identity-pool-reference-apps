import { Navigate } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PageContent from './common/PageContent';
import PageToolbar from './common/PageToolbar';

import { api } from '../api/api';
import {validators} from './forms/validation';
import {useFormFactory} from './forms/formFactory';

import authConfig from '../authConfig';

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
  }
}));

const Unauthorized = ({className, auth, handleLogin}) => {
  const classes = useStyles();

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
    formIsActive: loginRedirect || authConfig.loginHintEnabled
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
                  <Typography variant="h5" component="h2">Welcome!</Typography>
                  <Typography>Log in to manage your account.</Typography>
                </div>
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
                  </div>
                ) : (
                  <>
                    {authConfig.loginHintEnabled ? (
                      <div className={classes.loginInputsWrapper}>
                        {formFactory.createRequiredField({
                          name: 'loginHintIdentifier',
                          label: 'Email',
                          validate: {
                            validEmail: validators.validEmail({ label: 'Input' }),
                          },
                          className: classes.loginInputs
                        })}

                        <div style={{marginBottom: 20}}>
                          {formFactory.createFormFooter({
                            onSubmit: handleLogin,
                            submitText: 'Continue',
                            align: 'center',
                            className: classes.loginInputSubmit
                          })}
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
