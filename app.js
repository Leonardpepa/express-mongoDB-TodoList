//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

itemsSchema = mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const react = new Item({
  name: "Learn React",
});

const python = new Item({
  name: "Learn Python",
});

const course = new Item({
  name: "To Finish The Course",
})

const defaultItems = [react, python, course];

const ListSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", ListSchema);


app.get("/", function(req, res) {

  const day = date.getDate();
  Item.find({}, (err, foundItems) => {
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, (err) => {
        if(err){
          console.log(err);
        }
        else{
          console.log("succesfully done! [1]");
        }
      })
    }
    
    if(err){
      console.log(err);
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });

});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

    const newItem = new Item({
      name: itemName
    });
  

  if(listName === date.getDate()){
    newItem.save();
    res.redirect('/');
  }
  else{
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});


app.post("/delete", (req, res) => {
  let itemID = req.body.checkBox;
  const listName = req.body.listName;
  console.log(listName);
  if(listName === date.getDate()){
    Item.findByIdAndDelete(itemID, (err)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log("succsesfuly deleted item");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemID} } }, (err, foundList)=>{
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListNane", (req, res) => {
  const customListName = _.capitalize(req.params.customListNane);
  
  List.findOne({name: customListName}, (err, foundList) => {
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        let list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);        
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log(`Server has started succesfully`);
});
