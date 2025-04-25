'use client';
import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';  // Import MenuItem
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

// Remixicon React Icons
import EditBoxLineIcon from 'remixicon-react/EditBoxLineIcon';
import More2LineIcon from 'remixicon-react/More2LineIcon';
import Upload2LineIcon from 'remixicon-react/Upload2LineIcon';
import AddLineIcon from 'remixicon-react/AddLineIcon';



interface Category {
  imageSrc: string;
  name: string;
  description: string;
  totalProducts: number;
  totalEarning: number;
}

const categoriesData: Category[] = [
  {
    imageSrc: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-1.png',
    name: 'Smart Phone',
    description: 'Choose from wide range of smartphones online at best prices.',
    totalProducts: 12548,
    totalEarning: 98784.00,
  },
  {
    imageSrc: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-9.png',
    name: 'Clothing, Shoes, and jewellery',
    description: 'Fashion for a wide selection of clothing, shoes, jewellery and watches.',
    totalProducts: 4689,
    totalEarning: 45627.00,
  },
  {
    imageSrc: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-10.png',
    name: 'Home and Kitchen',
    description: 'Browse through the wide range of Home and kitchen products.',
    totalProducts: 11297,
    totalEarning: 51097.00,
  },
];

const CategoriesTable: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [searchValue, setSearchValue] = React.useState('');


  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Card>
                <Box sx={{ p: 5, display: 'flex', alignItems: { sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 4, sm: 0 } }}>
                    <TextField
                        placeholder="Search"
                        size="small"
                        sx={{ maxWidth: { xs: '100%', sm: 'auto' } }}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' }, width:{xs:'100%', sm:'auto'} }}>
                        <Button variant="outlined" color="secondary" startIcon={<Upload2LineIcon />} fullWidth={true}>
                            Export
                        </Button>
                        <Button variant="contained" startIcon={<AddLineIcon />} fullWidth={true}>
                            Add Category
                        </Button>
                    </Box>
                </Box>

                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table className="table_table__cB3AL">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Checkbox size="medium" />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" component="div" sx={{ cursor: 'pointer', userSelect: 'none' }}>Categories</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" component="div" sx={{ cursor: 'pointer', userSelect: 'none' }}>Total Products</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" component="div" sx={{ cursor: 'pointer', userSelect: 'none' }}>Total Earning</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" component="div">Actions</Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categoriesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Checkbox size="medium" />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <img width={38} height={38} className="rounded bg-actionHover" src={category.imageSrc} alt={category.name} />
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{category.name}</Typography>
                                                <Typography variant="body2">{category.description}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body1">{category.totalProducts.toLocaleString()}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body1">${category.totalEarning.toFixed(2).toLocaleString()}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconButton size="small">
                                                <EditBoxLineIcon style={{ fontSize: 22, color: 'var(--mui-palette-text-secondary)' }} />
                                            </IconButton>
                                            <IconButton>
                                                <More2LineIcon style={{ fontSize: 22, color: 'var(--mui-palette-text-secondary)' }} />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

               <TablePagination
                  rowsPerPageOptions={[15, 30, 50]}
                  component="div"
                  count={categoriesData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Nombre de produits par page:"
                  showFirstButton={false} // We don't need these in your example
                  showLastButton={false}
                  nextIconButtonProps={{
                    disabled: page >= Math.ceil(categoriesData.length / rowsPerPage) - 1, // Correctly calculate disabled state
                  }}
                  backIconButtonProps={{
                       disabled: page === 0,
                  }}
                />
            </Card>
        </Box>
    );
};

export default CategoriesTable;