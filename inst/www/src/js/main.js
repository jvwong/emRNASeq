"use strict";
window.jQuery = window.$ = require('jquery');
require('bootstrap');
require('datatables.net-bs')( window, $ );
require('jquery.urianchor');

var shell = require('./shell');
var ocpu = require('../lib/opencpu.js');
var boot = require('./boot');

//init this script when the page has loaded
(function(){
  boot.initModule();
  shell.initModule(ocpu, "//localhost:8787/ocpu/library/emRNASeq/R", $('#em'));
}());
