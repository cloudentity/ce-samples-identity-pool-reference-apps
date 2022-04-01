import { Navigate } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PageContent from './common/PageContent';
import PageToolbar from './common/PageToolbar';

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    height: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginCard: {
    padding: '30px 50px'
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
    },
  }
}));

const Unauthorized = ({className, auth, handleLogin}) => {
  const classes = useStyles();

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
                  <Typography>Log in to manage your profile.</Typography>
                </div>
                <Button color="primary" onClick={handleLogin} className={classes.loginButton}>
                  Continue
                </Button>
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
