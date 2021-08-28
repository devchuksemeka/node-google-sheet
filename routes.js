const { GoogleSpreadsheet } = require('google-spreadsheet');
const faker = require('faker');

const GOOGLESHEET = "1VWqLK7KjJZ3zhnXSv_CuzItKmMWLmzfcyglOFmMMgxo"
// Initialize the sheet - doc ID is the long id in the sheets URL
const doc = new GoogleSpreadsheet(GOOGLESHEET);

const farmerSheetId = 0

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY =  process.env.GOOGLE_PRIVATE_KEY

const addRecord = async (req, res) => {
    try{
        // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
        await doc.useServiceAccountAuth({
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key:  GOOGLE_PRIVATE_KEY,
        });

        await doc.loadInfo(); // loads document properties and worksheets
        // console.log(doc.title);
        const farmerSheet = doc.sheetsById[farmerSheetId]
        await farmerSheet.setHeaderRow([
            'id',
            'first_name',
            'last_name',
            'email',
            'gender',
            'dob',
        ])
        // append rows
        const id = faker.datatype.uuid()
        const first_name = faker.name.firstName()
        const last_name = faker.name.lastName()
        const email = faker.internet.email(first_name, last_name).replace(/ /g,"_").toLowerCase()
        const gender = "Male"
        await farmerSheet.addRow({ 
            id,
            first_name,
            last_name, 
            email,
            gender,
            dob: "1992/01/01"
        });

        console.log("Items Added to Farmer Sheet successfully");
        res.json({message: "It works"})
    }
    catch(err){
        res.json({message: `Failed to Add Record: ${err.message}`})
    }
}

const updateRecord = async (req, res) => {
    try{
        const {farmerId} = req.params
        const {email,gender} = req.query
        await doc.useServiceAccountAuth({
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key:  GOOGLE_PRIVATE_KEY,
        });

        const payload = {
            email,
            gender
        }

        await doc.loadInfo();

        const farmerSheet = doc.sheetsById[farmerSheetId]
        // append rows
        const farmers = await farmerSheet.getRows({});
        const farmer = farmers.find(farmer => {
            return farmer.id === farmerId
        })
        if(!farmer) throw new Error("Farmer not found")

        if(email) farmer.email = payload.email
        if(gender) farmer.gender = payload.gender

        await farmer.save()
        res.json({message: "Farmer updated successfully"})
    }
    catch(err){
        res.json({message: `Failed to Updated: ${err.message}`})
    }
}

const deleteRecord = async (req, res) => {
    try{
        const {farmerId} = req.params
        await doc.useServiceAccountAuth({
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key:  GOOGLE_PRIVATE_KEY,
        });

        await doc.loadInfo();

        const farmerSheet = doc.sheetsById[farmerSheetId]
        // append rows
        const farmers = await farmerSheet.getRows({});
        const farmer = farmers.find(farmer => {
            return farmer.id === farmerId
        })
        if(!farmer) throw new Error("Farmer not found")

        await farmer.delete()
        res.json({message: "Farmer deleted successfully"})
    }
    catch(err){
        res.json({message: `Failed to delete: ${err.message}`})
    }
}


module.exports = {
    addRecord,
    updateRecord,
    deleteRecord
}