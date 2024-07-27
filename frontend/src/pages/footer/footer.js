import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const Footer = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                px: 0.7,
                py: 0.7,
                position: 'fixed',
                bottom: 0,
                width: '100%',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                borderTop: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Typography
                sx={{
                    fontSize: {
                        xs: '0.7rem',
                        sm: '0.875rem',
                        md: '1rem'
                    }
                }}>
                Developed by Apparao Puchakayala
            </Typography>
            <Typography sx={{
                fontSize: {
                    xs: '0.7rem',
                    sm: '0.875rem',
                    md: '1rem'
                }
            }}>
                CSE-Technician - SOT
            </Typography>
        </Box>
    );
};

export default Footer;
