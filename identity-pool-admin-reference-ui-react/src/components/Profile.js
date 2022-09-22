import makeStyles from '@mui/styles/makeStyles';
import ReactJson from 'react-json-view';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import jwt_decode from 'jwt-decode';
import authConfig from '../authConfig';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  profileCard: {
    margin: '30px 0',
    padding: '10px 20px',
    width: 'calc(100vw - 80px)',
    [theme.breakpoints.up('sm')]: {
      padding: '30px 50px',
      width: 'calc(100vw - 300px)',
    }
  }
}));

const Profile = ({auth, handleLogout}) => {
  const classes = useStyles();

  const accessToken = window.localStorage.getItem(authConfig.accessTokenName);
  let accessTokenData;

  if (authConfig.env === 'dev') {
    const preMockAccessTokenData = accessToken ? jwt_decode(accessToken) : {};
    accessTokenData = {...preMockAccessTokenData, ...authConfig.mockAccessTokenData};
  } else {
    accessTokenData = accessToken ? jwt_decode(accessToken) : {};
  }

  const idToken = window.localStorage.getItem(authConfig.idTokenName);
  const idTokenData = idToken ? jwt_decode(idToken) : {};

  return (
    <div className={classes.root}>
      <Card className={classes.profileCard}>
        <div className={classes.profileHeader}>
          <Typography variant="h5" component="h2">Your Access/ID token data</Typography>
        </div>
        <div style={{marginTop: 20}}>
          <Typography>The contents of your OAuth Access token:</Typography>
        </div>
        <ReactJson style={{marginTop: 20}} src={accessTokenData} />
        <div style={{marginTop: 20}}>
          <Typography>The contents of your OAuth ID token:</Typography>
        </div>
        <ReactJson style={{marginTop: 20}} src={idTokenData} />
      </Card>
    </div>
  );
};

export default Profile;
