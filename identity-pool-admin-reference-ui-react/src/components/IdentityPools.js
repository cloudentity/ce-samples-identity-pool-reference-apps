import {useState, useEffect} from 'react';
import IdentityPoolsTable, {mapPoolsToData} from './IdentityPoolsTable';
import CreateIdentityPoolDialog from './CreateIdentityPool';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import { useQuery } from 'react-query';
import { api } from '../api/api';
import Progress from './Progress';
import authConfig from '../authConfig';
import idpMappingsConfig from '../idpMappingsConfig';
import { pick, pickBy, isEmpty, includes } from 'ramda';

const useStyles = makeStyles((theme) => ({
  filterPoolsInput: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 250,
    },
    [theme.breakpoints.up('md')]: {
      width: 400,
    },
  },
  createIdentityPoolButton: {
    color: '#fff',
    background: theme.palette.primary.main,
    padding: '10px 20px',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  dialogRootStyles: {
    padding: 40,
    minWidth: 300
  },
  dialogInputContainer: {

  },
  dialogConfirmButton: {
    color: '#fff',
    background: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  dialogCancelButton: {

  }
}));

export default function IdentityPools ({org, identityRoles}) {
  const classes = useStyles();

  const [selectedPool, setSelectedPool] = useState([]);
  const [createPoolDialogOpen, setCreatePoolDialogOpen] = useState(false);
  const [refreshList, initRefreshList] = useState(false);
  const [filterInput, updateFilterInput] = useState('');

  const handleChangeCreatePoolDialogState = (action, data) => {
    if (action === 'cancel') {
      setCreatePoolDialogOpen(false);
    }
    if (action === 'confirm') {
      const mainProps = pickBy(f => f !== '', pick(['name', 'id', 'description', 'public_registration_allowed', 'authentication_mechanisms'], data));
      const metadataProps = {
        ...pickBy(f => !!f || f === false, pick(['location', 'salesforceAccount', 'bp', 'industry', 'isAuthenticationFederated'], data)),
        parentOrg: data.parentOrg || org,
        type: 'b2borganization',
        b2borganizationGroupLabel: authConfig.b2borganizationGroupLabel
      };

      const payload = {
        ...mainProps,
        ...(authConfig.simplePoolCreateForm ? {authentication_mechanisms: ['password'], public_registration_allowed: false} : {}),
        ...(authConfig.defaultPasswordPolicy ? {password_policy: authConfig.defaultPasswordPolicy} : {}),
        payload_schema_id: authConfig.childOrgSchemaId,
        metadata: metadataProps
      };

      api.createIdentityPool({tenant_id: authConfig.tenantId, ...payload})
        .then(createPoolRes => {
          if (authConfig.onCreatePoolAddIdentityProviderConnection) {
            const createIdentityProviderBody = {
              method: 'identity_pool',
              name: createPoolRes.name,
              identity_pool_id: createPoolRes.id
            };

            api.postCreatePool_CreateIdentityProviderFromPool(createIdentityProviderBody)
              .then(createIdentityProviderRes => {
                const updateIdpMappingsBody = {
                  method: 'identity_pool',
                  name: createPoolRes.name,
                  identity_pool_id: createPoolRes.id,
                  ...idpMappingsConfig
                };

                api.postCreatePool_ConfigureIdentityProviderMappings(createIdentityProviderRes.id, updateIdpMappingsBody)
                  .then(() => {
                    const configurePostAuthScriptBody = {
                      execution_points: [
                        {
                          tenant_id: authConfig.tenantId,
                          server_id: authConfig.authorizationServerId,
                          type: 'post_authn_ctx',
                          target_fk: createIdentityProviderRes.id,
                          script_id: authConfig.postAuthScriptId
                        }
                      ]
                    };

                    api.postCreatePool_ConfigurePostAuthScript(configurePostAuthScriptBody)
                      .then(() => {
                        setCreatePoolDialogOpen(false);
                        initRefreshList(!refreshList);
                      })
                      .catch((err) => {
                        console.log('API error', err);
                        window.alert('There was an error running the post-auth script API. Please try again.');
                      });
                  })
                  .catch((err) => {
                    console.log('API error', err);
                    window.alert('There was an error setting the IDP mappings configuration. Please try again.');
                  });
              })
              .catch((err) => {
                console.log('API error', err);
                window.alert('There was an error creating the identity provider. Please try again.');
              });
          } else {
            setCreatePoolDialogOpen(false);
            initRefreshList(!refreshList);
          }
        })
        .catch((err) => {
          console.log('API error', err);
          window.alert('There was an error creating the organization. Please try again.');
        });
    }
  };

  // LOAD POOL LIST
  const {
    isLoading: fetchIdentityPoolsProgress,
    error: fetchIdentityPoolsError,
    data: identityPoolsRes
  } = useQuery(['fetchIdentityPools', refreshList], api.fetchIdentityPools, {
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: identityPoolsRes => {
      console.log('Organizations response', identityPoolsRes);
    }
  });

  const isPartOfB2BOrgGroup = org => (
    !isEmpty(org.metadata)
    && org.metadata.type === 'b2borganization'
    && org.metadata.b2borganizationGroupLabel === authConfig.b2borganizationGroupLabel
  );

  const identityPools = identityPoolsRes?.pools.filter(p => isPartOfB2BOrgGroup(p) || p.id === authConfig.superadminOrgId) || [];

  let filteredPools = identityPools.filter(p => p.id === org);

  const findAllPoolDescendents = (list, parent) => {
    const topTierParent = list.filter(p => p.id === org)[0]?.id
    parent = typeof parent !== 'undefined' ? parent : { id: topTierParent };

    const children = list.filter(child => child.metadata?.parentOrg === parent.id);

    if (children.length) {
      children.forEach(child => {
        filteredPools.push(child)
        findAllPoolDescendents(list, child);
      });
    }
  };

  findAllPoolDescendents(identityPools);

  const tableData = org === authConfig.superadminOrgId ? identityPools.map(mapPoolsToData) : filteredPools.map(mapPoolsToData);


  function nestOrgs (list, parent, tree) {
    const checkForParents = parentId => list.filter(p => p.id === parentId);
    const topTierParent = list.filter(p => isEmpty(checkForParents(p.parentOrg)))[0]?.parentOrg;

    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : { id: topTierParent };

    const children = list.filter(child => child.parentOrg === parent.id);

    if (children.length) {
      if (parent.id === topTierParent) {
        tree = children;
      } else {
        parent['children'] = children;
      }
      children.forEach(child => {
        nestOrgs(list, child);
      });
    }

    return tree;
  }

  const finalTableData = authConfig.hierarchicalPoolList ? nestOrgs(tableData) : tableData;

  const isPoolListLoading = fetchIdentityPoolsProgress;

  // LOAD POOL DETAILS
  const {
    isLoading: fetchPoolDetailsProgress,
    error: fetchPoolDetailsError,
    data: poolDetailsRes
  } = useQuery(['identityPoolDetails', refreshList], () => api.identityPoolDetails(selectedPool[0]), {
    enabled: !!selectedPool[0],
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: poolDetailsRes => {
      console.log('Organization details response', poolDetailsRes);
    }
  });

  const isPoolDataLoading = fetchPoolDetailsProgress;

  useEffect(() => {
    if (createPoolDialogOpen === false) {
      console.log('dialog closed');
    }
  }, [createPoolDialogOpen]);

  if (isPoolListLoading) {
    return <Progress/>;
  }

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <FormControl className={classes.filterPoolsInput}>
          <TextField
            id="filter-identity-pools-input"
            name="filterpools"
            type="text"
            placeholder="Filter organizations by name"
            onChange={e => updateFilterInput(e?.target?.value?.trim().toLowerCase() || '')}
            variant="outlined"
          />
        </FormControl>
        {(includes('superadmin', identityRoles) || includes('pools_admin', identityRoles)) && (
          <Button color="primary" onClick={() => setCreatePoolDialogOpen(true)} className={classes.createIdentityPoolButton}>
            Create Organization
          </Button>
        )}
      </div>
      <IdentityPoolsTable
        data={filterInput ? finalTableData.filter(p => p.name.toLowerCase().includes(filterInput)) : finalTableData}
        selectedPool={selectedPool}
        setSelectedPool={p => setSelectedPool(p)}
        poolData={poolDetailsRes}
        isPoolDataLoading={isPoolDataLoading}
        refreshData={refreshList}
        handleRefreshList={() => initRefreshList(!refreshList)}
        identityRoles={identityRoles}
        style={{marginTop: 24, height: 'calc(100% - 332px - 24px'}}
      />
      <CreateIdentityPoolDialog
        open={createPoolDialogOpen}
        handleClose={handleChangeCreatePoolDialogState}
        availableParentOrgs={tableData.map(org => org.id)}
        classes={classes}
      />
    </>
  )
};
