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
            const studentId = row.columns.get('column2');
            const name = row.columns.get('column3');
            const cgpa = row.columns.get('column4'); 
            return sno !== undefined && name !== undefined && cgpa !== undefined && sno !== 'S.NO' && name !== 'STUD NAME' && !isNaN(parseFloat(cgpa));
        }).map(row => ({
            sno: row.columns.get('column1'),
            studentId :row.columns.get('column2'),
            name: row.columns.get('column3'),
            cgpa: parseFloat(row.columns.get('column4')) 
        }));

        if (validRows.length === 0) {
            return res.status(400).send('Oops, it looks like your sheet doesn’t have any valid data.');
        }
        
        // Sort rows by CGPA in descending order
        validRows.sort((a, b) => b.cgpa - a.cgpa);

        const totalMembers = validRows.length;
        const partSize = Math.floor(totalMembers / 3);
        const remainder = totalMembers % 3;

        // dividing students into three parts
        const higherEnd = partSize + (remainder > 0 ? 1 : 0);
        const mediumEnd = higherEnd + partSize + (remainder > 1 ? 1 : 0);
        const lowStart = mediumEnd;

        const higher = validRows.slice(0, higherEnd);
        const medium = validRows.slice(higherEnd, mediumEnd);
        const low = validRows.slice(lowStart);

        // console.log('Higher:', higher);
        // console.log('Higher count:', higher.length);
        // console.log('Medium:', medium);
        // console.log('Medium count:', medium.length);
        // console.log('Low:', low);
        // console.log('Low count:', low.length);

        // Create groups based on specified size
        const groups = [];
        let higherIndex = 0;
        let lowIndex = low.length - 1;

        while (higherIndex < higher.length || lowIndex >= 0) {
            const group = [];

            // Add one person from higher if available
            if (higherIndex < higher.length) {
                group.push(higher[higherIndex]);
                higherIndex++;
            }

            // Add one person from low if available
            if (lowIndex >= 0) {
                group.push(low[lowIndex]);
                lowIndex--;
            }

            // Add random members from medium
            while (group.length < groupSize && medium.length > 0) {
                const randomIndex = Math.floor(Math.random() * medium.length);
                group.push(medium[randomIndex]);
                medium.splice(randomIndex, 1); 
            }

            // Add the group to the list if it meets the specified size
            if (group.length === groupSize) {
                groups.push(group);
            } else {
                // If not enough members to form a valid group, add remaining members
                medium.push(...group); 
            }
        }

        // Add remaining members to existing groups
        const remainingMembers = [...higher.slice(higherIndex), ...medium, ...low.slice(0, lowIndex + 1)];
        if (remainingMembers.length > 0) {
            let i = 0;
            while (remainingMembers.length > 0) {
                const member = remainingMembers.shift();
                if (groups.length > 0) {
                    groups[i % groups.length].push(member);
                } else {
                    groups.push([member]);
                }
                i++;
            }
        }
        // const groupsWithAverages = groups.map(group => {
        //     const totalCGPA = group.reduce((sum, member) => sum + member.cgpa, 0);
        //     const averageCGPA = totalCGPA / group.length;
        //     return {
        //         members: group,
        //         averageCGPA: averageCGPA.toFixed(2) 
        //     };
        // });
        
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send('Error processing data.');
    }
});

module.exports = router;