import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const Footer = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                px: 2,
                py: 2,
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
                borderTop: `1px solid ${theme.palette.divider}`, // Optional border
            }}
        >
            <Typography variant="h6">
                Developed by Apparao Puchakayala
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                CSE-Technician SOT
            </Typography>
        </Box>
    );
};

export default Footer;
