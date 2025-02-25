import React from 'react'
import Link from 'next/link';

// ** MUI Imports
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Collapse from '@mui/material/Collapse'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListSubheader from '@mui/material/ListSubheader'

// ** Icons Imports
import ChevronDown from 'mdi-material-ui/ChevronDown'
import ChevronUp from 'mdi-material-ui/ChevronUp'
import Store from 'mdi-material-ui/Store'
import Tag from 'mdi-material-ui/Tag'
import { styled } from '@mui/material/styles';

interface NavItem {
    title: string;
    path?: string;
    children?: NavItem[];
}




const EcommerceNav = () => {
    const [openCategories, setOpenCategories] = React.useState<boolean>(true)
    const [openProducts, setOpenProducts] = React.useState<boolean>(true)

    const handleClickCategories = () => {
        setOpenCategories(!openCategories)
    }

    const handleClickProducts = () => {
        setOpenProducts(!openProducts)
    }

    const categories: NavItem[] = [
        { title: 'Electronics', path: '/ecommerce/categories/electronics' },
        { title: 'Clothing', path: '/ecommerce/categories/clothing' },
        { title: 'Home & Garden', path: '/ecommerce/categories/home-garden' },
        { title: 'Books', path: '/ecommerce/categories/books' },
        { title: 'Sports & Outdoors', path: '/ecommerce/categories/sports-outdoors' }
    ]

    const products: NavItem[] = [
        { title: 'Apple Watch', path: '/ecommerce/products/apple-watch' },
        { title: 'iPhone 11 Pro', path: '/ecommerce/products/iphone-11-pro' },
        { title: 'Nike Shoes', path: '/ecommerce/products/nike-shoes' },
        { title: 'Laptop', path: '/ecommerce/products/laptop' },
        { title: 'Camera', path: '/ecommerce/products/camera' },
    ]

    return (
        <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
            component='nav'
            aria-labelledby='nested-list-subheader'
            subheader={
                <ListSubheader component='div' id='nested-list-subheader'>
                    Ecommerce Navigation
                </ListSubheader>
            }
        >
            <ListItemButton onClick={handleClickCategories}>
                <Store sx={{ marginRight: 2 }} />
                <ListItemText primary='Categories' />
                {openCategories ? <ChevronUp /> : <ChevronDown />}
            </ListItemButton>
            <Collapse in={openCategories} timeout='auto' unmountOnExit>
                <List component='div' disablePadding>
                    {categories.map((category, index) => (
                        <ListItem key={index} disablePadding>
                            <Link href={category.path || ''} passHref legacyBehavior>
                                <ListItemButton sx={{ pl: 4 }}>
                                    <ListItemText primary={category.title} />
                                </ListItemButton>
                            </Link>
                        </ListItem>
                    ))}
                </List>
            </Collapse>
            <ListItemButton onClick={handleClickProducts}>
                <Tag sx={{ marginRight: 2 }} />
                <ListItemText primary='Products' />
                {openProducts ? <ChevronUp /> : <ChevronDown />}
            </ListItemButton>
            <Collapse in={openProducts} timeout='auto' unmountOnExit>
                <List component='div' disablePadding>
                    {products.map((product, index) => (
                        <ListItem key={index} disablePadding>
                            <Link href={product.path || ''} passHref legacyBehavior>
                                <ListItemButton sx={{ pl: 4 }}>
                                    <ListItemText primary={product.title} />
                                </ListItemButton>
                            </Link>
                        </ListItem>
                    ))}
                </List>
            </Collapse>
        </List>
    )
}

export default EcommerceNav
