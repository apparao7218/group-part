const express = require('express');
const router = express.Router();
const ExcelSheet = require('../models/excel');

router.post('/', async (req, res) => {
    try {
        const groupSize = parseInt(req.body.groupSize, 10) || 4; // Use groupSize from request or default to 4

        if (!groupSize || isNaN(groupSize) || groupSize <= 0) {
            return res.status(400).send('Invalid group size.');
        }
        const excelSheet = await ExcelSheet.findOne().sort({ uploadDate: -1 }).exec();
        if (!excelSheet) {
            return res.status(404).send('No Excel file found.');
        }

        const data = excelSheet.data;

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).send('No data found in the Excel sheet.');
        }

        // below code find the index where SNO starts with '1'
        const startIndex = data.findIndex(row => row.columns.get('column1') === '1');
        if (startIndex === -1) {
            return res.status(400).send('No valid starting row found in the Excel sheet.');
        }

        const validRows = data.slice(startIndex).filter(row => {
            const sno = row.columns.get('column1');
            const name = row.columns.get('column4');
            return sno !== undefined && name !== undefined && sno !== 'S.NO' && name !== 'STUD NAME';
        }).map(row => ({
            sno: row.columns.get('column1'),
            name: row.columns.get('column4')
        }));

        const groups = [];
        let index = 0;

        // Distribute members evenly into existing groups
        while (index < validRows.length) {
            const group = [];
            while (group.length < groupSize && index < validRows.length) {
                group.push(validRows[index]);
                index++;
            }
            // creates a seperate group if members reach described size
            if (group.length === groupSize) {
                groups.push(group);
            }
        }

        // Calculate the number of  members left
        const totalMembers = validRows.length;
        const totalGroups = groups.length;
        const remainder = totalMembers % groupSize;

        if (remainder > 0 && totalGroups > 0) {
            // Extract left members
            const remainderMembers = validRows.slice(-remainder);

            // Distribute left members to existing groups
            let groupIndex = 0;
            remainderMembers.forEach(member => {
                // Add members to groups only if the group has space
                if (groups[groupIndex].length < groupSize) {
                    groups[groupIndex].push(member);
                } else {
                    groupIndex = (groupIndex + 1) % totalGroups; 
                    groups[groupIndex].push(member);
                }
            });
        }

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send('Error processing data.');
    }
});

module.exports = router;
