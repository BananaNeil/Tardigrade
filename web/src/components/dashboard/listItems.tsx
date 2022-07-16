import * as React from 'react';
import {useLocation} from 'react-router-dom';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';


export const MainListItems = ({handleSideNav}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  let location = useLocation()
  const handleListItemClick = (index:number) => {
    setSelectedIndex(index)
  }
  const navItems = [
    {
      primary: "Dashboard",
      icon: (<DashboardIcon />),
      route: '/',
      selectedIndex: 0
    },
    {
      primary: "Add Username",
      icon: (<PeopleIcon />),
      route: '/signup',
      selectedIndex: 1
    },
  ]
  const navItemComponents = navItems.map((item, i) => {
    return (
      <ListItemButton
        key={i}
        selected={selectedIndex === item.selectedIndex}
        onClick={() => {
        handleSideNav(item.route)
        handleListItemClick(i)
        }}
      >
        <ListItemIcon>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.primary} />
      </ListItemButton>
    )
  })

  React.useEffect(() => {
    const navItem = navItems.find((item) => item.route === location.pathname)
    setSelectedIndex(navItem ? navItem.selectedIndex: 0)
  }, [location])

  return (
  <React.Fragment>
    {navItemComponents}
    {/*
    <ListItemButton>
      <ListItemIcon>
        <ShoppingCartIcon />
      </ListItemIcon>
      <ListItemText primary="Orders" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Customers" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Integrations" />
    </ListItemButton>
    */}
  </React.Fragment>
)};

export const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset>
      Saved reports
    </ListSubheader>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItemButton>
  </React.Fragment>
);
