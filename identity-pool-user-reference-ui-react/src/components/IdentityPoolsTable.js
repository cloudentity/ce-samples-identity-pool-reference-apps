import {useEffect, useState} from 'react';
import clsx from 'clsx';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
// import {stringToHex} from './analytics.utils';

export const mapPoolsToData = pool => createData (
  pool.id,
  pool.name,
  pool.description,
  pool.public_registration_allowed,
  pool.tenant_id,
  pool.authentication_mechanisms
);

function createData (
  id,
  name,
  description,
  public_registration_allowed,
  tenant_id,
  authentication_mechanisms
) {
  return {id, name, description, public_registration_allowed, tenant_id, authentication_mechanisms};
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
  {id: 'description', numeric: false, disablePadding: false, label: 'Description'},
  {id: 'public_registration_allowed', numeric: false, disablePadding: false, label: 'Public registration allowed'},
  {id: 'authentication_mechanisms', numeric: false, disablePadding: false, label: 'Authentication mechanisms'},
  {id: 'tenant_id', numeric: false, disablePadding: false, label: 'Tenant ID'},
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

export default function IdentityPoolsTable({data, style = {}}) {
  const classes = useStyles();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <div className={classes.root} id="analytics-table-root" style={style}>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
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
                    >
                      <TableCell id={labelId} scope="row" align="left">
                        <span style={{background: '#ECECEC', padding: 4}}>{row.id}</span>
                      </TableCell>
                      <TableCell align="left">{row.name}</TableCell>
                      <TableCell align="left">{row.description}</TableCell>
                      <TableCell align="left">{`${row.public_registration_allowed ? 'yes' : 'no'}`}</TableCell>
                      <TableCell align="left">{(row.authentication_mechanisms || []).join(', ')}</TableCell>
                      <TableCell align="left">{row.tenant_id}</TableCell>
                    </TableRow>
                  );
                })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>No identity pools found</TableCell>
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
    </div>
  );
}
