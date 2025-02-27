import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';  // Import MenuItem
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';

//For Icons
import Upload2LineIcon from 'remixicon-react/Upload2LineIcon';
import BoldIcon from 'remixicon-react/BoldIcon'
import UnderlineIcon from 'remixicon-react/UnderlineIcon'
import ItalicIcon from 'remixicon-react/ItalicIcon'
import StrikethroughIcon from 'remixicon-react/StrikethroughIcon'
import AlignLeftIcon from 'remixicon-react/AlignLeftIcon'
import AlignCenterIcon from 'remixicon-react/AlignCenterIcon'
import AlignRightIcon from 'remixicon-react/AlignRightIcon'
import AlignJustifyIcon from 'remixicon-react/AlignJustifyIcon'
import CloseLineIcon from 'remixicon-react/CloseLineIcon';
import AddLineIcon from 'remixicon-react/AddLineIcon';
import ArrowDownSLineIcon from 'remixicon-react/ArrowDownSLineIcon';
import CarLineIcon from 'remixicon-react/CarLineIcon';
import GlobalLineIcon from 'remixicon-react/GlobalLineIcon';
import LinkMIcon from 'remixicon-react/LinkMIcon';
import LockUnlockLineIcon from 'remixicon-react/LockUnlockLineIcon';



const AddProductPage = () => {

    const [tabValue, setTabValue] = React.useState('advanced');

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: { sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 6 }}>
            <Box>
              <Typography variant="h4" mb={1}>
                Add a new product
              </Typography>
              <Typography variant="body1">Orders placed across your store</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button variant="outlined" color="secondary">
                Discard
              </Button>
              <Button variant="outlined" color="primary">
                Save Draft
              </Button>
              <Button variant="contained" color="primary">
                Publish Product
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
                {/* Product Information */}
              <Card>
                <CardHeader title={<Typography variant='h5'>Product Information</Typography>} />
                <CardContent>
                  <Grid container spacing={5} mb={5}>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Product Name" placeholder="iPhone 14" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="SKU" placeholder="FXSK123U" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Barcode" placeholder="0123-4567" />
                    </Grid>
                  </Grid>
                  <Typography variant="body1" mb={1}>
                    Description (Optional)
                  </Typography>

                  <Card sx={{ p: 0, border: 'none', boxShadow: 'none' }}>
                      <CardContent sx={{ p: 0 }} >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: {xs: 1,md:3} , pb: 5, pl: 5, pr:4 }}>
                            <Button variant="outlined" size="small" color="primary">
                                <BoldIcon  />
                            </Button>
                            <Button variant="outlined" size="small" color="primary">
                                <UnderlineIcon />
                            </Button>
                            <Button variant="outlined" size="small" color="primary">
                                <ItalicIcon  />
                            </Button>
                            <Button variant="outlined" size="small" color="primary">
                                <StrikethroughIcon  />
                            </Button>
                            <Button variant="outlined" size="small" color="primary">
                                <AlignLeftIcon />
                            </Button>
                            <Button variant="outlined" size="small" color="primary">
                                <AlignCenterIcon  />
                            </Button>
                            <Button variant="outlined" size="small" color="primary">
                                <AlignRightIcon />
                            </Button>
                            <Button variant="outlined" size="small" color="primary">
                                <AlignJustifyIcon  />
                            </Button>
                        </Box>
                        <Divider sx={{ ml: 5 }} />
                        <Box sx={{ maxHeight: 135, overflowY: 'auto', display: 'flex' }}>
                            <Box contentEditable={true} role="textbox" tabIndex={0} className="tiptap ProseMirror">
                                <p>Keep your account secure with authentication step.</p>
                            </Box>
                        </Box>
                      </CardContent>
                  </Card> 

                  </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12}>
                 {/* Product Image */}
              <Box>
                <Card>
                  <CardHeader
                    title={<Typography variant='h5'>Product Image</Typography>}
                    action={
                      <a href="/materio-mui-nextjs-admin-template/demo-1">
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Add media from URL
                        </Typography>
                      </a>
                    }
                  />
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: 2,
                        textAlign: 'center',
                        border: '1px dashed grey', // Added for visual dropzone
                        padding: 4,                // Added for visual dropzone
                        cursor: 'pointer'         // Added for visual dropzone
                      }}
                      role="presentation"
                      tabIndex={0}
                      // **Important: Add basic drag and drop handling (optional)**
                      onDrop={(e) => { e.preventDefault(); console.log('File dropped:', e.dataTransfer.files); }}
                      onDragOver={(e) => e.preventDefault()} // Prevent default to allow drop
                    >
                      <input multiple tabIndex={-1} type="file" style={{ display: 'none' }} />
                      <Avatar variant="rounded" color="secondary" sx={{ backgroundColor: 'transparent' }}>
                        <Upload2LineIcon />
                      </Avatar>
                      <Typography variant="h4">Drag and Drop Your Image Here.</Typography>
                      <Typography variant="body1">or</Typography>
                      <Button variant="outlined" size="small" color="primary">
                        Browse Image
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            <Grid item xs={12}>
                {/* Product Variants */}
              <Card>
                <CardHeader title={<Typography variant='h5'>Product Variants</Typography>} />
                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12} className="repeater-item">
                      <Grid container spacing={5}>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel id="variant-select-label" shrink>Select Variant</InputLabel>
                            <Select
                                labelId="variant-select-label"
                                defaultValue="Smell"
                                label="Select Variant"
                                // Add onChange handler as needed
                                >
                                <MenuItem value="Smell">Smell</MenuItem>
                                <MenuItem value="Size">Size</MenuItem>
                                <MenuItem value="Color">Color</MenuItem>
                                {/* Add more options as needed */}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Box sx={{display:'flex', alignItems:'center', gap:5}}>
                                <TextField fullWidth label="Variant Value" placeholder="Enter Variant Value" />
                                <Button variant="text" color="primary" sx={{ minWidth: 'fit-content' }}>
                                    <CloseLineIcon />
                                </Button>
                            </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" color="primary" startIcon={<AddLineIcon />}>
                        Add Another Option
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
                {/* Inventory */}
              <Card>
                <CardHeader title={<Typography variant='h5'>Inventory</Typography>} />
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ flex: '0 0 auto', width:{md:'33%'} }}>
                        <TabContext value={tabValue}>
                            <Tabs
                                orientation="vertical"
                                value={tabValue}
                                onChange={handleTabChange}
                                aria-label="Inventory Tabs"
                                sx={{ borderRight: 1, borderColor: 'divider' }}
                                >
                                <Tab label="Restock" icon={<AddLineIcon />} value="restock"  sx={{ flexDirection: 'row', justifyContent: 'flex-start', textTransform: 'none', width: '100%' }}/>
                                <Tab label="Shipping" icon={<CarLineIcon />} value="shipping" sx={{ flexDirection: 'row', justifyContent: 'flex-start', textTransform: 'none', width: '100%' }} />
                                <Tab label="Global Delivery" icon={<GlobalLineIcon />} value="global-delivery" sx={{ flexDirection: 'row', justifyContent: 'flex-start', textTransform: 'none', width: '100%' }} />
                                <Tab label="Attributes" icon={<LinkMIcon />} value="attributes" sx={{ flexDirection: 'row', justifyContent: 'flex-start', textTransform: 'none', width: '100%' }} />
                                <Tab label="Advanced" icon={<LockUnlockLineIcon />} value="advanced" sx={{ flexDirection: 'row', justifyContent: 'flex-start', textTransform: 'none', width: '100%' }} />
                            </Tabs>
                         </TabContext>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    <Box sx={{ flexGrow: 1, width:{md:'67%'} }}>
                        <TabContext value={tabValue}>
                            <TabPanel value="restock" sx={{ p: 0 }}>{/* Content for Restock */}</TabPanel>
                            <TabPanel value="shipping" sx={{ p: 0 }}>{/* Content for Shipping */}</TabPanel>
                            <TabPanel value="global-delivery" sx={{ p: 0 }}>{/* Content for Global Delivery */}</TabPanel>
                            <TabPanel value="attributes" sx={{ p: 0 }}>{/* Content for Attributes */}</TabPanel>
                            <TabPanel value="advanced" sx={{ p: 0 }}>
                                {/* Content for Advanced */}
                                <FormGroup>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        Advanced
                                    </Typography>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} sm={6} md={7}>
                                            <FormControl fullWidth size="small">
                                            <InputLabel id="product-id-type-label" shrink>Product ID Type</InputLabel>
                                                <Select
                                                    labelId="product-id-type-label"
                                                    defaultValue="ISBN"
                                                    label="Product ID Type"
                                                    size="small"
                                                    // Add onChange handler as needed
                                                >
                                                    <MenuItem value="ISBN">ISBN</MenuItem>
                                                    <MenuItem value="UPC">UPC</MenuItem>
                                                    <MenuItem value="EAN">EAN</MenuItem>
                                                    {/* Add more options as needed */}
                                            </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={5}>
                                            <TextField fullWidth label="Product ID" placeholder="100023" size="small" />
                                        </Grid>
                                    </Grid>
                                </FormGroup>
                            </TabPanel>
                        </TabContext>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
                {/* Pricing */}
              <Card>
                <CardHeader title={<Typography variant='h5'>Pricing</Typography>} />
                <CardContent>
                  <form>
                    <TextField fullWidth label="Base Price" placeholder="Enter Base Price" sx={{ mb: 5 }} />
                    <TextField fullWidth label="Discounted Price" placeholder="$499" sx={{ mb: 5 }} />
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label={<Typography variant="body1">Charge tax on this product</Typography>}
                    />
                    <Divider sx={{ ml: 0, mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1">In stock</Typography>
                      <Switch defaultChecked />
                    </Box>
                  </form>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
                {/* Organize */}
              <Card>
                <CardHeader title={<Typography variant='h5'>Organize</Typography>} />
                <CardContent>
                  <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <FormControl fullWidth>
                      <InputLabel id="vendor-select-label" shrink>Select Vendor</InputLabel>
                        <Select
                            labelId="vendor-select-label"
                            defaultValue="Women's Clothing"
                            label="Select Vendor"
                        >
                            <MenuItem value="Women's Clothing">Women's Clothing</MenuItem>
                            <MenuItem value="Men's Clothing">Men's Clothing</MenuItem>
                            <MenuItem value="Electronics">Electronics</MenuItem>
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FormControl fullWidth>
                            <InputLabel id="category-select-label" shrink>Select Category</InputLabel>
                                <Select
                                    labelId="category-select-label"
                                    defaultValue="Automotive"
                                    label="Select Category"
                                >
                                <MenuItem value="Automotive">Automotive</MenuItem>
                                <MenuItem value="Beauty">Beauty</MenuItem>
                                <MenuItem value="Books">Books</MenuItem>
                            </Select>
                        </FormControl>
                      <Button variant="outlined" size="large" color="primary" sx={{ minWidth: 'fit-content' }}>
                        <AddLineIcon />
                      </Button>
                    </Box>
                    <FormControl fullWidth>
                      <InputLabel id="collection-select-label" shrink> Select Collection</InputLabel>
                        <Select
                            labelId="collection-select-label"
                            defaultValue="Women's Clothing"
                            label="Select Collection"
                        >
                            <MenuItem value="Women's Clothing">Women's Clothing</MenuItem>
                            <MenuItem value="Summer Collection">Summer Collection</MenuItem>
                            <MenuItem value="Winter Collection">Winter Collection</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel id="status-select-label" shrink>Select Status</InputLabel>
                            <Select
                                labelId="status-select-label"
                                defaultValue="Scheduled"
                                label="Select Status"
                            >
                                <MenuItem value="Scheduled">Scheduled</MenuItem>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Draft">Draft</MenuItem>
                            </Select>
                    </FormControl>
                    <TextField fullWidth label="Enter Tags" placeholder="Fashion, Trending, Summer" />
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddProductPage;
