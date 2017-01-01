"use strict";

var shell = require('./shell');
var boot = require('./boot');

//init this script when the page has loaded
(function(){
  boot.initModule();
  shell.initModule("//localhost:8787/ocpu/library/emRNASeq/R", $('#em')); 
}());
