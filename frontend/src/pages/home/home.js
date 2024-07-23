import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

const Home = () => {
    const [file, setFile] = useState(null);
    const [groups, setGroups] = useState([]);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const uploadResponse = await axios.post('http://localhost:3001/api/excel-upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log('File uploaded successfully:', uploadResponse.data);

                const processResponse = await axios.post('http://localhost:3001/api/excel-process');
                console.log('Data processed and grouped:', processResponse.data);
                setGroups(processResponse.data);

            } catch (error) {
                console.error('Error uploading or processing file:', error);
            }
        } else {
            console.log('No file selected');
        }
    };

    return (
        <Container sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100vw",
            overflow: "hidden",
            padding: 2
        }}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{ width: '100%', marginBottom: 2 }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Upload Excel File
                </Typography>
                <Box display="flex" flexDirection='row' alignItems="center" sx={{ gap: 1 }}>
                    <TextField
                        type="file"
                        onChange={handleFileChange}
                        inputProps={{ accept: '.xlsx, .xls' }}
                        variant="outlined"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<UploadFileIcon />}
                        onClick={handleUpload}
                    >
                        Upload
                    </Button>
                </Box>
            </Box>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="flex-start"
                sx={{ height: '80vh', width: '100%', overflowY: 'auto' }}
            >
                {groups.length > 0 && (
                    <Box mt={4} width="100%" display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center">
                        <Typography variant="h5">Grouped Data</Typography>
                        <Grid container spacing={2}>
                            {groups.map((group, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Box>
                                        <Typography variant="h6">Group {index + 1}</Typography>
                                        {group.length > 0 ? (
                                            <TableContainer component={Paper}>
                                                <Table>
                                                    <TableHead sx={{ backgroundColor: '#1976d2', color: '#ffffff' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ color: '#ffffff' }}>S.NO</TableCell>
                                                            <TableCell sx={{ color: '#ffffff' }}>STUDNAME</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {group.map((row, rowIndex) => (
                                                            <TableRow key={rowIndex} sx={{ backgroundColor: rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff' }}>
                                                                <TableCell>{row.sno}</TableCell>
                                                                <TableCell>{row.name}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography variant="body1">No data available</Typography>
                                        )}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Home;
