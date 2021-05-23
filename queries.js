const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://kimiakavanroodi:!@Ramz12@cluster0.5iqdk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



