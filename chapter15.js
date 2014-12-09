var MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost/", function(err, db) {

  //Using this database
  var myDB = db.db("words");

  //We are first going to start by running the function countItems. I have set a timer for 3 seconds and after that 3 seconds is up it will move onto the next function
  myDB.collection("word_stats", countItems);
  setTimeout(function(){

  //Once the countItems function is done we are going to move onto the next function which is findItems, once this is done the database closes
  myDB.collection("word_stats", findItems);
    setTimeout(function(){
      db.close();
    }, 3000);

  }, 3000);

});


//All of the parts in the function use the words.count function. The console.log explains what each one does
function countItems(err, words){


  words.count({first:{$in: ['a', 'b', 'c']}}, function(err, count){
    console.log("Words starting with a, b or c: " + count);
  });


  words.count({size:{$gt: 12}}, function(err, count){
    console.log("Words longer than 12 characters: " + count);
  });


  words.count({size:{$mod: [2,0]}}, function(err, count){
    console.log("Words with even Lengths: " + count);
  });


  words.count({letters:{$size: 12}}, function(err, count){
    console.log("Words with 12 Distinct characters: " + count);
  });


  words.count({$and: [{first:{$in: ['a', 'e', 'i', 'o', 'u']}},
  {last:{$in: ['a', 'e', 'i', 'o', 'u']}}]},
  function(err, count){
    console.log("Words that start and end with a vowel: " + count);
  });


  words.count({"stats.vowels":{$gt:6}}, function(err, count){
    console.log("Words containing 7 or more vowels: " + count);
  });


  words.count({letters:{$all: ['a','e','i','o','u']}},
  function(err, count){
    console.log("Words with all 5 vowels: " + count);
  });


  words.count({otherChars: {$exists:true}}, function(err, count){
    console.log("Words with non-alphabet characters: " + count);
  });


  words.count({charsets:{$elemMatch:{$and:[{type:'other'},
  {chars:{$size:2}}]}}},
  function(err, count){
    console.log("Words with 2 non-alphabet characters: " + count);
  });
}


  //This function outputs the results as it nees to output more then one result.
  function displayWords(msg, cursor, pretty){
    cursor.toArray(function(err, itemArr){
      console.log("\n"+msg);
      var wordList = [];
      for(var i=0; i<itemArr.length; i++){
        wordList.push(itemArr[i].word);
      }
      console.log(JSON.stringify(wordList, null, pretty));
    });
  }


//All of these functions use the words.find featue. The console.log explains what each one does
function findItems(err, words){


  words.find({first:{$in: ['a', 'b', 'c']}}, function(err, cursor){
    displayWords("Words starting with a, b or c: ", cursor);
  });


  words.find({size:{$gt: 12}}, function(err, cursor){
    displayWords("Words longer than 12 characters: ", cursor);
  });


  words.find({size:{$mod: [2,0]}}, function(err, cursor){
    displayWords("Words with even Lengths: ", cursor);
  });


  words.find({letters:{$size: 12}}, function(err, cursor){
    displayWords("Words with 12 Distinct characters: ", cursor);
  });


  words.find({$and: [{first:{$in: ['a', 'e', 'i', 'o', 'u']}},
  {last:{$in: ['a', 'e', 'i', 'o', 'u']}}]},
  function(err, cursor){
    displayWords("Words that start and end with a vowel: ", cursor);
  });


  words.find({"stats.vowels":{$gt:6}}, function(err, cursor){
    displayWords("Words containing 7 or more vowels: ", cursor);
  });


  words.find({letters:{$all: ['a','e','i','o','u']}},
  function(err, cursor){
    displayWords("Words with all 5 vowels: ", cursor);
  });


  words.find({otherChars: {$exists:true}}, function(err, cursor){
    displayWords("Words with non-alphabet characters: ", cursor);
  });


  words.find({charsets:{$elemMatch:{$and:[{type:'other'},
  {chars:{$size:2}}]}}},
  function(err, cursor){
    displayWords("Words with 2 non-alphabet characters: ", cursor);
  });



  //This one uses the limit command to limit the results to how many we want.
  words.find({first:'p'}, {limit:5}, function(err, cursor){
    displayWords("Limiting words starting with p : ", cursor);
  });


  //The sort here is sorting it by ascending value
  words.find({last:'w'}, {sort:{word:1}}, function(err, cursor){
    displayWords("Words ending in w sorted ascending: ", cursor);
  });

  //The sort here is sorting it by decending value
  words.find({last:'w'}, {sort:{word:-1}}, function(err, cursor){
    displayWords("Words ending in w sorted, descending: ", cursor);
  });

  //These looks for distinct values. So it get the lenght of all the words then outputs the reuslts without repeating them.
  words.distinct('size', function(err, values){
    console.log("\nSizes of words: ");
    console.log(values);
  });

  //This prints the first letters of any words that end of u, but without repeating the first letter.
  words.distinct('first', {last:'u'}, function(err, values){
    console.log("\nFirst letters of words ending in u: ");
    console.log(values);
  });

  //Here we are using a group by. So we are grouping by first and last name. We are grouping by first names that start with an o and end in a value.
  words.group(['first','last'],
  {first:'o',last:{$in:['a','e','i','o','u']}},
  {"count":0},
  function (obj, prev) { prev.count++; }, true,
  function(err, results){
    console.log("\n'O' words grouped by first and last" +
    " letter that end with a vowel: ");
    console.log(results);
  });

  //Here are are only grouping by first names.
  words.group(['first'],
  {size:{$gt:13}},
  {"count":0, "totalVowels":0},
  function (obj, prev) {
    prev.count++; prev.totalVowels += obj.stats.vowels;
  }, {}, true,
  function(err, results){
    console.log("\nWords grouped by first letter larger than 13: ");
    console.log(results);
  });







}
