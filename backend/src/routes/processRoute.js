const express = require('express');
const router = express.Router();
const ExcelSheet = require('../models/excel');

router.post('/', async (req, res) => {
    try {
        const excelSheet = await ExcelSheet.findOne().sort({ uploadDate: -1 }).exec();
        if (!excelSheet) {
            return res.status(404).send('No Excel file found.');
        }

        const data = excelSheet.data;

        console.log('Raw data from Excel sheet:', data);

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).send('No data found in the Excel sheet.');
        }

       
        const validRows = data.slice(1).filter(row => {
            const sno = row.columns.get('column1');
            const name = row.columns.get('column4');
            return sno !== undefined && name !== undefined && sno !== 'S.NO' && name !== 'STUD NAME';
        }).map(row => ({
            sno: row.columns.get('column1'),
            name: row.columns.get('column4')
        }));

        console.log('Filtered valid rows with SNO and Name:', validRows);

        const groups = [];
        for (let i = 0; i < validRows.length; i += 4) {
            const group = validRows.slice(i, i + 4);
            groups.push(group);
            console.log(`Group ${Math.floor(i / 4) + 1}:`, group); 
        }

        console.log('Grouped data:', groups);

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error processing data:', error); 
        res.status(500).send('Error processing data.');
    }
});

module.exports = router;
