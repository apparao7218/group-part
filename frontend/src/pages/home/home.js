import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

const Home = () => {
    const [file, setFile] = useState(null);
    const [groups, setGroups] = useState([]);
    const [groupSize, setGroupSize] = useState(''); // State to hold group size

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleGroupSizeChange = (event) => {
        setGroupSize(event.target.value);
    };

    const handleUpload = async () => {
        if (!file) {
            console.log('No file selected');
            return;
        }

        if (!groupSize || isNaN(groupSize) || groupSize <= 0) {
            console.log('Invalid group size');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('groupSize', groupSize); 

        try {
            // Upload the file
            const uploadResponse = await axios.post('http://localhost:3001/api/excel-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('File uploaded successfully:', uploadResponse.data);

            // Process the file and get the grouped data
            const processResponse = await axios.post('http://localhost:3001/api/excel-process', { groupSize });
            console.log('Data processed and grouped:', processResponse.data);
            setGroups(processResponse.data);

        } catch (error) {
            console.error('Error uploading or processing file:', error);
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
                        required
                        type="file"
                        onChange={handleFileChange}
                        inputProps={{ accept: '.xlsx, .xls' }}
                        variant="outlined"
                    />
                    <TextField
                        label="Enter the group size"
                        type="number"
                        value={groupSize}
                        onChange={handleGroupSizeChange}
                        variant="outlined"
                        inputProps={{ min: 1 }} 
                        sx={{ marginLeft: 2 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<UploadFileIcon />}
                        onClick={handleUpload}
                        sx={{ marginLeft: 2 }}
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
                                                                <TableCell>{rowIndex + 1}</TableCell>
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
