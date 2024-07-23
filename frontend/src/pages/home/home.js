import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

const Home = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleGroups = ()=>{

    };

    const handleUpload = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post('http://localhost:3001/api/excel-upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log('File uploaded successfully:', response.data);
                alert('file upload successfully');
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        } else {
            console.log('No file selected');
        }
    };

    return (
        <Container  sx={{
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"center",
            // border: '1px solid red',
            height:"100vh",
            width:"100vw"
        }}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100vh"
                width="100vw"
                // border="1px solid yellow"
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Upload Excel File
                </Typography>
                <Box display="flex" flexDirection='row' alignItems="center" 
                sx={{
                    gap:1
                }}>
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
                        // style={{ marginLeft: '16px' }}
                    >
                        Upload
                    </Button>
                </Box>
                <Box display="flex" alignItems="center" sx={{
                    mt:1
                }}>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: '16px' }}
                        onClick={handleGroups}
                    >
                        make as groups
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Home;
