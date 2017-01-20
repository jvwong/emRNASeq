(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/boot.js":[function(require,module,exports){
'use strict';

//Show and hide the spinner for all ajax requests.

module.exports = function () {
  var initModule;

  initModule = function initModule() {
    $(document).ajaxStart(function () {
      $('#ajax-spinner').show();
      // Hide any buttons that could unsync with ajax error handlers
      $('.ajax-sensitive').attr('disabled', true);
    }).ajaxStop(function () {
      $('#ajax-spinner').hide();
      $('.ajax-sensitive').attr('disabled', false);
    });
  };
  return { initModule: initModule };
}();

},{}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/emdata.js":[function(require,module,exports){
"use strict";

var util = require('./util.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');
var modulename = function () {

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var configMap = {
    anchor_schema_map: {},
    template: String() + '<div class="em-emdata">' + '<div class="row">' + '<h2 class="col-xs-12 col-sm-10 em-section-title">EM Data Files <small></small></h2>' + '<h4 class="col-xs-12 col-sm-2"><a class="btn btn-danger btn-block em-emdata-clear clear-btn ajax-sensitive col-xs-3 col-md-3">Reset</a></h4>' + '</div>' + '<hr/>' + '<div class="em-emdata-results">' + '<fieldset class="form-group">' + '<legend>GSEA Inputs</legend>' + '<div class="em-emdata-results-files-gsea"></div>' + '<p><small class="col-sm-offset-2 gsea-help-block"></small></p>' + '</fieldset>' + '<fieldset class="form-group">' + '<legend>EM Inputs</legend>' + '<div class="em-emdata-results-files-em">' + '<div class="em-emdata-results-files-em-expression"></div>' + '<div class="em-emdata-results-files-em-phenotype"></div>' + '</div>' + '<p><small class="col-sm-offset-2 em-help-block"></small></p>' + '</fieldset>' + '</div>' + '</div>',

    code_template: String() + '<pre class="em-code"></pre>',

    settable_map: {}
  },
      stateMap = {
    filter_rseq_session: null,
    normalize_rseq_session: null,
    de_test_rseq_session: null,
    rank_gsea_session: null,
    expression_em_session: null,
    pheontype: null,
    expression_gsea_session: null,
    phenotype_gsea_session: null
  },
      jqueryMap = {},
      reset,
      setJQueryMap,
      fetchGSEAFiles,
      fetchEMFiles,
      createDataFiles,
      configModule,
      initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function setJQueryMap($container) {
    jqueryMap = {
      $container: $container,
      $emdata_clear: $container.find('.em-emdata .em-emdata-clear'),
      $emdata_results: $container.find('.em-emdata .em-emdata-results'),
      $emdata_results_files_gsea: $container.find('.em-emdata .em-emdata-results .em-emdata-results-files-gsea'),
      $emdata_gsea_help: $container.find('.em-emdata .em-emdata-results .gsea-help-block'),
      $emdata_results_files_em: $container.find('.em-emdata .em-emdata-results .em-emdata-results-files-em'),
      $emdata_results_files_em_expression: $container.find('.em-emdata .em-emdata-results .em-emdata-results-files-em .em-emdata-results-files-em-expression '),
      $emdata_results_files_em_phenotype: $container.find('.em-emdata .em-emdata-results .em-emdata-results-files-em .em-emdata-results-files-em-phenotype'),
      $emdata_em_help: $container.find('.em-emdata .em-emdata-results .em-help-block')
    };
  };
  // End DOM method /setJQueryMap/

  /* Fetch and append the various files required for EM
   *
   * @param $container object the jquery object to append to
   * @param next function an optional callback
   *
   * @return boolean
   */
  fetchEMFiles = function fetchEMFiles($container, next) {
    var jqxhr_expression,
        jqxhr_phenotype,
        onfail,
        onDone,
        cb = next || function () {};

    onDone = function onDone() {
      jqueryMap.$emdata_em_help.text('');
    };

    onfail = function onfail(jqXHR) {
      var errText = "Server error: " + jqXHR.responseText;
      console.error(errText);
      jqueryMap.$emdata_em_help.text(errText);
      cb(true);
    };

    // filter
    jqxhr_expression = ocpu.call('format_expression_gsea', {
      normalized_dge: stateMap.normalize_rseq_session
    }, function (session) {
      stateMap.expression_gsea_session = session;
    }).done(function () {
      util.displayAsTable('Expression file (.txt)', stateMap.expression_gsea_session, jqueryMap.$emdata_results_files_em_expression, null);
    }).fail(onfail);

    jqxhr_phenotype = jqxhr_expression.then(function () {
      return ocpu.rpc('format_class_gsea', {
        filtered_dge: stateMap.filter_rseq_session,
        de_tested_tt: stateMap.de_test_rseq_session
      }, function (data) {
        //some stoopid GSEA format.
        var running = String();
        data.forEach(function (line) {
          running += line[0] + '\n';
        });
        jqueryMap.$emdata_results_files_em_phenotype.append('<div class="panel panel-success">' + '<div class="panel-heading">' + '<h3 class="panel-title">Phenotype file (.cls)</h3>' + '</div>' + '<div class="panel-body"><pre class="em-code">' + running + '</pre></div>' + '<div class="panel-footer">' + '<a type="button" class="btn btn-default" href="' + util.makeTextFile(running) + '" download="phenotype.cls">Download (.cls)</a>' + '</div>' + '</div>');
      });
    }).done(function () {
      // util.displayAsTable('Phenotype file (.cls)',
      //   stateMap.class_gsea_session,
      //   jqueryMap.$emdata_results_files_em_phenotype,
      //   null );
      cb(null);
    }).fail(onfail);

    return true;
  };

  /* Fetch and append the various files required for GSEA
   *
   * @param $container object the jquery object to append to
   * @param next function an optional callback
   *
   * @return boolean
   */
  fetchGSEAFiles = function fetchGSEAFiles($container, next) {
    var jqxhr,
        onfail,
        onDone,
        cb = next || function () {};

    onDone = function onDone() {
      util.displayAsTable('Rank File (.rnk)', stateMap.rank_gsea_session, jqueryMap.$emdata_results_files_gsea, null);
      jqueryMap.$emdata_gsea_help.text('');
      cb(false);
    };

    onfail = function onfail(jqXHR) {
      var errText = "Server error: " + jqXHR.responseText;
      console.error(errText);
      jqueryMap.$emdata_gsea_help.text(errText);
      cb(true);
    };

    // filter
    jqxhr = ocpu.call('format_ranks_gsea', {
      de_tested_tt: stateMap.de_test_rseq_session
    }, function (session) {
      stateMap.rank_gsea_session = session;
    }).done(onDone).fail(onfail);

    return true;
  };

  /* Fetch and append the various files required
   *
   * @param $container object the jquery object to append to
   *
   * @return boolean
   */
  createDataFiles = function createDataFiles() {
    fetchGSEAFiles(jqueryMap.$emdata_results_files_gsea, function (err) {
      if (err) {
        return false;
      }
      fetchEMFiles(jqueryMap.$emdata_results_files_em);
    });
    return true;
  };
  // ---------- END DOM METHODS ------------------------------------------------

  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  // ---------- END EVENT HANDLERS ---------------------------------------------

  // ---------- BEGIN PUBLIC METHODS -------------------------------------------
  // Begin public method /reset/
  /* Return to the ground state
   *
   * @return boolean
   */
  reset = function reset() {
    alert('reset called');
    return true;
  };
  // End public method /reset/


  // Begin public method /configModule/
  // Example   : spa.chat.configModule({ slider_open_em : 18 });
  // Purpose   : Configure the module prior to initialization
  // Arguments :
  //   * set_chat_anchor - a callback to modify the URI anchor to
  //     indicate opened or closed state. This callback must return
  //     false if the requested state cannot be met
  //   * chat_model - the chat model object provides methods
  //       to interact with our instant messaging
  //   * people_model - the people model object which provides
  //       methods to manage the list of people the model maintains
  //   * slider_* settings. All these are optional scalars.
  //       See mapConfig.settable_map for a full list
  //       Example: slider_open_em is the open height in em's
  // Action    :
  //   The internal configuration data structure (configMap) is
  //   updated with provided arguments. No other actions are taken.
  // Returns   : true
  // Throws    : JavaScript error object and stack trace on
  //             unacceptable or missing arguments
  //
  configModule = function configModule(input_map) {
    util.setConfigMap({
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap
    });
    return true;
  };
  // End public method /configModule/

  /* initModule
   * @param ocpu (Object) ocpu singleton
   * @param $container (Object) jQuery parent
   */
  initModule = function initModule($container, msg_map) {
    if (!$container) {
      console.error('Missing container');
      return false;
    }
    if ($.isEmptyObject(msg_map) || !msg_map.hasOwnProperty('filter_rseq_session') || !msg_map.hasOwnProperty('normalize_rseq_session' || !msg_map.hasOwnProperty('de_test_rseq_session'))) {
      console.error('Missing msg_map');
      return false;
    }
    $container.html(configMap.template);
    setJQueryMap($container);
    jqueryMap.$emdata_clear.click(reset);

    stateMap.filter_rseq_session = msg_map.filter_rseq_session;
    stateMap.normalize_rseq_session = msg_map.normalize_rseq_session;
    stateMap.de_test_rseq_session = msg_map.de_test_rseq_session;

    // do stuff
    createDataFiles();
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule: initModule,
    configModule: configModule,
    reset: reset
  };
}();

module.exports = modulename;

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/lib/opencpu.js/opencpu-0.5-npm.js","./util.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/util.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/main.js":[function(require,module,exports){
"use strict";

var shell = require('./shell');
var boot = require('./boot');

/*
 * OpenCPU is NOT a console...
 * https://www.opencpu.org/jslib.html
 *
 * 'Also note that even when using CORS, the opencpu.js library still requires
 * that all R functions used by a certain application are contained in a single
 * R package. This is on purpose, to force you to keep things organized. If
 * you would like to use functionality from various R packages, you need
 * to create an R package that includes some wrapper functions and formally
 * declares its dependencies on the other packages. Writing an R package is
 * really easy these days, so this should be no problem.'
 */
(function () {
  boot.initModule();
  shell.initModule("//localhost:8000/ocpu/library/emRNASeq/R", $('#em'));
})();

},{"./boot":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/boot.js","./shell":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/shell.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/munge.js":[function(require,module,exports){
"use strict";

var util = require('./util.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

var munge = function () {

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var configMap = {

    template: String() + '<div class="em-munge">' + '<div class="row">' + '<h2 class="col-xs-12 col-sm-10 em-section-title">Data Munge <small></small></h2>' + '<h4 class="col-xs-12 col-sm-2"><a class="btn btn-danger btn-block em-munge-clear clear-btn ajax-sensitive col-xs-3 col-md-3">Reset</a></h4>' + '</div>' + '<hr/>' + '<form>' + '<fieldset class="form-group em-munge-metadata">' + '<legend>Metadata Input</legend>' + '<div class="em-munge-metadata-file row">' + '<label class="col-sm-3 col-form-label">Metadata File</label>' + '<div class="col-sm-9">' + '<label class="btn btn-primary btn-file btn-md btn-block" for="em-munge-metadata-input">Select</label>' + '<input type="file" class="form-control-file" style="display: none;" id="em-munge-metadata-input" />' + '</div>' + '</div>' + '<div><small class="help-block"></small></div>' + '<div class="form-group em-munge-metadata-results"></div>' + '</fieldset>' + '<fieldset class="form-group em-munge-data">' + '<legend>Data Input</legend>' + '<div class="em-munge-data-species row">' + '<label class="col-sm-3 col-form-label">Species &nbsp</label>' + '<div class="col-sm-9">' + '<select class="selectpicker form-control" data-style="btn-default">' + '<option>human</option>' + '<option>mouse</option>' + '</select>' + '</div>' + '</div>' + '<div class="em-munge-data-source_name row">' + '<label class="col-sm-3 col-form-label">Source Namespace</label>' + '<div class="col-sm-9">' + '<select class="selectpicker form-control" data-style="btn-default">' + '<option>ensembl_gene_id</option>' + '<option>hgnc_symbol</option>' + '<option>mgi_symbol</option>' + '</select>' + '</div>' + '</div>' + '<div class="em-munge-data-target_name row">' + '<label class="col-sm-3 col-form-label">Target Namespace</label>' + '<div class="col-sm-9">' + '<select class="selectpicker form-control" data-style="btn-default">' + '<option>hgnc_symbol</option>' + '<option>ensembl_id</option>' + '<option>mgi_symbol</option>' + '</select>' + '</div>' + '</div>' + '<div class="em-munge-data-file row">' + '<label class="col-sm-3 col-form-label">Data Files</label>' + '<div class="col-sm-9">' + '<label class="btn btn-primary btn-file btn-md btn-block" for="em-munge-data-file">Select</label>' + '<input type="file" class="form-control-file" style="display: none;" id="em-munge-data-file" multiple />' + '</div>' + '</div>' + '<div><small class="help-block"></small></div>' + '<div class="form-group em-munge-data-results"></div>' + '</fieldset>' + '</form>' + '</div>',

    default_metadata_help: String() + 'Tab-delimited (.txt). Headers for \'id\' (filenames) and \'class\'',
    default_data_help: String() + 'Tab-delimited (.txt). Rows indicate gene and count',

    code_template: String() + '<pre class="em-code"></pre>',
    settable_map: {}
  },
      stateMap = {
    metadata_session: null,
    metadata_file: null,
    data_session: null,
    data_files: null
  },
      jqueryMap = {},
      setJQueryMap,
      configModule,
      toggleInput,
      reset,
      onMetaFileChange,
      onMetadataProcessed,
      processMetaFile,
      onDataFilesChange,
      onDataProcessed,
      processDataFiles,
      initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function setJQueryMap($container) {
    jqueryMap = {
      $container: $container,
      $munge: $container.find('.em-munge'),
      $munge_clear: $container.find('.em-munge .em-munge-clear'),

      $munge_metadata_fieldset: $container.find('.em-munge fieldset.em-munge-metadata'),
      $munge_metadata_file_input: $container.find('.em-munge .em-munge-metadata .em-munge-metadata-file #em-munge-metadata-input'),
      $munge_metadata_help: $container.find('.em-munge .em-munge-metadata .help-block'),
      $munge_metadata_results: $container.find('.em-munge .em-munge-metadata .em-munge-metadata-results'),

      $munge_data_fieldset: $container.find('.em-munge fieldset.em-munge-data'),
      $munge_data_species_select: $container.find('.em-munge .em-munge-data .em-munge-data-species .selectpicker'),
      $munge_data_source_name_select: $container.find('.em-munge .em-munge-data .em-munge-data-source_name .selectpicker'),
      $munge_data_target_name_select: $container.find('.em-munge .em-munge-data .em-munge-data-target_name .selectpicker'),
      $munge_data_file: $container.find('.em-munge .em-munge-data .em-munge-data-file input'),
      $munge_data_help: $container.find('.em-munge .em-munge-data .help-block'),
      $munge_data_results: $container.find('.em-munge .em-munge-data-results')
    };
  };
  // End DOM method /setJQueryMap/

  // Begin DOM method /processMetaFile/
  processMetaFile = function processMetaFile(data, cb) {
    if (!data.hasOwnProperty('files') || !data.files.length) {
      alert('No file selected.');
      return;
    }

    stateMap.metadata_file = data.files[0];

    //perform the request
    var jqxhr = ocpu.call('create_meta', {
      metadata_file: stateMap.metadata_file
    }, function (session) {
      stateMap.metadata_session = session;
    });

    jqxhr.done(function () {
      //clear any previous help messages
      jqueryMap.$munge_metadata_help.text('');
      cb(null, stateMap.metadata_session, stateMap.metadata_file.name);
    });

    jqxhr.fail(function () {
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_metadata_help.text(errText);
      jqueryMap.$munge_metadata_results.empty();
      cb(true);
    });

    return true;
  };
  // End DOM method /processMetaFile/

  // Begin DOM method /processDataFiles/
  processDataFiles = function processDataFiles(data, cb) {

    if (!data.hasOwnProperty('species') || !data.hasOwnProperty('files') || !data.files.length) {
      alert('No file(s) selected.');
      return;
    }

    if (!stateMap.metadata_file) {
      alert('Please load metadata.');
      return;
    }

    // THis is required
    if (!data.species) {
      alert('Species must be set to \'human\' or \'mouse\'');
      cb(true);
      return false;
    }

    stateMap.data_files = data.files;

    // opencpu only accepts single files as arguments
    var args = {
      metadata_file: stateMap.metadata_file,
      species: data.species,
      source_name: data.source_name,
      target_name: data.target_name
    };

    // loop through files
    for (var i = 0; i < stateMap.data_files.length; i++) {
      var file = stateMap.data_files.item(i);
      args['file' + i] = file;
    }

    //perform the request
    var jqxhr = ocpu.call('merge_data', args, function (session) {
      stateMap.data_session = session;
      util.displayAsPrint('Results', stateMap.data_session, jqueryMap.$munge_data_results);
    });

    jqxhr.done(function () {
      jqueryMap.$munge_data_help.text('Files merged: ' + stateMap.data_files.length);
      cb(null, stateMap.data_session);
    });

    jqxhr.fail(function () {
      var errText = "Server error: " + jqxhr.responseText;
      console.error(errText);
      jqueryMap.$munge_data_help.text(errText);
      jqueryMap.$munge_data_results.empty();
      cb(true);
    });

    return true;
  };
  // End DOM method /processDataFiles/
  // ---------- END DOM METHODS ------------------------------------------------

  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  onMetaFileChange = function onMetaFileChange() {
    var self = $(this),
        data = {
      files: self[0].files
    };
    return processMetaFile(data, onMetadataProcessed);
  };

  onMetadataProcessed = function onMetadataProcessed(err, session, fname) {
    if (err) {
      return false;
    }
    util.displayAsTable(fname, session, jqueryMap.$munge_metadata_results, function (err) {
      if (err) {
        return false;
      }
      toggleInput('data', true);
    });
    return true;
  };

  onDataFilesChange = function onDataFilesChange() {
    var self = $(this),
        data = {
      files: self[0].files,
      species: jqueryMap.$munge_data_species_select.val().trim().toLowerCase() || null,
      source_name: jqueryMap.$munge_data_source_name_select.val().trim().toLowerCase(),
      target_name: jqueryMap.$munge_data_target_name_select.val().trim().toLowerCase()
    };
    return processDataFiles(data, onDataProcessed);
  };

  onDataProcessed = function onDataProcessed(err, session) {
    if (err) {
      return false;
    }
    util.displayAsPrint('Results', session, jqueryMap.$munge_data_results, function (err) {
      if (err) {
        return false;
      }
      toggleInput('metadata', false);
      toggleInput('data', false);

      //Make the data available
      $.gevent.publish('em-munge-data', {
        metadata_session: stateMap.metadata_session,
        data_session: stateMap.data_session
      });
    });
    return true;
  };
  // ---------- END EVENT HANDLERS ---------------------------------------------

  // ---------- BEGIN PUBLIC METHODS -------------------------------------------
  // Begin public method /toggleInput/
  /* Toggle the input availbility for a matched element
   *
   * @param label the stateMap key to set
   * @param do_enable boolean true if enable, false to disable
   *
   * @return boolean
   */
  toggleInput = function toggleInput(label, do_enable) {

    if (label === 'data') {
      jqueryMap.$munge_data_fieldset.attr('disabled', !do_enable);
      jqueryMap.$munge_data_species_select.selectpicker('refresh');
    } else {
      jqueryMap.$munge_metadata_fieldset.attr('disabled', !do_enable);
    }

    return true;
  };
  // End public method /toggleInput/

  // Begin public method /reset/
  /* Return to the ground state
   *
   * @return boolean
   */
  reset = function reset() {
    // Must do this manually
    jqueryMap.$munge_metadata_file_input.val("");
    jqueryMap.$munge_metadata_help.text(configMap.default_metadata_help);
    jqueryMap.$munge_metadata_results.empty();
    jqueryMap.$munge_data_species_select.val("");
    jqueryMap.$munge_data_file.val("");
    jqueryMap.$munge_data_help.text(configMap.default_data_help);
    jqueryMap.$munge_data_results.empty();

    // must clear out stateMap references
    stateMap.metadata_session = null;
    stateMap.metadata_file = null;
    stateMap.data_session = null;
    stateMap.data_files = null;

    // reset input
    toggleInput('metadata', true);
    toggleInput('data', false);
    return true;
  };
  // End public method /reset/


  // Begin public method /configModule/
  /* The internal configuration data structure (configMap) is
   * updated with provided arguments. No other actions are taken.
   *
   * @return true if updated successfully
   */
  configModule = function configModule(input_map) {
    util.setConfigMap({
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap
    });
    return true;
  };
  // End public method /configModule/

  /* initModule
   * @param ocpu (Object) ocpu singleton
   * @param $container (Object) jQuery parent
   */
  initModule = function initModule($container) {
    if (!$container) {
      console.error('Missing container');
      return false;
    }

    $container.html(configMap.template);
    setJQueryMap($container);
    jqueryMap.$munge_metadata_help.text(configMap.default_metadata_help);
    jqueryMap.$munge_data_help.text(configMap.default_data_help);
    // bind file change HANDLERS
    jqueryMap.$munge_metadata_file_input.change(onMetaFileChange);
    jqueryMap.$munge_data_file.change(onDataFilesChange);
    toggleInput('metadata', true);
    toggleInput('data', false);

    jqueryMap.$munge_clear.click(reset);

    return true;
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule: initModule,
    configModule: configModule,
    reset: reset
  };
}();

module.exports = munge;

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/lib/opencpu.js/opencpu-0.5-npm.js","./util.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/util.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/process_rseq.js":[function(require,module,exports){
"use strict";

var util = require('./util.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

var process_rseq = function () {
  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var configMap = {
    anchor_schema_map: {},
    template: String() + '<div class="em-process_rseq">' + '<div class="row">' + '<h2 class="col-xs-12 col-sm-10 em-section-title">RNA Sequencing Analysis <small></small></h2>' + '<h4 class="col-xs-12 col-sm-2"><a class="btn btn-danger btn-block em-process_rseq-clear clear-btn ajax-sensitive col-xs-3 col-md-3">Reset</a></h4>' + '</div>' + '<hr/>' + '<form class="form-horizontal em-process_rseq-class">' + '<fieldset>' + '<legend>Differential Expression Testing</legend>' + '<div class="form-group">' + '<label for="em-process_rseq-class-test" class="col-sm-2 control-label">Test Class</label>' + '<div class="col-sm-10">' + '<input type="text" class="form-control" id="em-process_rseq-class-test" placeholder="Test">' + '</div>' + '</div>' + '<div class="form-group">' + '<label for="em-process_rseq-class-baseline" class="col-sm-2 control-label">Baseline</label>' + '<div class="col-sm-10">' + '<input type="text" class="form-control" id="em-process_rseq-class-baseline" placeholder="Baseline">' + '</div>' + '</div>' + '<div class="form-group">' + '<div class="col-sm-offset-2 col-sm-10">' + '<button type="submit" class="btn btn-primary btn-block em-process_rseq-class-submit">Submit</button>' + '</div>' + '</div>' + '<p><small class="col-sm-offset-2 help-block"></small></p>' + '</fieldset>' + '</form>' + '<div class="em-process_rseq-results">' + '<div class="row">' + '<div class="col-sm-offset-2 col-sm-10">' + '<div class="progress em-process_rseq-results-progress">' + '<div class="progress-bar progress-bar-danger" style="width: 50%;">' + '<span>Filtering</span>' + '</div>' + '<div class="progress-bar progress-bar-primary" style="width: 25%;">' + '<span>Normalizing</span>' + '</div>' + '<div class="progress-bar progress-bar-success" style="width: 25%;">' + '<span>Testing</span>' + '</div>' + '</div>' + '</div>' + '</div>' + '<div class="em-process_rseq-results-detest"></div>' + '<div class="em-process_rseq-results-deplot rplot"></div>' + '</div>' + '</div>',

    settable_map: {}
  },
      stateMap = {
    metadata_session: null,
    data_session: null,
    filter_rseq_session: null,
    normalize_rseq_session: null,
    de_test_rseq_session: null,
    classes: [],
    test_class: null,
    baseline_class: null
  },
      jqueryMap = {},
      reset,
      setJQueryMap,
      configModule,
      onSubmitClass,
      processRNASeq,
      onRNASeqProcessed,
      toggleInput,
      initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- Begin UTILITY METHODS ------------------------------------------
  // ---------- End UTILITY METHODS --------------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function setJQueryMap($container) {
    jqueryMap = {
      $container: $container,
      $em_process_rseq_clear: $container.find('.em-process_rseq .em-process_rseq-clear'),
      $em_process_rseq_class_test_input: $container.find('.em-process_rseq .em-process_rseq-class #em-process_rseq-class-test'),
      $em_process_rseq_class_baseline_input: $container.find('.em-process_rseq .em-process_rseq-class #em-process_rseq-class-baseline'),
      $em_process_rseq_class_form: $container.find('.em-process_rseq .em-process_rseq-class'),
      $em_process_rseq_class_submit: $container.find('.em-process_rseq .em-process_rseq-class .em-process_rseq-class-submit'),
      $em_process_rseq_class_help: $container.find('.em-process_rseq .help-block'),
      $em_process_rseq_results_detest: $container.find('.em-process_rseq .em-process_rseq-results .em-process_rseq-results-detest'),
      $em_process_rseq_results_deplot: $container.find('.em-process_rseq .em-process_rseq-results .em-process_rseq-results-deplot'),
      $em_process_rseq_results_progress: $container.find('.em-process_rseq .em-process_rseq-results .em-process_rseq-results-progress')
    };
  };
  // End DOM method /setJQueryMap/

  // Begin DOM method /processRNASeq/
  processRNASeq = function processRNASeq(baseline, test, cb) {

    var jqxhr_filter, jqxhr_normalize, jqxhr_test, onfail, onDone;

    onDone = function onDone(n) {
      var $bar = jqueryMap.$em_process_rseq_results_progress.find('.progress-bar:nth-child(' + n + ')');
      $bar.toggle(true);
      jqueryMap.$em_process_rseq_class_help.text('');
    };

    onfail = function onfail(jqXHR) {
      var errText = "Server error: " + jqXHR.responseText;
      console.error(errText);
      jqueryMap.$em_process_rseq_class_help.text(errText);
      cb(true);
    };

    // filter
    jqxhr_filter = ocpu.call('filter_rseq', {
      se: stateMap.data_session,
      baseline: baseline,
      test: test,
      min_counts: 1
    }, function (session) {
      stateMap.filter_rseq_session = session;
    }).done(function () {
      onDone(1);
    }).fail(onfail);

    jqxhr_normalize = jqxhr_filter.then(function () {
      return ocpu.call('normalize_rseq', {
        filtered_dge: stateMap.filter_rseq_session
      }, function (session) {
        stateMap.normalize_rseq_session = session;
      });
    }).done(function () {
      onDone(2);
    }).fail(onfail);

    jqxhr_test = jqxhr_normalize.then(function () {
      return ocpu.call('de_test_rseq', {
        normalized_dge: stateMap.normalize_rseq_session,
        baseline: baseline,
        test: test
      }, function (session) {
        stateMap.de_test_rseq_session = session;
      });
    }).done(function () {
      onDone(3);
      toggleInput('class', false);
      cb(null, stateMap.de_test_rseq_session);
    }).fail(onfail);
    // test

    return true;
  };
  // End DOM method /processRNASeq/
  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  onSubmitClass = function onSubmitClass(event) {
    event.preventDefault();
    jqueryMap.$em_process_rseq_class_help.text("");

    var proposed_test_class = jqueryMap.$em_process_rseq_class_test_input.val(),
        proposed_baseline_class = jqueryMap.$em_process_rseq_class_baseline_input.val(),
        isOK = stateMap.classes.indexOf(proposed_test_class) > -1 && stateMap.classes.indexOf(proposed_baseline_class) > -1;

    if (!isOK) {
      jqueryMap.$em_process_rseq_class_help.text(['Invalid class declarations: ', proposed_test_class, proposed_baseline_class].join(' '));
      return false;
    }

    jqueryMap.$em_process_rseq_results_progress.toggle(true);

    return processRNASeq(proposed_baseline_class, proposed_test_class, onRNASeqProcessed);
  };

  onRNASeqProcessed = function onRNASeqProcessed(err, de_test_rseq_session) {
    if (err) {
      return false;
    }

    var name = 'plot_de',
        args = {
      filtered_dge: stateMap.filter_rseq_session,
      de_tested_tt: stateMap.de_test_rseq_session,
      baseline: stateMap.baseline_class,
      test: stateMap.test_class,
      threshold: 0.05
    };

    util.displayAsPrint('DE Testing Results', de_test_rseq_session, jqueryMap.$em_process_rseq_results_detest, function (err) {
      if (err) {
        return false;
      }

      //Make the data available
      util.graphicR('DE Genes', name, args, jqueryMap.$em_process_rseq_results_deplot, function (err) {
        if (err) {
          return false;
        }

        //Make the data available
        $.gevent.publish('em-process_rseq', {
          filter_rseq_session: stateMap.filter_rseq_session,
          normalize_rseq_session: stateMap.normalize_rseq_session,
          de_test_rseq_session: stateMap.de_test_rseq_session
        });
      });
    });

    return true;
  };
  // ---------- END EVENT HANDLERS ---------------------------------------------

  // ---------- BEGIN PUBLIC METHODS -------------------------------------------
  // Begin public method /toggleInput/
  /* Toggle the input availbility for a matched element
   *
   * @param label the stateMap key to set
   * @param do_enable boolean true if enable, false to disable
   *
   * @return boolean
   */
  toggleInput = function toggleInput(label, do_enable) {
    var $handles = label === 'class' ? [jqueryMap.$em_process_rseq_class_test_input, jqueryMap.$em_process_rseq_class_baseline_input, jqueryMap.$em_process_rseq_class_submit] : [];

    $.each($handles, function (index, value) {
      value.attr('disabled', !do_enable);
      value.attr('disabled', !do_enable);
    });

    return true;
  };
  // End public method /toggleInput/

  // Begin public method /reset/
  /* Return to the ground state
   *
   * @return boolean
   */
  reset = function reset() {

    stateMap.filter_rseq_session = null;
    stateMap.normalize_rseq_session = null;
    stateMap.de_test_rseq_session = null;
    stateMap.test_class = null;
    stateMap.baseline_class = null;

    jqueryMap.$em_process_rseq_results_progress.find('.progress-bar').toggle(false);
    jqueryMap.$em_process_rseq_results_progress.toggle(false);

    jqueryMap.$em_process_rseq_results_detest.empty();
    jqueryMap.$em_process_rseq_results_deplot.empty();

    toggleInput('class', true);

    return true;
  };
  // End public method /reset/


  // Begin public method /configModule/
  // Example   : spa.chat.configModule({ slider_open_em : 18 });
  // Purpose   : Configure the module prior to initialization
  // Arguments :
  //   * set_chat_anchor - a callback to modify the URI anchor to
  //     indicate opened or closed state. This callback must return
  //     false if the requested state cannot be met
  //   * chat_model - the chat model object provides methods
  //       to interact with our instant messaging
  //   * people_model - the people model object which provides
  //       methods to manage the list of people the model maintains
  //   * slider_* settings. All these are optional scalars.
  //       See mapConfig.settable_map for a full list
  //       Example: slider_open_em is the open height in em's
  // Action    :
  //   The internal configuration data structure (configMap) is
  //   updated with provided arguments. No other actions are taken.
  // Returns   : true
  // Throws    : JavaScript error object and stack trace on
  //             unacceptable or missing arguments
  //
  configModule = function configModule(input_map) {
    util.setConfigMap({
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap
    });
    return true;
  };
  // End public method /configModule/

  /* initModule
   * @param $container (Object) jQuery parent
   * @param msg_map Object the parent session
   */
  initModule = function initModule($container, msg_map) {
    if (!$container) {
      console.error('Missing container');
      return false;
    }
    if ($.isEmptyObject(msg_map) || !msg_map.hasOwnProperty('metadata_session') || !msg_map.hasOwnProperty('data_session')) {
      console.error('Missing msg_map');
      return false;
    }
    $container.html(configMap.template);

    setJQueryMap($container);
    jqueryMap.$em_process_rseq_results_progress.find('.progress-bar').toggle(false);
    jqueryMap.$em_process_rseq_results_progress.toggle(false);

    jqueryMap.$em_process_rseq_clear.click(reset);

    stateMap.metadata_session = msg_map.metadata_session;
    stateMap.data_session = msg_map.data_session;

    // populate the comparisons by default
    stateMap.metadata_session.getObject(function (data) {
      if (!data.length) {
        return;
      }
      var keys = Object.keys(data[0]);
      var classes = data.map(function (val) {
        return val[keys[1]];
      });

      // Set the classes inthe stateMap
      var unique = util.unique(classes);
      if (unique.length !== 2) {
        console.error('There are not exactly 2 classes');
        return false;
      }

      stateMap.classes = unique;
      jqueryMap.$em_process_rseq_class_test_input.attr('placeholder', stateMap.classes[0]).val(stateMap.classes[0]);
      jqueryMap.$em_process_rseq_class_baseline_input.attr('placeholder', stateMap.classes[1]).val(stateMap.classes[1]);
    });

    jqueryMap.$em_process_rseq_class_form.submit(onSubmitClass);
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule: initModule,
    configModule: configModule,
    reset: reset
  };
}();

module.exports = process_rseq;

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/lib/opencpu.js/opencpu-0.5-npm.js","./util.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/util.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/shell.js":[function(require,module,exports){
"use strict";

var util = require('./util.js');
var munge = require('./munge.js');
var process_rseq = require('./process_rseq.js');
var emdata = require('./emdata.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

//init this script when the page has loaded
var shell = function () {

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var configMap = {
    anchor_schema_map: {
      metadata: { enabled: true, disabled: true },
      data: { enabled: true, disabled: true }
    },
    template: String() + '<div class="container em-shell">' + '<div class="em-shell-munge"></div>' + '<div class="em-shell-process_rseq"></div>' + '<div class="em-shell-emdata"></div>' + '</div>'
  },

  // stateMap = {},
  jqueryMap = {},
      setJQueryMap,
      clearInput,
      initModule;
  // ---------- END MODULE SCOPE VARIABLES -------------------------------------


  // ---------- BEGIN UTILITY METHODS ------------------------------------------
  // ---------- END UTILITY METHODS --------------------------------------------


  // ---------- BEGIN DOM METHODS ----------------------------------------------
  // Begin DOM method /setJQueryMap/
  setJQueryMap = function setJQueryMap($container) {
    jqueryMap = {
      $container: $container,
      $shell: $container.find('.em-shell'),
      $munge_container: $container.find('.em-shell .em-shell-munge'),
      $process_rseq_container: $container.find('.em-shell .em-shell-process_rseq'),
      $emdata_container: $container.find('.em-shell .em-shell-emdata')
    };
  };
  // End DOM method /setJQueryMap/

  // Begin DOM method /clearInput/
  /* Clears the input and resets the state to ground zero
   *
   * @return  boolean Whether the anchor portion could be updated
   */
  clearInput = function clearInput() {
    return munge.reset();
  };
  // End DOM method /clearInput/
  // ---------- END DOM METHODS ------------------------------------------------

  // ---------- BEGIN EVENT HANDLERS -------------------------------------------
  // ---------- END EVENT HANDLERS ---------------------------------------------

  //---------------------- BEGIN CALLBACKS ---------------------
  //----------------------- END CALLBACKS ----------------------

  // ---------- BEGIN PUBLIC METHODS -------------------------------------------

  /* initModule
   * @param path (String) path
   * @param $container (Object) jQuery parent
   */
  initModule = function initModule(path, $container) {
    if (!ocpu) {
      alert('server error');return;
    }
    if (path) {
      console.info('setting path %s', path);
      ocpu.seturl(path);
    }
    $container.html(configMap.template);
    setJQueryMap($container);

    // configure and initialize feature modules
    $.gevent.subscribe(jqueryMap.$process_rseq_container, 'em-munge-data', function (event, msg_map) {
      localStorage.setItem('em-munge-data', util.serialize(msg_map));
      process_rseq.configModule({});
      process_rseq.initModule(jqueryMap.$process_rseq_container, msg_map);
    });
    // $.gevent.subscribe(
    //   jqueryMap.$emdata_container,
    //   'em-process_rseq',
    //   function ( event, msg_map ) {
    //     localStorage.setItem( 'em-process_rseq', util.serialize(msg_map) );
    //     emdata.configModule({});
    //     emdata.initModule( jqueryMap.$emdata_container, msg_map  );
    //   }
    // );

    // munge.configModule({});
    // munge.initModule( jqueryMap.$munge_container );
    // var msg_map = util.deserializeSessionData( localStorage.getItem( 'em-munge-data' ) );
    // process_rseq.configModule({});
    // process_rseq.initModule( jqueryMap.$process_rseq_container, msg_map );
    var msg_map = util.deserializeSessionData(localStorage.getItem('em-process_rseq'));
    emdata.configModule({});
    emdata.initModule(jqueryMap.$emdata_container, msg_map);

    return true;
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule: initModule
  };
}();

module.exports = shell;

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/lib/opencpu.js/opencpu-0.5-npm.js","./emdata.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/emdata.js","./munge.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/munge.js","./process_rseq.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/process_rseq.js","./util.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/util.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/util.js":[function(require,module,exports){
'use strict';

var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

//Show and hide the spinner for all ajax requests.
module.exports = function () {

  var makeError, setConfigMap, serialize, deserializeSessionData, displayAsPrint, displayAsTable, graphicR, makeTextFile, unique;

  /* Begin Public method /serialize/
   * A convenience wrapper to create a serialized version of data
   *
   * @param object a serializeable object
   *
   * @return string representation data
   * @throws JavaScript error object and stack trace on unacceptable arguments
   */
  serialize = function serialize(data) {
    var serialized;
    try {
      serialized = JSON.stringify(data);
    } catch (e) {
      console.error(e);
    }
    return serialized;
  };
  // End Public method /serialize/

  /* Begin Public method /deserializeSessionData/
   * A convenience wrapper to create a Sessions from serialized
   * data. Each object value must be a Session
   *
   * @param string a serialized representation
   *
   * @return an object with Session values restored
   * @throws JavaScript error object and stack trace on unacceptable arguments
   */
  deserializeSessionData = function deserializeSessionData(data) {
    var deserialized = {};
    try {
      var raw = JSON.parse(data);
      Object.getOwnPropertyNames(raw).forEach(function (key) {
        deserialized[key] = new ocpu.Session(raw[key].loc, raw[key].key, raw[key].txt);
      });
    } catch (e) {
      console.error(e);
    }
    return deserialized;
  };
  // End Public method /deserializeSessionData/

  // Begin Public constructor /makeError/
  // Purpose: a convenience wrapper to create an error object
  // Arguments:
  //   * name_text - the error name
  //   * msg_text  - long error message
  //   * data      - optional data attached to error object
  // Returns  : newly constructed error object
  // Throws   : none
  //
  makeError = function makeError(name_text, msg_text, data) {
    var error = new Error();
    error.name = name_text;
    error.message = msg_text;

    if (data) {
      error.data = data;
    }

    return error;
  };
  // End Public constructor /makeError/

  // Begin Public method /setConfigMap/
  // Purpose: Common code to set configs in feature modules
  // Arguments:
  //   * input_map    - map of key-values to set in config
  //   * settable_map - map of allowable keys to set
  //   * config_map   - map to apply settings to
  // Returns: true
  // Throws : Exception if input key not allowed
  //
  setConfigMap = function setConfigMap(arg_map) {
    var input_map = arg_map.input_map,
        settable_map = arg_map.settable_map,
        config_map = arg_map.config_map,
        key_name,
        error;

    for (key_name in input_map) {
      if (input_map.hasOwnProperty(key_name)) {
        if (settable_map.hasOwnProperty(key_name)) {
          config_map[key_name] = input_map[key_name];
        } else {
          error = makeError('Bad Input', 'Setting config key |' + key_name + '| is not supported');
          throw error;
        }
      }
    }
  };
  // End Public method /setConfigMap/

  /* Begin Public method /displayAsPrint/
   * A convenience wrapper to display the R object text description in a
   * Bootstrap panel. Also provides link to download object as .rds file.
   *
   * @param text some descriptive text for the header
   * @param session The ocpu Session
   * @param $container jQuery object to place panel inside with text
   * @param next the optional callback
   */
  displayAsPrint = function displayAsPrint(text, session, $container, next) {
    var url = session.getLoc() + 'R/.val/print';
    var cb = next || function () {};

    $.get(url, function (data) {
      // DOM manipulations
      var $code = $('<pre class="em-code"></pre>');
      $code.html(data);
      var $panel = $('<div class="panel panel-success">' + '<div class="panel-heading">' + '<h3 class="panel-title"></h3>' + '</div>' + '<div class="panel-body fixed-panel"></div>' + '<div class="panel-footer"></div>' + '</div>');
      $panel.find('.panel-title').text(text);
      $panel.find('.panel-body').append($code);
      $panel.find('.panel-footer').append('<a type="button" class="btn btn-default" href="' + session.getLoc() + 'R/.val/rds">Download (.rds)</a>');
      $container.empty();
      $container.append($panel);
    }).done(function () {
      cb(null);
    }).fail(function () {
      cb(true);
    });
  };
  // End DOM method /displayAsPrint/

  /* Begin Public method /displayAsTable/
   * A convenience wrapper to display the R object text description as a
   * table inside a Boostrap panel.
   * Also provides link to download object as .rds file.
   *
   * @param text some descriptive text for the header
   * @param session The ocpu Session
   * @param $container jQuery object to place panel inside with text
   * @param next the optional callback
   */

  displayAsTable = function displayAsTable(text, session, $container, next) {
    var cb = next || function () {};
    session.getObject(function (data) {
      if (!data.length) {
        return;
      }

      // Data manipulations
      var keys = Object.keys(data[0]);
      var headers = keys.map(function (v) {
        return '<th>' + v + '</th>';
      });
      var aoColumns = keys.map(function (v) {
        return {
          "mDataProp": v
        };
      });

      // DOM manipulations
      var $table = $('<div class="table-responsive">' + '<table class="table table-condensed table-striped table-bordered em-table">' + '<thead>' + '<tr></tr>' + '</thead>' + '</table>' + '</div>');
      if (headers.length) {
        $table.find('thead tr').html($(headers.join('')));
      }
      var $panel = $('<div class="panel panel-success">' + '<div class="panel-heading">' + '<h3 class="panel-title"></h3>' + '</div>' + '<div class="panel-body"></div>' + '<div class="panel-footer">' + '<div class="btn-group dropup">' + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + 'Downloads <span class="caret"></span>' + '</button>' + '<ul class="dropdown-menu">' + '<li><a href="' + session.getLoc() + 'R/.val/json' + '" download>JSON</a></li>' + '<li><a href="' + session.getLoc() + 'R/.val/csv' + '" download>CSV</a></li>' + '<li><a href="' + session.getLoc() + 'R/.val/tab' + '" download>TAB</a></li>' + '<li><a href="' + session.getLoc() + 'R/.val/md' + '" download>MD</a></li>' + '<li role="separator" class="divider"></li>' + '<li><a href="' + session.getLoc() + 'R/.val/rds" download>RDS</a></li>' + '</ul>' + '</div>' + '</div>' + '</div>');
      $panel.find('.panel-title').text(text);
      $panel.find('.panel-body').append($table);
      $panel.find('.panel-footer').append('');
      $container.empty();
      $container.append($panel);
      $table.find('table').DataTable({
        "aaData": data,
        "aoColumns": aoColumns
      });
    }).done(function () {
      cb(null);
    }).fail(function () {
      cb(true);
    });
  };
  // End Public method /displayAsTable/

  /* Begin Public method /unique/
   * A convenience wrapper to reduce an array to unique elements
   *
   * @param array an array
   *
   * @return an array of unique elements
   */
  unique = function unique(array) {
    var n = [];
    for (var i = 0; i < array.length; i++) {
      if (n.indexOf(array[i]) === -1) {
        n.push(array[i]);
      }
    }
    return n;
  };
  // End Public method /unique/

  /* Begin Public method /makeTextFile/
   * Create a text file on the client that can be used to download
   *
   * @example <a href=makeTextFile('sometext') download="file.txt">downloadme!</a>
   * @param text string to convert to file
   *
   * @return URL for the file
   */
  makeTextFile = function makeTextFile(text) {
    var data = new Blob([text], { type: 'text/plain' });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    var textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
  };

  /* Begin Public method /graphicR/
   * A convenience wrapper for formatting a graphic
   *
   * @param title string for the panel
   * @param func string the function to call
   * @param args object of function parameters
   * @param $container the jquery object to insert the image
   * @param next the optional callback
   *
   * @return an array of unique elements
   */
  graphicR = function graphicR(title, func, args, $container, next) {

    var jqxhr,
        onfail,
        onDone,
        cb = next || function () {};

    onDone = function onDone() {
      cb(null);
    };

    onfail = function onfail(jqXHR) {
      var errText = "Server error: " + jqXHR.responseText;
      console.error(errText);
      cb(true);
    };

    // filter
    jqxhr = ocpu.call(func, args, function (session) {
      var $panel = $('<div class="panel panel-success">' + '<div class="panel-heading">' + '<h3 class="panel-title">' + title + '</h3>' + '</div>' + '<div class="panel-body">' + '<img src="" class="img-responsive" alt="Responsive image">' + '</div>' + '<div class="panel-footer">' + '<div class="btn-group dropup">' + '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + 'Downloads <span class="caret"></span>' + '</button>' + '<ul class="dropdown-menu">' + '<li><a href="' + session.getLoc() + 'graphics/1/png' + '" download>PNG</a></li>' + '<li><a href="' + session.getLoc() + 'graphics/1/svg' + '" download>SVG</a></li>' + '<li><a href="' + session.getLoc() + 'graphics/1/pdf' + '" download>PDF</a></li>' + '<li role="separator" class="divider"></li>' + '<li><a href="' + session.getLoc() + 'R/.val/rds" download>RDS</a></li>' + '</ul>' + '</div>' + '</div>' + '</div>');
      var $img = $panel.find('.img-responsive');
      $img.attr('src', session.getLoc() + 'graphics/1/png');
      $container.append($panel);
    }).done(onDone).fail(onfail);
  };
  // End DOM method /plotR/

  return {
    makeError: makeError,
    setConfigMap: setConfigMap,
    serialize: serialize,
    deserializeSessionData: deserializeSessionData,
    displayAsPrint: displayAsPrint,
    displayAsTable: displayAsTable,
    unique: unique,
    graphicR: graphicR,
    makeTextFile: makeTextFile
  };
}();

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/lib/opencpu.js/opencpu-0.5-npm.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/lib/opencpu.js/opencpu-0.5-npm.js":[function(require,module,exports){
"use strict";

/**
 * Javascript client library for OpenCPU
 * Version 0.5.0
 * Depends: jQuery
 * Requires HTML5 FormData support for file uploads
 * http://github.com/jeroenooms/opencpu.js
 *
 * Include this file in your apps and packages.
 * You only need to use ocpu.seturl if this page is hosted outside of the OpenCPU package. For example:
 *
 * ocpu.seturl("../R") //default, use for apps
 * ocpu.seturl("//public.opencpu.org/ocpu/library/mypackage/R") //CORS
 * ocpu.seturl("/ocpu/library/mypackage/R") //hardcode path
 * ocpu.seturl("https://user:secret/my.server.com/ocpu/library/pkg/R") // basic auth
 */

//Warning for the newbies
if (!window.jQuery) {
  alert("Could not find jQuery! The HTML must include jquery.js before opencpu.js!");
}

module.exports = function (window, $) {

  //global variable
  var r_cors = false;
  var r_path = document.createElement('a');
  r_path.href = "../R";

  //new Session()
  function Session(loc, key, txt) {
    this.loc = loc;
    this.key = key;
    this.txt = txt;
    this.output = txt.split(/\r\n|\r|\n/g);

    this.getKey = function () {
      return key;
    };

    this.getLoc = function () {
      return loc;
    };

    this.getFileURL = function (path) {
      var new_url = document.createElement('a');
      new_url.href = this.getLoc() + "files/" + path;
      new_url.username = r_path.username;
      new_url.password = r_path.password;
      return new_url.href;
    };

    this.getFile = function (path, success) {
      var url = this.getFileURL(path);
      return $.get(url, success);
    };

    this.getObject = function (name, data, success) {
      //in case of no arguments
      name = name || ".val";

      //first arg is a function
      if (name instanceof Function) {
        //pass on to second arg
        success = name;
        name = ".val";
      }

      var url = this.getLoc() + "R/" + name + "/json";
      return $.get(url, data, success);
    };

    this.getStdout = function (success) {
      var url = this.getLoc() + "stdout/text";
      return $.get(url, success);
    };

    this.getConsole = function (success) {
      var url = this.getLoc() + "console/text";
      return $.get(url, success);
    };
  }

  //for POSTing raw code snippets
  //new Snippet("rnorm(100)")
  function Snippet(code) {
    this.code = code || "NULL";

    this.getCode = function () {
      return code;
    };
  }

  //for POSTing files
  //new Upload($('#file')[0].files)
  function Upload(file) {
    if (file instanceof File) {
      this.file = file;
    } else if (file instanceof FileList) {
      this.file = file[0];
    } else if (file.files instanceof FileList) {
      this.file = file.files[0];
    } else if (file.length > 0 && file[0].files instanceof FileList) {
      this.file = file[0].files[0];
    } else {
      throw 'invalid new Upload(file). Argument file must be a HTML <input type="file"></input>';
    }

    this.getFile = function () {
      return file;
    };
  }

  function stringify(x) {
    if (x instanceof Session) {
      return x.getKey();
    } else if (x instanceof Snippet) {
      return x.getCode();
    } else if (x instanceof Upload) {
      return x.getFile();
    } else if (x instanceof File) {
      return x;
    } else if (x instanceof FileList) {
      return x[0];
    } else if (x && x.files instanceof FileList) {
      return x.files[0];
    } else if (x && x.length && x[0].files instanceof FileList) {
      return x[0].files[0];
    } else {
      return JSON.stringify(x);
    }
  }

  //low level call
  function r_fun_ajax(fun, settings, handler) {
    //validate input
    if (!fun) throw "r_fun_call called without fun";
    settings = settings || {};
    handler = handler || function () {};

    //set global settings
    settings.url = settings.url || r_path.href + "/" + fun;
    settings.type = settings.type || "POST";
    settings.data = settings.data || {};
    settings.dataType = settings.dataType || "text";

    //ajax call
    var jqxhr = $.ajax(settings).done(function () {
      var loc = jqxhr.getResponseHeader('Location') || console.log("Location response header missing.");
      var key = jqxhr.getResponseHeader('X-ocpu-session') || console.log("X-ocpu-session response header missing.");
      var txt = jqxhr.responseText;

      //in case of cors we translate relative paths to the target domain
      if (r_cors && loc.match("^/[^/]")) {
        loc = r_path.protocol + "//" + r_path.host + loc;
      }
      handler(new Session(loc, key, txt));
    }).fail(function () {
      console.log("OpenCPU error HTTP " + jqxhr.status + "\n" + jqxhr.responseText);
    });

    //function chaining
    return jqxhr;
  }

  //call a function using uson arguments
  function r_fun_call_json(fun, args, handler) {
    return r_fun_ajax(fun, {
      data: JSON.stringify(args || {}),
      contentType: 'application/json'
    }, handler);
  }

  //call function using url encoding
  //needs to wrap arguments in quotes, etc
  function r_fun_call_urlencoded(fun, args, handler) {
    var data = {};
    $.each(args, function (key, val) {
      data[key] = stringify(val);
    });
    return r_fun_ajax(fun, {
      data: $.param(data)
    }, handler);
  }

  //call a function using multipart/form-data
  //use for file uploads. Requires HTML5
  function r_fun_call_multipart(fun, args, handler) {
    testhtml5();
    var formdata = new FormData();
    $.each(args, function (key, value) {
      formdata.append(key, stringify(value));
    });
    return r_fun_ajax(fun, {
      data: formdata,
      cache: false,
      contentType: false,
      processData: false
    }, handler);
  }

  //Automatically determines type based on argument classes.
  function r_fun_call(fun, args, handler) {
    args = args || {};
    var hasfiles = false;
    var hascode = false;

    //find argument types
    $.each(args, function (key, value) {
      if (value instanceof File || value instanceof Upload || value instanceof FileList) {
        hasfiles = true;
      } else if (value instanceof Snippet || value instanceof Session) {
        hascode = true;
      }
    });

    //determine type
    if (hasfiles) {
      return r_fun_call_multipart(fun, args, handler);
    } else if (hascode) {
      return r_fun_call_urlencoded(fun, args, handler);
    } else {
      return r_fun_call_json(fun, args, handler);
    }
  }

  //call a function and return JSON
  function rpc(fun, args, handler) {
    return r_fun_call(fun, args, function (session) {
      session.getObject(function (data) {
        if (handler) handler(data);
      }).fail(function () {
        console.log("Failed to get JSON response for " + session.getLoc());
      });
    });
  }

  //plotting widget
  //to be called on an (empty) div.
  $.fn.rplot = function (fun, args, cb) {
    var targetdiv = this;
    var myplot = initplot(targetdiv);

    //reset state
    myplot.setlocation();
    myplot.spinner.show();

    // call the function
    return r_fun_call(fun, args, function (tmp) {
      myplot.setlocation(tmp.getLoc());

      //call success handler as well
      if (cb) cb(tmp);
    }).always(function () {
      myplot.spinner.hide();
    });
  };

  $.fn.graphic = function (session, n) {
    initplot(this).setlocation(session.getLoc(), n || "last");
  };

  function initplot(targetdiv) {
    if (targetdiv.data("ocpuplot")) {
      return targetdiv.data("ocpuplot");
    }
    var ocpuplot = function () {
      //local variables
      var Location;
      var n = "last";
      var pngwidth;
      var pngheight;

      var plotdiv = $('<div />').attr({
        style: "width: 100%; height:100%; min-width: 100px; min-height: 100px; position:relative; background-repeat:no-repeat; background-size: 100% 100%;"
      }).appendTo(targetdiv).css("background-image", "none");

      var spinner = $('<span />').attr({
        style: "position: absolute; top: 20px; left: 20px; z-index:1000; font-family: monospace;"
      }).text("loading...").appendTo(plotdiv).hide();

      var pdf = $('<a />').attr({
        target: "_blank",
        style: "position: absolute; top: 10px; right: 10px; z-index:1000; text-decoration:underline; font-family: monospace;"
      }).text("pdf").appendTo(plotdiv);

      var svg = $('<a />').attr({
        target: "_blank",
        style: "position: absolute; top: 30px; right: 10px; z-index:1000; text-decoration:underline; font-family: monospace;"
      }).text("svg").appendTo(plotdiv);

      var png = $('<a />').attr({
        target: "_blank",
        style: "position: absolute; top: 50px; right: 10px; z-index:1000; text-decoration:underline; font-family: monospace;"
      }).text("png").appendTo(plotdiv);

      function updatepng() {
        if (!Location) return;
        pngwidth = plotdiv.width();
        pngheight = plotdiv.height();
        plotdiv.css("background-image", "url(" + Location + "graphics/" + n + "/png?width=" + pngwidth + "&height=" + pngheight + ")");
      }

      function setlocation(newloc, newn) {
        n = newn || n;
        Location = newloc;
        if (!Location) {
          pdf.hide();
          svg.hide();
          png.hide();
          plotdiv.css("background-image", "");
        } else {
          pdf.attr("href", Location + "graphics/" + n + "/pdf?width=11.69&height=8.27&paper=a4r").show();
          svg.attr("href", Location + "graphics/" + n + "/svg?width=11&height=6").show();
          png.attr("href", Location + "graphics/" + n + "/png?width=800&height=600").show();
          updatepng();
        }
      }

      // function to update the png image
      var onresize = debounce(function (e) {
        if (pngwidth == plotdiv.width() && pngheight == plotdiv.height()) {
          return;
        }
        if (plotdiv.is(":visible")) {
          updatepng();
        }
      }, 500);

      // register update handlers
      plotdiv.on("resize", onresize);
      $(window).on("resize", onresize);

      //return objects
      return {
        setlocation: setlocation,
        spinner: spinner
      };
    }();

    targetdiv.data("ocpuplot", ocpuplot);
    return ocpuplot;
  }

  // from understore.js
  function debounce(func, wait, immediate) {
    var result;
    var timeout = null;
    return function () {
      var context = this,
          args = arguments;
      var later = function later() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  }

  function testhtml5() {
    if (window.FormData === undefined) {
      alert("Uploading of files requires HTML5. It looks like you are using an outdated browser that does not support this. Please install Firefox, Chrome or Internet Explorer 10+");
      throw "HTML5 required.";
    }
  }

  //global settings
  function seturl(newpath) {
    if (!newpath.match("/R$")) {
      alert("ERROR! Trying to set R url to: " + newpath + ". Path to an OpenCPU R package must end with '/R'");
    } else {
      r_path = document.createElement('a');
      r_path.href = newpath;
      r_path.href = r_path.href; //IE needs this

      if (location.protocol != r_path.protocol || location.host != r_path.host) {
        r_cors = true;
        if (!('withCredentials' in new XMLHttpRequest())) {
          alert("This browser does not support CORS. Try using Firefox or Chrome.");
        } else if (r_path.username && r_path.password) {
          //should only do this for calls to opencpu maybe
          var regex = new RegExp(r_path.host);
          $.ajaxSetup({
            beforeSend: function beforeSend(xhr, settings) {
              //only use auth for ajax requests to ocpu
              if (regex.test(settings.url)) {
                //settings.username = r_path.username;
                //settings.password = r_path.password;

                /* take out user:pass from target url */
                var target = document.createElement('a');
                target.href = settings.url;
                settings.url = target.protocol + "//" + target.host + target.pathname;

                /* set basic auth header */
                settings.xhrFields = settings.xhrFields || {};
                settings.xhrFields.withCredentials = true;
                settings.crossDomain = true;
                xhr.setRequestHeader("Authorization", "Basic " + btoa(r_path.username + ":" + r_path.password));

                /* debug */
                console.log("Authenticated request to: " + settings.url + " (" + r_path.username + ", " + r_path.password + ")");
              }
            }
          });
        }
      }

      if (location.protocol == "https:" && r_path.protocol != "https:") {
        alert("Page is hosted on HTTPS but using a (non-SSL) HTTP OpenCPU server. This is insecure and most browsers will not allow this.");
      }

      if (r_cors) {
        console.log("Setting path to CORS server " + r_path.href);
      } else {
        console.log("Setting path to local (non-CORS) server " + r_path.href);
      }

      //CORS disallows redirects.
      return $.get(r_path.href + "/", function (resdata) {
        console.log("Path updated. Available objects/functions:\n" + resdata);
      }).fail(function (xhr, textStatus, errorThrown) {
        alert("Connection to OpenCPU failed:\n" + textStatus + "\n" + xhr.responseText + "\n" + errorThrown);
      });
    }
  }

  //for innernetz exploder
  if (typeof console == "undefined") {
    this.console = { log: function log() {} };
  }

  //export
  return {
    call: r_fun_call,
    rpc: rpc,
    seturl: seturl,
    Snippet: Snippet,
    Upload: Upload,
    Session: Session
  };
}(window, jQuery);

},{}]},{},["/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/app/src/js/main.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdC5qcyIsInNyYy9qcy9lbWRhdGEuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tdW5nZS5qcyIsInNyYy9qcy9wcm9jZXNzX3JzZXEuanMiLCJzcmMvanMvc2hlbGwuanMiLCJzcmMvanMvdXRpbC5qcyIsInNyYy9saWIvb3BlbmNwdS5qcy9vcGVuY3B1LTAuNS1ucG0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFDQSxPQUFPLE9BQVAsR0FBa0IsWUFBVTtBQUMxQixNQUNFLFVBREY7O0FBR0EsZUFBYSxzQkFBVTtBQUNyQixNQUFFLFFBQUYsRUFDRyxTQURILENBQ2EsWUFBVTtBQUNqQixRQUFFLGVBQUYsRUFBbUIsSUFBbkI7QUFDQTtBQUNBLFFBQUUsaUJBQUYsRUFBcUIsSUFBckIsQ0FBMEIsVUFBMUIsRUFBc0MsSUFBdEM7QUFDSCxLQUxILEVBTUcsUUFOSCxDQU1ZLFlBQVU7QUFDaEIsUUFBRSxlQUFGLEVBQW1CLElBQW5CO0FBQ0EsUUFBRSxpQkFBRixFQUFxQixJQUFyQixDQUEwQixVQUExQixFQUFzQyxLQUF0QztBQUNILEtBVEg7QUFVRCxHQVhEO0FBWUEsU0FBTyxFQUFFLFlBQWlCLFVBQW5CLEVBQVA7QUFDRCxDQWpCaUIsRUFBbEI7OztBQ0hBOztBQUVBLElBQUksT0FBTyxRQUFRLFdBQVIsQ0FBWDtBQUNBLElBQUksT0FBTyxRQUFRLHNDQUFSLENBQVg7QUFDQSxJQUFJLGFBQWMsWUFBVTs7QUFFMUI7QUFDQSxNQUNBLFlBQVk7QUFDVix1QkFBb0IsRUFEVjtBQUdWLGNBQVcsV0FDVCx5QkFEUyxHQUVQLG1CQUZPLEdBR0wscUZBSEssR0FJTCw4SUFKSyxHQUtQLFFBTE8sR0FNUCxPQU5PLEdBT1AsaUNBUE8sR0FRTCwrQkFSSyxHQVNILDhCQVRHLEdBVUgsa0RBVkcsR0FXSCxnRUFYRyxHQVlMLGFB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QUFQLElBQWtCLFdBQXRCLEVBQW1DO0FBQ2pDLFNBQUssT0FBTCxHQUFlLEVBQUMsS0FBSyxlQUFXLENBQUUsQ0FBbkIsRUFBZjtBQUNEOztBQUVEO0FBQ0EsU0FBTztBQUNMLFVBQWUsVUFEVjtBQUVMLFNBQWUsR0FGVjtBQUdMLFlBQWUsTUFIVjtBQUlMLGFBQWUsT0FKVjtBQUtMLFlBQWUsTUFMVjtBQU1MLGFBQWU7QUFOVixHQUFQO0FBU0QsQ0EzYWlCLENBMmFmLE1BM2FlLEVBMmFQLE1BM2FPLENBQWxCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuLy9TaG93IGFuZCBoaWRlIHRoZSBzcGlubmVyIGZvciBhbGwgYWpheCByZXF1ZXN0cy5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG4gIHZhclxuICAgIGluaXRNb2R1bGU7XG5cbiAgaW5pdE1vZHVsZSA9IGZ1bmN0aW9uKCl7XG4gICAgJChkb2N1bWVudClcbiAgICAgIC5hamF4U3RhcnQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcjYWpheC1zcGlubmVyJykuc2hvdygpO1xuICAgICAgICAgIC8vIEhpZGUgYW55IGJ1dHRvbnMgdGhhdCBjb3VsZCB1bnN5bmMgd2l0aCBhamF4IGVycm9yIGhhbmRsZXJzXG4gICAgICAgICAgJCgnLmFqYXgtc2Vuc2l0aXZlJykuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuYWpheFN0b3AoZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcjYWpheC1zcGlubmVyJykuaGlkZSgpO1xuICAgICAgICAgICQoJy5hamF4LXNlbnNpdGl2ZScpLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfSk7XG4gIH07XG4gIHJldHVybiB7IGluaXRNb2R1bGUgICAgIDogaW5pdE1vZHVsZSB9O1xufSgpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xudmFyIG9jcHUgPSByZXF1aXJlKCcuLi9saWIvb3BlbmNwdS5qcy9vcGVuY3B1LTAuNS1ucG0uanMnKTtcbnZhciBtb2R1bGVuYW1lID0gKGZ1bmN0aW9uKCl7XG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHZhclxuICBjb25maWdNYXAgPSB7XG4gICAgYW5jaG9yX3NjaGVtYV9tYXAgOiB7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZSA6IFN0cmluZygpICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwicm93XCI+JyArXG4gICAgICAgICAgJzxoMiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tMTAgZW0tc2VjdGlvbi10aXRsZVwiPkVNIERhdGEgRmlsZXMgPHNtYWxsPjwvc21hbGw+PC9oMj4nICtcbiAgICAgICAgICAnPGg0IGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS0yXCI+PGEgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tYmxvY2sgZW0tZW1kYXRhLWNsZWFyIGNsZWFyLWJ0biBhamF4LXNlbnNpdGl2ZSBjb2wteHMtMyBjb2wtbWQtM1wiPlJlc2V0PC9hPjwvaDQ+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzxoci8+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhLXJlc3VsdHNcIj4nICtcbiAgICAgICAgICAnPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsZWdlbmQ+R1NFQSBJbnB1dHM8L2xlZ2VuZD4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZ3NlYVwiPjwvZGl2PicgK1xuICAgICAgICAgICAgJzxwPjxzbWFsbCBjbGFzcz1cImNvbC1zbS1vZmZzZXQtMiBnc2VhLWhlbHAtYmxvY2tcIj48L3NtYWxsPjwvcD4nICtcbiAgICAgICAgICAnPC9maWVsZHNldD4nICtcbiAgICAgICAgICAnPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsZWdlbmQ+RU0gSW5wdXRzPC9sZWdlbmQ+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLWVtZGF0YS1yZXN1bHRzLWZpbGVzLWVtXCI+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW0tZXhwcmVzc2lvblwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLWVtZGF0YS1yZXN1bHRzLWZpbGVzLWVtLXBoZW5vdHlwZVwiPjwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxwPjxzbWFsbCBjbGFzcz1cImNvbC1zbS1vZmZzZXQtMiBlbS1oZWxwLWJsb2NrXCI+PC9zbWFsbD48L3A+JyArXG4gICAgICAgICAgJzwvZmllbGRzZXQ+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICc8L2Rpdj4nLFxuXG4gICAgY29kZV90ZW1wbGF0ZSA6IFN0cmluZygpICtcbiAgICAgICc8cHJlIGNsYXNzPVwiZW0tY29kZVwiPjwvcHJlPicsXG5cbiAgICBzZXR0YWJsZV9tYXAgOiB7fVxuICB9LFxuICBzdGF0ZU1hcCA9IHtcbiAgICBmaWx0ZXJfcnNlcV9zZXNzaW9uICAgICA6IG51bGwsXG4gICAgbm9ybWFsaXplX3JzZXFfc2Vzc2lvbiAgOiBudWxsLFxuICAgIGRlX3Rlc3RfcnNlcV9zZXNzaW9uICAgIDogbnVsbCxcbiAgICByYW5rX2dzZWFfc2Vzc2lvbiAgICAgICA6IG51bGwsXG4gICAgZXhwcmVzc2lvbl9lbV9zZXNzaW9uICAgOiBudWxsLFxuICAgIHBoZW9udHlwZSAgICAgICAgICAgICAgIDogbnVsbCxcbiAgICBleHByZXNzaW9uX2dzZWFfc2Vzc2lvbiA6IG51bGwsXG4gICAgcGhlbm90eXBlX2dzZWFfc2Vzc2lvbiAgOiBudWxsXG4gIH0sXG4gIGpxdWVyeU1hcCA9IHt9LFxuICByZXNldCxcbiAgc2V0SlF1ZXJ5TWFwLFxuXG4gIGZldGNoR1NFQUZpbGVzLFxuICBmZXRjaEVNRmlsZXMsXG4gIGNyZWF0ZURhdGFGaWxlcyxcblxuICBjb25maWdNb2R1bGUsXG4gIGluaXRNb2R1bGU7XG4gIC8vIC0tLS0tLS0tLS0gRU5EIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBET00gTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEJlZ2luIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cbiAgc2V0SlF1ZXJ5TWFwID0gZnVuY3Rpb24oICRjb250YWluZXIgKXtcbiAgICBqcXVlcnlNYXAgPSB7XG4gICAgICAkY29udGFpbmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIsXG4gICAgICAkZW1kYXRhX2NsZWFyICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLWVtZGF0YSAuZW0tZW1kYXRhLWNsZWFyJyksXG4gICAgICAkZW1kYXRhX3Jlc3VsdHMgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLWVtZGF0YSAuZW0tZW1kYXRhLXJlc3VsdHMnKSxcbiAgICAgICRlbWRhdGFfcmVzdWx0c19maWxlc19nc2VhICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cyAuZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZ3NlYScpLFxuICAgICAgJGVtZGF0YV9nc2VhX2hlbHAgICAgICAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1lbWRhdGEgLmVtLWVtZGF0YS1yZXN1bHRzIC5nc2VhLWhlbHAtYmxvY2snKSxcbiAgICAgICRlbWRhdGFfcmVzdWx0c19maWxlc19lbSAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cyAuZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW0nKSxcbiAgICAgICRlbWRhdGFfcmVzdWx0c19maWxlc19lbV9leHByZXNzaW9uICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cyAuZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW0gLmVtLWVtZGF0YS1yZXN1bHRzLWZpbGVzLWVtLWV4cHJlc3Npb24gJyksXG4gICAgICAkZW1kYXRhX3Jlc3VsdHNfZmlsZXNfZW1fcGhlbm90eXBlICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLWVtZGF0YSAuZW0tZW1kYXRhLXJlc3VsdHMgLmVtLWVtZGF0YS1yZXN1bHRzLWZpbGVzLWVtIC5lbS1lbWRhdGEtcmVzdWx0cy1maWxlcy1lbS1waGVub3R5cGUnKSxcbiAgICAgICRlbWRhdGFfZW1faGVscCAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cyAuZW0taGVscC1ibG9jaycpXG4gICAgfTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cblxuICAvKiBGZXRjaCBhbmQgYXBwZW5kIHRoZSB2YXJpb3VzIGZpbGVzIHJlcXVpcmVkIGZvciBFTVxuICAgKlxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciBvYmplY3QgdGhlIGpxdWVyeSBvYmplY3QgdG8gYXBwZW5kIHRvXG4gICAqIEBwYXJhbSBuZXh0IGZ1bmN0aW9uIGFuIG9wdGlvbmFsIGNhbGxiYWNrXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgZmV0Y2hFTUZpbGVzID0gZnVuY3Rpb24oICRjb250YWluZXIsIG5leHQgKXtcbiAgICB2YXJcbiAgICBqcXhocl9leHByZXNzaW9uLFxuICAgIGpxeGhyX3BoZW5vdHlwZSxcbiAgICBvbmZhaWwsXG4gICAgb25Eb25lLFxuICAgIGNiID0gbmV4dCB8fCBmdW5jdGlvbigpe307XG5cbiAgICBvbkRvbmUgPSBmdW5jdGlvbiggKXtcbiAgICAgIGpxdWVyeU1hcC4kZW1kYXRhX2VtX2hlbHAudGV4dCgnJyk7XG4gICAgfTtcblxuICAgIG9uZmFpbCA9IGZ1bmN0aW9uKCBqcVhIUiApe1xuICAgICAgdmFyIGVyclRleHQgPSBcIlNlcnZlciBlcnJvcjogXCIgKyBqcVhIUi5yZXNwb25zZVRleHQ7XG4gICAgICBjb25zb2xlLmVycm9yKGVyclRleHQpO1xuICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfZW1faGVscC50ZXh0KGVyclRleHQpO1xuICAgICAgY2IoIHRydWUgKTtcbiAgICB9O1xuXG4gICAgLy8gZmlsdGVyXG4gICAganF4aHJfZXhwcmVzc2lvbiA9IG9jcHUuY2FsbCgnZm9ybWF0X2V4cHJlc3Npb25fZ3NlYScsIHtcbiAgICAgIG5vcm1hbGl6ZWRfZGdlIDogc3RhdGVNYXAubm9ybWFsaXplX3JzZXFfc2Vzc2lvblxuICAgIH0sIGZ1bmN0aW9uKCBzZXNzaW9uICl7IHN0YXRlTWFwLmV4cHJlc3Npb25fZ3NlYV9zZXNzaW9uID0gc2Vzc2lvbjsgfSlcbiAgICAuZG9uZSggZnVuY3Rpb24oKXtcbiAgICAgIHV0aWwuZGlzcGxheUFzVGFibGUoJ0V4cHJlc3Npb24gZmlsZSAoLnR4dCknLFxuICAgICAgICBzdGF0ZU1hcC5leHByZXNzaW9uX2dzZWFfc2Vzc2lvbixcbiAgICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfcmVzdWx0c19maWxlc19lbV9leHByZXNzaW9uLFxuICAgICAgICBudWxsICk7XG4gICAgfSlcbiAgICAuZmFpbCggb25mYWlsICk7XG5cbiAgICBqcXhocl9waGVub3R5cGUgPSBqcXhocl9leHByZXNzaW9uLnRoZW4oIGZ1bmN0aW9uKCApe1xuICAgICAgcmV0dXJuIG9jcHUucnBjKCdmb3JtYXRfY2xhc3NfZ3NlYScsIHtcbiAgICAgICAgZmlsdGVyZWRfZGdlIDogc3RhdGVNYXAuZmlsdGVyX3JzZXFfc2Vzc2lvbixcbiAgICAgICAgZGVfdGVzdGVkX3R0IDogc3RhdGVNYXAuZGVfdGVzdF9yc2VxX3Nlc3Npb24sXG4gICAgICB9LCBmdW5jdGlvbiggZGF0YSApe1xuICAgICAgICAvL3NvbWUgc3Rvb3BpZCBHU0VBIGZvcm1hdC5cbiAgICAgICAgdmFyIHJ1bm5pbmcgPSBTdHJpbmcoKTtcbiAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKCBsaW5lICl7XG4gICAgICAgICAgcnVubmluZyArPSBsaW5lWzBdICsgJ1xcbic7XG4gICAgICAgIH0pO1xuICAgICAgICBqcXVlcnlNYXAuJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2VtX3BoZW5vdHlwZS5hcHBlbmQoXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1zdWNjZXNzXCI+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4nICtcbiAgICAgICAgICAgICAgJzxoMyBjbGFzcz1cInBhbmVsLXRpdGxlXCI+UGhlbm90eXBlIGZpbGUgKC5jbHMpPC9oMz4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPjxwcmUgY2xhc3M9XCJlbS1jb2RlXCI+JyArIHJ1bm5pbmcgKyAnPC9wcmU+PC9kaXY+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWZvb3RlclwiPicgK1xuICAgICAgICAgICAgICAnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgaHJlZj1cIicgKyB1dGlsLm1ha2VUZXh0RmlsZShydW5uaW5nKSArICdcIiBkb3dubG9hZD1cInBoZW5vdHlwZS5jbHNcIj5Eb3dubG9hZCAoLmNscyk8L2E+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzwvZGl2PidcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgLmRvbmUoIGZ1bmN0aW9uKCl7XG4gICAgICAvLyB1dGlsLmRpc3BsYXlBc1RhYmxlKCdQaGVub3R5cGUgZmlsZSAoLmNscyknLFxuICAgICAgLy8gICBzdGF0ZU1hcC5jbGFzc19nc2VhX3Nlc3Npb24sXG4gICAgICAvLyAgIGpxdWVyeU1hcC4kZW1kYXRhX3Jlc3VsdHNfZmlsZXNfZW1fcGhlbm90eXBlLFxuICAgICAgLy8gICBudWxsICk7XG4gICAgICBjYiggbnVsbCApO1xuICAgIH0pXG4gICAgLmZhaWwoIG9uZmFpbCApO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyogRmV0Y2ggYW5kIGFwcGVuZCB0aGUgdmFyaW91cyBmaWxlcyByZXF1aXJlZCBmb3IgR1NFQVxuICAgKlxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciBvYmplY3QgdGhlIGpxdWVyeSBvYmplY3QgdG8gYXBwZW5kIHRvXG4gICAqIEBwYXJhbSBuZXh0IGZ1bmN0aW9uIGFuIG9wdGlvbmFsIGNhbGxiYWNrXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgZmV0Y2hHU0VBRmlsZXMgPSBmdW5jdGlvbiggJGNvbnRhaW5lciwgbmV4dCApe1xuICAgIHZhclxuICAgIGpxeGhyLFxuICAgIG9uZmFpbCxcbiAgICBvbkRvbmUsXG4gICAgY2IgPSBuZXh0IHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIG9uRG9uZSA9IGZ1bmN0aW9uKCl7XG4gICAgICB1dGlsLmRpc3BsYXlBc1RhYmxlKCdSYW5rIEZpbGUgKC5ybmspJyxcbiAgICAgIHN0YXRlTWFwLnJhbmtfZ3NlYV9zZXNzaW9uLFxuICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfcmVzdWx0c19maWxlc19nc2VhLFxuICAgICAgbnVsbCApO1xuICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfZ3NlYV9oZWxwLnRleHQoJycpO1xuICAgICAgY2IoIGZhbHNlICk7XG4gICAgfTtcblxuICAgIG9uZmFpbCA9IGZ1bmN0aW9uKCBqcVhIUiApe1xuICAgICAgdmFyIGVyclRleHQgPSBcIlNlcnZlciBlcnJvcjogXCIgKyBqcVhIUi5yZXNwb25zZVRleHQ7XG4gICAgICBjb25zb2xlLmVycm9yKGVyclRleHQpO1xuICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfZ3NlYV9oZWxwLnRleHQoZXJyVGV4dCk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgIH07XG5cbiAgICAvLyBmaWx0ZXJcbiAgICBqcXhociA9IG9jcHUuY2FsbCgnZm9ybWF0X3JhbmtzX2dzZWEnLCB7XG4gICAgICBkZV90ZXN0ZWRfdHQgOiBzdGF0ZU1hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvblxuICAgIH0sIGZ1bmN0aW9uKCBzZXNzaW9uICl7IHN0YXRlTWFwLnJhbmtfZ3NlYV9zZXNzaW9uID0gc2Vzc2lvbjsgfSlcbiAgICAuZG9uZSggb25Eb25lIClcbiAgICAuZmFpbCggb25mYWlsICk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuXG4gIC8qIEZldGNoIGFuZCBhcHBlbmQgdGhlIHZhcmlvdXMgZmlsZXMgcmVxdWlyZWRcbiAgICpcbiAgICogQHBhcmFtICRjb250YWluZXIgb2JqZWN0IHRoZSBqcXVlcnkgb2JqZWN0IHRvIGFwcGVuZCB0b1xuICAgKlxuICAgKiBAcmV0dXJuIGJvb2xlYW5cbiAgICovXG4gIGNyZWF0ZURhdGFGaWxlcyA9IGZ1bmN0aW9uKCApe1xuICAgIGZldGNoR1NFQUZpbGVzKCBqcXVlcnlNYXAuJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2dzZWEsIGZ1bmN0aW9uKCBlcnIgKXtcbiAgICAgICAgaWYoIGVyciApeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgZmV0Y2hFTUZpbGVzKCBqcXVlcnlNYXAuJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2VtICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tIEVORCBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQmVnaW4gcHVibGljIG1ldGhvZCAvcmVzZXQvXG4gIC8qIFJldHVybiB0byB0aGUgZ3JvdW5kIHN0YXRlXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgcmVzZXQgPSBmdW5jdGlvbiggKSB7XG4gICAgYWxlcnQoJ3Jlc2V0IGNhbGxlZCcpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvcmVzZXQvXG5cblxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC9jb25maWdNb2R1bGUvXG4gIC8vIEV4YW1wbGUgICA6IHNwYS5jaGF0LmNvbmZpZ01vZHVsZSh7IHNsaWRlcl9vcGVuX2VtIDogMTggfSk7XG4gIC8vIFB1cnBvc2UgICA6IENvbmZpZ3VyZSB0aGUgbW9kdWxlIHByaW9yIHRvIGluaXRpYWxpemF0aW9uXG4gIC8vIEFyZ3VtZW50cyA6XG4gIC8vICAgKiBzZXRfY2hhdF9hbmNob3IgLSBhIGNhbGxiYWNrIHRvIG1vZGlmeSB0aGUgVVJJIGFuY2hvciB0b1xuICAvLyAgICAgaW5kaWNhdGUgb3BlbmVkIG9yIGNsb3NlZCBzdGF0ZS4gVGhpcyBjYWxsYmFjayBtdXN0IHJldHVyblxuICAvLyAgICAgZmFsc2UgaWYgdGhlIHJlcXVlc3RlZCBzdGF0ZSBjYW5ub3QgYmUgbWV0XG4gIC8vICAgKiBjaGF0X21vZGVsIC0gdGhlIGNoYXQgbW9kZWwgb2JqZWN0IHByb3ZpZGVzIG1ldGhvZHNcbiAgLy8gICAgICAgdG8gaW50ZXJhY3Qgd2l0aCBvdXIgaW5zdGFudCBtZXNzYWdpbmdcbiAgLy8gICAqIHBlb3BsZV9tb2RlbCAtIHRoZSBwZW9wbGUgbW9kZWwgb2JqZWN0IHdoaWNoIHByb3ZpZGVzXG4gIC8vICAgICAgIG1ldGhvZHMgdG8gbWFuYWdlIHRoZSBsaXN0IG9mIHBlb3BsZSB0aGUgbW9kZWwgbWFpbnRhaW5zXG4gIC8vICAgKiBzbGlkZXJfKiBzZXR0aW5ncy4gQWxsIHRoZXNlIGFyZSBvcHRpb25hbCBzY2FsYXJzLlxuICAvLyAgICAgICBTZWUgbWFwQ29uZmlnLnNldHRhYmxlX21hcCBmb3IgYSBmdWxsIGxpc3RcbiAgLy8gICAgICAgRXhhbXBsZTogc2xpZGVyX29wZW5fZW0gaXMgdGhlIG9wZW4gaGVpZ2h0IGluIGVtJ3NcbiAgLy8gQWN0aW9uICAgIDpcbiAgLy8gICBUaGUgaW50ZXJuYWwgY29uZmlndXJhdGlvbiBkYXRhIHN0cnVjdHVyZSAoY29uZmlnTWFwKSBpc1xuICAvLyAgIHVwZGF0ZWQgd2l0aCBwcm92aWRlZCBhcmd1bWVudHMuIE5vIG90aGVyIGFjdGlvbnMgYXJlIHRha2VuLlxuICAvLyBSZXR1cm5zICAgOiB0cnVlXG4gIC8vIFRocm93cyAgICA6IEphdmFTY3JpcHQgZXJyb3Igb2JqZWN0IGFuZCBzdGFjayB0cmFjZSBvblxuICAvLyAgICAgICAgICAgICB1bmFjY2VwdGFibGUgb3IgbWlzc2luZyBhcmd1bWVudHNcbiAgLy9cbiAgY29uZmlnTW9kdWxlID0gZnVuY3Rpb24gKCBpbnB1dF9tYXAgKSB7XG4gICAgdXRpbC5zZXRDb25maWdNYXAoe1xuICAgICAgaW5wdXRfbWFwICAgIDogaW5wdXRfbWFwLFxuICAgICAgc2V0dGFibGVfbWFwIDogY29uZmlnTWFwLnNldHRhYmxlX21hcCxcbiAgICAgIGNvbmZpZ19tYXAgICA6IGNvbmZpZ01hcFxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvY29uZmlnTW9kdWxlL1xuXG4gIC8qIGluaXRNb2R1bGVcbiAgICogQHBhcmFtIG9jcHUgKE9iamVjdCkgb2NwdSBzaW5nbGV0b25cbiAgICogQHBhcmFtICRjb250YWluZXIgKE9iamVjdCkgalF1ZXJ5IHBhcmVudFxuICAgKi9cbiAgaW5pdE1vZHVsZSA9IGZ1bmN0aW9uKCAkY29udGFpbmVyLCBtc2dfbWFwICl7XG4gICAgaWYoICEkY29udGFpbmVyICl7XG4gICAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGNvbnRhaW5lcicpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiggJC5pc0VtcHR5T2JqZWN0KCBtc2dfbWFwICkgfHxcbiAgICAgICAhbXNnX21hcC5oYXNPd25Qcm9wZXJ0eSggJ2ZpbHRlcl9yc2VxX3Nlc3Npb24nICkgfHxcbiAgICAgICAhbXNnX21hcC5oYXNPd25Qcm9wZXJ0eSggJ25vcm1hbGl6ZV9yc2VxX3Nlc3Npb24nIHx8XG4gICAgICAgIW1zZ19tYXAuaGFzT3duUHJvcGVydHkoICdkZV90ZXN0X3JzZXFfc2Vzc2lvbicgKSApKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgbXNnX21hcCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAkY29udGFpbmVyLmh0bWwoIGNvbmZpZ01hcC50ZW1wbGF0ZSApO1xuICAgIHNldEpRdWVyeU1hcCggJGNvbnRhaW5lciApO1xuICAgIGpxdWVyeU1hcC4kZW1kYXRhX2NsZWFyLmNsaWNrKCByZXNldCApO1xuXG4gICAgc3RhdGVNYXAuZmlsdGVyX3JzZXFfc2Vzc2lvbiA9IG1zZ19tYXAuZmlsdGVyX3JzZXFfc2Vzc2lvbjtcbiAgICBzdGF0ZU1hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uID0gbXNnX21hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uO1xuICAgIHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uID0gbXNnX21hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvbjtcblxuICAgIC8vIGRvIHN0dWZmXG4gICAgY3JlYXRlRGF0YUZpbGVzKCk7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0TW9kdWxlICAgICAgOiBpbml0TW9kdWxlLFxuICAgIGNvbmZpZ01vZHVsZSAgICA6IGNvbmZpZ01vZHVsZSxcbiAgICByZXNldCAgICAgICAgICAgOiByZXNldFxuICB9O1xuXG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1vZHVsZW5hbWU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHNoZWxsID0gcmVxdWlyZSgnLi9zaGVsbCcpO1xudmFyIGJvb3QgPSByZXF1aXJlKCcuL2Jvb3QnKTtcblxuLypcbiAqIE9wZW5DUFUgaXMgTk9UIGEgY29uc29sZS4uLlxuICogaHR0cHM6Ly93d3cub3BlbmNwdS5vcmcvanNsaWIuaHRtbFxuICpcbiAqICdBbHNvIG5vdGUgdGhhdCBldmVuIHdoZW4gdXNpbmcgQ09SUywgdGhlIG9wZW5jcHUuanMgbGlicmFyeSBzdGlsbCByZXF1aXJlc1xuICogdGhhdCBhbGwgUiBmdW5jdGlvbnMgdXNlZCBieSBhIGNlcnRhaW4gYXBwbGljYXRpb24gYXJlIGNvbnRhaW5lZCBpbiBhIHNpbmdsZVxuICogUiBwYWNrYWdlLiBUaGlzIGlzIG9uIHB1cnBvc2UsIHRvIGZvcmNlIHlvdSB0byBrZWVwIHRoaW5ncyBvcmdhbml6ZWQuIElmXG4gKiB5b3Ugd291bGQgbGlrZSB0byB1c2UgZnVuY3Rpb25hbGl0eSBmcm9tIHZhcmlvdXMgUiBwYWNrYWdlcywgeW91IG5lZWRcbiAqIHRvIGNyZWF0ZSBhbiBSIHBhY2thZ2UgdGhhdCBpbmNsdWRlcyBzb21lIHdyYXBwZXIgZnVuY3Rpb25zIGFuZCBmb3JtYWxseVxuICogZGVjbGFyZXMgaXRzIGRlcGVuZGVuY2llcyBvbiB0aGUgb3RoZXIgcGFja2FnZXMuIFdyaXRpbmcgYW4gUiBwYWNrYWdlIGlzXG4gKiByZWFsbHkgZWFzeSB0aGVzZSBkYXlzLCBzbyB0aGlzIHNob3VsZCBiZSBubyBwcm9ibGVtLidcbiAqL1xuKGZ1bmN0aW9uKCl7XG4gIGJvb3QuaW5pdE1vZHVsZSgpO1xuICBzaGVsbC5pbml0TW9kdWxlKFwiLy9sb2NhbGhvc3Q6ODAwMC9vY3B1L2xpYnJhcnkvZW1STkFTZXEvUlwiLCAkKCcjZW0nKSk7XG59KCkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG52YXIgb2NwdSA9IHJlcXVpcmUoJy4uL2xpYi9vcGVuY3B1LmpzL29wZW5jcHUtMC41LW5wbS5qcycpO1xuXG52YXIgbXVuZ2UgPSAoZnVuY3Rpb24oKXtcblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdmFyXG4gIGNvbmZpZ01hcCA9IHtcblxuICAgIHRlbXBsYXRlIDogU3RyaW5nKCkgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJlbS1tdW5nZVwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAgICc8aDIgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTEwIGVtLXNlY3Rpb24tdGl0bGVcIj5EYXRhIE11bmdlIDxzbWFsbD48L3NtYWxsPjwvaDI+JyArXG4gICAgICAgICAgJzxoNCBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tMlwiPjxhIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLWJsb2NrIGVtLW11bmdlLWNsZWFyIGNsZWFyLWJ0biBhamF4LXNlbnNpdGl2ZSBjb2wteHMtMyBjb2wtbWQtM1wiPlJlc2V0PC9hPjwvaDQ+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzxoci8+JyArXG4gICAgICAgICc8Zm9ybT4nICtcbiAgICAgICAgICAnPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cCBlbS1tdW5nZS1tZXRhZGF0YVwiPicgK1xuICAgICAgICAgICAgJzxsZWdlbmQ+TWV0YWRhdGEgSW5wdXQ8L2xlZ2VuZD4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tbXVuZ2UtbWV0YWRhdGEtZmlsZSByb3dcIj4nICtcbiAgICAgICAgICAgICAgJzxsYWJlbCBjbGFzcz1cImNvbC1zbS0zIGNvbC1mb3JtLWxhYmVsXCI+TWV0YWRhdGEgRmlsZTwvbGFiZWw+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLXNtLTlcIj4nICtcbiAgICAgICAgICAgICAgICAnPGxhYmVsIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1maWxlIGJ0bi1tZCBidG4tYmxvY2tcIiBmb3I9XCJlbS1tdW5nZS1tZXRhZGF0YS1pbnB1dFwiPlNlbGVjdDwvbGFiZWw+JyArXG4gICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwiZmlsZVwiIGNsYXNzPVwiZm9ybS1jb250cm9sLWZpbGVcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCIgaWQ9XCJlbS1tdW5nZS1tZXRhZGF0YS1pbnB1dFwiIC8+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2PjxzbWFsbCBjbGFzcz1cImhlbHAtYmxvY2tcIj48L3NtYWxsPjwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwIGVtLW11bmdlLW1ldGFkYXRhLXJlc3VsdHNcIj48L2Rpdj4nICtcbiAgICAgICAgICAnPC9maWVsZHNldD4nICtcblxuICAgICAgICAgICc8ZmllbGRzZXQgY2xhc3M9XCJmb3JtLWdyb3VwIGVtLW11bmdlLWRhdGFcIj4nICtcbiAgICAgICAgICAgICc8bGVnZW5kPkRhdGEgSW5wdXQ8L2xlZ2VuZD4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tbXVuZ2UtZGF0YS1zcGVjaWVzIHJvd1wiPicgK1xuICAgICAgICAgICAgICAnPGxhYmVsIGNsYXNzPVwiY29sLXNtLTMgY29sLWZvcm0tbGFiZWxcIj5TcGVjaWVzICZuYnNwPC9sYWJlbD4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtc20tOVwiPicgK1xuICAgICAgICAgICAgICAgICc8c2VsZWN0IGNsYXNzPVwic2VsZWN0cGlja2VyIGZvcm0tY29udHJvbFwiIGRhdGEtc3R5bGU9XCJidG4tZGVmYXVsdFwiPicgK1xuICAgICAgICAgICAgICAgICAgJzxvcHRpb24+aHVtYW48L29wdGlvbj4nICtcbiAgICAgICAgICAgICAgICAgICc8b3B0aW9uPm1vdXNlPC9vcHRpb24+JyArXG4gICAgICAgICAgICAgICAgJzwvc2VsZWN0PicgK1xuICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLW11bmdlLWRhdGEtc291cmNlX25hbWUgcm93XCI+JyArXG4gICAgICAgICAgICAgICc8bGFiZWwgY2xhc3M9XCJjb2wtc20tMyBjb2wtZm9ybS1sYWJlbFwiPlNvdXJjZSBOYW1lc3BhY2U8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS05XCI+JyArXG4gICAgICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJzZWxlY3RwaWNrZXIgZm9ybS1jb250cm9sXCIgZGF0YS1zdHlsZT1cImJ0bi1kZWZhdWx0XCI+JyArXG4gICAgICAgICAgICAgICAgICAnPG9wdGlvbj5lbnNlbWJsX2dlbmVfaWQ8L29wdGlvbj4nICtcbiAgICAgICAgICAgICAgICAgICc8b3B0aW9uPmhnbmNfc3ltYm9sPC9vcHRpb24+JyArXG4gICAgICAgICAgICAgICAgICAnPG9wdGlvbj5tZ2lfc3ltYm9sPC9vcHRpb24+JyArXG4gICAgICAgICAgICAgICAgJzwvc2VsZWN0PicgK1xuICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLW11bmdlLWRhdGEtdGFyZ2V0X25hbWUgcm93XCI+JyArXG4gICAgICAgICAgICAgICc8bGFiZWwgY2xhc3M9XCJjb2wtc20tMyBjb2wtZm9ybS1sYWJlbFwiPlRhcmdldCBOYW1lc3BhY2U8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS05XCI+JyArXG4gICAgICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJzZWxlY3RwaWNrZXIgZm9ybS1jb250cm9sXCIgZGF0YS1zdHlsZT1cImJ0bi1kZWZhdWx0XCI+JyArXG4gICAgICAgICAgICAgICAgICAnPG9wdGlvbj5oZ25jX3N5bWJvbDwvb3B0aW9uPicgK1xuICAgICAgICAgICAgICAgICAgJzxvcHRpb24+ZW5zZW1ibF9pZDwvb3B0aW9uPicgK1xuICAgICAgICAgICAgICAgICAgJzxvcHRpb24+bWdpX3N5bWJvbDwvb3B0aW9uPicgK1xuICAgICAgICAgICAgICAgICc8L3NlbGVjdD4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJlbS1tdW5nZS1kYXRhLWZpbGUgcm93XCI+JyArXG4gICAgICAgICAgICAgICc8bGFiZWwgY2xhc3M9XCJjb2wtc20tMyBjb2wtZm9ybS1sYWJlbFwiPkRhdGEgRmlsZXM8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS05XCI+JyArXG4gICAgICAgICAgICAgICAgJzxsYWJlbCBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4tZmlsZSBidG4tbWQgYnRuLWJsb2NrXCIgZm9yPVwiZW0tbXVuZ2UtZGF0YS1maWxlXCI+U2VsZWN0PC9sYWJlbD4nICtcbiAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJmaWxlXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wtZmlsZVwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBpZD1cImVtLW11bmdlLWRhdGEtZmlsZVwiIG11bHRpcGxlIC8+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2PjxzbWFsbCBjbGFzcz1cImhlbHAtYmxvY2tcIj48L3NtYWxsPjwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwIGVtLW11bmdlLWRhdGEtcmVzdWx0c1wiPjwvZGl2PicgK1xuICAgICAgICAgICc8L2ZpZWxkc2V0PicgK1xuICAgICAgICAnPC9mb3JtPicgK1xuICAgICAgJzwvZGl2PicsXG5cbiAgICBkZWZhdWx0X21ldGFkYXRhX2hlbHAgOiBTdHJpbmcoKSArICdUYWItZGVsaW1pdGVkICgudHh0KS4gSGVhZGVycyBmb3IgXFwnaWRcXCcgKGZpbGVuYW1lcykgYW5kIFxcJ2NsYXNzXFwnJyxcbiAgICBkZWZhdWx0X2RhdGFfaGVscCAgICAgOiBTdHJpbmcoKSArICdUYWItZGVsaW1pdGVkICgudHh0KS4gUm93cyBpbmRpY2F0ZSBnZW5lIGFuZCBjb3VudCcsXG5cbiAgICAgY29kZV90ZW1wbGF0ZSA6IFN0cmluZygpICtcbiAgICAgICc8cHJlIGNsYXNzPVwiZW0tY29kZVwiPjwvcHJlPicsXG4gICAgc2V0dGFibGVfbWFwIDoge31cbiAgfSxcblxuICBzdGF0ZU1hcCA9IHtcbiAgICBtZXRhZGF0YV9zZXNzaW9uICAgICAgICA6IG51bGwsXG4gICAgbWV0YWRhdGFfZmlsZSAgICAgICAgICAgOiBudWxsLFxuICAgIGRhdGFfc2Vzc2lvbiAgICAgICAgICAgIDogbnVsbCxcbiAgICBkYXRhX2ZpbGVzICAgICAgICAgICAgICA6IG51bGxcbiAgfSxcbiAganF1ZXJ5TWFwID0ge30sXG4gIHNldEpRdWVyeU1hcCxcbiAgY29uZmlnTW9kdWxlLFxuICB0b2dnbGVJbnB1dCxcbiAgcmVzZXQsXG4gIG9uTWV0YUZpbGVDaGFuZ2UsXG4gIG9uTWV0YWRhdGFQcm9jZXNzZWQsXG4gIHByb2Nlc3NNZXRhRmlsZSxcbiAgb25EYXRhRmlsZXNDaGFuZ2UsXG4gIG9uRGF0YVByb2Nlc3NlZCxcbiAgcHJvY2Vzc0RhdGFGaWxlcyxcbiAgaW5pdE1vZHVsZTtcbiAgLy8gLS0tLS0tLS0tLSBFTkQgTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQmVnaW4gRE9NIG1ldGhvZCAvc2V0SlF1ZXJ5TWFwL1xuICBzZXRKUXVlcnlNYXAgPSBmdW5jdGlvbiggJGNvbnRhaW5lciApe1xuICAgIGpxdWVyeU1hcCA9IHtcbiAgICAgICRjb250YWluZXIgICAgICAgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lcixcbiAgICAgICRtdW5nZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UnKSxcbiAgICAgICRtdW5nZV9jbGVhciAgICAgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLWNsZWFyJyksXG5cbiAgICAgICRtdW5nZV9tZXRhZGF0YV9maWVsZHNldCAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgZmllbGRzZXQuZW0tbXVuZ2UtbWV0YWRhdGEnKSxcbiAgICAgICRtdW5nZV9tZXRhZGF0YV9maWxlX2lucHV0ICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLW1ldGFkYXRhIC5lbS1tdW5nZS1tZXRhZGF0YS1maWxlICNlbS1tdW5nZS1tZXRhZGF0YS1pbnB1dCcpLFxuICAgICAgJG11bmdlX21ldGFkYXRhX2hlbHAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtbWV0YWRhdGEgLmhlbHAtYmxvY2snKSxcbiAgICAgICRtdW5nZV9tZXRhZGF0YV9yZXN1bHRzICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLW1ldGFkYXRhIC5lbS1tdW5nZS1tZXRhZGF0YS1yZXN1bHRzJyksXG5cbiAgICAgICRtdW5nZV9kYXRhX2ZpZWxkc2V0ICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgZmllbGRzZXQuZW0tbXVuZ2UtZGF0YScpLFxuICAgICAgJG11bmdlX2RhdGFfc3BlY2llc19zZWxlY3QgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtZGF0YSAuZW0tbXVuZ2UtZGF0YS1zcGVjaWVzIC5zZWxlY3RwaWNrZXInKSxcbiAgICAgICRtdW5nZV9kYXRhX3NvdXJjZV9uYW1lX3NlbGVjdCAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLWRhdGEgLmVtLW11bmdlLWRhdGEtc291cmNlX25hbWUgLnNlbGVjdHBpY2tlcicpLFxuICAgICAgJG11bmdlX2RhdGFfdGFyZ2V0X25hbWVfc2VsZWN0ICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtZGF0YSAuZW0tbXVuZ2UtZGF0YS10YXJnZXRfbmFtZSAuc2VsZWN0cGlja2VyJyksXG4gICAgICAkbXVuZ2VfZGF0YV9maWxlICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLW11bmdlIC5lbS1tdW5nZS1kYXRhIC5lbS1tdW5nZS1kYXRhLWZpbGUgaW5wdXQnKSxcbiAgICAgICRtdW5nZV9kYXRhX2hlbHAgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLWRhdGEgLmhlbHAtYmxvY2snKSxcbiAgICAgICRtdW5nZV9kYXRhX3Jlc3VsdHMgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLWRhdGEtcmVzdWx0cycpXG4gICAgfTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cblxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9wcm9jZXNzTWV0YUZpbGUvXG4gIHByb2Nlc3NNZXRhRmlsZSA9IGZ1bmN0aW9uKCBkYXRhLCBjYiApe1xuICAgIGlmKCAhZGF0YS5oYXNPd25Qcm9wZXJ0eSgnZmlsZXMnKSB8fCAhZGF0YS5maWxlcy5sZW5ndGggKXtcbiAgICAgIGFsZXJ0KCdObyBmaWxlIHNlbGVjdGVkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN0YXRlTWFwLm1ldGFkYXRhX2ZpbGUgPSBkYXRhLmZpbGVzWzBdO1xuXG4gICAgLy9wZXJmb3JtIHRoZSByZXF1ZXN0XG4gICAgdmFyIGpxeGhyID0gb2NwdS5jYWxsKCdjcmVhdGVfbWV0YScsIHtcbiAgICAgIG1ldGFkYXRhX2ZpbGUgOiBzdGF0ZU1hcC5tZXRhZGF0YV9maWxlXG4gICAgfSwgZnVuY3Rpb24oc2Vzc2lvbil7XG4gICAgICBzdGF0ZU1hcC5tZXRhZGF0YV9zZXNzaW9uID0gc2Vzc2lvbjtcbiAgICB9KTtcblxuICAgIGpxeGhyLmRvbmUoZnVuY3Rpb24oKXtcbiAgICAgIC8vY2xlYXIgYW55IHByZXZpb3VzIGhlbHAgbWVzc2FnZXNcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfaGVscC50ZXh0KCcnKTtcbiAgICAgIGNiKCBudWxsLCBzdGF0ZU1hcC5tZXRhZGF0YV9zZXNzaW9uLCBzdGF0ZU1hcC5tZXRhZGF0YV9maWxlLm5hbWUgKTtcbiAgICB9KTtcblxuICAgIGpxeGhyLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgIHZhciBlcnJUZXh0ID0gXCJTZXJ2ZXIgZXJyb3I6IFwiICsganF4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgY29uc29sZS5lcnJvcihlcnJUZXh0KTtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfaGVscC50ZXh0KGVyclRleHQpO1xuICAgICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9yZXN1bHRzLmVtcHR5KCk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBET00gbWV0aG9kIC9wcm9jZXNzTWV0YUZpbGUvXG5cbiAgLy8gQmVnaW4gRE9NIG1ldGhvZCAvcHJvY2Vzc0RhdGFGaWxlcy9cbiAgcHJvY2Vzc0RhdGFGaWxlcyA9IGZ1bmN0aW9uKCBkYXRhLCBjYiApe1xuXG4gICAgaWYoICFkYXRhLmhhc093blByb3BlcnR5KCdzcGVjaWVzJykgfHxcbiAgICAgICAgIWRhdGEuaGFzT3duUHJvcGVydHkoJ2ZpbGVzJykgfHxcbiAgICAgICAgIWRhdGEuZmlsZXMubGVuZ3RoICl7XG4gICAgICBhbGVydCgnTm8gZmlsZShzKSBzZWxlY3RlZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiggIXN0YXRlTWFwLm1ldGFkYXRhX2ZpbGUgKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgbG9hZCBtZXRhZGF0YS4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUSGlzIGlzIHJlcXVpcmVkXG4gICAgaWYoICFkYXRhLnNwZWNpZXMgKXtcbiAgICAgIGFsZXJ0KCdTcGVjaWVzIG11c3QgYmUgc2V0IHRvIFxcJ2h1bWFuXFwnIG9yIFxcJ21vdXNlXFwnJyk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXRlTWFwLmRhdGFfZmlsZXMgPSBkYXRhLmZpbGVzO1xuXG4gICAgLy8gb3BlbmNwdSBvbmx5IGFjY2VwdHMgc2luZ2xlIGZpbGVzIGFzIGFyZ3VtZW50c1xuICAgIHZhciBhcmdzID0ge1xuICAgICAgbWV0YWRhdGFfZmlsZSAgIDogc3RhdGVNYXAubWV0YWRhdGFfZmlsZSxcbiAgICAgIHNwZWNpZXMgICAgICAgICA6IGRhdGEuc3BlY2llcyxcbiAgICAgIHNvdXJjZV9uYW1lICAgICA6IGRhdGEuc291cmNlX25hbWUsXG4gICAgICB0YXJnZXRfbmFtZSAgICAgOiBkYXRhLnRhcmdldF9uYW1lXG4gICAgfTtcblxuICAgIC8vIGxvb3AgdGhyb3VnaCBmaWxlc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGVNYXAuZGF0YV9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZmlsZSA9IHN0YXRlTWFwLmRhdGFfZmlsZXMuaXRlbShpKTtcbiAgICAgICAgYXJnc1snZmlsZScgKyBpXSA9IGZpbGU7XG4gICAgfVxuXG4gICAgLy9wZXJmb3JtIHRoZSByZXF1ZXN0XG4gICAgdmFyIGpxeGhyID0gb2NwdS5jYWxsKCdtZXJnZV9kYXRhJyxcbiAgICAgIGFyZ3MsXG4gICAgICBmdW5jdGlvbihzZXNzaW9uKXtcbiAgICAgICAgc3RhdGVNYXAuZGF0YV9zZXNzaW9uID0gc2Vzc2lvbjtcbiAgICAgICAgdXRpbC5kaXNwbGF5QXNQcmludCgnUmVzdWx0cycsXG4gICAgICAgICAgc3RhdGVNYXAuZGF0YV9zZXNzaW9uLFxuICAgICAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9yZXN1bHRzKTtcbiAgICB9KTtcblxuICAgIGpxeGhyLmRvbmUoZnVuY3Rpb24oKXtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9oZWxwLnRleHQoJ0ZpbGVzIG1lcmdlZDogJyArIHN0YXRlTWFwLmRhdGFfZmlsZXMubGVuZ3RoKTtcbiAgICAgIGNiKCBudWxsLCBzdGF0ZU1hcC5kYXRhX3Nlc3Npb24gKTtcbiAgICB9KTtcblxuICAgIGpxeGhyLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgIHZhciBlcnJUZXh0ID0gXCJTZXJ2ZXIgZXJyb3I6IFwiICsganF4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgY29uc29sZS5lcnJvcihlcnJUZXh0KTtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9oZWxwLnRleHQoZXJyVGV4dCk7XG4gICAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfcmVzdWx0cy5lbXB0eSgpO1xuICAgICAgY2IoIHRydWUgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvcHJvY2Vzc0RhdGFGaWxlcy9cbiAgLy8gLS0tLS0tLS0tLSBFTkQgRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uTWV0YUZpbGVDaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIHZhclxuICAgIHNlbGYgPSAkKHRoaXMpLFxuICAgIGRhdGEgPSB7XG4gICAgICBmaWxlcyAgIDogc2VsZlswXS5maWxlcyxcbiAgICB9O1xuICAgIHJldHVybiBwcm9jZXNzTWV0YUZpbGUoIGRhdGEsIG9uTWV0YWRhdGFQcm9jZXNzZWQgKTtcbiAgfTtcblxuICBvbk1ldGFkYXRhUHJvY2Vzc2VkID0gZnVuY3Rpb24oIGVyciwgc2Vzc2lvbiwgZm5hbWUgKXtcbiAgICBpZiggZXJyICkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB1dGlsLmRpc3BsYXlBc1RhYmxlKGZuYW1lLFxuICAgICAgc2Vzc2lvbixcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfcmVzdWx0cyxcbiAgICAgIGZ1bmN0aW9uKCBlcnIgKXtcbiAgICAgICAgaWYoIGVyciApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIHRvZ2dsZUlucHV0KCAnZGF0YScsIHRydWUgKTtcbiAgICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIG9uRGF0YUZpbGVzQ2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgZGF0YSA9IHtcbiAgICAgIGZpbGVzICAgICAgIDogc2VsZlswXS5maWxlcyxcbiAgICAgIHNwZWNpZXMgICAgIDoganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX3NwZWNpZXNfc2VsZWN0LnZhbCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpIHx8IG51bGwsXG4gICAgICBzb3VyY2VfbmFtZSA6IGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9zb3VyY2VfbmFtZV9zZWxlY3QudmFsKCkudHJpbSgpLnRvTG93ZXJDYXNlKCksXG4gICAgICB0YXJnZXRfbmFtZSA6IGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV90YXJnZXRfbmFtZV9zZWxlY3QudmFsKCkudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICB9O1xuICAgIHJldHVybiBwcm9jZXNzRGF0YUZpbGVzKCBkYXRhLCBvbkRhdGFQcm9jZXNzZWQgKTtcbiAgfTtcblxuICBvbkRhdGFQcm9jZXNzZWQgPSBmdW5jdGlvbiggZXJyLCBzZXNzaW9uICl7XG4gICAgaWYoIGVyciApeyByZXR1cm4gZmFsc2U7IH1cbiAgICB1dGlsLmRpc3BsYXlBc1ByaW50KCdSZXN1bHRzJyxcbiAgICAgc2Vzc2lvbixcbiAgICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX3Jlc3VsdHMsXG4gICAgIGZ1bmN0aW9uKCBlcnIgKSB7XG4gICAgICAgIGlmICggZXJyICkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgdG9nZ2xlSW5wdXQoICdtZXRhZGF0YScsIGZhbHNlICk7XG4gICAgICAgIHRvZ2dsZUlucHV0KCAnZGF0YScsIGZhbHNlICk7XG5cbiAgICAgICAgLy9NYWtlIHRoZSBkYXRhIGF2YWlsYWJsZVxuICAgICAgICAkLmdldmVudC5wdWJsaXNoKFxuICAgICAgICAgICdlbS1tdW5nZS1kYXRhJyxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRhZGF0YV9zZXNzaW9uIDogc3RhdGVNYXAubWV0YWRhdGFfc2Vzc2lvbixcbiAgICAgICAgICAgIGRhdGFfc2Vzc2lvbiAgICAgOiBzdGF0ZU1hcC5kYXRhX3Nlc3Npb25cbiAgICAgICAgICB9XG4gICAgICAgICApO1xuICAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLy8gLS0tLS0tLS0tLSBFTkQgRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEJlZ2luIHB1YmxpYyBtZXRob2QgL3RvZ2dsZUlucHV0L1xuICAvKiBUb2dnbGUgdGhlIGlucHV0IGF2YWlsYmlsaXR5IGZvciBhIG1hdGNoZWQgZWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0gbGFiZWwgdGhlIHN0YXRlTWFwIGtleSB0byBzZXRcbiAgICogQHBhcmFtIGRvX2VuYWJsZSBib29sZWFuIHRydWUgaWYgZW5hYmxlLCBmYWxzZSB0byBkaXNhYmxlXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgdG9nZ2xlSW5wdXQgPSBmdW5jdGlvbiggbGFiZWwsIGRvX2VuYWJsZSApIHtcblxuICAgIGlmICggbGFiZWwgPT09ICdkYXRhJyApIHtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9maWVsZHNldC5hdHRyKCAnZGlzYWJsZWQnLCAhZG9fZW5hYmxlICk7XG4gICAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfc3BlY2llc19zZWxlY3Quc2VsZWN0cGlja2VyKCdyZWZyZXNoJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfZmllbGRzZXQuYXR0ciggJ2Rpc2FibGVkJywgIWRvX2VuYWJsZSApO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvdG9nZ2xlSW5wdXQvXG5cbiAgLy8gQmVnaW4gcHVibGljIG1ldGhvZCAvcmVzZXQvXG4gIC8qIFJldHVybiB0byB0aGUgZ3JvdW5kIHN0YXRlXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgcmVzZXQgPSBmdW5jdGlvbiggKSB7XG4gICAgLy8gTXVzdCBkbyB0aGlzIG1hbnVhbGx5XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9maWxlX2lucHV0LnZhbChcIlwiKTtcbiAgICBqcXVlcnlNYXAuJG11bmdlX21ldGFkYXRhX2hlbHAudGV4dChjb25maWdNYXAuZGVmYXVsdF9tZXRhZGF0YV9oZWxwKTtcbiAgICBqcXVlcnlNYXAuJG11bmdlX21ldGFkYXRhX3Jlc3VsdHMuZW1wdHkoKTtcbiAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfc3BlY2llc19zZWxlY3QudmFsKFwiXCIpO1xuICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9maWxlLnZhbChcIlwiKTtcbiAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfaGVscC50ZXh0KGNvbmZpZ01hcC5kZWZhdWx0X2RhdGFfaGVscCk7XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX3Jlc3VsdHMuZW1wdHkoKTtcblxuICAgIC8vIG11c3QgY2xlYXIgb3V0IHN0YXRlTWFwIHJlZmVyZW5jZXNcbiAgICBzdGF0ZU1hcC5tZXRhZGF0YV9zZXNzaW9uID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5tZXRhZGF0YV9maWxlICAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5kYXRhX3Nlc3Npb24gICAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5kYXRhX2ZpbGVzICAgICAgID0gbnVsbDtcblxuICAgIC8vIHJlc2V0IGlucHV0XG4gICAgdG9nZ2xlSW5wdXQoICdtZXRhZGF0YScsIHRydWUgKTtcbiAgICB0b2dnbGVJbnB1dCggJ2RhdGEnLCBmYWxzZSApO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvcmVzZXQvXG5cblxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC9jb25maWdNb2R1bGUvXG4gIC8qIFRoZSBpbnRlcm5hbCBjb25maWd1cmF0aW9uIGRhdGEgc3RydWN0dXJlIChjb25maWdNYXApIGlzXG4gICAqIHVwZGF0ZWQgd2l0aCBwcm92aWRlZCBhcmd1bWVudHMuIE5vIG90aGVyIGFjdGlvbnMgYXJlIHRha2VuLlxuICAgKlxuICAgKiBAcmV0dXJuIHRydWUgaWYgdXBkYXRlZCBzdWNjZXNzZnVsbHlcbiAgICovXG4gIGNvbmZpZ01vZHVsZSA9IGZ1bmN0aW9uICggaW5wdXRfbWFwICkge1xuICAgIHV0aWwuc2V0Q29uZmlnTWFwKHtcbiAgICAgIGlucHV0X21hcCAgICA6IGlucHV0X21hcCxcbiAgICAgIHNldHRhYmxlX21hcCA6IGNvbmZpZ01hcC5zZXR0YWJsZV9tYXAsXG4gICAgICBjb25maWdfbWFwICAgOiBjb25maWdNYXBcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLy8gRW5kIHB1YmxpYyBtZXRob2QgL2NvbmZpZ01vZHVsZS9cblxuICAvKiBpbml0TW9kdWxlXG4gICAqIEBwYXJhbSBvY3B1IChPYmplY3QpIG9jcHUgc2luZ2xldG9uXG4gICAqIEBwYXJhbSAkY29udGFpbmVyIChPYmplY3QpIGpRdWVyeSBwYXJlbnRcbiAgICovXG4gIGluaXRNb2R1bGUgPSBmdW5jdGlvbiggJGNvbnRhaW5lciApe1xuICAgIGlmKCAhJGNvbnRhaW5lciApe1xuICAgICAgY29uc29sZS5lcnJvciggJ01pc3NpbmcgY29udGFpbmVyJyApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgICRjb250YWluZXIuaHRtbCggY29uZmlnTWFwLnRlbXBsYXRlICk7XG4gICAgc2V0SlF1ZXJ5TWFwKCAkY29udGFpbmVyICk7XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9oZWxwLnRleHQoIGNvbmZpZ01hcC5kZWZhdWx0X21ldGFkYXRhX2hlbHAgKTtcbiAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfaGVscC50ZXh0KCBjb25maWdNYXAuZGVmYXVsdF9kYXRhX2hlbHAgKTtcbiAgICAvLyBiaW5kIGZpbGUgY2hhbmdlIEhBTkRMRVJTXG4gICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9maWxlX2lucHV0LmNoYW5nZSggb25NZXRhRmlsZUNoYW5nZSApO1xuICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9maWxlLmNoYW5nZSggb25EYXRhRmlsZXNDaGFuZ2UgKTtcbiAgICB0b2dnbGVJbnB1dCggJ21ldGFkYXRhJywgdHJ1ZSApO1xuICAgIHRvZ2dsZUlucHV0KCAnZGF0YScsIGZhbHNlICk7XG5cbiAgICBqcXVlcnlNYXAuJG11bmdlX2NsZWFyLmNsaWNrKCByZXNldCApO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0TW9kdWxlICAgICAgOiBpbml0TW9kdWxlLFxuICAgIGNvbmZpZ01vZHVsZSAgICA6IGNvbmZpZ01vZHVsZSxcbiAgICByZXNldCAgICAgICAgICAgOiByZXNldFxuICB9O1xuXG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG11bmdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG52YXIgb2NwdSA9IHJlcXVpcmUoJy4uL2xpYi9vcGVuY3B1LmpzL29wZW5jcHUtMC41LW5wbS5qcycpO1xuXG52YXIgcHJvY2Vzc19yc2VxID0gKGZ1bmN0aW9uKCl7XG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB2YXJcbiAgY29uZmlnTWFwID0ge1xuICAgIGFuY2hvcl9zY2hlbWFfbWFwIDoge1xuICAgIH0sXG4gICAgdGVtcGxhdGUgOiBTdHJpbmcoKSArXG4gICAgICAnPGRpdiBjbGFzcz1cImVtLXByb2Nlc3NfcnNlcVwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAgICc8aDIgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTEwIGVtLXNlY3Rpb24tdGl0bGVcIj5STkEgU2VxdWVuY2luZyBBbmFseXNpcyA8c21hbGw+PC9zbWFsbD48L2gyPicgK1xuICAgICAgICAgICc8aDQgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTJcIj48YSBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1ibG9jayBlbS1wcm9jZXNzX3JzZXEtY2xlYXIgY2xlYXItYnRuIGFqYXgtc2Vuc2l0aXZlIGNvbC14cy0zIGNvbC1tZC0zXCI+UmVzZXQ8L2E+PC9oND4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGhyLz4nICtcbiAgICAgICAgJzxmb3JtIGNsYXNzPVwiZm9ybS1ob3Jpem9udGFsIGVtLXByb2Nlc3NfcnNlcS1jbGFzc1wiPicgK1xuICAgICAgICAgICc8ZmllbGRzZXQ+JyArXG4gICAgICAgICAgICAnPGxlZ2VuZD5EaWZmZXJlbnRpYWwgRXhwcmVzc2lvbiBUZXN0aW5nPC9sZWdlbmQ+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJlbS1wcm9jZXNzX3JzZXEtY2xhc3MtdGVzdFwiIGNsYXNzPVwiY29sLXNtLTIgY29udHJvbC1sYWJlbFwiPlRlc3QgQ2xhc3M8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS0xMFwiPicgK1xuICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZW0tcHJvY2Vzc19yc2VxLWNsYXNzLXRlc3RcIiBwbGFjZWhvbGRlcj1cIlRlc3RcIj4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAgICc8bGFiZWwgZm9yPVwiZW0tcHJvY2Vzc19yc2VxLWNsYXNzLWJhc2VsaW5lXCIgY2xhc3M9XCJjb2wtc20tMiBjb250cm9sLWxhYmVsXCI+QmFzZWxpbmU8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS0xMFwiPicgK1xuICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZW0tcHJvY2Vzc19yc2VxLWNsYXNzLWJhc2VsaW5lXCIgcGxhY2Vob2xkZXI9XCJCYXNlbGluZVwiPicgK1xuICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtc20tb2Zmc2V0LTIgY29sLXNtLTEwXCI+JyArXG4gICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9jayBlbS1wcm9jZXNzX3JzZXEtY2xhc3Mtc3VibWl0XCI+U3VibWl0PC9idXR0b24+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8cD48c21hbGwgY2xhc3M9XCJjb2wtc20tb2Zmc2V0LTIgaGVscC1ibG9ja1wiPjwvc21hbGw+PC9wPicgK1xuICAgICAgICAgICc8L2ZpZWxkc2V0PicgK1xuICAgICAgICAnPC9mb3JtPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzXCI+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLXNtLW9mZnNldC0yIGNvbC1zbS0xMFwiPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInByb2dyZXNzIGVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzLXByb2dyZXNzXCI+JyArXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLWRhbmdlclwiIHN0eWxlPVwid2lkdGg6IDUwJTtcIj4nICtcbiAgICAgICAgICAgICAgICAgICc8c3Bhbj5GaWx0ZXJpbmc8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1wcmltYXJ5XCIgc3R5bGU9XCJ3aWR0aDogMjUlO1wiPicgK1xuICAgICAgICAgICAgICAgICAgJzxzcGFuPk5vcm1hbGl6aW5nPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItc3VjY2Vzc1wiIHN0eWxlPVwid2lkdGg6IDI1JTtcIj4nICtcbiAgICAgICAgICAgICAgICAgICc8c3Bhbj5UZXN0aW5nPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzLWRldGVzdFwiPjwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMtZGVwbG90IHJwbG90XCI+PC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICc8L2Rpdj4nLFxuXG4gICAgc2V0dGFibGVfbWFwIDoge31cbiAgfSxcbiAgc3RhdGVNYXAgPSB7XG4gICAgbWV0YWRhdGFfc2Vzc2lvbiAgICAgICAgOiBudWxsLFxuICAgIGRhdGFfc2Vzc2lvbiAgICAgICAgICAgIDogbnVsbCxcbiAgICBmaWx0ZXJfcnNlcV9zZXNzaW9uICAgICA6IG51bGwsXG4gICAgbm9ybWFsaXplX3JzZXFfc2Vzc2lvbiAgOiBudWxsLFxuICAgIGRlX3Rlc3RfcnNlcV9zZXNzaW9uICAgIDogbnVsbCxcbiAgICBjbGFzc2VzICAgICAgICAgICAgICAgICA6IFtdLFxuICAgIHRlc3RfY2xhc3MgICAgICAgICAgICAgIDogbnVsbCxcbiAgICBiYXNlbGluZV9jbGFzcyAgICAgICAgICA6IG51bGxcbiAgfSxcbiAganF1ZXJ5TWFwID0ge30sXG4gIHJlc2V0LFxuICBzZXRKUXVlcnlNYXAsXG4gIGNvbmZpZ01vZHVsZSxcbiAgb25TdWJtaXRDbGFzcyxcbiAgcHJvY2Vzc1JOQVNlcSxcbiAgb25STkFTZXFQcm9jZXNzZWQsXG4gIHRvZ2dsZUlucHV0LFxuICBpbml0TW9kdWxlO1xuICAvLyAtLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIC0tLS0tLS0tLS0gQmVnaW4gVVRJTElUWSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tIEVuZCBVVElMSVRZIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9zZXRKUXVlcnlNYXAvXG4gIHNldEpRdWVyeU1hcCA9IGZ1bmN0aW9uKCAkY29udGFpbmVyICl7XG4gICAganF1ZXJ5TWFwID0ge1xuICAgICAgJGNvbnRhaW5lciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGVhciAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1jbGVhcicpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc190ZXN0X2lucHV0ICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1jbGFzcyAjZW0tcHJvY2Vzc19yc2VxLWNsYXNzLXRlc3QnKSxcbiAgICAgICRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfYmFzZWxpbmVfaW5wdXQgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tcHJvY2Vzc19yc2VxIC5lbS1wcm9jZXNzX3JzZXEtY2xhc3MgI2VtLXByb2Nlc3NfcnNlcS1jbGFzcy1iYXNlbGluZScpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19mb3JtICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1jbGFzcycpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19zdWJtaXQgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1jbGFzcyAuZW0tcHJvY2Vzc19yc2VxLWNsYXNzLXN1Ym1pdCcpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19oZWxwICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmhlbHAtYmxvY2snKSxcbiAgICAgICRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19kZXRlc3QgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tcHJvY2Vzc19yc2VxIC5lbS1wcm9jZXNzX3JzZXEtcmVzdWx0cyAuZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMtZGV0ZXN0JyksXG4gICAgICAkZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfZGVwbG90ICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXByb2Nlc3NfcnNlcSAuZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMgLmVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzLWRlcGxvdCcpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX3Byb2dyZXNzICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzIC5lbS1wcm9jZXNzX3JzZXEtcmVzdWx0cy1wcm9ncmVzcycpXG4gICAgfTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cblxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9wcm9jZXNzUk5BU2VxL1xuICBwcm9jZXNzUk5BU2VxID0gZnVuY3Rpb24oIGJhc2VsaW5lLCB0ZXN0LCBjYiApe1xuXG4gICAgdmFyXG4gICAganF4aHJfZmlsdGVyLFxuICAgIGpxeGhyX25vcm1hbGl6ZSxcbiAgICBqcXhocl90ZXN0LFxuICAgIG9uZmFpbCxcbiAgICBvbkRvbmU7XG5cbiAgICBvbkRvbmUgPSBmdW5jdGlvbiggbiApe1xuICAgICAgdmFyICRiYXIgPSBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX3Byb2dyZXNzLmZpbmQoICcucHJvZ3Jlc3MtYmFyOm50aC1jaGlsZCgnICsgbiArICcpJyApO1xuICAgICAgICAkYmFyLnRvZ2dsZSggdHJ1ZSApO1xuICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfaGVscC50ZXh0KCcnKTtcbiAgICB9O1xuXG4gICAgb25mYWlsID0gZnVuY3Rpb24oIGpxWEhSICl7XG4gICAgICB2YXIgZXJyVGV4dCA9IFwiU2VydmVyIGVycm9yOiBcIiArIGpxWEhSLnJlc3BvbnNlVGV4dDtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyVGV4dCk7XG4gICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19oZWxwLnRleHQoZXJyVGV4dCk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgIH07XG5cbiAgICAvLyBmaWx0ZXJcbiAgICBqcXhocl9maWx0ZXIgPSBvY3B1LmNhbGwoJ2ZpbHRlcl9yc2VxJywge1xuICAgICAgc2UgICAgICAgICAgOiBzdGF0ZU1hcC5kYXRhX3Nlc3Npb24sXG4gICAgICBiYXNlbGluZSAgICA6IGJhc2VsaW5lLFxuICAgICAgdGVzdCAgICAgICAgOiB0ZXN0LFxuICAgICAgbWluX2NvdW50cyAgOiAxXG4gICAgfSwgZnVuY3Rpb24oIHNlc3Npb24gKXsgc3RhdGVNYXAuZmlsdGVyX3JzZXFfc2Vzc2lvbiA9IHNlc3Npb247IH0pXG4gICAgLmRvbmUoZnVuY3Rpb24oKXsgb25Eb25lKCAxICk7IH0pXG4gICAgLmZhaWwoIG9uZmFpbCApO1xuXG4gICAganF4aHJfbm9ybWFsaXplID0ganF4aHJfZmlsdGVyLnRoZW4oIGZ1bmN0aW9uKCApe1xuICAgICAgcmV0dXJuIG9jcHUuY2FsbCgnbm9ybWFsaXplX3JzZXEnLCB7XG4gICAgICAgIGZpbHRlcmVkX2RnZSAgOiBzdGF0ZU1hcC5maWx0ZXJfcnNlcV9zZXNzaW9uXG4gICAgICB9LCBmdW5jdGlvbiggc2Vzc2lvbiApeyBzdGF0ZU1hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uID0gc2Vzc2lvbjsgfSk7XG4gICAgfSlcbiAgICAuZG9uZSggZnVuY3Rpb24oKXsgb25Eb25lKCAyICk7IH0gKVxuICAgIC5mYWlsKCBvbmZhaWwgKTtcblxuICAgIGpxeGhyX3Rlc3QgPSBqcXhocl9ub3JtYWxpemUudGhlbiggZnVuY3Rpb24oICl7XG4gICAgICByZXR1cm4gb2NwdS5jYWxsKCdkZV90ZXN0X3JzZXEnLCB7XG4gICAgICAgIG5vcm1hbGl6ZWRfZGdlICA6IHN0YXRlTWFwLm5vcm1hbGl6ZV9yc2VxX3Nlc3Npb24sXG4gICAgICAgIGJhc2VsaW5lICAgICAgICA6IGJhc2VsaW5lLFxuICAgICAgICB0ZXN0ICAgICAgICAgICAgOiB0ZXN0XG4gICAgICB9LCBmdW5jdGlvbiggc2Vzc2lvbiApeyBzdGF0ZU1hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvbiA9IHNlc3Npb247IH0pO1xuICAgIH0pXG4gICAgLmRvbmUoIGZ1bmN0aW9uKCl7XG4gICAgICBvbkRvbmUoIDMgKTtcbiAgICAgIHRvZ2dsZUlucHV0KCAnY2xhc3MnLCBmYWxzZSApO1xuICAgICAgY2IoIG51bGwsIHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uICk7XG4gICAgfSlcbiAgICAuZmFpbCggb25mYWlsICk7XG4gICAgLy8gdGVzdFxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBET00gbWV0aG9kIC9wcm9jZXNzUk5BU2VxL1xuICAvLyAtLS0tLS0tLS0tIEJFR0lOIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25TdWJtaXRDbGFzcyA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX2hlbHAudGV4dChcIlwiKTtcblxuICAgIHZhclxuICAgICAgcHJvcG9zZWRfdGVzdF9jbGFzcyA9IGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX3Rlc3RfaW5wdXQudmFsKCksXG4gICAgICBwcm9wb3NlZF9iYXNlbGluZV9jbGFzcyA9IGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX2Jhc2VsaW5lX2lucHV0LnZhbCgpLFxuICAgICAgaXNPSyA9ICggc3RhdGVNYXAuY2xhc3Nlcy5pbmRleE9mKHByb3Bvc2VkX3Rlc3RfY2xhc3MpID4gLTEgJiZcbiAgICAgICBzdGF0ZU1hcC5jbGFzc2VzLmluZGV4T2YocHJvcG9zZWRfYmFzZWxpbmVfY2xhc3MpID4gLTEgKTtcblxuICAgICAgaWYoICFpc09LICkge1xuICAgICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19oZWxwXG4gICAgICAgICAgLnRleHQoWydJbnZhbGlkIGNsYXNzIGRlY2xhcmF0aW9uczogJyxcbiAgICAgICAgICAgICAgICBwcm9wb3NlZF90ZXN0X2NsYXNzLFxuICAgICAgICAgICAgICAgIHByb3Bvc2VkX2Jhc2VsaW5lX2NsYXNzXS5qb2luKCcgJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfcHJvZ3Jlc3NcbiAgICAgICAgLnRvZ2dsZSggdHJ1ZSApO1xuXG4gICAgICByZXR1cm4gcHJvY2Vzc1JOQVNlcSggcHJvcG9zZWRfYmFzZWxpbmVfY2xhc3MsXG4gICAgICAgIHByb3Bvc2VkX3Rlc3RfY2xhc3MsXG4gICAgICAgIG9uUk5BU2VxUHJvY2Vzc2VkICk7XG4gIH07XG5cblxuXG4gIG9uUk5BU2VxUHJvY2Vzc2VkID0gZnVuY3Rpb24oIGVyciwgZGVfdGVzdF9yc2VxX3Nlc3Npb24gKXtcbiAgICBpZiggZXJyICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIHZhclxuICAgIG5hbWUgPSAncGxvdF9kZScsXG4gICAgYXJncyA9IHtcbiAgICAgICAgZmlsdGVyZWRfZGdlICA6IHN0YXRlTWFwLmZpbHRlcl9yc2VxX3Nlc3Npb24sXG4gICAgICAgIGRlX3Rlc3RlZF90dCAgOiBzdGF0ZU1hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvbixcbiAgICAgICAgYmFzZWxpbmUgICAgICA6IHN0YXRlTWFwLmJhc2VsaW5lX2NsYXNzLFxuICAgICAgICB0ZXN0ICAgICAgICAgIDogc3RhdGVNYXAudGVzdF9jbGFzcyxcbiAgICAgICAgdGhyZXNob2xkICAgICA6IDAuMDVcbiAgICAgIH07XG5cbiAgICB1dGlsLmRpc3BsYXlBc1ByaW50KCAnREUgVGVzdGluZyBSZXN1bHRzJyxcbiAgICAgIGRlX3Rlc3RfcnNlcV9zZXNzaW9uLFxuICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19kZXRlc3QsXG4gICAgICBmdW5jdGlvbiggZXJyICl7XG4gICAgICAgIGlmKCBlcnIgKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgICAgIC8vTWFrZSB0aGUgZGF0YSBhdmFpbGFibGVcbiAgICAgICAgdXRpbC5ncmFwaGljUiggJ0RFIEdlbmVzJyxcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19kZXBsb3QsXG4gICAgICAgICAgZnVuY3Rpb24oIGVyciApe1xuICAgICAgICAgICAgaWYoIGVyciApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgICAgIC8vTWFrZSB0aGUgZGF0YSBhdmFpbGFibGVcbiAgICAgICAgICAgICQuZ2V2ZW50LnB1Ymxpc2goXG4gICAgICAgICAgICAgICdlbS1wcm9jZXNzX3JzZXEnLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmlsdGVyX3JzZXFfc2Vzc2lvbiAgICAgOiBzdGF0ZU1hcC5maWx0ZXJfcnNlcV9zZXNzaW9uLFxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZV9yc2VxX3Nlc3Npb24gIDogc3RhdGVNYXAubm9ybWFsaXplX3JzZXFfc2Vzc2lvbixcbiAgICAgICAgICAgICAgICBkZV90ZXN0X3JzZXFfc2Vzc2lvbiAgICA6IHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyAtLS0tLS0tLS0tIEVORCBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQmVnaW4gcHVibGljIG1ldGhvZCAvdG9nZ2xlSW5wdXQvXG4gIC8qIFRvZ2dsZSB0aGUgaW5wdXQgYXZhaWxiaWxpdHkgZm9yIGEgbWF0Y2hlZCBlbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSBsYWJlbCB0aGUgc3RhdGVNYXAga2V5IHRvIHNldFxuICAgKiBAcGFyYW0gZG9fZW5hYmxlIGJvb2xlYW4gdHJ1ZSBpZiBlbmFibGUsIGZhbHNlIHRvIGRpc2FibGVcbiAgICpcbiAgICogQHJldHVybiBib29sZWFuXG4gICAqL1xuICB0b2dnbGVJbnB1dCA9IGZ1bmN0aW9uKCBsYWJlbCwgZG9fZW5hYmxlICkge1xuICAgIHZhciAkaGFuZGxlcyA9IGxhYmVsID09PSAnY2xhc3MnID9cbiAgICAgIFsganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfdGVzdF9pbnB1dCxcbiAgICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfYmFzZWxpbmVfaW5wdXQsXG4gICAgICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX3N1Ym1pdCBdIDpcbiAgICAgIFtdO1xuXG4gICAgJC5lYWNoKCAkaGFuZGxlcywgZnVuY3Rpb24oIGluZGV4LCB2YWx1ZSApe1xuICAgICAgdmFsdWUuYXR0cignZGlzYWJsZWQnLCAhZG9fZW5hYmxlICk7XG4gICAgICB2YWx1ZS5hdHRyKCdkaXNhYmxlZCcsICFkb19lbmFibGUgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvdG9nZ2xlSW5wdXQvXG5cbiAgLy8gQmVnaW4gcHVibGljIG1ldGhvZCAvcmVzZXQvXG4gIC8qIFJldHVybiB0byB0aGUgZ3JvdW5kIHN0YXRlXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgcmVzZXQgPSBmdW5jdGlvbiggKSB7XG5cbiAgICBzdGF0ZU1hcC5maWx0ZXJfcnNlcV9zZXNzaW9uICAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvbiAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC50ZXN0X2NsYXNzICAgICAgICAgICAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5iYXNlbGluZV9jbGFzcyAgICAgICAgID0gbnVsbDtcblxuICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfcHJvZ3Jlc3MuZmluZCggJy5wcm9ncmVzcy1iYXInICkudG9nZ2xlKCBmYWxzZSApO1xuICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfcHJvZ3Jlc3MudG9nZ2xlKCBmYWxzZSApO1xuXG4gICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19kZXRlc3QuZW1wdHkoKTtcbiAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX2RlcGxvdC5lbXB0eSgpO1xuXG4gICAgdG9nZ2xlSW5wdXQoICdjbGFzcycsIHRydWUgKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvcmVzZXQvXG5cblxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC9jb25maWdNb2R1bGUvXG4gIC8vIEV4YW1wbGUgICA6IHNwYS5jaGF0LmNvbmZpZ01vZHVsZSh7IHNsaWRlcl9vcGVuX2VtIDogMTggfSk7XG4gIC8vIFB1cnBvc2UgICA6IENvbmZpZ3VyZSB0aGUgbW9kdWxlIHByaW9yIHRvIGluaXRpYWxpemF0aW9uXG4gIC8vIEFyZ3VtZW50cyA6XG4gIC8vICAgKiBzZXRfY2hhdF9hbmNob3IgLSBhIGNhbGxiYWNrIHRvIG1vZGlmeSB0aGUgVVJJIGFuY2hvciB0b1xuICAvLyAgICAgaW5kaWNhdGUgb3BlbmVkIG9yIGNsb3NlZCBzdGF0ZS4gVGhpcyBjYWxsYmFjayBtdXN0IHJldHVyblxuICAvLyAgICAgZmFsc2UgaWYgdGhlIHJlcXVlc3RlZCBzdGF0ZSBjYW5ub3QgYmUgbWV0XG4gIC8vICAgKiBjaGF0X21vZGVsIC0gdGhlIGNoYXQgbW9kZWwgb2JqZWN0IHByb3ZpZGVzIG1ldGhvZHNcbiAgLy8gICAgICAgdG8gaW50ZXJhY3Qgd2l0aCBvdXIgaW5zdGFudCBtZXNzYWdpbmdcbiAgLy8gICAqIHBlb3BsZV9tb2RlbCAtIHRoZSBwZW9wbGUgbW9kZWwgb2JqZWN0IHdoaWNoIHByb3ZpZGVzXG4gIC8vICAgICAgIG1ldGhvZHMgdG8gbWFuYWdlIHRoZSBsaXN0IG9mIHBlb3BsZSB0aGUgbW9kZWwgbWFpbnRhaW5zXG4gIC8vICAgKiBzbGlkZXJfKiBzZXR0aW5ncy4gQWxsIHRoZXNlIGFyZSBvcHRpb25hbCBzY2FsYXJzLlxuICAvLyAgICAgICBTZWUgbWFwQ29uZmlnLnNldHRhYmxlX21hcCBmb3IgYSBmdWxsIGxpc3RcbiAgLy8gICAgICAgRXhhbXBsZTogc2xpZGVyX29wZW5fZW0gaXMgdGhlIG9wZW4gaGVpZ2h0IGluIGVtJ3NcbiAgLy8gQWN0aW9uICAgIDpcbiAgLy8gICBUaGUgaW50ZXJuYWwgY29uZmlndXJhdGlvbiBkYXRhIHN0cnVjdHVyZSAoY29uZmlnTWFwKSBpc1xuICAvLyAgIHVwZGF0ZWQgd2l0aCBwcm92aWRlZCBhcmd1bWVudHMuIE5vIG90aGVyIGFjdGlvbnMgYXJlIHRha2VuLlxuICAvLyBSZXR1cm5zICAgOiB0cnVlXG4gIC8vIFRocm93cyAgICA6IEphdmFTY3JpcHQgZXJyb3Igb2JqZWN0IGFuZCBzdGFjayB0cmFjZSBvblxuICAvLyAgICAgICAgICAgICB1bmFjY2VwdGFibGUgb3IgbWlzc2luZyBhcmd1bWVudHNcbiAgLy9cbiAgY29uZmlnTW9kdWxlID0gZnVuY3Rpb24gKCBpbnB1dF9tYXAgKSB7XG4gICAgdXRpbC5zZXRDb25maWdNYXAoe1xuICAgICAgaW5wdXRfbWFwICAgIDogaW5wdXRfbWFwLFxuICAgICAgc2V0dGFibGVfbWFwIDogY29uZmlnTWFwLnNldHRhYmxlX21hcCxcbiAgICAgIGNvbmZpZ19tYXAgICA6IGNvbmZpZ01hcFxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvY29uZmlnTW9kdWxlL1xuXG4gIC8qIGluaXRNb2R1bGVcbiAgICogQHBhcmFtICRjb250YWluZXIgKE9iamVjdCkgalF1ZXJ5IHBhcmVudFxuICAgKiBAcGFyYW0gbXNnX21hcCBPYmplY3QgdGhlIHBhcmVudCBzZXNzaW9uXG4gICAqL1xuICBpbml0TW9kdWxlID0gZnVuY3Rpb24oICRjb250YWluZXIsIG1zZ19tYXAgKXtcbiAgICBpZiggISRjb250YWluZXIgKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgY29udGFpbmVyJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmKCAkLmlzRW1wdHlPYmplY3QoIG1zZ19tYXAgKSB8fFxuICAgICAgICFtc2dfbWFwLmhhc093blByb3BlcnR5KCAnbWV0YWRhdGFfc2Vzc2lvbicgKSB8fFxuICAgICAgICFtc2dfbWFwLmhhc093blByb3BlcnR5KCAnZGF0YV9zZXNzaW9uJyApKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgbXNnX21hcCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAkY29udGFpbmVyLmh0bWwoIGNvbmZpZ01hcC50ZW1wbGF0ZSApO1xuXG4gICAgc2V0SlF1ZXJ5TWFwKCAkY29udGFpbmVyICk7XG4gICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19wcm9ncmVzcy5maW5kKCAnLnByb2dyZXNzLWJhcicgKS50b2dnbGUoIGZhbHNlICk7XG4gICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19wcm9ncmVzcy50b2dnbGUoIGZhbHNlICk7XG5cbiAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGVhci5jbGljayggcmVzZXQgKTtcblxuICAgIHN0YXRlTWFwLm1ldGFkYXRhX3Nlc3Npb24gPSBtc2dfbWFwLm1ldGFkYXRhX3Nlc3Npb247XG4gICAgc3RhdGVNYXAuZGF0YV9zZXNzaW9uID0gbXNnX21hcC5kYXRhX3Nlc3Npb247XG5cbiAgICAvLyBwb3B1bGF0ZSB0aGUgY29tcGFyaXNvbnMgYnkgZGVmYXVsdFxuICAgIHN0YXRlTWFwLm1ldGFkYXRhX3Nlc3Npb24uZ2V0T2JqZWN0KGZ1bmN0aW9uKCBkYXRhICl7XG4gICAgICBpZiggIWRhdGEubGVuZ3RoICl7IHJldHVybjsgfVxuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhWzBdKTtcbiAgICAgIHZhciBjbGFzc2VzID0gZGF0YS5tYXAoZnVuY3Rpb24oIHZhbCApeyByZXR1cm4gdmFsW2tleXNbMV1dOyB9KTtcblxuICAgICAgLy8gU2V0IHRoZSBjbGFzc2VzIGludGhlIHN0YXRlTWFwXG4gICAgICB2YXIgdW5pcXVlID0gdXRpbC51bmlxdWUoIGNsYXNzZXMgKTtcbiAgICAgIGlmKCB1bmlxdWUubGVuZ3RoICE9PSAyICl7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoICdUaGVyZSBhcmUgbm90IGV4YWN0bHkgMiBjbGFzc2VzJyApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHN0YXRlTWFwLmNsYXNzZXMgPSB1bmlxdWU7XG4gICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc190ZXN0X2lucHV0XG4gICAgICAgIC5hdHRyKCAncGxhY2Vob2xkZXInLCBzdGF0ZU1hcC5jbGFzc2VzWzBdIClcbiAgICAgICAgLnZhbCggc3RhdGVNYXAuY2xhc3Nlc1swXSApO1xuICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfYmFzZWxpbmVfaW5wdXRcbiAgICAgICAgLmF0dHIoICdwbGFjZWhvbGRlcicsIHN0YXRlTWFwLmNsYXNzZXNbMV0gKVxuICAgICAgICAudmFsKCBzdGF0ZU1hcC5jbGFzc2VzWzFdICk7XG4gICAgfSk7XG5cbiAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19mb3JtLnN1Ym1pdCggb25TdWJtaXRDbGFzcyApO1xuICB9O1xuICAvLyAtLS0tLS0tLS0tIEVORCBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJldHVybiB7XG4gICAgaW5pdE1vZHVsZSAgICAgIDogaW5pdE1vZHVsZSxcbiAgICBjb25maWdNb2R1bGUgICAgOiBjb25maWdNb2R1bGUsXG4gICAgcmVzZXQgICAgICAgICAgIDogcmVzZXRcbiAgfTtcblxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwcm9jZXNzX3JzZXE7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcbnZhciBtdW5nZSA9IHJlcXVpcmUoJy4vbXVuZ2UuanMnKTtcbnZhciBwcm9jZXNzX3JzZXEgPSByZXF1aXJlKCcuL3Byb2Nlc3NfcnNlcS5qcycpO1xudmFyIGVtZGF0YSA9IHJlcXVpcmUoJy4vZW1kYXRhLmpzJyk7XG52YXIgb2NwdSA9IHJlcXVpcmUoJy4uL2xpYi9vcGVuY3B1LmpzL29wZW5jcHUtMC41LW5wbS5qcycpO1xuXG4vL2luaXQgdGhpcyBzY3JpcHQgd2hlbiB0aGUgcGFnZSBoYXMgbG9hZGVkXG52YXIgc2hlbGwgPSAoZnVuY3Rpb24oKXtcblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdmFyXG4gIGNvbmZpZ01hcCA9IHtcbiAgICBhbmNob3Jfc2NoZW1hX21hcCA6IHtcbiAgICAgIG1ldGFkYXRhICA6IHsgZW5hYmxlZDogdHJ1ZSwgZGlzYWJsZWQ6IHRydWUgfSxcbiAgICAgIGRhdGEgICAgICA6IHsgZW5hYmxlZDogdHJ1ZSwgZGlzYWJsZWQ6IHRydWUgfVxuICAgIH0sXG4gICAgdGVtcGxhdGUgOiBTdHJpbmcoKSArXG4gICAgICAnPGRpdiBjbGFzcz1cImNvbnRhaW5lciBlbS1zaGVsbFwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImVtLXNoZWxsLW11bmdlXCI+PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tc2hlbGwtcHJvY2Vzc19yc2VxXCI+PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tc2hlbGwtZW1kYXRhXCI+PC9kaXY+JyArXG4gICAgICAnPC9kaXY+J1xuICB9LFxuICAvLyBzdGF0ZU1hcCA9IHt9LFxuICBqcXVlcnlNYXAgPSB7fSxcbiAgc2V0SlF1ZXJ5TWFwLFxuICBjbGVhcklucHV0LFxuICBpbml0TW9kdWxlO1xuICAvLyAtLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gVVRJTElUWSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tIEVORCBVVElMSVRZIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9zZXRKUXVlcnlNYXAvXG4gIHNldEpRdWVyeU1hcCA9IGZ1bmN0aW9uKCAkY29udGFpbmVyICl7XG4gICAganF1ZXJ5TWFwID0ge1xuICAgICAgJGNvbnRhaW5lciAgICAgICAgICAgICAgICA6ICRjb250YWluZXIsXG4gICAgICAkc2hlbGwgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tc2hlbGwnKSxcbiAgICAgICRtdW5nZV9jb250YWluZXIgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1zaGVsbCAuZW0tc2hlbGwtbXVuZ2UnKSxcbiAgICAgICRwcm9jZXNzX3JzZXFfY29udGFpbmVyICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1zaGVsbCAuZW0tc2hlbGwtcHJvY2Vzc19yc2VxJyksXG4gICAgICAkZW1kYXRhX2NvbnRhaW5lciAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tc2hlbGwgLmVtLXNoZWxsLWVtZGF0YScpXG4gICAgfTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cblxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9jbGVhcklucHV0L1xuICAvKiBDbGVhcnMgdGhlIGlucHV0IGFuZCByZXNldHMgdGhlIHN0YXRlIHRvIGdyb3VuZCB6ZXJvXG4gICAqXG4gICAqIEByZXR1cm4gIGJvb2xlYW4gV2hldGhlciB0aGUgYW5jaG9yIHBvcnRpb24gY291bGQgYmUgdXBkYXRlZFxuICAgKi9cbiAgY2xlYXJJbnB1dCA9IGZ1bmN0aW9uKCApe1xuICAgIHJldHVybiBtdW5nZS5yZXNldCggKTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL2NsZWFySW5wdXQvXG4gIC8vIC0tLS0tLS0tLS0gRU5EIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tIEVORCBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gQ0FMTEJBQ0tTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEVORCBDQUxMQkFDS1MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qIGluaXRNb2R1bGVcbiAgICogQHBhcmFtIHBhdGggKFN0cmluZykgcGF0aFxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciAoT2JqZWN0KSBqUXVlcnkgcGFyZW50XG4gICAqL1xuICBpbml0TW9kdWxlID0gZnVuY3Rpb24ocGF0aCwgJGNvbnRhaW5lcil7XG4gICAgaWYoIW9jcHUpeyBhbGVydCgnc2VydmVyIGVycm9yJyk7IHJldHVybjsgfVxuICAgIGlmKHBhdGgpe1xuICAgICAgY29uc29sZS5pbmZvKCdzZXR0aW5nIHBhdGggJXMnLCBwYXRoKTtcbiAgICAgIG9jcHUuc2V0dXJsKHBhdGgpO1xuICAgIH1cbiAgICAkY29udGFpbmVyLmh0bWwoIGNvbmZpZ01hcC50ZW1wbGF0ZSApO1xuICAgIHNldEpRdWVyeU1hcCggJGNvbnRhaW5lciApO1xuXG4gICAgLy8gY29uZmlndXJlIGFuZCBpbml0aWFsaXplIGZlYXR1cmUgbW9kdWxlc1xuICAgICQuZ2V2ZW50LnN1YnNjcmliZShcbiAgICAgIGpxdWVyeU1hcC4kcHJvY2Vzc19yc2VxX2NvbnRhaW5lcixcbiAgICAgICdlbS1tdW5nZS1kYXRhJyxcbiAgICAgIGZ1bmN0aW9uICggZXZlbnQsIG1zZ19tYXAgKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZW0tbXVuZ2UtZGF0YScsIHV0aWwuc2VyaWFsaXplKG1zZ19tYXApICk7XG4gICAgICAgIHByb2Nlc3NfcnNlcS5jb25maWdNb2R1bGUoe30pO1xuICAgICAgICBwcm9jZXNzX3JzZXEuaW5pdE1vZHVsZSgganF1ZXJ5TWFwLiRwcm9jZXNzX3JzZXFfY29udGFpbmVyLCBtc2dfbWFwICApO1xuICAgICAgfVxuICAgICk7XG4gICAgLy8gJC5nZXZlbnQuc3Vic2NyaWJlKFxuICAgIC8vICAganF1ZXJ5TWFwLiRlbWRhdGFfY29udGFpbmVyLFxuICAgIC8vICAgJ2VtLXByb2Nlc3NfcnNlcScsXG4gICAgLy8gICBmdW5jdGlvbiAoIGV2ZW50LCBtc2dfbWFwICkge1xuICAgIC8vICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ2VtLXByb2Nlc3NfcnNlcScsIHV0aWwuc2VyaWFsaXplKG1zZ19tYXApICk7XG4gICAgLy8gICAgIGVtZGF0YS5jb25maWdNb2R1bGUoe30pO1xuICAgIC8vICAgICBlbWRhdGEuaW5pdE1vZHVsZSgganF1ZXJ5TWFwLiRlbWRhdGFfY29udGFpbmVyLCBtc2dfbWFwICApO1xuICAgIC8vICAgfVxuICAgIC8vICk7XG5cbiAgICAvLyBtdW5nZS5jb25maWdNb2R1bGUoe30pO1xuICAgIC8vIG11bmdlLmluaXRNb2R1bGUoIGpxdWVyeU1hcC4kbXVuZ2VfY29udGFpbmVyICk7XG4gICAgLy8gdmFyIG1zZ19tYXAgPSB1dGlsLmRlc2VyaWFsaXplU2Vzc2lvbkRhdGEoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCAnZW0tbXVuZ2UtZGF0YScgKSApO1xuICAgIC8vIHByb2Nlc3NfcnNlcS5jb25maWdNb2R1bGUoe30pO1xuICAgIC8vIHByb2Nlc3NfcnNlcS5pbml0TW9kdWxlKCBqcXVlcnlNYXAuJHByb2Nlc3NfcnNlcV9jb250YWluZXIsIG1zZ19tYXAgKTtcbiAgICB2YXIgbXNnX21hcCA9IHV0aWwuZGVzZXJpYWxpemVTZXNzaW9uRGF0YSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oICdlbS1wcm9jZXNzX3JzZXEnICkgKTtcbiAgICBlbWRhdGEuY29uZmlnTW9kdWxlKHt9KTtcbiAgICBlbWRhdGEuaW5pdE1vZHVsZSgganF1ZXJ5TWFwLiRlbWRhdGFfY29udGFpbmVyLCBtc2dfbWFwICApO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0TW9kdWxlICAgIDogaW5pdE1vZHVsZVxuICB9O1xuXG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNoZWxsO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG9jcHUgPSByZXF1aXJlKCcuLi9saWIvb3BlbmNwdS5qcy9vcGVuY3B1LTAuNS1ucG0uanMnKTtcblxuLy9TaG93IGFuZCBoaWRlIHRoZSBzcGlubmVyIGZvciBhbGwgYWpheCByZXF1ZXN0cy5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIG1ha2VFcnJvciwgc2V0Q29uZmlnTWFwLFxuICAgc2VyaWFsaXplLFxuICAgZGVzZXJpYWxpemVTZXNzaW9uRGF0YSxcbiAgIGRpc3BsYXlBc1ByaW50LFxuICAgZGlzcGxheUFzVGFibGUsXG4gICBncmFwaGljUixcbiAgIG1ha2VUZXh0RmlsZSxcbiAgIHVuaXF1ZTtcblxuICAvKiBCZWdpbiBQdWJsaWMgbWV0aG9kIC9zZXJpYWxpemUvXG4gICAqIEEgY29udmVuaWVuY2Ugd3JhcHBlciB0byBjcmVhdGUgYSBzZXJpYWxpemVkIHZlcnNpb24gb2YgZGF0YVxuICAgKlxuICAgKiBAcGFyYW0gb2JqZWN0IGEgc2VyaWFsaXplYWJsZSBvYmplY3RcbiAgICpcbiAgICogQHJldHVybiBzdHJpbmcgcmVwcmVzZW50YXRpb24gZGF0YVxuICAgKiBAdGhyb3dzIEphdmFTY3JpcHQgZXJyb3Igb2JqZWN0IGFuZCBzdGFjayB0cmFjZSBvbiB1bmFjY2VwdGFibGUgYXJndW1lbnRzXG4gICAqL1xuICBzZXJpYWxpemUgPSBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgdmFyIHNlcmlhbGl6ZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KCBkYXRhICk7XG4gICAgfSBjYXRjaCggZSApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlcmlhbGl6ZWQ7XG4gIH07XG4gIC8vIEVuZCBQdWJsaWMgbWV0aG9kIC9zZXJpYWxpemUvXG5cbiAgLyogQmVnaW4gUHVibGljIG1ldGhvZCAvZGVzZXJpYWxpemVTZXNzaW9uRGF0YS9cbiAgICogQSBjb252ZW5pZW5jZSB3cmFwcGVyIHRvIGNyZWF0ZSBhIFNlc3Npb25zIGZyb20gc2VyaWFsaXplZFxuICAgKiBkYXRhLiBFYWNoIG9iamVjdCB2YWx1ZSBtdXN0IGJlIGEgU2Vzc2lvblxuICAgKlxuICAgKiBAcGFyYW0gc3RyaW5nIGEgc2VyaWFsaXplZCByZXByZXNlbnRhdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIGFuIG9iamVjdCB3aXRoIFNlc3Npb24gdmFsdWVzIHJlc3RvcmVkXG4gICAqIEB0aHJvd3MgSmF2YVNjcmlwdCBlcnJvciBvYmplY3QgYW5kIHN0YWNrIHRyYWNlIG9uIHVuYWNjZXB0YWJsZSBhcmd1bWVudHNcbiAgICovXG4gIGRlc2VyaWFsaXplU2Vzc2lvbkRhdGEgPSBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgdmFyIGRlc2VyaWFsaXplZCA9IHt9O1xuICAgIHRyeSB7XG4gICAgICB2YXIgcmF3ID0gSlNPTi5wYXJzZSggZGF0YSApO1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoIHJhdyApXG4gICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbigga2V5ICkge1xuICAgICAgICAgICAgZGVzZXJpYWxpemVkWyBrZXkgXSA9IG5ldyBvY3B1LlNlc3Npb24oIHJhd1trZXldLmxvYywgcmF3W2tleV0ua2V5LCByYXdba2V5XS50eHQgKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2goIGUgKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICAgIHJldHVybiBkZXNlcmlhbGl6ZWQ7XG4gIH07XG4gIC8vIEVuZCBQdWJsaWMgbWV0aG9kIC9kZXNlcmlhbGl6ZVNlc3Npb25EYXRhL1xuXG4gIC8vIEJlZ2luIFB1YmxpYyBjb25zdHJ1Y3RvciAvbWFrZUVycm9yL1xuICAvLyBQdXJwb3NlOiBhIGNvbnZlbmllbmNlIHdyYXBwZXIgdG8gY3JlYXRlIGFuIGVycm9yIG9iamVjdFxuICAvLyBBcmd1bWVudHM6XG4gIC8vICAgKiBuYW1lX3RleHQgLSB0aGUgZXJyb3IgbmFtZVxuICAvLyAgICogbXNnX3RleHQgIC0gbG9uZyBlcnJvciBtZXNzYWdlXG4gIC8vICAgKiBkYXRhICAgICAgLSBvcHRpb25hbCBkYXRhIGF0dGFjaGVkIHRvIGVycm9yIG9iamVjdFxuICAvLyBSZXR1cm5zICA6IG5ld2x5IGNvbnN0cnVjdGVkIGVycm9yIG9iamVjdFxuICAvLyBUaHJvd3MgICA6IG5vbmVcbiAgLy9cbiAgbWFrZUVycm9yID0gZnVuY3Rpb24gKCBuYW1lX3RleHQsIG1zZ190ZXh0LCBkYXRhICkge1xuICAgIHZhciBlcnJvciAgICAgPSBuZXcgRXJyb3IoKTtcbiAgICBlcnJvci5uYW1lICAgID0gbmFtZV90ZXh0O1xuICAgIGVycm9yLm1lc3NhZ2UgPSBtc2dfdGV4dDtcblxuICAgIGlmICggZGF0YSApeyBlcnJvci5kYXRhID0gZGF0YTsgfVxuXG4gICAgcmV0dXJuIGVycm9yO1xuICB9O1xuICAvLyBFbmQgUHVibGljIGNvbnN0cnVjdG9yIC9tYWtlRXJyb3IvXG5cbiAgLy8gQmVnaW4gUHVibGljIG1ldGhvZCAvc2V0Q29uZmlnTWFwL1xuICAvLyBQdXJwb3NlOiBDb21tb24gY29kZSB0byBzZXQgY29uZmlncyBpbiBmZWF0dXJlIG1vZHVsZXNcbiAgLy8gQXJndW1lbnRzOlxuICAvLyAgICogaW5wdXRfbWFwICAgIC0gbWFwIG9mIGtleS12YWx1ZXMgdG8gc2V0IGluIGNvbmZpZ1xuICAvLyAgICogc2V0dGFibGVfbWFwIC0gbWFwIG9mIGFsbG93YWJsZSBrZXlzIHRvIHNldFxuICAvLyAgICogY29uZmlnX21hcCAgIC0gbWFwIHRvIGFwcGx5IHNldHRpbmdzIHRvXG4gIC8vIFJldHVybnM6IHRydWVcbiAgLy8gVGhyb3dzIDogRXhjZXB0aW9uIGlmIGlucHV0IGtleSBub3QgYWxsb3dlZFxuICAvL1xuICBzZXRDb25maWdNYXAgPSBmdW5jdGlvbiAoIGFyZ19tYXAgKXtcbiAgICB2YXJcbiAgICAgIGlucHV0X21hcCAgICA9IGFyZ19tYXAuaW5wdXRfbWFwLFxuICAgICAgc2V0dGFibGVfbWFwID0gYXJnX21hcC5zZXR0YWJsZV9tYXAsXG4gICAgICBjb25maWdfbWFwICAgPSBhcmdfbWFwLmNvbmZpZ19tYXAsXG4gICAgICBrZXlfbmFtZSwgZXJyb3I7XG5cbiAgICBmb3IgKCBrZXlfbmFtZSBpbiBpbnB1dF9tYXAgKXtcbiAgICAgIGlmICggaW5wdXRfbWFwLmhhc093blByb3BlcnR5KCBrZXlfbmFtZSApICl7XG4gICAgICAgIGlmICggc2V0dGFibGVfbWFwLmhhc093blByb3BlcnR5KCBrZXlfbmFtZSApICl7XG4gICAgICAgICAgY29uZmlnX21hcFtrZXlfbmFtZV0gPSBpbnB1dF9tYXBba2V5X25hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGVycm9yID0gbWFrZUVycm9yKCAnQmFkIElucHV0JyxcbiAgICAgICAgICAgICdTZXR0aW5nIGNvbmZpZyBrZXkgfCcgKyBrZXlfbmFtZSArICd8IGlzIG5vdCBzdXBwb3J0ZWQnXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgLy8gRW5kIFB1YmxpYyBtZXRob2QgL3NldENvbmZpZ01hcC9cblxuICAvKiBCZWdpbiBQdWJsaWMgbWV0aG9kIC9kaXNwbGF5QXNQcmludC9cbiAgICogQSBjb252ZW5pZW5jZSB3cmFwcGVyIHRvIGRpc3BsYXkgdGhlIFIgb2JqZWN0IHRleHQgZGVzY3JpcHRpb24gaW4gYVxuICAgKiBCb290c3RyYXAgcGFuZWwuIEFsc28gcHJvdmlkZXMgbGluayB0byBkb3dubG9hZCBvYmplY3QgYXMgLnJkcyBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gdGV4dCBzb21lIGRlc2NyaXB0aXZlIHRleHQgZm9yIHRoZSBoZWFkZXJcbiAgICogQHBhcmFtIHNlc3Npb24gVGhlIG9jcHUgU2Vzc2lvblxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciBqUXVlcnkgb2JqZWN0IHRvIHBsYWNlIHBhbmVsIGluc2lkZSB3aXRoIHRleHRcbiAgICogQHBhcmFtIG5leHQgdGhlIG9wdGlvbmFsIGNhbGxiYWNrXG4gICAqL1xuICBkaXNwbGF5QXNQcmludCA9IGZ1bmN0aW9uKHRleHQsIHNlc3Npb24sICRjb250YWluZXIsIG5leHQgKXtcbiAgICB2YXIgdXJsID0gc2Vzc2lvbi5nZXRMb2MoKSArICdSLy52YWwvcHJpbnQnO1xuICAgIHZhciBjYiA9IG5leHQgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgJC5nZXQodXJsLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgIC8vIERPTSBtYW5pcHVsYXRpb25zXG4gICAgICB2YXIgJGNvZGUgPSAkKCc8cHJlIGNsYXNzPVwiZW0tY29kZVwiPjwvcHJlPicpO1xuICAgICAgJGNvZGUuaHRtbChkYXRhKTtcbiAgICAgIHZhciAkcGFuZWwgPSAkKCc8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtc3VjY2Vzc1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnPGgzIGNsYXNzPVwicGFuZWwtdGl0bGVcIj48L2gzPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keSBmaXhlZC1wYW5lbFwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWZvb3RlclwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicpO1xuICAgICAgJHBhbmVsLmZpbmQoJy5wYW5lbC10aXRsZScpLnRleHQodGV4dCk7XG4gICAgICAkcGFuZWwuZmluZCgnLnBhbmVsLWJvZHknKS5hcHBlbmQoJGNvZGUpO1xuICAgICAgJHBhbmVsLmZpbmQoJy5wYW5lbC1mb290ZXInKS5hcHBlbmQoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIGhyZWY9XCInICtcbiAgICAgICBzZXNzaW9uLmdldExvYygpICsgJ1IvLnZhbC9yZHNcIj5Eb3dubG9hZCAoLnJkcyk8L2E+Jyk7XG4gICAgICAkY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAkY29udGFpbmVyLmFwcGVuZCgkcGFuZWwpO1xuICAgIH0pXG4gICAgLmRvbmUoIGZ1bmN0aW9uKCl7IGNiKCBudWxsICk7IH0gKVxuICAgIC5mYWlsKCBmdW5jdGlvbigpeyBjYiggdHJ1ZSApOyB9ICk7XG4gIH07XG4gIC8vIEVuZCBET00gbWV0aG9kIC9kaXNwbGF5QXNQcmludC9cblxuICAvKiBCZWdpbiBQdWJsaWMgbWV0aG9kIC9kaXNwbGF5QXNUYWJsZS9cbiAgICogQSBjb252ZW5pZW5jZSB3cmFwcGVyIHRvIGRpc3BsYXkgdGhlIFIgb2JqZWN0IHRleHQgZGVzY3JpcHRpb24gYXMgYVxuICAgKiB0YWJsZSBpbnNpZGUgYSBCb29zdHJhcCBwYW5lbC5cbiAgICogQWxzbyBwcm92aWRlcyBsaW5rIHRvIGRvd25sb2FkIG9iamVjdCBhcyAucmRzIGZpbGUuXG4gICAqXG4gICAqIEBwYXJhbSB0ZXh0IHNvbWUgZGVzY3JpcHRpdmUgdGV4dCBmb3IgdGhlIGhlYWRlclxuICAgKiBAcGFyYW0gc2Vzc2lvbiBUaGUgb2NwdSBTZXNzaW9uXG4gICAqIEBwYXJhbSAkY29udGFpbmVyIGpRdWVyeSBvYmplY3QgdG8gcGxhY2UgcGFuZWwgaW5zaWRlIHdpdGggdGV4dFxuICAgKiBAcGFyYW0gbmV4dCB0aGUgb3B0aW9uYWwgY2FsbGJhY2tcbiAgICovXG5cbiAgZGlzcGxheUFzVGFibGUgPSBmdW5jdGlvbiggdGV4dCwgc2Vzc2lvbiwgJGNvbnRhaW5lciwgbmV4dCApe1xuICAgIHZhciBjYiA9IG5leHQgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHNlc3Npb24uZ2V0T2JqZWN0KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgaWYoIWRhdGEubGVuZ3RoKXsgcmV0dXJuOyB9XG5cbiAgICAgIC8vIERhdGEgbWFuaXB1bGF0aW9uc1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhWzBdKTtcbiAgICAgIHZhciBoZWFkZXJzID0ga2V5cy5tYXAoZnVuY3Rpb24odil7XG4gICAgICAgIHJldHVybiAnPHRoPicgKyB2ICsgJzwvdGg+JztcbiAgICAgIH0pO1xuICAgICAgdmFyIGFvQ29sdW1ucyA9IGtleXMubWFwKGZ1bmN0aW9uKHYpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICBcIm1EYXRhUHJvcFwiOiB2XG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgLy8gRE9NIG1hbmlwdWxhdGlvbnNcbiAgICAgIHZhciAkdGFibGUgPSAkKCc8ZGl2IGNsYXNzPVwidGFibGUtcmVzcG9uc2l2ZVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICc8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1jb25kZW5zZWQgdGFibGUtc3RyaXBlZCB0YWJsZS1ib3JkZXJlZCBlbS10YWJsZVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzx0aGVhZD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJzx0cj48L3RyPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvdGhlYWQ+JyArXG4gICAgICAgICAgICAgICAgICAgICAgJzwvdGFibGU+JyArXG4gICAgICAgICAgICAgICAgICAgICAnPC9kaXY+Jyk7XG4gICAgICBpZihoZWFkZXJzLmxlbmd0aCl7XG4gICAgICAgICR0YWJsZS5maW5kKCd0aGVhZCB0cicpLmh0bWwoJChoZWFkZXJzLmpvaW4oJycpKSk7XG4gICAgICB9XG4gICAgICB2YXIgJHBhbmVsID0gJCggJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1zdWNjZXNzXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJzxoMyBjbGFzcz1cInBhbmVsLXRpdGxlXCI+PC9oMz4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1mb290ZXJcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJidG4tZ3JvdXAgZHJvcHVwXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGRyb3Bkb3duLXRvZ2dsZVwiIGRhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIiBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiPicgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdEb3dubG9hZHMgPHNwYW4gY2xhc3M9XCJjYXJldFwiPjwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9idXR0b24+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzx1bCBjbGFzcz1cImRyb3Bkb3duLW1lbnVcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PGEgaHJlZj1cIicgKyBzZXNzaW9uLmdldExvYygpICsgJ1IvLnZhbC9qc29uJyArICdcIiBkb3dubG9hZD5KU09OPC9hPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCInICsgc2Vzc2lvbi5nZXRMb2MoKSArICdSLy52YWwvY3N2JyArICdcIiBkb3dubG9hZD5DU1Y8L2E+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PGEgaHJlZj1cIicgKyBzZXNzaW9uLmdldExvYygpICsgJ1IvLnZhbC90YWInICsgJ1wiIGRvd25sb2FkPlRBQjwvYT48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48YSBocmVmPVwiJyArIHNlc3Npb24uZ2V0TG9jKCkgKyAnUi8udmFsL21kJyArICdcIiBkb3dubG9hZD5NRDwvYT48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaSByb2xlPVwic2VwYXJhdG9yXCIgY2xhc3M9XCJkaXZpZGVyXCI+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PGEgaHJlZj1cIicgKyBzZXNzaW9uLmdldExvYygpICsgJ1IvLnZhbC9yZHNcIiBkb3dubG9hZD5SRFM8L2E+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC91bD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nKTtcbiAgICAgICRwYW5lbC5maW5kKCcucGFuZWwtdGl0bGUnKS50ZXh0KHRleHQpO1xuICAgICAgJHBhbmVsLmZpbmQoJy5wYW5lbC1ib2R5JykuYXBwZW5kKCR0YWJsZSk7XG4gICAgICAkcGFuZWwuZmluZCgnLnBhbmVsLWZvb3RlcicpLmFwcGVuZCgnJyk7XG4gICAgICAkY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAkY29udGFpbmVyLmFwcGVuZCgkcGFuZWwpO1xuICAgICAgJHRhYmxlLmZpbmQoJ3RhYmxlJykuRGF0YVRhYmxlKHtcbiAgICAgICAgICAgIFwiYWFEYXRhXCI6IGRhdGEsXG4gICAgICAgICAgICBcImFvQ29sdW1uc1wiOiBhb0NvbHVtbnNcbiAgICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5kb25lKCBmdW5jdGlvbigpeyBjYiggbnVsbCApO30gKVxuICAgIC5mYWlsKCBmdW5jdGlvbigpeyBjYiggdHJ1ZSApO30gKTtcbiAgfTtcbiAgLy8gRW5kIFB1YmxpYyBtZXRob2QgL2Rpc3BsYXlBc1RhYmxlL1xuXG4gIC8qIEJlZ2luIFB1YmxpYyBtZXRob2QgL3VuaXF1ZS9cbiAgICogQSBjb252ZW5pZW5jZSB3cmFwcGVyIHRvIHJlZHVjZSBhbiBhcnJheSB0byB1bmlxdWUgZWxlbWVudHNcbiAgICpcbiAgICogQHBhcmFtIGFycmF5IGFuIGFycmF5XG4gICAqXG4gICAqIEByZXR1cm4gYW4gYXJyYXkgb2YgdW5pcXVlIGVsZW1lbnRzXG4gICAqL1xuICB1bmlxdWUgPSBmdW5jdGlvbiggYXJyYXkgKSB7XG4gIFx0dmFyIG4gPSBbXTtcbiAgXHRmb3IodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgXHRcdGlmIChuLmluZGV4T2YoYXJyYXlbaV0pID09PSAtMSl7XG4gICAgICAgIG4ucHVzaChhcnJheVtpXSk7XG4gICAgICB9XG4gIFx0fVxuICBcdHJldHVybiBuO1xuICB9O1xuICAvLyBFbmQgUHVibGljIG1ldGhvZCAvdW5pcXVlL1xuXG4gIC8qIEJlZ2luIFB1YmxpYyBtZXRob2QgL21ha2VUZXh0RmlsZS9cbiAgICogQ3JlYXRlIGEgdGV4dCBmaWxlIG9uIHRoZSBjbGllbnQgdGhhdCBjYW4gYmUgdXNlZCB0byBkb3dubG9hZFxuICAgKlxuICAgKiBAZXhhbXBsZSA8YSBocmVmPW1ha2VUZXh0RmlsZSgnc29tZXRleHQnKSBkb3dubG9hZD1cImZpbGUudHh0XCI+ZG93bmxvYWRtZSE8L2E+XG4gICAqIEBwYXJhbSB0ZXh0IHN0cmluZyB0byBjb252ZXJ0IHRvIGZpbGVcbiAgICpcbiAgICogQHJldHVybiBVUkwgZm9yIHRoZSBmaWxlXG4gICAqL1xuICBtYWtlVGV4dEZpbGUgPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgdmFyIGRhdGEgPSBuZXcgQmxvYihbdGV4dF0sIHt0eXBlOiAndGV4dC9wbGFpbid9KTtcblxuICAgIC8vIElmIHdlIGFyZSByZXBsYWNpbmcgYSBwcmV2aW91c2x5IGdlbmVyYXRlZCBmaWxlIHdlIG5lZWQgdG9cbiAgICAvLyBtYW51YWxseSByZXZva2UgdGhlIG9iamVjdCBVUkwgdG8gYXZvaWQgbWVtb3J5IGxlYWtzLlxuICAgIGlmICh0ZXh0RmlsZSAhPT0gbnVsbCkge1xuICAgICAgd2luZG93LlVSTC5yZXZva2VPYmplY3RVUkwodGV4dEZpbGUpO1xuICAgIH1cblxuICAgIHZhciB0ZXh0RmlsZSA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGRhdGEpO1xuXG4gICAgLy8gcmV0dXJucyBhIFVSTCB5b3UgY2FuIHVzZSBhcyBhIGhyZWZcbiAgICByZXR1cm4gdGV4dEZpbGU7XG4gIH07XG5cbiAgLyogQmVnaW4gUHVibGljIG1ldGhvZCAvZ3JhcGhpY1IvXG4gICAqIEEgY29udmVuaWVuY2Ugd3JhcHBlciBmb3IgZm9ybWF0dGluZyBhIGdyYXBoaWNcbiAgICpcbiAgICogQHBhcmFtIHRpdGxlIHN0cmluZyBmb3IgdGhlIHBhbmVsXG4gICAqIEBwYXJhbSBmdW5jIHN0cmluZyB0aGUgZnVuY3Rpb24gdG8gY2FsbFxuICAgKiBAcGFyYW0gYXJncyBvYmplY3Qgb2YgZnVuY3Rpb24gcGFyYW1ldGVyc1xuICAgKiBAcGFyYW0gJGNvbnRhaW5lciB0aGUganF1ZXJ5IG9iamVjdCB0byBpbnNlcnQgdGhlIGltYWdlXG4gICAqIEBwYXJhbSBuZXh0IHRoZSBvcHRpb25hbCBjYWxsYmFja1xuICAgKlxuICAgKiBAcmV0dXJuIGFuIGFycmF5IG9mIHVuaXF1ZSBlbGVtZW50c1xuICAgKi9cbiAgZ3JhcGhpY1IgPSBmdW5jdGlvbiggdGl0bGUsIGZ1bmMsIGFyZ3MsICRjb250YWluZXIsIG5leHQgKXtcblxuICAgIHZhclxuICAgIGpxeGhyLFxuICAgIG9uZmFpbCxcbiAgICBvbkRvbmUsXG4gICAgY2IgPSBuZXh0IHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIG9uRG9uZSA9IGZ1bmN0aW9uKCApe1xuICAgICAgY2IgKCBudWxsICk7XG4gICAgfTtcblxuICAgIG9uZmFpbCA9IGZ1bmN0aW9uKCBqcVhIUiApe1xuICAgICAgdmFyIGVyclRleHQgPSBcIlNlcnZlciBlcnJvcjogXCIgKyBqcVhIUi5yZXNwb25zZVRleHQ7XG4gICAgICBjb25zb2xlLmVycm9yKGVyclRleHQpO1xuICAgICAgY2IoIHRydWUgKTtcbiAgICB9O1xuXG4gICAgLy8gZmlsdGVyXG4gICAganF4aHIgPSBvY3B1LmNhbGwoZnVuYywgYXJncywgZnVuY3Rpb24oIHNlc3Npb24gKXtcbiAgICAgIHZhciAkcGFuZWwgPSAkKCc8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtc3VjY2Vzc1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJzxoMyBjbGFzcz1cInBhbmVsLXRpdGxlXCI+JyArIHRpdGxlICsgJzwvaDM+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgJzxpbWcgc3JjPVwiXCIgY2xhc3M9XCJpbWctcmVzcG9uc2l2ZVwiIGFsdD1cIlJlc3BvbnNpdmUgaW1hZ2VcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWZvb3RlclwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiYnRuLWdyb3VwIGRyb3B1cFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGRyb3Bkb3duLXRvZ2dsZVwiIGRhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIiBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiPicgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Rvd25sb2FkcyA8c3BhbiBjbGFzcz1cImNhcmV0XCI+PC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvYnV0dG9uPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzx1bCBjbGFzcz1cImRyb3Bkb3duLW1lbnVcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48YSBocmVmPVwiJyArIHNlc3Npb24uZ2V0TG9jKCkgKyAnZ3JhcGhpY3MvMS9wbmcnICsgJ1wiIGRvd25sb2FkPlBORzwvYT48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCInICsgc2Vzc2lvbi5nZXRMb2MoKSArICdncmFwaGljcy8xL3N2ZycgKyAnXCIgZG93bmxvYWQ+U1ZHPC9hPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PGEgaHJlZj1cIicgKyBzZXNzaW9uLmdldExvYygpICsgJ2dyYXBoaWNzLzEvcGRmJyArICdcIiBkb3dubG9hZD5QREY8L2E+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaSByb2xlPVwic2VwYXJhdG9yXCIgY2xhc3M9XCJkaXZpZGVyXCI+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48YSBocmVmPVwiJyArIHNlc3Npb24uZ2V0TG9jKCkgKyAnUi8udmFsL3Jkc1wiIGRvd25sb2FkPlJEUzwvYT48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvdWw+JyArXG4gICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgJzwvZGl2PicpO1xuICAgICAgdmFyICRpbWcgPSAkcGFuZWwuZmluZCgnLmltZy1yZXNwb25zaXZlJyk7XG4gICAgICAgICAgJGltZy5hdHRyKCdzcmMnLCBzZXNzaW9uLmdldExvYygpICsgJ2dyYXBoaWNzLzEvcG5nJyApO1xuICAgICAgJGNvbnRhaW5lci5hcHBlbmQoJHBhbmVsKTtcbiAgICB9KVxuICAgIC5kb25lKCBvbkRvbmUgKVxuICAgIC5mYWlsKCBvbmZhaWwgKTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL3Bsb3RSL1xuXG4gIHJldHVybiB7XG4gICAgbWFrZUVycm9yICAgICAgICAgICAgICAgOiBtYWtlRXJyb3IsXG4gICAgc2V0Q29uZmlnTWFwICAgICAgICAgICAgOiBzZXRDb25maWdNYXAsXG4gICAgc2VyaWFsaXplICAgICAgICAgICAgICAgOiBzZXJpYWxpemUsXG4gICAgZGVzZXJpYWxpemVTZXNzaW9uRGF0YSAgOiBkZXNlcmlhbGl6ZVNlc3Npb25EYXRhLFxuICAgIGRpc3BsYXlBc1ByaW50ICAgICAgICAgIDogZGlzcGxheUFzUHJpbnQsXG4gICAgZGlzcGxheUFzVGFibGUgICAgICAgICAgOiBkaXNwbGF5QXNUYWJsZSxcbiAgICB1bmlxdWUgICAgICAgICAgICAgICAgICA6IHVuaXF1ZSxcbiAgICBncmFwaGljUiAgICAgICAgICAgICAgICA6IGdyYXBoaWNSLFxuICAgIG1ha2VUZXh0RmlsZSAgICAgICAgICAgIDogbWFrZVRleHRGaWxlXG4gIH07XG59KCkpO1xuIiwiLyoqXG4gKiBKYXZhc2NyaXB0IGNsaWVudCBsaWJyYXJ5IGZvciBPcGVuQ1BVXG4gKiBWZXJzaW9uIDAuNS4wXG4gKiBEZXBlbmRzOiBqUXVlcnlcbiAqIFJlcXVpcmVzIEhUTUw1IEZvcm1EYXRhIHN1cHBvcnQgZm9yIGZpbGUgdXBsb2Fkc1xuICogaHR0cDovL2dpdGh1Yi5jb20vamVyb2Vub29tcy9vcGVuY3B1LmpzXG4gKlxuICogSW5jbHVkZSB0aGlzIGZpbGUgaW4geW91ciBhcHBzIGFuZCBwYWNrYWdlcy5cbiAqIFlvdSBvbmx5IG5lZWQgdG8gdXNlIG9jcHUuc2V0dXJsIGlmIHRoaXMgcGFnZSBpcyBob3N0ZWQgb3V0c2lkZSBvZiB0aGUgT3BlbkNQVSBwYWNrYWdlLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBvY3B1LnNldHVybChcIi4uL1JcIikgLy9kZWZhdWx0LCB1c2UgZm9yIGFwcHNcbiAqIG9jcHUuc2V0dXJsKFwiLy9wdWJsaWMub3BlbmNwdS5vcmcvb2NwdS9saWJyYXJ5L215cGFja2FnZS9SXCIpIC8vQ09SU1xuICogb2NwdS5zZXR1cmwoXCIvb2NwdS9saWJyYXJ5L215cGFja2FnZS9SXCIpIC8vaGFyZGNvZGUgcGF0aFxuICogb2NwdS5zZXR1cmwoXCJodHRwczovL3VzZXI6c2VjcmV0L215LnNlcnZlci5jb20vb2NwdS9saWJyYXJ5L3BrZy9SXCIpIC8vIGJhc2ljIGF1dGhcbiAqL1xuXG4vL1dhcm5pbmcgZm9yIHRoZSBuZXdiaWVzXG5pZighd2luZG93LmpRdWVyeSkge1xuICBhbGVydChcIkNvdWxkIG5vdCBmaW5kIGpRdWVyeSEgVGhlIEhUTUwgbXVzdCBpbmNsdWRlIGpxdWVyeS5qcyBiZWZvcmUgb3BlbmNwdS5qcyFcIilcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCB3aW5kb3csICQgKSB7XG5cbiAgLy9nbG9iYWwgdmFyaWFibGVcbiAgdmFyIHJfY29ycyA9IGZhbHNlO1xuICB2YXIgcl9wYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICByX3BhdGguaHJlZiA9IFwiLi4vUlwiO1xuXG5cbiAgLy9uZXcgU2Vzc2lvbigpXG4gIGZ1bmN0aW9uIFNlc3Npb24obG9jLCBrZXksIHR4dCl7XG4gICAgdGhpcy5sb2MgPSBsb2M7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy50eHQgPSB0eHQ7XG4gICAgdGhpcy5vdXRwdXQgPSB0eHQuc3BsaXQoL1xcclxcbnxcXHJ8XFxuL2cpO1xuXG4gICAgdGhpcy5nZXRLZXkgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRMb2MgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGxvYztcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRGaWxlVVJMID0gZnVuY3Rpb24ocGF0aCl7XG4gICAgICB2YXIgbmV3X3VybCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIG5ld191cmwuaHJlZiA9IHRoaXMuZ2V0TG9jKCkgKyBcImZpbGVzL1wiICsgcGF0aDtcbiAgICAgIG5ld191cmwudXNlcm5hbWUgPSByX3BhdGgudXNlcm5hbWU7XG4gICAgICBuZXdfdXJsLnBhc3N3b3JkID0gcl9wYXRoLnBhc3N3b3JkXG4gICAgICByZXR1cm4gbmV3X3VybC5ocmVmO1xuICAgIH07XG5cbiAgICB0aGlzLmdldEZpbGUgPSBmdW5jdGlvbihwYXRoLCBzdWNjZXNzKXtcbiAgICAgIHZhciB1cmwgPSB0aGlzLmdldEZpbGVVUkwocGF0aCk7XG4gICAgICByZXR1cm4gJC5nZXQodXJsLCBzdWNjZXNzKTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRPYmplY3QgPSBmdW5jdGlvbihuYW1lLCBkYXRhLCBzdWNjZXNzKXtcbiAgICAgIC8vaW4gY2FzZSBvZiBubyBhcmd1bWVudHNcbiAgICAgIG5hbWUgPSBuYW1lIHx8IFwiLnZhbFwiO1xuXG4gICAgICAvL2ZpcnN0IGFyZyBpcyBhIGZ1bmN0aW9uXG4gICAgICBpZihuYW1lIGluc3RhbmNlb2YgRnVuY3Rpb24pe1xuICAgICAgICAvL3Bhc3Mgb24gdG8gc2Vjb25kIGFyZ1xuICAgICAgICBzdWNjZXNzID0gbmFtZTtcbiAgICAgICAgbmFtZSA9IFwiLnZhbFwiO1xuICAgICAgfVxuXG4gICAgICB2YXIgdXJsID0gdGhpcy5nZXRMb2MoKSArIFwiUi9cIiArIG5hbWUgKyBcIi9qc29uXCI7XG4gICAgICByZXR1cm4gJC5nZXQodXJsLCBkYXRhLCBzdWNjZXNzKTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRTdGRvdXQgPSBmdW5jdGlvbihzdWNjZXNzKXtcbiAgICAgIHZhciB1cmwgPSB0aGlzLmdldExvYygpICsgXCJzdGRvdXQvdGV4dFwiO1xuICAgICAgcmV0dXJuICQuZ2V0KHVybCwgc3VjY2Vzcyk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0Q29uc29sZSA9IGZ1bmN0aW9uKHN1Y2Nlc3Mpe1xuICAgICAgdmFyIHVybCA9IHRoaXMuZ2V0TG9jKCkgKyBcImNvbnNvbGUvdGV4dFwiO1xuICAgICAgcmV0dXJuICQuZ2V0KHVybCwgc3VjY2Vzcyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vZm9yIFBPU1RpbmcgcmF3IGNvZGUgc25pcHBldHNcbiAgLy9uZXcgU25pcHBldChcInJub3JtKDEwMClcIilcbiAgZnVuY3Rpb24gU25pcHBldChjb2RlKXtcbiAgICB0aGlzLmNvZGUgPSBjb2RlIHx8IFwiTlVMTFwiO1xuXG4gICAgdGhpcy5nZXRDb2RlID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBjb2RlO1xuICAgIH07XG4gIH1cblxuICAvL2ZvciBQT1NUaW5nIGZpbGVzXG4gIC8vbmV3IFVwbG9hZCgkKCcjZmlsZScpWzBdLmZpbGVzKVxuICBmdW5jdGlvbiBVcGxvYWQoZmlsZSl7XG4gICAgaWYoZmlsZSBpbnN0YW5jZW9mIEZpbGUpe1xuICAgICAgdGhpcy5maWxlID0gZmlsZTtcbiAgICB9IGVsc2UgaWYoZmlsZSBpbnN0YW5jZW9mIEZpbGVMaXN0KXtcbiAgICAgIHRoaXMuZmlsZSA9IGZpbGVbMF07XG4gICAgfSBlbHNlIGlmIChmaWxlLmZpbGVzIGluc3RhbmNlb2YgRmlsZUxpc3Qpe1xuICAgICAgdGhpcy5maWxlID0gZmlsZS5maWxlc1swXTtcbiAgICB9IGVsc2UgaWYgKGZpbGUubGVuZ3RoID4gMCAmJiBmaWxlWzBdLmZpbGVzIGluc3RhbmNlb2YgRmlsZUxpc3Qpe1xuICAgICAgdGhpcy5maWxlID0gZmlsZVswXS5maWxlc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ2ludmFsaWQgbmV3IFVwbG9hZChmaWxlKS4gQXJndW1lbnQgZmlsZSBtdXN0IGJlIGEgSFRNTCA8aW5wdXQgdHlwZT1cImZpbGVcIj48L2lucHV0Pic7XG4gICAgfVxuXG4gICAgdGhpcy5nZXRGaWxlID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBmaWxlO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBzdHJpbmdpZnkoeCl7XG4gICAgaWYoeCBpbnN0YW5jZW9mIFNlc3Npb24pe1xuICAgICAgcmV0dXJuIHguZ2V0S2V5KCk7XG4gICAgfSBlbHNlIGlmKHggaW5zdGFuY2VvZiBTbmlwcGV0KXtcbiAgICAgIHJldHVybiB4LmdldENvZGUoKTtcbiAgICB9IGVsc2UgaWYoeCBpbnN0YW5jZW9mIFVwbG9hZCl7XG4gICAgICByZXR1cm4geC5nZXRGaWxlKCk7XG4gICAgfSBlbHNlIGlmKHggaW5zdGFuY2VvZiBGaWxlKXtcbiAgICAgIHJldHVybiB4O1xuICAgIH0gZWxzZSBpZih4IGluc3RhbmNlb2YgRmlsZUxpc3Qpe1xuICAgICAgcmV0dXJuIHhbMF07XG4gICAgfSBlbHNlIGlmKHggJiYgeC5maWxlcyBpbnN0YW5jZW9mIEZpbGVMaXN0KXtcbiAgICAgIHJldHVybiB4LmZpbGVzWzBdO1xuICAgIH0gZWxzZSBpZih4ICYmIHgubGVuZ3RoICYmIHhbMF0uZmlsZXMgaW5zdGFuY2VvZiBGaWxlTGlzdCl7XG4gICAgICByZXR1cm4geFswXS5maWxlc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHgpO1xuICAgIH1cbiAgfVxuXG4gIC8vbG93IGxldmVsIGNhbGxcbiAgZnVuY3Rpb24gcl9mdW5fYWpheChmdW4sIHNldHRpbmdzLCBoYW5kbGVyKXtcbiAgICAvL3ZhbGlkYXRlIGlucHV0XG4gICAgaWYoIWZ1bikgdGhyb3cgXCJyX2Z1bl9jYWxsIGNhbGxlZCB3aXRob3V0IGZ1blwiO1xuICAgIHNldHRpbmdzID0gc2V0dGluZ3MgfHwge307XG4gICAgaGFuZGxlciA9IGhhbmRsZXIgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgLy9zZXQgZ2xvYmFsIHNldHRpbmdzXG4gICAgc2V0dGluZ3MudXJsID0gc2V0dGluZ3MudXJsIHx8IChyX3BhdGguaHJlZiArIFwiL1wiICsgZnVuKTtcbiAgICBzZXR0aW5ncy50eXBlID0gc2V0dGluZ3MudHlwZSB8fCBcIlBPU1RcIjtcbiAgICBzZXR0aW5ncy5kYXRhID0gc2V0dGluZ3MuZGF0YSB8fCB7fTtcbiAgICBzZXR0aW5ncy5kYXRhVHlwZSA9IHNldHRpbmdzLmRhdGFUeXBlIHx8IFwidGV4dFwiO1xuXG4gICAgLy9hamF4IGNhbGxcbiAgICB2YXIganF4aHIgPSAkLmFqYXgoc2V0dGluZ3MpLmRvbmUoZnVuY3Rpb24oKXtcbiAgICAgIHZhciBsb2MgPSBqcXhoci5nZXRSZXNwb25zZUhlYWRlcignTG9jYXRpb24nKSB8fCBjb25zb2xlLmxvZyhcIkxvY2F0aW9uIHJlc3BvbnNlIGhlYWRlciBtaXNzaW5nLlwiKTtcbiAgICAgIHZhciBrZXkgPSBqcXhoci5nZXRSZXNwb25zZUhlYWRlcignWC1vY3B1LXNlc3Npb24nKSB8fCBjb25zb2xlLmxvZyhcIlgtb2NwdS1zZXNzaW9uIHJlc3BvbnNlIGhlYWRlciBtaXNzaW5nLlwiKTtcbiAgICAgIHZhciB0eHQgPSBqcXhoci5yZXNwb25zZVRleHQ7XG5cbiAgICAgIC8vaW4gY2FzZSBvZiBjb3JzIHdlIHRyYW5zbGF0ZSByZWxhdGl2ZSBwYXRocyB0byB0aGUgdGFyZ2V0IGRvbWFpblxuICAgICAgaWYocl9jb3JzICYmIGxvYy5tYXRjaChcIl4vW14vXVwiKSl7XG4gICAgICAgIGxvYyA9IHJfcGF0aC5wcm90b2NvbCArIFwiLy9cIiArIHJfcGF0aC5ob3N0ICsgbG9jO1xuICAgICAgfVxuICAgICAgaGFuZGxlcihuZXcgU2Vzc2lvbihsb2MsIGtleSwgdHh0KSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbigpe1xuICAgICAgY29uc29sZS5sb2coXCJPcGVuQ1BVIGVycm9yIEhUVFAgXCIgKyBqcXhoci5zdGF0dXMgKyBcIlxcblwiICsganF4aHIucmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcblxuICAgIC8vZnVuY3Rpb24gY2hhaW5pbmdcbiAgICByZXR1cm4ganF4aHI7XG4gIH1cblxuICAvL2NhbGwgYSBmdW5jdGlvbiB1c2luZyB1c29uIGFyZ3VtZW50c1xuICBmdW5jdGlvbiByX2Z1bl9jYWxsX2pzb24oZnVuLCBhcmdzLCBoYW5kbGVyKXtcbiAgICByZXR1cm4gcl9mdW5fYWpheChmdW4sIHtcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGFyZ3MgfHwge30pLFxuICAgICAgY29udGVudFR5cGUgOiAnYXBwbGljYXRpb24vanNvbidcbiAgICB9LCBoYW5kbGVyKTtcbiAgfVxuXG4gIC8vY2FsbCBmdW5jdGlvbiB1c2luZyB1cmwgZW5jb2RpbmdcbiAgLy9uZWVkcyB0byB3cmFwIGFyZ3VtZW50cyBpbiBxdW90ZXMsIGV0Y1xuICBmdW5jdGlvbiByX2Z1bl9jYWxsX3VybGVuY29kZWQoZnVuLCBhcmdzLCBoYW5kbGVyKXtcbiAgICB2YXIgZGF0YSA9IHt9O1xuICAgICQuZWFjaChhcmdzLCBmdW5jdGlvbihrZXksIHZhbCl7XG4gICAgICBkYXRhW2tleV0gPSBzdHJpbmdpZnkodmFsKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcl9mdW5fYWpheChmdW4sIHtcbiAgICAgIGRhdGE6ICQucGFyYW0oZGF0YSlcbiAgICB9LCBoYW5kbGVyKTtcbiAgfVxuXG4gIC8vY2FsbCBhIGZ1bmN0aW9uIHVzaW5nIG11bHRpcGFydC9mb3JtLWRhdGFcbiAgLy91c2UgZm9yIGZpbGUgdXBsb2Fkcy4gUmVxdWlyZXMgSFRNTDVcbiAgZnVuY3Rpb24gcl9mdW5fY2FsbF9tdWx0aXBhcnQoZnVuLCBhcmdzLCBoYW5kbGVyKXtcbiAgICB0ZXN0aHRtbDUoKTtcbiAgICB2YXIgZm9ybWRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAkLmVhY2goYXJncywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgZm9ybWRhdGEuYXBwZW5kKGtleSwgc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJfZnVuX2FqYXgoZnVuLCB7XG4gICAgICBkYXRhOiBmb3JtZGF0YSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcbiAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZVxuICAgIH0sIGhhbmRsZXIpO1xuICB9XG5cbiAgLy9BdXRvbWF0aWNhbGx5IGRldGVybWluZXMgdHlwZSBiYXNlZCBvbiBhcmd1bWVudCBjbGFzc2VzLlxuICBmdW5jdGlvbiByX2Z1bl9jYWxsKGZ1biwgYXJncywgaGFuZGxlcil7XG4gICAgYXJncyA9IGFyZ3MgfHwge307XG4gICAgdmFyIGhhc2ZpbGVzID0gZmFsc2U7XG4gICAgdmFyIGhhc2NvZGUgPSBmYWxzZTtcblxuICAgIC8vZmluZCBhcmd1bWVudCB0eXBlc1xuICAgICQuZWFjaChhcmdzLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgIGlmKHZhbHVlIGluc3RhbmNlb2YgRmlsZSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFVwbG9hZCB8fCB2YWx1ZSBpbnN0YW5jZW9mIEZpbGVMaXN0KXtcbiAgICAgICAgaGFzZmlsZXMgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNuaXBwZXQgfHwgdmFsdWUgaW5zdGFuY2VvZiBTZXNzaW9uKXtcbiAgICAgICAgaGFzY29kZSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2RldGVybWluZSB0eXBlXG4gICAgaWYoaGFzZmlsZXMpe1xuICAgICAgcmV0dXJuIHJfZnVuX2NhbGxfbXVsdGlwYXJ0KGZ1biwgYXJncywgaGFuZGxlcik7XG4gICAgfSBlbHNlIGlmKGhhc2NvZGUpe1xuICAgICAgcmV0dXJuIHJfZnVuX2NhbGxfdXJsZW5jb2RlZChmdW4sIGFyZ3MsIGhhbmRsZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcl9mdW5fY2FsbF9qc29uKGZ1biwgYXJncywgaGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgLy9jYWxsIGEgZnVuY3Rpb24gYW5kIHJldHVybiBKU09OXG4gIGZ1bmN0aW9uIHJwYyhmdW4sIGFyZ3MsIGhhbmRsZXIpe1xuICAgIHJldHVybiByX2Z1bl9jYWxsKGZ1biwgYXJncywgZnVuY3Rpb24oc2Vzc2lvbil7XG4gICAgICBzZXNzaW9uLmdldE9iamVjdChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgaWYoaGFuZGxlcikgaGFuZGxlcihkYXRhKTtcbiAgICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJGYWlsZWQgdG8gZ2V0IEpTT04gcmVzcG9uc2UgZm9yIFwiICsgc2Vzc2lvbi5nZXRMb2MoKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vcGxvdHRpbmcgd2lkZ2V0XG4gIC8vdG8gYmUgY2FsbGVkIG9uIGFuIChlbXB0eSkgZGl2LlxuICAkLmZuLnJwbG90ID0gZnVuY3Rpb24oZnVuLCBhcmdzLCBjYikge1xuICAgIHZhciB0YXJnZXRkaXYgPSB0aGlzO1xuICAgIHZhciBteXBsb3QgPSBpbml0cGxvdCh0YXJnZXRkaXYpO1xuXG4gICAgLy9yZXNldCBzdGF0ZVxuICAgIG15cGxvdC5zZXRsb2NhdGlvbigpO1xuICAgIG15cGxvdC5zcGlubmVyLnNob3coKTtcblxuICAgIC8vIGNhbGwgdGhlIGZ1bmN0aW9uXG4gICAgcmV0dXJuIHJfZnVuX2NhbGwoZnVuLCBhcmdzLCBmdW5jdGlvbih0bXApIHtcbiAgICAgIG15cGxvdC5zZXRsb2NhdGlvbih0bXAuZ2V0TG9jKCkpO1xuXG4gICAgICAvL2NhbGwgc3VjY2VzcyBoYW5kbGVyIGFzIHdlbGxcbiAgICAgIGlmKGNiKSBjYih0bXApO1xuICAgIH0pLmFsd2F5cyhmdW5jdGlvbigpe1xuICAgICAgbXlwbG90LnNwaW5uZXIuaGlkZSgpO1xuICAgIH0pO1xuICB9O1xuXG4gICQuZm4uZ3JhcGhpYyA9IGZ1bmN0aW9uKHNlc3Npb24sIG4pe1xuICAgIGluaXRwbG90KHRoaXMpLnNldGxvY2F0aW9uKHNlc3Npb24uZ2V0TG9jKCksIG4gfHwgXCJsYXN0XCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdHBsb3QodGFyZ2V0ZGl2KXtcbiAgICBpZih0YXJnZXRkaXYuZGF0YShcIm9jcHVwbG90XCIpKXtcbiAgICAgIHJldHVybiB0YXJnZXRkaXYuZGF0YShcIm9jcHVwbG90XCIpO1xuICAgIH1cbiAgICB2YXIgb2NwdXBsb3QgPSBmdW5jdGlvbigpe1xuICAgICAgLy9sb2NhbCB2YXJpYWJsZXNcbiAgICAgIHZhciBMb2NhdGlvbjtcbiAgICAgIHZhciBuID0gXCJsYXN0XCI7XG4gICAgICB2YXIgcG5nd2lkdGg7XG4gICAgICB2YXIgcG5naGVpZ2h0O1xuXG4gICAgICB2YXIgcGxvdGRpdiA9ICQoJzxkaXYgLz4nKS5hdHRyKHtcbiAgICAgICAgc3R5bGU6IFwid2lkdGg6IDEwMCU7IGhlaWdodDoxMDAlOyBtaW4td2lkdGg6IDEwMHB4OyBtaW4taGVpZ2h0OiAxMDBweDsgcG9zaXRpb246cmVsYXRpdmU7IGJhY2tncm91bmQtcmVwZWF0Om5vLXJlcGVhdDsgYmFja2dyb3VuZC1zaXplOiAxMDAlIDEwMCU7XCJcbiAgICAgIH0pLmFwcGVuZFRvKHRhcmdldGRpdikuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBcIm5vbmVcIik7XG5cbiAgICAgIHZhciBzcGlubmVyID0gJCgnPHNwYW4gLz4nKS5hdHRyKHtcbiAgICAgICAgc3R5bGUgOiBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAyMHB4OyBsZWZ0OiAyMHB4OyB6LWluZGV4OjEwMDA7IGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7XCJcbiAgICAgIH0pLnRleHQoXCJsb2FkaW5nLi4uXCIpLmFwcGVuZFRvKHBsb3RkaXYpLmhpZGUoKTtcblxuICAgICAgdmFyIHBkZiA9ICQoJzxhIC8+JykuYXR0cih7XG4gICAgICAgIHRhcmdldDogXCJfYmxhbmtcIixcbiAgICAgICAgc3R5bGU6IFwicG9zaXRpb246IGFic29sdXRlOyB0b3A6IDEwcHg7IHJpZ2h0OiAxMHB4OyB6LWluZGV4OjEwMDA7IHRleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmU7IGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7XCJcbiAgICAgIH0pLnRleHQoXCJwZGZcIikuYXBwZW5kVG8ocGxvdGRpdik7XG5cbiAgICAgIHZhciBzdmcgPSAkKCc8YSAvPicpLmF0dHIoe1xuICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICAgIHN0eWxlOiBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAzMHB4OyByaWdodDogMTBweDsgei1pbmRleDoxMDAwOyB0ZXh0LWRlY29yYXRpb246dW5kZXJsaW5lOyBmb250LWZhbWlseTogbW9ub3NwYWNlO1wiXG4gICAgICB9KS50ZXh0KFwic3ZnXCIpLmFwcGVuZFRvKHBsb3RkaXYpO1xuXG4gICAgICB2YXIgcG5nID0gJCgnPGEgLz4nKS5hdHRyKHtcbiAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wiLFxuICAgICAgICBzdHlsZTogXCJwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogNTBweDsgcmlnaHQ6IDEwcHg7IHotaW5kZXg6MTAwMDsgdGV4dC1kZWNvcmF0aW9uOnVuZGVybGluZTsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTtcIlxuICAgICAgfSkudGV4dChcInBuZ1wiKS5hcHBlbmRUbyhwbG90ZGl2KTtcblxuICAgICAgZnVuY3Rpb24gdXBkYXRlcG5nKCl7XG4gICAgICAgIGlmKCFMb2NhdGlvbikgcmV0dXJuO1xuICAgICAgICBwbmd3aWR0aCA9IHBsb3RkaXYud2lkdGgoKTtcbiAgICAgICAgcG5naGVpZ2h0ID0gcGxvdGRpdi5oZWlnaHQoKTtcbiAgICAgICAgcGxvdGRpdi5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwidXJsKFwiICsgTG9jYXRpb24gKyBcImdyYXBoaWNzL1wiICsgbiArIFwiL3BuZz93aWR0aD1cIiArIHBuZ3dpZHRoICsgXCImaGVpZ2h0PVwiICsgcG5naGVpZ2h0ICsgXCIpXCIpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRsb2NhdGlvbihuZXdsb2MsIG5ld24pe1xuICAgICAgICBuID0gbmV3biB8fCBuO1xuICAgICAgICBMb2NhdGlvbiA9IG5ld2xvYztcbiAgICAgICAgaWYoIUxvY2F0aW9uKXtcbiAgICAgICAgICBwZGYuaGlkZSgpO1xuICAgICAgICAgIHN2Zy5oaWRlKCk7XG4gICAgICAgICAgcG5nLmhpZGUoKTtcbiAgICAgICAgICBwbG90ZGl2LmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgXCJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGRmLmF0dHIoXCJocmVmXCIsIExvY2F0aW9uICsgXCJncmFwaGljcy9cIiArIG4gKyBcIi9wZGY/d2lkdGg9MTEuNjkmaGVpZ2h0PTguMjcmcGFwZXI9YTRyXCIpLnNob3coKTtcbiAgICAgICAgICBzdmcuYXR0cihcImhyZWZcIiwgTG9jYXRpb24gKyBcImdyYXBoaWNzL1wiICsgbiArIFwiL3N2Zz93aWR0aD0xMSZoZWlnaHQ9NlwiKS5zaG93KCk7XG4gICAgICAgICAgcG5nLmF0dHIoXCJocmVmXCIsIExvY2F0aW9uICsgXCJncmFwaGljcy9cIiArIG4gKyBcIi9wbmc/d2lkdGg9ODAwJmhlaWdodD02MDBcIikuc2hvdygpO1xuICAgICAgICAgIHVwZGF0ZXBuZygpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGZ1bmN0aW9uIHRvIHVwZGF0ZSB0aGUgcG5nIGltYWdlXG4gICAgICB2YXIgb25yZXNpemUgPSBkZWJvdW5jZShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmKHBuZ3dpZHRoID09IHBsb3RkaXYud2lkdGgoKSAmJiBwbmdoZWlnaHQgPT0gcGxvdGRpdi5oZWlnaHQoKSl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKHBsb3RkaXYuaXMoXCI6dmlzaWJsZVwiKSl7XG4gICAgICAgICAgdXBkYXRlcG5nKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIDUwMCk7XG5cbiAgICAgIC8vIHJlZ2lzdGVyIHVwZGF0ZSBoYW5kbGVyc1xuICAgICAgcGxvdGRpdi5vbihcInJlc2l6ZVwiLCBvbnJlc2l6ZSk7XG4gICAgICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgb25yZXNpemUpO1xuXG4gICAgICAvL3JldHVybiBvYmplY3RzXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzZXRsb2NhdGlvbjogc2V0bG9jYXRpb24sXG4gICAgICAgIHNwaW5uZXIgOiBzcGlubmVyXG4gICAgICB9O1xuICAgIH0oKTtcblxuICAgIHRhcmdldGRpdi5kYXRhKFwib2NwdXBsb3RcIiwgb2NwdXBsb3QpO1xuICAgIHJldHVybiBvY3B1cGxvdDtcbiAgfVxuXG4gIC8vIGZyb20gdW5kZXJzdG9yZS5qc1xuICBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIHZhciB0aW1lb3V0ID0gbnVsbDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKVxuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICB9O1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICBpZiAoY2FsbE5vdylcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRlc3RodG1sNSgpe1xuICAgIGlmKCB3aW5kb3cuRm9ybURhdGEgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGFsZXJ0KFwiVXBsb2FkaW5nIG9mIGZpbGVzIHJlcXVpcmVzIEhUTUw1LiBJdCBsb29rcyBsaWtlIHlvdSBhcmUgdXNpbmcgYW4gb3V0ZGF0ZWQgYnJvd3NlciB0aGF0IGRvZXMgbm90IHN1cHBvcnQgdGhpcy4gUGxlYXNlIGluc3RhbGwgRmlyZWZveCwgQ2hyb21lIG9yIEludGVybmV0IEV4cGxvcmVyIDEwK1wiKTtcbiAgICAgIHRocm93IFwiSFRNTDUgcmVxdWlyZWQuXCI7XG4gICAgfVxuICB9XG5cbiAgLy9nbG9iYWwgc2V0dGluZ3NcbiAgZnVuY3Rpb24gc2V0dXJsKG5ld3BhdGgpe1xuICAgIGlmKCFuZXdwYXRoLm1hdGNoKFwiL1IkXCIpKXtcbiAgICAgIGFsZXJ0KFwiRVJST1IhIFRyeWluZyB0byBzZXQgUiB1cmwgdG86IFwiICsgbmV3cGF0aCArXCIuIFBhdGggdG8gYW4gT3BlbkNQVSBSIHBhY2thZ2UgbXVzdCBlbmQgd2l0aCAnL1InXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByX3BhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICByX3BhdGguaHJlZiA9IG5ld3BhdGg7XG4gICAgICByX3BhdGguaHJlZiA9IHJfcGF0aC5ocmVmOyAvL0lFIG5lZWRzIHRoaXNcblxuICAgICAgaWYobG9jYXRpb24ucHJvdG9jb2wgIT0gcl9wYXRoLnByb3RvY29sIHx8IGxvY2F0aW9uLmhvc3QgIT0gcl9wYXRoLmhvc3Qpe1xuICAgICAgICByX2NvcnMgPSB0cnVlO1xuICAgICAgICBpZiAoISgnd2l0aENyZWRlbnRpYWxzJyBpbiBuZXcgWE1MSHR0cFJlcXVlc3QoKSkpIHtcbiAgICAgICAgICBhbGVydChcIlRoaXMgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IENPUlMuIFRyeSB1c2luZyBGaXJlZm94IG9yIENocm9tZS5cIik7XG4gICAgICAgIH0gZWxzZSBpZihyX3BhdGgudXNlcm5hbWUgJiYgcl9wYXRoLnBhc3N3b3JkKSB7XG4gICAgICAgICAgLy9zaG91bGQgb25seSBkbyB0aGlzIGZvciBjYWxscyB0byBvcGVuY3B1IG1heWJlXG4gICAgICAgICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChyX3BhdGguaG9zdCk7XG4gICAgICAgICAgJC5hamF4U2V0dXAoe1xuICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24oeGhyLCBzZXR0aW5ncykge1xuICAgICAgICAgICAgICAvL29ubHkgdXNlIGF1dGggZm9yIGFqYXggcmVxdWVzdHMgdG8gb2NwdVxuICAgICAgICAgICAgICBpZihyZWdleC50ZXN0KHNldHRpbmdzLnVybCkpe1xuICAgICAgICAgICAgICAgIC8vc2V0dGluZ3MudXNlcm5hbWUgPSByX3BhdGgudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgLy9zZXR0aW5ncy5wYXNzd29yZCA9IHJfcGF0aC5wYXNzd29yZDtcblxuICAgICAgICAgICAgICAgIC8qIHRha2Ugb3V0IHVzZXI6cGFzcyBmcm9tIHRhcmdldCB1cmwgKi9cbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICAgIHRhcmdldC5ocmVmID0gc2V0dGluZ3MudXJsO1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLnVybCA9IHRhcmdldC5wcm90b2NvbCArIFwiLy9cIiArIHRhcmdldC5ob3N0ICsgdGFyZ2V0LnBhdGhuYW1lXG5cbiAgICAgICAgICAgICAgICAvKiBzZXQgYmFzaWMgYXV0aCBoZWFkZXIgKi9cbiAgICAgICAgICAgICAgICBzZXR0aW5ncy54aHJGaWVsZHMgPSBzZXR0aW5ncy54aHJGaWVsZHMgfHwge307XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MueGhyRmllbGRzLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuY3Jvc3NEb21haW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQXV0aG9yaXphdGlvblwiLCBcIkJhc2ljIFwiICsgYnRvYShyX3BhdGgudXNlcm5hbWUgKyBcIjpcIiArIHJfcGF0aC5wYXNzd29yZCkpO1xuXG4gICAgICAgICAgICAgICAgLyogZGVidWcgKi9cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkF1dGhlbnRpY2F0ZWQgcmVxdWVzdCB0bzogXCIgKyBzZXR0aW5ncy51cmwgKyBcIiAoXCIgKyByX3BhdGgudXNlcm5hbWUgKyBcIiwgXCIgKyByX3BhdGgucGFzc3dvcmQgKyBcIilcIilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGxvY2F0aW9uLnByb3RvY29sID09IFwiaHR0cHM6XCIgJiYgcl9wYXRoLnByb3RvY29sICE9IFwiaHR0cHM6XCIpe1xuICAgICAgICBhbGVydChcIlBhZ2UgaXMgaG9zdGVkIG9uIEhUVFBTIGJ1dCB1c2luZyBhIChub24tU1NMKSBIVFRQIE9wZW5DUFUgc2VydmVyLiBUaGlzIGlzIGluc2VjdXJlIGFuZCBtb3N0IGJyb3dzZXJzIHdpbGwgbm90IGFsbG93IHRoaXMuXCIpXG4gICAgICB9XG5cbiAgICAgIGlmKHJfY29ycyl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2V0dGluZyBwYXRoIHRvIENPUlMgc2VydmVyIFwiICsgcl9wYXRoLmhyZWYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXR0aW5nIHBhdGggdG8gbG9jYWwgKG5vbi1DT1JTKSBzZXJ2ZXIgXCIgKyByX3BhdGguaHJlZik7XG4gICAgICB9XG5cbiAgICAgIC8vQ09SUyBkaXNhbGxvd3MgcmVkaXJlY3RzLlxuICAgICAgcmV0dXJuICQuZ2V0KHJfcGF0aC5ocmVmICsgXCIvXCIsIGZ1bmN0aW9uKHJlc2RhdGEpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIlBhdGggdXBkYXRlZC4gQXZhaWxhYmxlIG9iamVjdHMvZnVuY3Rpb25zOlxcblwiICsgcmVzZGF0YSk7XG5cbiAgICAgIH0pLmZhaWwoZnVuY3Rpb24oeGhyLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bil7XG4gICAgICAgIGFsZXJ0KFwiQ29ubmVjdGlvbiB0byBPcGVuQ1BVIGZhaWxlZDpcXG5cIiArIHRleHRTdGF0dXMgKyBcIlxcblwiICsgeGhyLnJlc3BvbnNlVGV4dCArIFwiXFxuXCIgKyBlcnJvclRocm93bik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvL2ZvciBpbm5lcm5ldHogZXhwbG9kZXJcbiAgaWYgKHR5cGVvZiBjb25zb2xlID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB0aGlzLmNvbnNvbGUgPSB7bG9nOiBmdW5jdGlvbigpIHt9fTtcbiAgfVxuXG4gIC8vZXhwb3J0XG4gIHJldHVybiB7XG4gICAgY2FsbCAgICAgICAgOiAgcl9mdW5fY2FsbCxcbiAgICBycGMgICAgICAgICA6ICBycGMsXG4gICAgc2V0dXJsICAgICAgOiAgc2V0dXJsLFxuICAgIFNuaXBwZXQgICAgIDogIFNuaXBwZXQsXG4gICAgVXBsb2FkICAgICAgOiAgVXBsb2FkLFxuICAgIFNlc3Npb24gICAgIDogIFNlc3Npb25cbiAgfTtcblxufSggd2luZG93LCBqUXVlcnkgKSk7XG4iXX0=
