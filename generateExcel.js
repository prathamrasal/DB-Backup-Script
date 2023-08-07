// For Generating Excel

const { MongoClient } = require('mongodb');
const ExcelJS = require('exceljs');

const sourceUrl = 'mongodb+srv://sprajapati:Entropy@cluster0.nzhdw.mongodb.net/agri-api?retryWrites=true&w=majority';

async function openDbFromUrl(mongoUrl) {
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        return client.db();
    } catch (err) {
        console.error('error opening database:', err);
        throw err;
    }
}

async function generateExcelSheet(source) {
    try {
        const collectionNames = await source.listCollections().toArray();

        const workbook = new ExcelJS.Workbook();

        for (const collectionInfo of collectionNames) {
            const collectionName = collectionInfo.name;
            console.log(`Generating sheet for collection: ${collectionName}`);

            const sourceCollection = source.collection(collectionName);
            const worksheet = workbook.addWorksheet(collectionName);

            const results = await sourceCollection.find().toArray();

            if (results.length > 0) {
                const keys = Object.keys(results[0]);

                // Add headers to the worksheet
                worksheet.addRow(keys);

                // Add data rows
                results.forEach(row => {
                    const values = keys.map(key => row[key]);
                    worksheet.addRow(values);
                });

                console.log(`Added ${results.length} rows to ${collectionName}`);
            }
        }

        // Save the workbook to a file
        await workbook.xlsx.writeFile('output.xlsx');
        console.log('Excel spreadsheet generated successfully');
    } catch (err) {
        console.error('Error generating Excel spreadsheet:', err);
        throw err;
    }
}

(async () => {
    try {
        const sourceDb = await openDbFromUrl(sourceUrl);
        await generateExcelSheet(sourceDb);
    } catch (err) {
        process.exit(1);
    }
})();
