import React from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const createData = (name, value) => {
  return { name, value };
}

const tableData1 = [
  createData('Item 1', 'Value 1'),
  createData('Item 2', 'Value 2'),
  createData('Item 3', 'Value 3'),
];

const tableData2 = [
  createData('Item A', 'Value A'),
  createData('Item B', 'Value B'),
  createData('Item C', 'Value C'),
];

const Group = () => {
  const renderTable = (data, title) => (
    <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
      <Typography variant="h6" component="div" style={{ padding: '16px' }}>
        {title}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Groups
      </Typography>
      {renderTable(tableData1, 'Table 1')}
      {renderTable(tableData2, 'Table 2')}
    </Container>
  );
};

export default Group;
