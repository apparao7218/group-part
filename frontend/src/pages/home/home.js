import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableHead,
    TableRow,
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Grid,
    CircularProgress,
    TableContainer,
    TableCell,
    TableBody,
    TableFooter
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Footer from '../footer/footer';

const Home = () => {
    const [file, setFile] = useState(null);
    const [groups, setGroups] = useState([]);
    const [groupSize, setGroupSize] = useState('');
    const [fileError, setFileError] = useState('');
    const [groupSizeError, setGroupSizeError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);


    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

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
            // const url = 'http://localhost:3001';

            // await axios.post(`${url}/api/excel-upload`, formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            // });

            // const processResponse = await axios.post(`${url}/api/excel-process`, { groupSize });

            await axios.post('/api/excel-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });


            const processResponse = await axios.post('/api/excel-process', { groupSize });

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

        doc.setFontSize(18);
        doc.text('Groups', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

        let yOffset = 30;
        const pageHeight = doc.internal.pageSize.getHeight();
        const headers = ['S.NO', 'STUDENT ID', 'STUDNAME'];
        const groupInfoHeight = 20; // Height for group title and average CGPA text

        groups.forEach((group, index) => {
            const avgCgpa = (group.reduce((sum, member) => sum + member.cgpa, 0) / group.length).toFixed(2);

            let sequentialNumber = 1;
            const data = group.map(member => [sequentialNumber++, member.studentId, member.name]);
            const tableHeight = data.length * 10 + 20; // Estimate the height of the table

            if (yOffset + groupInfoHeight + tableHeight > pageHeight) {
                doc.addPage();
                yOffset = 30;
            }

            doc.setFontSize(14);
            doc.text(`Group ${index + 1}`, 14, yOffset);
            yOffset += 10;

            doc.setFontSize(12);
            doc.text(`Avg CGPA of this group: ${avgCgpa}`, 14, yOffset);
            yOffset += 10;

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

    const downloadTemplate = () => {
        const workbook = XLSX.utils.book_new();
        const worksheetData = [
            ['S.NO', 'STUDENTID', 'STUDNAME', 'CGPA']
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'student_data_template.xlsx');
    };

    const totalStudents = groups.reduce((sum, group) => sum + group.length, 0);


    return (
        <Container
            disableGutters
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "calc(100vh - 220px)",
                width: "100%",
                overflow: "hidden",
                padding: 2,
                marginTop: '120px',
                marginBottom: '120px',
            }}
        >
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                </Box>
            ) : (
                !isFileUploaded && (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        width='100%'
                    >
                        <Box>
                            <Typography variant="h5" component="h1" gutterBottom>
                                Student Groups
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="h7" gutterBottom>
                                Upload Excel File
                            </Typography>
                        </Box>
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
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={downloadTemplate}
                                    fullWidth
                                >
                                    Download Template
                                </Button>
                            </Box>
                            <Typography variant='h7' color='tomato'>Download the Template first and insert the student data and upload..</Typography>
                        </Box>
                    </Box>
                )
            )}
            {isFileUploaded && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="flex-start"
                    sx={{
                        height: '100%',
                        width: '100%',
                        overflowY: 'auto',
                        overflowX:'hidden',
                        p: 1
                    }}
                >
                    {groups.length > 0 && (
                        <Box mt={4} width="100%" display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                        // border='1px solid black'
                        >
                            <Typography variant="h5">Grouped Data</Typography>
                            <Box sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: 'center',
                                alignItems: 'center',
                                // border: '1px solid black',
                                width: '100%',
                                p: 2,
                                gap: 3
                            }}>
                                <Paper sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    p: 2,
                                }}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <Box sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        p: 2,
                                    }}>
                                        <Typography variant="h7" mr={2}>Group Size : {groupSize}   </Typography>
                                        <Typography variant="h7" mr={2}>Total Students : {totalStudents}   </Typography>
                                        <Typography variant="h7" >Total Groups: {groups.length} </Typography>
                                    </Box>
                                    {isHovered ? (
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            justifyContent='center'
                                            alignItems="center"
                                            // border="1px solid black"
                                            sx={{ gap: 1, width: '100%' }}
                                        >
                                            <Box display="flex"
                                                flexDirection={{ xs: 'column', sm: 'row' }}
                                                justifyContent='center'
                                                alignItems="center"
                                                // border="1px solid black"
                                                sx={{ gap: 2, borderRadius: 1, height: 'auto', width: '100%' }}>
                                                <TextField
                                                    label="Enter the group size"
                                                    type="number"
                                                    value={groupSize}
                                                    onChange={handleGroupSizeChange}
                                                    variant="outlined"
                                                    inputProps={{ min: 1 }}
                                                    error={!!groupSizeError}
                                                    helperText={groupSizeError}
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            height: '50px',
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            fontSize: '12px', 
                                                        },
                                                        '& .MuiFormHelperText-root': {
                                                            fontSize: '10px', 
                                                        },
                                                    }}
                                                />

                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    startIcon={<UploadFileIcon />}
                                                    onClick={handleUpload}
                                                // fullWidth
                                                >
                                                    Submit
                                                </Button>
                                            </Box>
                                            <Box display="flex"
                                                flexDirection="column"
                                                justifyContent='center'
                                                alignItems="center"
                                                // border="1px solid black"
                                                sx={{ borderRadius: 1, height: 'auto', width: '100%' }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={downloadPDF}
                                                    sx={{}}
                                                >
                                                    Download PDF
                                                </Button>
                                            </Box>
                                        </Box>) : ''}
                                </Paper>
                            </Box>
                            <Grid container spacing={2}>
                                {groups.map((group, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                            <Typography variant="h7" textAlign="center" p={1}>Group {index + 1}</Typography>
                                            {group.length > 0 ? (
                                                <TableContainer component={Paper}>
                                                    <Table>
                                                        <TableHead sx={{ backgroundColor: '#1976d2' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ color: '#ffffff', textAlign: 'center' }}>S.No</TableCell>
                                                                <TableCell sx={{ color: '#ffffff', textAlign: 'center' }}>Student Id</TableCell>
                                                                <TableCell sx={{ color: '#ffffff', textAlign: 'center' }}>Name</TableCell>
                                                                <TableCell sx={{ color: '#ffffff', textAlign: 'center' }}>CGPA</TableCell>

                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {group.map((row, rowIndex) => (
                                                                <TableRow key={rowIndex} sx={{ backgroundColor: rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff' }}>
                                                                    <TableCell sx={{ textAlign: 'center' }}>{rowIndex + 1}</TableCell>
                                                                    <TableCell sx={{ textAlign: 'center' }}>{row.studentId}</TableCell>
                                                                    <TableCell sx={{ textAlign: 'center' }}>{row.name}</TableCell>
                                                                    <TableCell sx={{ textAlign: 'center' }}>{row.cgpa}</TableCell>

                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                        <TableFooter>
                                                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                                                <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#ffffff' }}>
                                                                    <Typography variant='h9'>Avg CGPA of this group: {calculateAverageCGPA(group).toFixed(2)}</Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableFooter>
                                                    </Table>
                                                </TableContainer>
                                            ) : (
                                                <Typography>No data available for this group.</Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={downloadPDF}
                                sx={{ marginTop: '16px', marginBottom: '16px' }}
                            >
                                Download PDF
                            </Button>
                        </Box>
                    )}
                </Box>
            )
            }
            <Footer />
        </Container >
    );
};

export default Home;
