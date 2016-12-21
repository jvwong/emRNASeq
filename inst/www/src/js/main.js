"use strict";

var shell = require('./shell');
var ocpu = require('./lib/opencpu.js');

//init this script when the page has loaded
(function(){
 shell.init(ocpu, "//localhost:8787/ocpu/library/emRNASeq/R", $('#emrnaseq'));
}());
