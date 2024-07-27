import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
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
                flexDirection: 'column',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1200,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.default,
                img: {
                    width: {
                        xs: '95px',   
                        sm: '125px', 
                        md: '135px',  
                        lg: '135px', 
                        xl: '150px'  
                    },
                    height: 'auto'
                }
            }}
        >
            <img src={logo} alt="Woxsen Logo" />
            <Typography sx={{
                fontSize: {
                    xs: '9px',  
                    sm: '9px',   
                    md: '10px',  
                    lg: '11px',  
                    xl: '12px'   
                },
                fontWeight: '', 
                mt: 0, 
                mr: 2.5,
                textAlign: 'center'
            }}>
                SCHOOL OF TECHNOLOGY
            </Typography>
        </Box>
    );
};

export default Header;
