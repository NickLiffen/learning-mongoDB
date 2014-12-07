var MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost/", function(err, db) {
  //Connecting as Admin
  var adminDB = db.admin();
  adminDB.listDatabases(function(err, databases) {
    console.log("Before Add Database List: ");
    console.log(databases);
  });
  //Creating a Database, in this case called NewDB
  var newDB = db.db("newDB");
  //Listing Collection Names that are in the Database, at the moment it should be nothing as it has just been created
  newDB.collectionNames(function(err, collectionNames) {
    console.log("Initial collections: ");
    console.log(collectionNames);
    //Creating a Collection, in this case called newCollection
    newDB.createCollection("newColleciton", function(err, collection) {
      if (!err) {
        console.log("New Database and Collection Created");
        //Listing the Databases
        adminDB.listDatabases(function(err, databases) {
          console.log("After Add Database List: ");
          console.log(databases);
          //Listing the Collection Names within the Database
          newDB.collectionNames(function(err, collectionNames) {
            console.log("Collection's After: ");
            console.log(collectionNames);
            //Dropping the collection within the database called newCollection and outputting the answer
            newDB.dropCollection("newColleciton", function(err, results) {
              newDB.collectionNames(function(err, collectionNames) {
                console.log("Collections after deletion: ");
                console.log(collectionNames);
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
                }, 1000);
              });
            });
          });
        });
      }
    });
  });
});
