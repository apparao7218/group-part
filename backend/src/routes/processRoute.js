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

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).send('No data found in the Excel sheet.');
        }

        // Find the index where SNO starts with '1'
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

        const groupSize = 4;
        const groups = [];
        const usedMembers = new Set(); // Track members already added to a group

        let index = 0;

        // Distribute members into groups of 4
        while (index < validRows.length) {
            const group = [];
            while (group.length < groupSize && index < validRows.length) {
                const member = validRows[index];
                if (!usedMembers.has(member.sno)) {
                    group.push(member);
                    usedMembers.add(member.sno);
                }
                index++;
            }
            groups.push(group);
        }

        // Calculate the number of remainder members
        const remainder = validRows.length % groupSize;
        const totalGroups = groups.length;

        if (remainder > 0 && totalGroups > 1) {
            // Extract remainder members
            const remainderMembers = validRows.slice(-remainder);

            // Add remainder members evenly to the last few groups without duplication
            let groupIndex = totalGroups - Math.ceil(remainder / groupSize); // Start from the appropriate group

            remainderMembers.forEach((member, idx) => {
                if (!usedMembers.has(member.sno)) {
                    if (groups[groupIndex]) {
                        groups[groupIndex].push(member);
                        usedMembers.add(member.sno);
                        groupIndex = (groupIndex + 1) % totalGroups; // Cycle through groups
                    }
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
