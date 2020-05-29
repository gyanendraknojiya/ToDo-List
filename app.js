//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const lodash = require('lodash');
mongoose.set('useFindAndModify', false);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
mongoose.connect('mongodb+srv://admin-gyanendra:Admin123@cluster0-osdsq.mongodb.net/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true });
const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item', itemsSchema);

var today = new Date();
var options = { weekday: 'long', month: 'long', day: 'numeric' };
var day = today.toLocaleDateString("en-US", options);


const item1 = new Item({
    name: 'Welcome to todo List'
});
const item2 = new Item({
    name: 'Hit + button to add items'
});
const item3 = new Item({
    name: '<--- hit this button to delete'
});
const defaultItems = [item1, item2, item3];
Item.find(function(err, result) {
    if (result.length < 1) {
        Item.insertMany(defaultItems, function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
});
const coustomListSchema = {
    name: String,
    list: [itemsSchema]
};
const List = mongoose.model('List', coustomListSchema);


app.get('/', function(req, res) {
    Item.find(function(err, dbItems) {
        if (err) {
            console.log(err);
        } else {

            res.render('list', { title: "Today", items: dbItems });

        }
    });


});


app.post('/delete', function(req, res) {
    var toDelete = req.body.checkboxID;
    var deleteList = req.body.deleteList;
    if (deleteList === 'Today') {
        Item.deleteOne({ _id: toDelete }, function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({ name: deleteList }, { $pull: { list: { _id: toDelete } } }, function(err, result) {
            if (!err) {
                res.redirect('/' + deleteList);
            }
        });

    }
});

app.get('/:path', function(req, res) {
    const coustomList = lodash.capitalize(req.params.path);



    List.findOne({ name: coustomList }, function(err, found) {
        if (!err) {
            if (found) {
                res.render('list', { title: coustomList, items: found.list });
            } else {
                const list = new List({
                    name: coustomList,
                    list: defaultItems
                });
                list.save();
                res.redirect('/' + coustomList);
            }
        }
    });
});

app.post('/', function(req, res) {
    newItem = req.body.item;
    const addItem = new Item({
        name: newItem
    });
    const listName = req.body.listname;
    if (listName === 'Today') {
        addItem.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }, function(err, foundlist) {
            if (!err) {
                foundlist.list.push(addItem);
                foundlist.save();
                res.redirect('/' + listName);
            }
        });
    }
});

app.listen(process.env.port || 3000);