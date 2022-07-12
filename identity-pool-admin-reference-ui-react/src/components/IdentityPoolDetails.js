import EditPoolDialog from './EditIdentityPool';
// import DeletePoolConfirmDialog from './DeletePoolConfirm';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { useQuery } from 'react-query';
import { api } from '../api/api';
// import { processPayloadSchema } from './Users';
import { omit } from 'ramda';
import Progress from './Progress';

const useStyles = makeStyles((theme) => ({
  poolDetailsHeader: {
    padding: 15,
    display: 'flex',
    justifyContent: 'space-between',
  },
  poolDetailsContainer: {
    background: '#eefeef',
    width: 400,
    padding: 15
  },
  poolDetailsItem: {
    display: 'flex',
    margin: '5px 0',
    justifyContent: 'space-between'
  },
  poolDetailsItemKey: {
    fontWeight: 700
  },
  poolDetailsItemValue: {
    fontWeight: 'normal'
  },
  editPoolButtonContainer: {
    marginTop: 30,
    display: 'flex',
    justifyContent: 'center'
  },
  dialogRootStyles: {
    padding: 40,
    minWidth: 300
  }
}));

export default function IdentityPoolDetails ({
  isLoading,
  payloadSchema,
  poolId,
  poolData,
  refreshData,
  updatePoolDialogOpen,
  handleOpenEditPoolDialog,
  handleCloseUpdatePoolDialog,
  // deletePoolDialogOpen,
  // handleOpenDeletePoolDialog,
  // handleCloseDeletePoolDialog,
  onClose
}) {
  const classes = useStyles();

  const missingInfoPlaceholder = 'N/A';

  const sampleData = {
    "name": "g3admin",
    "description": "G3 super admin org",
    "id": "g3admin",
    "tenant_id": "csattgast",
    "authentication_mechanisms": ["password"],
    "payload_schema_id": "default_payload",
    "metadata_schema_id": "default_metadata",
    "public_registration_allowed": false,
    "otp_settings": {
      "activation": {
        "length": 8,
        "ttl": "168h0m0s"
      },
      "reset_password": {
        "length":8,
        "ttl": "1h0m0s"
      },
      "challenge": {
        "length": 8,
        "ttl": "5m0s"
      }
    },
    "metadata":{}
  };

  const poolDetails = poolData ? [
    {
      displayName: 'Name',
      value: poolData.name || missingInfoPlaceholder
    },
    {
      displayName: 'Description',
      value: poolData.description || missingInfoPlaceholder
    },
    {
      displayName: 'ID',
      value: poolData.id || missingInfoPlaceholder
    },
    {
      displayName: 'Public Registration Allowed',
      value: poolData.public_registration_allowed ? 'yes' : 'no'
    },
    {
      displayName: 'Authentication Mechanisms',
      value: (poolData.authentication_mechanisms || []).join(', ') || missingInfoPlaceholder
    },
    {
      displayName: 'Tenant ID',
      value: poolData.tenant_id || missingInfoPlaceholder
    },
    {
      displayName: 'User Payload Schema ID',
      value: poolData.payload_schema_id || missingInfoPlaceholder
    }
  ] : [];

  const editablePoolDetails = {
    name: poolData?.name || '',
    description: poolData?.description || '',
    id: poolData?.id || '',
    public_registration_allowed: poolData?.public_registration_allowed || false,
    authentication_mechanisms: poolData?.authentication_mechanisms || [],
  };

  if (isLoading) {
    return <Progress/>;
  }

  return (
    <>
      <div className={classes.poolDetailsHeader}>
        <Typography style={{marginTop: 8}} variant="h5" component="h3">Identity Pool Details</Typography>
        <IconButton onClick={onClose} edge="start" color="inherit" aria-label="close" size="large">
          <CloseIcon />
        </IconButton>
      </div>
      <div className={classes.poolDetailsContainer}>
        {poolDetails.map((d, i) => (
          <div key={i} className={classes.poolDetailsItem}>
            <div className={classes.poolDetailsItemKey}>
              {d.displayName + ':'}
            </div>
            <div className={classes.poolDetailsItemValue}>
              {d.value}
            </div>
          </div>
        ))}
      </div>
      <div className={classes.editPoolButtonContainer}>
        <Button
          id="edit-pool-details-button"
          variant="contained"
          size="large"
          onClick={() => handleOpenEditPoolDialog()}
          style={{marginRight: 5}}
          sx={{
            width: 220,
            color: '#fff',
          }}
        >
          Edit Identity Pool
        </Button>
        <EditPoolDialog
          open={updatePoolDialogOpen}
          handleClose={handleCloseUpdatePoolDialog}
          poolData={editablePoolDetails}
          classes={classes}
        />
      </div>
    </>
  )
};