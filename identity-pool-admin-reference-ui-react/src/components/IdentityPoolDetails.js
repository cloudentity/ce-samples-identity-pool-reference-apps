import EditPoolDialog from './EditIdentityPool';
import EditPoolMetadataDialog from './EditIdentityPoolMetadata';
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
    margin: '30px auto 0 auto',
    width: '85%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  dialogRootStyles: {
    padding: 40,
    minWidth: 300
  }
}));

export default function IdentityPoolDetails ({
  isLoading,
  identityRole,
  payloadSchema,
  poolId,
  poolData,
  poolsList,
  refreshData,
  updatePoolDialogOpen,
  handleOpenEditPoolDialog,
  handleCloseUpdatePoolDialog,
  editMetadataDialogOpen,
  handleOpenEditMetadataDialog,
  handleCloseEditMetadataDialog,
  // deletePoolDialogOpen,
  // handleOpenDeletePoolDialog,
  // handleCloseDeletePoolDialog,
  onClose
}) {
  const classes = useStyles();

  const missingInfoPlaceholder = 'N/A';

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
      displayName: 'Parent Organization',
      value: poolData.metadata?.parentOrg || missingInfoPlaceholder
    },
    {
      displayName: 'Child Organizations',
      value: poolsList.filter(p => p.parentOrg === poolData.id).map(p => p.id).join(', ') || missingInfoPlaceholder
    },
    {
      displayName: 'Location',
      value: poolData.metadata?.location || missingInfoPlaceholder
    },
    {
      displayName: 'Salesforce Account ID',
      value: poolData.metadata?.salesforceAccount || missingInfoPlaceholder
    },
    {
      displayName: 'BP',
      value: ((Array.isArray(poolData.metadata?.bp) && poolData.metadata?.bp) || []).join(', ') || missingInfoPlaceholder
    },
    {
      displayName: 'Industry',
      value: poolData.metadata?.industry || missingInfoPlaceholder
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

    // metadata attributes
    location: poolData?.metadata?.location || '',
    salesforceAccount: poolData?.metadata?.salesforceAccount || '',
    bp: (Array.isArray(poolData.metadata?.bp) && poolData.metadata?.bp) || [],
    industry: poolData?.metadata?.industry || ''
  };

  if (isLoading) {
    return <Progress/>;
  }

  return (
    <>
      <div className={classes.poolDetailsHeader}>
        <Typography style={{marginTop: 8}} variant="h5" component="h3">Organization Details</Typography>
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
        {(identityRole === 'superadmin' || identityRole === 'pools_admin') && (
          <>
            <Button
              fullWidth
              id="edit-pool-details-button"
              variant="contained"
              size="large"
              onClick={() => handleOpenEditPoolDialog()}
              style={{marginBottom: 20}}
              sx={{
                color: '#fff',
              }}
            >
              Edit Organization
            </Button>
            <Button
              fullWidth
              id="edit-pool-details-button"
              variant="contained"
              size="large"
              onClick={() => handleOpenEditMetadataDialog()}
              sx={{
                color: '#fff',
              }}
            >
              Manage Organization Metadata
            </Button>
          </>
        )}
        <EditPoolDialog
          open={updatePoolDialogOpen}
          handleClose={handleCloseUpdatePoolDialog}
          rawPoolData={poolData}
          poolData={editablePoolDetails}
          classes={classes}
        />
        <EditPoolMetadataDialog
          open={editMetadataDialogOpen}
          handleClose={handleCloseEditMetadataDialog}
          rawPoolData={poolData}
          poolData={editablePoolDetails}
          classes={classes}
        />
      </div>
    </>
  )
};
