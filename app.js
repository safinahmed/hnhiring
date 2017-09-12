const mongoose = require('mongoose');
const hnscraper = require('./hnscrapper');

// ES6 promises
mongoose.Promise = Promise;

// mongodb connection
mongoose.connect("mongodb://localhost:27017/nhhiring", {
    useMongoClient: true,
    promiseLibrary: global.Promise
});

var db = mongoose.connection;

// mongodb error
db.on('error', console.error.bind(console, 'connection error:'));

// mongodb connection open
db.once('open', () => {
    console.log(`Connected to Mongo at: ${new Date()}`)
});

var settingsSchema = mongoose.Schema({
    key: String,
    value: String
});
var Settings = mongoose.model('Settings', settingsSchema);

var maxOfferId = 0;
var listingPostId = '15148885'; //This ID is for September 2017

Settings.find({ key: "MAX_OFFER_ID" })
    .then(function(result) {
        if (result.length > 0)
            maxOfferId = result[0].value;

        hnscraper.scrapeForJobs(listingPostId, maxOfferId.toString())
            .then(function(data) {

                if (data.data.length == 0) {
                    db.close();
                    return;
                }


                var jobOffers = db.collection('jobOffers');
                jobOffers.insertMany(data.data)
                    .then(function(result) {
                        console.log(`Inserted ${result.insertedCount} rows`);

                        //Doesn't work with Promises
                        Settings.findOneAndUpdate({ key: 'MAX_OFFER_ID' }, { $set: { value: data.maxOfferId } }, { upsert: true }, function(err, doc) {
                            if (err) {
                                console.log("Error updating maxOfferId: " + err);
                            }
                            db.close();
                        });

                    }).catch(function(err) {
                        console.log(`Error saving to DB: ${err}`);
                    });

            }).catch(function(err) {
                console.log(err);
            });

    }).catch(function(err) {
        console.log(`Error getting MAX_OFFER_ID: ${err}`);
    });