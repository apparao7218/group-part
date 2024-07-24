const express = require('express');
const router = express.Router();
const ExcelSheet = require('../models/excel');

router.post('/', async (req, res) => {
    try {
        const groupSize = parseInt(req.body.groupSize, 10) || 3;

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

        // Find the index where SNO starts with '1'
        const startIndex = data.findIndex(row => row.columns.get('column1') === '1');
        if (startIndex === -1) {
            return res.status(400).send('No valid starting row found in the Excel sheet.');
        }

        const validRows = data.slice(startIndex).filter(row => {
            const sno = row.columns.get('column1');
            const name = row.columns.get('column4');
            const cgpa = row.columns.get('column5'); // Assuming CGPA is in column5
            return sno !== undefined && name !== undefined && cgpa !== undefined && sno !== 'S.NO' && name !== 'STUD NAME' && !isNaN(parseFloat(cgpa));
        }).map(row => ({
            sno: row.columns.get('column1'),
            name: row.columns.get('column4'),
            cgpa: parseFloat(row.columns.get('column5')) // Convert CGPA to number
        }));

        // Sort rows by CGPA in descending order
        validRows.sort((a, b) => b.cgpa - a.cgpa);

        const totalMembers = validRows.length;
        const partSize = Math.floor(totalMembers / 3);
        const remainder = totalMembers % 3;

        const higher = validRows.slice(0, partSize + (remainder > 0 ? 1 : 0));
        const medium = validRows.slice(partSize + (remainder > 0 ? 1 : 0), 2 * partSize + (remainder > 1 ? 1 : 0));
        const low = validRows.slice(2 * partSize + (remainder > 1 ? 1 : 0));

        // Create groups
        const groups = [];
        const usedHigher = new Set();
        const usedLow = new Set();

        let higherIndex = 0;
        let lowIndex = low.length - 1;

        while (higherIndex < higher.length || lowIndex >= 0) {
            const group = [];

            // Add first person from higher if available and not used
            while (higherIndex < higher.length) {
                const higherPerson = higher[higherIndex++];
                if (!usedHigher.has(higherPerson.sno)) {
                    group.push(higherPerson);
                    usedHigher.add(higherPerson.sno);
                    break;
                }
            }

            // Add one person from medium if available
            if (medium.length > 0) {
                const mediumPerson = medium.shift();
                group.push(mediumPerson);
            }

            // Add last person from low if available and not used
            while (lowIndex >= 0) {
                const lowPerson = low[lowIndex--];
                if (!usedLow.has(lowPerson.sno)) {
                    group.push(lowPerson);
                    usedLow.add(lowPerson.sno);
                    break;
                }
            }

            // Add additional members from low to meet the group size
            while (group.length < groupSize && lowIndex >= 0) {
                const lowPerson = low[lowIndex--];
                if (!usedLow.has(lowPerson.sno)) {
                    group.push(lowPerson);
                    usedLow.add(lowPerson.sno);
                }
            }

            // Add the group to the list if it has members
            if (group.length > 0) {
                groups.push(group);
            }
        }

        // Log the results for debugging
        console.log('Higher:', higher);
        console.log('Higher count:', higher.length);
        console.log('Medium:', medium);
        console.log('Medium count:', medium.length);
        console.log('Low:', low);
        console.log('Low count:', low.length);

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send('Error processing data.');
    }
});

module.exports = router;
