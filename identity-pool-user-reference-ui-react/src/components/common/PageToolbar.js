import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Hidden from '@mui/material/Hidden';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';

// Uncomment and change the line below to point to your own logo image
// import logoImage from '../../assets/logo-example.svg';

export const subHeaderHeight = 116;

const useStyles = (withSubheader, mode) =>
  makeStyles((theme) => ({
    appBar: {
      ...(withSubheader
        ? {
            border: 'none',
          }
        : {}),
    },
    toolBar: {
      ...(withSubheader
        ? {
            border: '1px solid transparent',
            borderBottom: 'none',
          }
        : {}),
      ...(mode === 'onlySubheader'
        ? {
            display: 'none',
          }
        : {}),
    },
    subHeaderContainer: {
      height: subHeaderHeight,
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.primary.main,
      fontSize: 28,
      lineHeight: '40px',
      padding: '0 80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    button: {
      color: 'white',
      fontSize: 16,
      lineHeight: '24px',
      textTransform: 'none',
      padding: '8px 24px',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
    },
    textLogo: {
      marginLeft: 10,
      color: theme.palette.primary.main
    }
  }));

export default function PageToolbar({
  mode,
  children,
  authorizationServerURL,
  authorizationServerId,
  tenantId,
  tab,
  subHeaderTitle,
  subHeaderButton,
  handleTabChange,
  handleLogout
}) {
  const classes = useStyles(!!subHeaderTitle, mode)();

  return (
    <AppBar
      position="fixed"
      color="inherit"
      variant="outlined"
      className={classes.appBar}
    >
      <Toolbar className={classes.toolBar}>
        {/* <img alt="logo image" src={logoImage} /> */}
        {/* To use your own logo, uncomment the line above (after editing the 'logoImage' import declaration to point to your own image)... */}
        {/* ...and remove the div block directly below */}
        <div className={classes.textLogo}>
          <Typography variant="h5" component="h1">Identity Pools Demo</Typography>
        </div>
        <div style={{ flex: 1 }} />

        {mode === 'dialog' && children}
        {mode === 'main' && (
          <>
            <Hidden mdUp>
              <IconButton edge="start" color="inherit" aria-label="menu" size="large">
                <MenuIcon />
              </IconButton>
            </Hidden>
            <Hidden mdDown>
              <Tabs
                value={tab || 'admin'}
                indicatorColor="primary"
                aria-label="menu tabs"
                style={{ height: 64 }}
              >
                <Tab
                  label="Admin"
                  value="admin"
                  id={'admin-tab'}
                  style={{ height: 64 }}
                  onClick={() => handleTabChange('admin')}
                />
                <Tab
                  label="My Profile"
                  value="profile"
                  id={'profile-tab'}
                  style={{ height: 64 }}
                  onClick={() => handleTabChange('profile')}
                />
              </Tabs>
            </Hidden>
            <Button
              style={{marginLeft: 20}}
              variant="outlined"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
      {subHeaderTitle && (
        <div className={classes.subHeaderContainer}>
          <div>{subHeaderTitle}</div>
          {subHeaderButton && (
            <Button
              onClick={subHeaderButton.onClick}
              variant="contained"
              color="primary"
              className={classes.button}
              id={subHeaderButton.id}
            >
              {subHeaderButton.title}
            </Button>
          )}
        </div>
      )}
    </AppBar>
  );
}
