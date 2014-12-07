var MongoClient = require('mongodb').MongoClient;

//Callback function for me to add objects to a collection
function addObject(collection, object) {
  collection.insert(object, function(err, result) {
    if (!err) {
      console.log("Inserted : ");
      console.log(result);
    }
  });
}

//Connect to Mongo
MongoClient.connect("mongodb://localhost/", function(err, db) {
  //Connecting as Admin
  var adminDB = db.admin();
  adminDB.listDatabases(function(err, databases) {
    console.log(" ");
    console.log("This is the original list of database before i have done anything");
    console.log(databases);
    console.log(" ");
  });
  //Creating a Database, in this case called NewDB
  var newDB = db.db("newDB");
  //Listing Collection Names that are in the Database, at the moment it should be nothing as it has just been created
  newDB.collectionNames(function(err, collectionNames) {
    console.log("This List the collections in the database - should be empty");
    console.log(collectionNames);
    console.log(" ");
    //Creating a Collection, in this case collection
    newDB.createCollection("colleciton", function(err, collection) {
      if (!err) {
        //If theres no Erroes add this to the collection called collection
        addObject(collection, {
          ngc: "NGC 7293",
          name: "Helix",
          type: "planetary",
          location: "Aquila"
        });
        addObject(collection, {
          ngc: "NGC 6543",
          name: "Cat's Eye",
          type: "planetary",
          location: "Draco"
        });
        addObject(collection, {
          ngc: "NGC 1952",
          name: "Crab",
          type: "supernova",
          location: "Taurus"
        });
        console.log("New Database and Collection Created");
        //Listing the Databases
        adminDB.listDatabases(function(err, databases) {
          console.log(" ");
          console.log("I have now added a database called newDB");
          console.log(databases);
          console.log(" ");
          //Listing the Collection Names within the Database
          newDB.collectionNames(function(err, collectionNames) {
            console.log("These are the collections in the database newDB: There should be one called 'collection'");
            console.log(collectionNames);
            console.log(" ");
            collection.findOne({
              type: 'planetary'
            }, function(err, item) {
              console.log("Here I am searching for something witha  type: planetary");
              console.log(item);
              console.log(" ");
              collection.find(function(err, items) {
                items.toArray(function(err, itemArr) {
                  console.log("These are all my documents in the collection called collection");
                  console.log(itemArr);
                  console.log(" ");
                  //Updating the collection with any objects that have planetary to Planetay.
                  collection.update({
                    type: "planetary",
                    $isolated: 1
                  }, {
                    $set: {
                      type: "Planetary",
                      updated: true
                    }
                  }, {
                    upsert: false,
                    multi: true,
                    w: 1
                  },
                  function(err, results) {
                    collection.find({
                      type: "Planetary"
                    }, function(err, items) {
                      items.toArray(function(err, itemArr) {
                        console.log("After Update: ");
                        console.log(itemArr);

                        //Remvoing everything in the collection that has a type of plantary
                        collection.remove({
                          type: "Planetary"
                        }, function(err, results) {
                          console.log("Delete:\n " + results);
                          collection.find(function(err, items) {
                            items.toArray(function(err, itemArr) {
                              console.log("After Delete: ");
                              console.log(itemArr);
                              console.log(" ");
                              //Dropping the collection within the database called collection and outputting the answer
                              newDB.dropCollection("colleciton", function(err, results) {
                                console.log(" ");
                                newDB.collectionNames(function(err, collectionNames) {
                                  console.log("Collections after deletion: ");
                                  console.log(collectionNames);
                                  console.log(" ");
                                  //Setting a timer to delete the database - giving it enough time to do everything before deleting.
                                  setTimeout(function() {
                                    db.db("newDB").dropDatabase(function(err, results) {
                                      if (!err) {
                                        console.log("Database dropped.");
                                        adminDB.listDatabases(function(err, results) {
                                          var found = false;
                                          for (var i = 0; i < results.databases.length; i++) {
                                            if (results.databases[i].name == "newDB") found = true;
                                          }
                                          if (!found) {
                                            console.log("After Delete Database List: ");
                                            console.log(results);
                                          }
                                          db.close();
                                        });
                                      }
                                    });
                                  }, 8000);
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }
    });
  });
});
