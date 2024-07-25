import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, CircularProgress, TableFooter } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import instructionPng from '../../assets/instructions.png';

const Home = () => {
    const [file, setFile] = useState(null);
    const [groups, setGroups] = useState([]);
    const [groupSize, setGroupSize] = useState('');
    const [fileError, setFileError] = useState('');
    const [groupSizeError, setGroupSizeError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setFileError('');
    };

    const handleGroupSizeChange = (event) => {
        setGroupSize(event.target.value);
        setGroupSizeError('');
    };

    const handleUpload = async () => {
        let valid = true;

        if (!file) {
            setFileError('Please select a file.');
            valid = false;
        }

        if (!groupSize || isNaN(groupSize) || groupSize <= 0) {
            setGroupSizeError('Please enter a valid group size.');
            valid = false;
        }

        if (!valid) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('groupSize', groupSize);

        setLoading(true);

        try {
            await axios.post('http://localhost:3001/api/excel-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const processResponse = await axios.post('http://localhost:3001/api/excel-process', { groupSize });

            setGroups(processResponse.data);
            setIsFileUploaded(true);

        } catch (error) {
            console.error('Error uploading or processing file:', error);
            setFileError('Error processing the file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFont('Poppins', 'normal');

        const headers = ['S.NO', 'STUDENT ID', 'STUDNAME'];

        let yOffset = 30;
        let sequentialNumber = 1;

        groups.forEach((group, index) => {
            const avgCgpa = (group.reduce((sum, member) => sum + member.cgpa, 0) / group.length).toFixed(2);

            doc.setFontSize(14);
            doc.text(`Group ${index + 1}`, 14, yOffset);
            yOffset += 10;

            doc.setFontSize(12);
            doc.text(`Avg CGPA of this group: ${avgCgpa}`, 14, yOffset);
            yOffset += 10;

            const data = group.map(member => [sequentialNumber++, member.studentId, member.name]);

            const columnStyles = {
                0: { halign: 'center' },
                1: { halign: 'center' },
                2: { halign: 'center' }
            };

            doc.autoTable({
                head: [headers],
                body: data,
                startY: yOffset,
                margin: { horizontal: 14 },
                theme: 'grid',
                columnStyles: columnStyles,
                headStyles: {
                    halign: 'center',
                    font: 'Poppins',
                    fontSize: 12
                },
                styles: {
                    font: 'Poppins',
                    fontSize: 10
                },
                didDrawCell: (data) => {
                    if (data.row.index === 0) {
                        data.cell.styles.fillColor = [0, 0, 255];
                        data.cell.styles.textColor = [255, 255, 255];
                    }
                }
            });

            yOffset = doc.lastAutoTable.finalY + 20;
        });

        doc.save('grouped_data.pdf');
    };

    const calculateAverageCGPA = (group) => {
        if (group.length === 0) return 0;
        const totalCGPA = group.reduce((sum, member) => sum + parseFloat(member.cgpa), 0);
        return totalCGPA / group.length;
    };

    return (
        <Container sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100vh",
            width: "100vw",
            overflow: "hidden",
            padding: 2,
        }}>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                </Box>
            ) : (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    width='100%'
                >
                    <Typography variant="h5" component="h1" gutterBottom>
                        Upload Excel File
                    </Typography>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ gap: 2 }}
                    >
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent='center'
                            alignItems="stretch"
                            sx={{ gap: 2, padding: 2, borderRadius: 1 }}
                        >
                            <TextField
                                required
                                type="file"
                                onChange={handleFileChange}
                                inputProps={{ accept: '.xlsx, .xls' }}
                                variant="outlined"
                                error={!!fileError}
                                helperText={fileError}
                            />
                            <TextField
                                label="Enter the group size"
                                type="number"
                                value={groupSize}
                                onChange={handleGroupSizeChange}
                                variant="outlined"
                                inputProps={{ min: 1 }}
                                error={!!groupSizeError}
                                helperText={groupSizeError}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<UploadFileIcon />}
                                onClick={handleUpload}
                                fullWidth
                            >
                                Upload
                            </Button>
                        </Box>
                        {!isFileUploaded && (
                            <Box
                                sx={{ width: '100%', marginTop: 2, textAlign: 'center', padding: 2, borderRadius: 1 }}
                            >
                                <Typography variant="body1" color='red' sx={{ mb: 2 }}>
                                    Please upload an Excel file with the following format only to get group data:
                                </Typography>
                                <img src={instructionPng} alt="instructions" style={{ width: '80%', maxHeight: '500px', objectFit: 'contain' }} />
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
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
                                                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ color: '#ffffff', textAlign: 'center' }}>S.No</TableCell>
                                                            <TableCell sx={{ color: '#ffffff', textAlign: 'center' }}>Student Id</TableCell>
                                                            <TableCell sx={{ color: '#ffffff', textAlign: 'center' }}>Name</TableCell>
                                                            {/* <TableCell sx={{ color: '#ffffff', textAlign: 'center' }}>CGPA</TableCell> */}

                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {group.map((row, rowIndex) => (
                                                            <TableRow key={rowIndex} sx={{ backgroundColor: rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff' }}>
                                                                <TableCell sx={{ textAlign: 'center' }}>{rowIndex + 1}</TableCell>
                                                                <TableCell sx={{ textAlign: 'center' }}>{row.studentId}</TableCell>
                                                                <TableCell sx={{ textAlign: 'center' }}>{row.name}</TableCell>
                                                                {/* <TableCell sx={{ textAlign: 'center' }}>{row.cgpa}</TableCell> */}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                    <TableFooter>
                                                        <TableRow>
                                                            <TableCell colSpan={3} sx={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1976d2', color: '#ffffff' }}>
                                                                Average CGPA of this group is {calculateAverageCGPA(group).toFixed(2) || 'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableFooter>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography variant="body1">No data available</Typography>
                                        )}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={downloadPDF}
                            sx={{ marginTop: 2, width: '100%', maxWidth: 300 }}
                        >
                            Download PDF
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Home;
