import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem'; // Import MenuItem
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer'; // Not strictly needed, but good practice.
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';  // Import styled for custom styling
import Box from '@mui/material/Box';  //Import for utility.




// Dummy data for the table (replace with your actual data)
const products = [
  {
    id: 1,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-1.png',
    name: 'iPhone 14 Pro',
    description: 'Super Retina XDR display footnote Pro Motion technology',
    category: 'Electronics',
    categoryIcon: 'ri-computer-line',
    categoryColor: 'primary',
    stock: true,
    sku: '19472',
    price: '$999',
    qty: 665,
    status: 'Inactive',
    statusColor: 'error',
  },
    {
    id: 2,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-2.png',
    name: 'Echo Dot (4th Gen)',
    description: 'Echo Dot Smart speaker with Alexa',
    category: 'Electronics',
    categoryIcon: 'ri-computer-line',
    categoryColor: 'primary',
    stock: false,
    sku: '72836',
    price: '$25.50',
    qty: 827,
    status: 'Publish',
    statusColor: 'success',
  },
  {
    id: 3,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-3.png',
    name: 'Dohioue Wall Clock',
    description: 'Modern 10 Inch Battery Operated Wall Clocks',
    category: 'Accessories',
    categoryIcon: 'ri-headphone-line',
    categoryColor: 'error',
    stock: false,
    sku: '29540',
    price: '$16.34',
    qty: 804,
    status: 'Publish',
    statusColor: 'success',
  },
  {
    id: 4,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-4.png',
    name: 'INZCOU Running Shoes',
    description: 'Lightweight Tennis Shoes Non Slip Gym Workout Shoes',
    category: 'Shoes',
    categoryIcon: 'ri-footprint-line',
    categoryColor: 'success',
    stock: false,
    sku: '49402',
    price: '$36.98',
    qty: 528,
    status: 'Scheduled',
    statusColor: 'warning',
  },
  {
    id: 5,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-5.png',
    name: 'Apple Watch Series 7',
    description: 'Starlight Aluminum Case with Starlight Sport Band.',
    category: 'Office',
    categoryIcon: 'ri-briefcase-line',
    categoryColor: 'warning',
    stock: false,
    sku: '46658',
    price: '$799',
    qty: 851,
    status: 'Scheduled',
    statusColor: 'warning',
  },
  {
    id: 6,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-6.png',
    name: 'Meta Quest 2',
    description: 'Advanced All-In-One Virtual Reality Headset',
    category: 'Office',
    categoryIcon: 'ri-briefcase-line',
    categoryColor: 'warning',
    stock: true,
    sku: '57640',
    price: '$299',
    qty: 962,
    status: 'Scheduled',
    statusColor: 'warning',
  },
  {
    id: 7,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-7.png',
    name: 'MacBook Pro 16',
    description: 'Laptop M2 Pro chip with 12‑core CPU and 19‑core GPU',
    category: 'Electronics',
    categoryIcon: 'ri-computer-line',
    categoryColor: 'primary',
    stock: true,
    sku: '92885',
    price: '$2648.95',
    qty: 965,
    status: 'Publish',
    statusColor: 'success',
  },
  {
    id: 8,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-8.png',
    name: 'SAMSUNG Galaxy S22 Ultra',
    description: 'Android Smartphone, 256GB, 8K Camera',
    category: 'Electronics',
    categoryIcon: 'ri-computer-line',
    categoryColor: 'primary',
    stock: true,
    sku: '75257',
    price: '$899',
    qty: 447,
    status: 'Publish',
    statusColor: 'success',
  },
  {
    id: 9,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-9.png',
    name: 'Air Jordan',
    description: 'Air Jordan is a line of basketball shoes produced by Nike',
    category: 'Shoes',
    categoryIcon: 'ri-footprint-line',
    categoryColor: 'success',
    stock: false,
    sku: '31063',
    price: '$125',
    qty: 942,
    status: 'Inactive',
    statusColor: 'error',
  },
  {
    id: 10,
    image: '/materio-mui-nextjs-admin-template/demo-1/images/apps/ecommerce/product-10.png',
    name: 'VISKABACKA',
    description: 'Armchair, Skartofta black/light grey',
    category: 'Home Decor',
    categoryIcon: 'ri-home-6-line',
    categoryColor: 'info',
    stock: false,
    sku: '91848',
    price: '$190.45',
    qty: 133,
    status: 'Scheduled',
    statusColor: 'warning',
  },
];

// Custom styles for the table cells (optional, but often useful)
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    fontWeight: 'bold',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover, //optional
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


const SalesOverview = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [status, setStatus] = React.useState('');  // Example state for select
  const [category, setCategory] = React.useState('');
  const [stock, setStock] = React.useState('');

    const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const salesData = [
    { title: 'In-Store Sales', amount: '$5,345', orders: '5k orders', percentage: '5.7%', icon: 'ri-home-6-line', color: 'success' },
    { title: 'Website Sales', amount: '$74,347', orders: '21k orders', percentage: '12.4%', icon: 'ri-computer-line', color: 'success' },
    { title: 'Discount', amount: '$14,235', orders: '6k orders', icon: 'ri-gift-line' },
    { title: 'Affiliate', amount: '$8,345', orders: '150 orders', percentage: '-3.5%', icon: 'ri-money-dollar-circle-line', color: 'error' },
  ];

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={6}>
                {salesData.map((sale, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body1">{sale.title}</Typography>
                          <Typography variant="h4">{sale.amount}</Typography>
                        </Box>
                        <Avatar variant="rounded" sx={{ bgcolor: 'action.disabledBackground', color: 'text.primary' }} skin="filled" size={44}>
                          <i className={`${sale.icon} text-[28px]`}></i>
                        </Avatar>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1">{sale.orders}</Typography>
                        {sale.percentage && (
                          <Chip
                            label={sale.percentage}
                            color={sale.color}
                            size="small"
                            variant="tonal"
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Filters" />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                    <InputLabel id="status-select">Status</InputLabel>
                    <Select
                        labelId="status-select"
                        id="select-status"
                        input={<OutlinedInput label="Status" />}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        >
                         <MenuItem value="">Select Status</MenuItem> {/* Add a default/empty option */}
                         <MenuItem value="active">Active</MenuItem>
                         <MenuItem value="inactive">Inactive</MenuItem>
                         <MenuItem value="scheduled">Scheduled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                    <InputLabel id="category-select">Category</InputLabel>
                    <Select
                        labelId="category-select"
                        id="select-category"
                        input={<OutlinedInput label="Category" />}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        >
                        <MenuItem value="">Select Category</MenuItem>
                        <MenuItem value="electronics">Electronics</MenuItem>
                        <MenuItem value="accessories">Accessories</MenuItem>
                        <MenuItem value="shoes">Shoes</MenuItem>
                        <MenuItem value="office">Office</MenuItem>
                        <MenuItem value="home decor">Home Decor</MenuItem>
                        </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="stock-select">Stock</InputLabel>
                     <Select
                        labelId="stock-select"
                        id="select-stock"
                        input={<OutlinedInput label="Stock" />}
                        value={stock}
                         onChange={(e) => setStock(e.target.value)}
                        >
                        <MenuItem value="">Select Stock</MenuItem>
                        <MenuItem value="in stock">In Stock</MenuItem>
                        <MenuItem value="out of stock">Out of Stock</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <TextField
                  placeholder="Search Product"
                  variant="outlined"
                  size="small"
                  sx={{ maxWidth: { sm: '300px' }, width: '100%' }}
                />

                 <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width:{xs:'100%', sm:'auto'}}}>
                 <Button variant="outlined" color="secondary" startIcon={<i className="ri-upload-2-line"></i>} fullWidth={true} sx={{flexGrow: 1}}>
                    Export
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<i className="ri-add-line"></i>}
                    href="/materio-mui-nextjs-admin-template/demo-1/en/apps/ecommerce/products/add"
                      fullWidth={true}
                    sx={{flexGrow: 1}}
                  >
                    Add Product
                  </Button>
                 </Box>
              </Box>

              <TableContainer sx={{ overflowX: 'auto', mt: 2 }}>
                <Table  aria-label="products table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell><Checkbox /></StyledTableCell>
                      <StyledTableCell>Product</StyledTableCell>
                      <StyledTableCell>Category</StyledTableCell>
                      <StyledTableCell>Stock</StyledTableCell>
                      <StyledTableCell>SKU</StyledTableCell>
                      <StyledTableCell>Price</StyledTableCell>
                      <StyledTableCell>QTY</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <StyledTableRow key={row.id}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img width="38" height="38" className="rounded bg-actionHover" src={row.image} alt={row.name} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>{row.name}</Typography>
                              <Typography variant="body2">{row.description}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                variant="circular"
                                sx={{ bgcolor: (theme) => theme.palette[row.categoryColor]?.light, color: (theme) => theme.palette[row.categoryColor]?.main }}
                                size={30}
                            >
                                 <i className={`${row.categoryIcon} text-lg`}></i>
                            </Avatar>
                            <Typography variant="body1">{row.category}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Switch checked={row.stock} />
                        </TableCell>
                        <TableCell><Typography variant="body1">{row.sku}</Typography></TableCell>
                        <TableCell><Typography variant="body1">{row.price}</Typography></TableCell>
                        <TableCell><Typography variant="body1">{row.qty}</Typography></TableCell>
                         <TableCell>
                            <Chip
                                label={row.status}
                                color={row.statusColor}
                                size="small"
                                variant="tonal"
                            />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <i className="ri-edit-box-line text-[22px] text-textSecondary"></i>
                          </IconButton>
                          <IconButton>
                            <i className="ri-more-2-line text-textSecondary text-[22px]"></i>
                          </IconButton>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={products.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesOverview;