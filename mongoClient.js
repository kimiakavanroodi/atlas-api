
require("dotenv").config();

const uri = "mongodb+srv://kimiakavanroodi:!@Ramz12@cluster0.5iqdk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const { MongoClient } = require("mongodb");
const mongo = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongo.connect((err, result) => { // note the 'result':

    // result == mongo ✅

    // Exports the connection
    module.exports = result

    // Logs out if the process is killed
    process.on("SIGINT", function () {
        mongo.close();
    });
});