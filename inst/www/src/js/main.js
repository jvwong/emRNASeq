"use strict";

var shell = require('./shell');
var ocpu = require('./lib/opencpu.js');

//init this script when the page has loaded
(function(){
 shell.initModule(ocpu, "//localhost:8787/ocpu/library/emRNASeq/R", $('#em'));
}());
