const db ={};

db.Comment = require("./Comment.js")
db.Member = require("./Member.js")
db.Preference = require("./Preference.js")
db.Follow = require("./Follow.js")
db.Image = require("./Image.js")

module.exports = db;