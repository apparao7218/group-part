import React from 'react';
import { Box, useTheme } from '@mui/material';
import logo from '../../assets/woxsenlogo.jpg';

const Header = () => {
    const theme = useTheme();

    return (
        <Box
            component="header"
            sx={{
                px: 2,
                py: 2,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1200,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.default,
            }}
        >
            <img src={logo} alt="Woxsen Logo" style={{ width: '135px', height: 'auto' }} />
        </Box>
    );
};

export default Header;
