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
import Paper from '@mui/material/Paper';
import UserDetails from './UserDetails';
// import {stringToHex} from './analytics.utils';
import { api } from '../api/api';
import { omit, pickBy } from 'ramda';

export const mapUsersToData = user => createData (
  user.id,
  user.payload?.given_name,
  user.payload?.family_name,
  user.payload?.name,
  user.status,
  user.created_at
);

function createData (
  id,
  firstName,
  lastName,
  fullName,
  status,
  createdAt
) {
  return {id, firstName, lastName, fullName, status, createdAt};
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
  {id: 'firstName', numeric: false, disablePadding: false, label: 'First name'},
  {id: 'lastName', numeric: false, disablePadding: false, label: 'Last name'},
  {id: 'fullName', numeric: false, disablePadding: false, label: 'Full Name'},
  {id: 'status', numeric: false, disablePadding: false, label: 'Status'},
  {id: 'createdAt', numeric: false, disablePadding: false, label: 'Created'},
];

function EnhancedTableHead (props) {
  const {classes, order, orderBy, onRequestSort} = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
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

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      height: '100%',
      position: 'relative'
    },
    table: {
      //minWidth: 750,
    },
    tableContainer: {
      [theme.breakpoints.down('md')]: {
        marginTop: 70,
        width: 'calc(100vw - 60px)'
      },
      // [theme.breakpoints.down('md')]: {
      //   width: 'calc(100vw - 80px)'
      // },
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

export default function UsersTable({
  data,
  poolId,
  payloadSchema,
  selectedUser,
  setSelectedUser,
  userData,
  isUserDataLoading,
  refreshData,
  handleRefreshList,
  style = {}
}) {
  const classes = useStyles();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [page, setPage] = useState(0);
  const [dense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [updateUserDialogOpen, setUpdateUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);

  const handleOpenEditUserDialog = () => {
    setUpdateUserDialogOpen(true);
  }

  const handleOpenDeleteUserDialog = () => {
    setDeleteUserDialogOpen(true);
  }

  const handleCloseUpdateUserDialog = (action, data) => {
    if (action === 'cancel') {
      setUpdateUserDialogOpen(false);
    }
    if (action === 'confirm') {
      const payload = {
        payload: {
          given_name: data.firstName,
          family_name: data.lastName,
          name: data.fullName,
          ...pickBy(f => !!f, omit(['firstName', 'lastName', 'name'], data))
        }
      };
      api.updateUser(poolId, selectedUser[0], payload)
      .then(() => {
        setUpdateUserDialogOpen(false);
        handleRefreshList();
      })
      .catch((err) => {
        console.log('API error', err);
        window.alert('There was an error. Please try again.');
      });
    }
  };

  const handleCloseDeleteUserDialog = (action) => {
    if (action === 'cancel') {
      setDeleteUserDialogOpen(false);
    }
    if (action === 'confirm') {
      api.deleteUser(poolId, selectedUser[0])
      .then(() => {
        setDeleteUserDialogOpen(false);
        setSelectedUser([]);
        handleRefreshList();
      })
      .catch((err) => {
        console.log('API error', err);
        window.alert('There was an error. Please try again.');
      });
    }
  };

  const handleCloseDrawer = () => {
    setSelectedUser([]);
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
      setSelectedUser(newSelecteds);
      return;
    }
    setSelectedUser([]);
  };

  const handleSelectUser = (id) => {
    if (selectedUser.length) {
      setSelectedUser([]);
      return;
    }
    setSelectedUser([id]);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selectedUser.indexOf(id) !== -1;

  return (
    <div className={classes.root} id="users-table-root" style={style}>
      <Paper className={classes.paper}>
        <TableContainer className={classes.tableContainer}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
            sx={{
              width: 'max-content'
            }}
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selectedUser.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {stableSort(data, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-analytics-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      className={'analytics-table-row'}
                      // onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id + index}
                      selected={isItemSelected}
                      onClick={() => handleSelectUser(row.id)}
                    >
                      <TableCell id={labelId} scope="row" align="left">
                        <span style={{background: '#ECECEC', padding: 4}}>{row.id}</span>
                      </TableCell>
                      <TableCell align="left">{row.firstName}</TableCell>
                      <TableCell align="left">{row.lastName}</TableCell>
                      <TableCell align="left">{row.fullName}</TableCell>
                      <TableCell align="left">{row.status}</TableCell>
                      <TableCell align="left">{row.createdAt}</TableCell>
                    </TableRow>
                  );
                })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>No users found for the selected identity pool</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
        open={!!selectedUser.length}
        anchor="right"
        onClose={handleCloseDrawer}
      >
        <UserDetails
          isLoading={isUserDataLoading}
          poolId={poolId}
          payloadSchema={payloadSchema}
          userId={selectedUser[0]}
          userData={userData}
          refreshData={refreshData}
          updateUserDialogOpen={updateUserDialogOpen}
          handleOpenEditUserDialog={handleOpenEditUserDialog}
          handleCloseUpdateUserDialog={handleCloseUpdateUserDialog}
          deleteUserDialogOpen={deleteUserDialogOpen}
          handleOpenDeleteUserDialog={handleOpenDeleteUserDialog}
          handleCloseDeleteUserDialog={handleCloseDeleteUserDialog}
          onClose={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}
