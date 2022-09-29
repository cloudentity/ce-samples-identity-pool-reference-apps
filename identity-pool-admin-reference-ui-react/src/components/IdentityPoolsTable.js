import {useEffect, useState} from 'react';
import clsx from 'clsx';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Drawer from '@mui/material/Drawer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IdentityPoolDetails from './IdentityPoolDetails';
// import {stringToHex} from './analytics.utils';
import { pick, pickBy } from 'ramda';
import { api } from '../api/api';

export const mapPoolsToData = pool => createData (
  pool.id,
  pool.name,
  pool.metadata?.parentOrg,
  pool.metadata?.salesforceAccount,
  pool.metadata?.industry,
  pool.metadata?.location,
  pool.children
);

function createData (
  id,
  name,
  parentOrg,
  salesforceAccount,
  industry,
  location,
  children
) {
  return {id, name, parentOrg, salesforceAccount, industry, location, children};
}

function descendingComparator (a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator (order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort (array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {id: 'id', numeric: false, disablePadding: false, label: 'ID'},
  {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
  {id: 'parentOrg', numeric: false, disablePadding: false, label: 'Parent Org'},
  {id: 'salesforceAccount', numeric: false, disablePadding: false, label: 'Salesforce Acct. ID'},
  {id: 'industry', numeric: false, disablePadding: false, label: 'Industry'},
  {id: 'location', numeric: false, disablePadding: false, label: 'Location'},
];

function EnhancedTableHead (props) {
  const {classes, order, orderBy, onRequestSort} = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead style={{background: '#ECECEC'}}>
      <TableRow className={'analytics-table-head'}>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableBody ({
  classes,
  data,
  selectedPool,
  isSelected,
  handleSelectPool,
  handleSelectAllClick,
  handleRequestSort,
  order,
  orderBy,
  page,
  rowsPerPage,
  isChildTable
}) {
  const orgHasChildren = org => org?.children?.length > 1;

  return (
    <Table
      className={classes.table}
      aria-labelledby="tableTitle"
      size={'medium'}
      aria-label="enhanced table"
    >
      {!isChildTable && (
        <EnhancedTableHead
          classes={classes}
          numSelected={selectedPool.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          onRequestSort={handleRequestSort}
          rowCount={data.length}
        />
      )}
      <TableBody>
        {stableSort(data, getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row, index) => {
            const isItemSelected = isSelected(row.id);
            const labelId = `enhanced-analytics-table-checkbox-${index}`;

            return (
            <>
              <TableRow
                hover
                className={'analytics-table-row'}
                style={{borderTop: '2px solid #ECECEC'}}
                // onClick={(event) => handleClick(event, row.id)}
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={row.id + index}
                selected={isItemSelected}
                onClick={() => handleSelectPool(row.id)}
              >
                <TableCell id={labelId} scope="row" align="left">
                  <span style={{background: '#ECECEC', padding: 4}}>{row.id}</span>
                </TableCell>
                <TableCell align="left">{row.name}</TableCell>
                <TableCell align="left">{row.parentOrg || 'N/A'}</TableCell>
                <TableCell align="left">{row.salesforceAccount}</TableCell>
                <TableCell align="left">{row.industry}</TableCell>
                <TableCell align="left">{row.location}</TableCell>
              </TableRow>
              {row.children?.length > 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="right">
                    <EnhancedTableBody
                      classes={classes}
                      data={row.children}
                      selectedPool={selectedPool}
                      isSelected={isSelected}
                      handleSelectPool={handleSelectPool}
                      handleSelectAllClick={handleSelectAllClick}
                      handleRequestSort={handleRequestSort}
                      order={order}
                      orderBy={orderBy}
                      page={page}
                      rowsPerPage={rowsPerPage}
                    />
                  </TableCell>
                </TableRow>
              )}
            </>
            );
          })}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={6}>No Organizations found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      height: 'calc(100vh - 200px)',
      position: 'relative'
    },
    table: {
      //minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    tablePagination: {
      position: 'absolute',
      bottom: 0,
      right: 0
    }
  }),
);

export default function IdentityPoolsTable({
  data,
  selectedPool,
  setSelectedPool,
  poolData,
  isPoolDataLoading,
  refreshData,
  handleRefreshList,
  identityRoles,
  style = {}
}) {
  const classes = useStyles();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [page, setPage] = useState(0);
  const [dense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [updatePoolDialogOpen, setUpdatePoolDialogOpen] = useState(false);
  const [editMetadataDialogOpen, setEditMetadataDialogOpen] = useState(false);

  const handleOpenEditPoolDialog = () => {
    setUpdatePoolDialogOpen(true);
  }

  const handleOpenEditMetadataDialog = () => {
    setEditMetadataDialogOpen(true);
  }

  const handleCloseUpdatePoolDialog = (action, newData, originalPoolData) => {
    if (action === 'cancel') {
      setUpdatePoolDialogOpen(false);
      setEditMetadataDialogOpen(false);
    }
    if (action === 'confirm') {
      const mainProps = pickBy(f => f !== '', pick(['name', 'id', 'description', 'public_registration_allowed', 'authentication_mechanisms'], newData));
      const metadataProps = pickBy(f => !!f || f === false, pick(['location', 'salesforceAccount', 'bp', 'industry', 'isAuthenticationFederated'], newData));
      const updatedMetadata = {...(originalPoolData.metadata || {}), ...metadataProps};

      const payload = {
        ...originalPoolData,
        ...mainProps,
        metadata: updatedMetadata
      };

      api.editIdentityPool(selectedPool[0], payload)
      .then(() => {
        setUpdatePoolDialogOpen(false);
        setEditMetadataDialogOpen(false);
        handleRefreshList();
      })
      .catch((err) => {
        console.log('API error', err);
        window.alert('There was an error. Please try again.');
      });
    }
  };

  const handleCloseDrawer = () => {
    setSelectedPool([]);
  }

  useEffect(() => {
    const rootHeight = document.getElementById('analytics-table-root')?.clientHeight;
    const headHeight = document.getElementsByClassName('analytics-table-head')?.item(0)?.clientHeight;
    const rowHeight = document.getElementsByClassName('analytics-table-row')?.item(0)?.clientHeight;
    const paginationHeight = document.getElementsByClassName('analytics-table-pagination')?.item(0)?.clientHeight;

    if (rootHeight && headHeight && rowHeight && paginationHeight) {
      setRowsPerPage(Math.floor((rootHeight - headHeight - paginationHeight) / rowHeight))
    }
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = data.map((n) => n.id);
      setSelectedPool(newSelecteds);
      return;
    }
    setSelectedPool([]);
  };

  const handleSelectPool = (id) => {
    if (selectedPool.length) {
      setSelectedPool([]);
      return;
    }
    setSelectedPool([id]);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selectedPool.indexOf(id) !== -1;

  return (
    <div className={classes.root} id="analytics-table-root" style={style}>
      <Paper className={classes.paper}>
        <TableContainer>
          <EnhancedTableBody
            classes={classes}
            data={data}
            selectedPool={selectedPool}
            isSelected={isSelected}
            handleSelectPool={handleSelectPool}
            handleSelectAllClick={handleSelectAllClick}
            handleRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
            page={page}
            rowsPerPage={rowsPerPage}
          />
        </TableContainer>
        <TablePagination
          className={clsx(['analytics-table-pagination', classes.tablePagination])}
          rowsPerPageOptions={[]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Drawer
        open={!!selectedPool.length}
        anchor="right"
        onClose={handleCloseDrawer}
      >
        <IdentityPoolDetails
          isLoading={isPoolDataLoading}
          identityRoles={identityRoles}
          poolId={selectedPool[0]}
          poolData={poolData}
          poolsList={data || []}
          refreshData={refreshData}
          updatePoolDialogOpen={updatePoolDialogOpen}
          handleOpenEditPoolDialog={handleOpenEditPoolDialog}
          handleCloseUpdatePoolDialog={handleCloseUpdatePoolDialog}
          editMetadataDialogOpen={editMetadataDialogOpen}
          handleOpenEditMetadataDialog={handleOpenEditMetadataDialog}
          handleCloseEditMetadataDialog={handleCloseUpdatePoolDialog}
          // deletePoolDialogOpen={deletePoolDialogOpen}
          // handleOpenDeletePoolDialog={handleOpenDeletePoolDialog}
          // handleCloseDeletePoolDialog={handleCloseDeletePoolDialog}
          onClose={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}
