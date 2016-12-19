"use strict";

var shell = require('./shell');
var ocpu = require('./lib/opencpu.js');

//init this script when the page has loaded
(function(){
 shell.init(ocpu, "//127.0.0.1:8080/ocpu/library/emRNASeq/R", $('#emrnaseq'));
}());
