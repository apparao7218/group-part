const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const excelSheetSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  data: [
    {
      row: {
        type: Number,
        required: true,
      },
      columns: {
        type: Map,
        of: String,
      },
    },
  ],
});

const ExcelSheet = mongoose.model('ExcelSheet', excelSheetSchema);

module.exports = ExcelSheet;
