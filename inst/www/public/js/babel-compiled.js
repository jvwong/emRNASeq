(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/boot.js":[function(require,module,exports){
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

},{}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/emdata.js":[function(require,module,exports){
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

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/lib/opencpu.js/opencpu-0.5-npm.js","./util.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/util.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/main.js":[function(require,module,exports){
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
  // shell.initModule("//localhost:8787/ocpu/library/emRNASeq/R", $('#em'));
  shell.initModule("", $('#em'));
})();

},{"./boot":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/boot.js","./shell":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/shell.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/munge.js":[function(require,module,exports){
"use strict";

var util = require('./util.js');
var ocpu = require('../lib/opencpu.js/opencpu-0.5-npm.js');

var munge = function () {

  // ---------- BEGIN MODULE SCOPE VARIABLES -----------------------------------
  var configMap = {

    template: String() + '<div class="em-munge">' + '<div class="row">' + '<h2 class="col-xs-12 col-sm-10 em-section-title">Data Munge <small></small></h2>' + '<h4 class="col-xs-12 col-sm-2"><a class="btn btn-danger btn-block em-munge-clear clear-btn ajax-sensitive col-xs-3 col-md-3">Reset</a></h4>' + '</div>' + '<hr/>' + '<form>' + '<fieldset class="form-group">' + '<legend>Metadata Input</legend>' + '<div class="em-munge-meta row">' + '<label class="col-sm-2 col-form-label">File</label>' + '<div class="col-sm-10">' + '<label class="btn btn-primary btn-file btn-md btn-block" for="em-munge-meta-input">Select</label>' + '<input type="file" class="form-control-file" style="display: none;" id="em-munge-meta-input" />' + '<p><small class="help-block"></small></p>' + '</div>' + '</div>' + '<div class="form-group em-munge-meta-results"></div>' + '</fieldset>' + '<fieldset class="form-group">' + '<legend>Data Input</legend>' + '<div class="em-munge-species row">' + '<label for="em-munge-species-input" class="col-sm-2 col-form-label">Species &nbsp</label>' + '<div class="col-sm-10">' + '<input type="text" class="form-control" placeholder="e.g. \'mouse\' (optional)">' + '<p><small class="help-block"></small></p>' + '</div>' + '</div>' + '<div class="em-munge-data row">' + '<label class="col-sm-2 col-form-label">File</label>' + '<div class="col-sm-10">' + '<label class="btn btn-primary btn-file btn-md btn-block" for="em-munge-data-input">Select</label>' + '<input type="file" class="form-control-file" style="display: none;" id="em-munge-data-input" disabled multiple />' + '<p><small class="help-block"></small></p>' + '</div>' + '</div>' + '<div class="form-group em-munge-data-results"></div>' + '</fieldset>' + '</form>' + '</div>',

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
      $munge_metadata_input: $container.find('.em-munge .em-munge-meta input'),
      $munge_metadata_label: $container.find('.em-munge .em-munge-meta label'),
      $munge_metadata_help: $container.find('.em-munge .em-munge-meta .help-block'),
      $munge_metadata_results: $container.find('.em-munge .em-munge-meta-results'),
      $munge_spec_input: $container.find('.em-munge .em-munge-species input'),
      $munge_data_input: $container.find('.em-munge .em-munge-data input'),
      $munge_data_label: $container.find('.em-munge .em-munge-data label'),
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
      jqueryMap.$munge_metadata_help.text(stateMap.metadata_file.name);
      cb(null, stateMap.metadata_session);
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

    stateMap.data_files = data.files;

    // opencpu only accepts single files as arguments
    var args = {
      metadata_file: stateMap.metadata_file,
      species: data.species
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

  onMetadataProcessed = function onMetadataProcessed(err, session) {
    if (err) {
      return false;
    }
    util.displayAsTable('Results', session, jqueryMap.$munge_metadata_results, function (err) {
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
      species: jqueryMap.$munge_spec_input.val().trim().toLowerCase() || null
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
    var $handles = label === 'data' ? [jqueryMap.$munge_data_label, jqueryMap.$munge_data_input, jqueryMap.$munge_spec_input] : [jqueryMap.$munge_metadata_label, jqueryMap.$munge_metadata_input];

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
    // Must do this manually
    jqueryMap.$munge_metadata_input.val("");
    jqueryMap.$munge_metadata_help.text(configMap.default_metadata_help);
    jqueryMap.$munge_metadata_results.empty();
    jqueryMap.$munge_spec_input.val("");
    jqueryMap.$munge_data_input.val("");
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
    jqueryMap.$munge_metadata_input.change(onMetaFileChange);
    jqueryMap.$munge_data_input.change(onDataFilesChange);
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

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/lib/opencpu.js/opencpu-0.5-npm.js","./util.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/util.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/process_rseq.js":[function(require,module,exports){
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

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/lib/opencpu.js/opencpu-0.5-npm.js","./util.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/util.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/shell.js":[function(require,module,exports){
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
    $.gevent.subscribe(jqueryMap.$emdata_container, 'em-process_rseq', function (event, msg_map) {
      localStorage.setItem('em-process_rseq', util.serialize(msg_map));
      emdata.configModule({});
      emdata.initModule(jqueryMap.$emdata_container, msg_map);
    });

    munge.configModule({});
    munge.initModule(jqueryMap.$munge_container);
    // var msg_map = util.deserializeSessionData( localStorage.getItem( 'em-munge-data' ) );
    // process_rseq.configModule({});
    // process_rseq.initModule( jqueryMap.$process_rseq_container, msg_map );
    // var msg_map = util.deserializeSessionData( localStorage.getItem( 'em-process_rseq' ) );
    // emdata.configModule({});
    // emdata.initModule( jqueryMap.$emdata_container, msg_map  );

    return true;
  };
  // ---------- END PUBLIC METHODS --------------------------------------------

  return {
    initModule: initModule
  };
}();

module.exports = shell;

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/lib/opencpu.js/opencpu-0.5-npm.js","./emdata.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/emdata.js","./munge.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/munge.js","./process_rseq.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/process_rseq.js","./util.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/util.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/util.js":[function(require,module,exports){
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

},{"../lib/opencpu.js/opencpu-0.5-npm.js":"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/lib/opencpu.js/opencpu-0.5-npm.js"}],"/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/lib/opencpu.js/opencpu-0.5-npm.js":[function(require,module,exports){
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

},{}]},{},["/Users/jeffreywong/Projects/PathwayCommons/packages/emRNASeq/inst/www/src/js/main.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdC5qcyIsInNyYy9qcy9lbWRhdGEuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tdW5nZS5qcyIsInNyYy9qcy9wcm9jZXNzX3JzZXEuanMiLCJzcmMvanMvc2hlbGwuanMiLCJzcmMvanMvdXRpbC5qcyIsInNyYy9saWIvb3BlbmNwdS5qcy9vcGVuY3B1LTAuNS1ucG0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFDQSxPQUFPLE9BQVAsR0FBa0IsWUFBVTtBQUMxQixNQUNFLFVBREY7O0FBR0EsZUFBYSxzQkFBVTtBQUNyQixNQUFFLFFBQUYsRUFDRyxTQURILENBQ2EsWUFBVTtBQUNqQixRQUFFLGVBQUYsRUFBbUIsSUFBbkI7QUFDQTtBQUNBLFFBQUUsaUJBQUYsRUFBcUIsSUFBckIsQ0FBMEIsVUFBMUIsRUFBc0MsSUFBdEM7QUFDSCxLQUxILEVBTUcsUUFOSCxDQU1ZLFlBQVU7QUFDaEIsUUFBRSxlQUFGLEVBQW1CLElBQW5CO0FBQ0EsUUFBRSxpQkFBRixFQUFxQixJQUFyQixDQUEwQixVQUExQixFQUFzQyxLQUF0QztBQUNILEtBVEg7QUFVRCxHQVhEO0FBWUEsU0FBTyxFQUFFLFlBQWlCLFVBQW5CLEVBQVA7QUFDRCxDQWpCaUIsRUFBbEI7OztBQ0hBOztBQUVBLElBQUksT0FBTyxRQUFRLFdBQVIsQ0FBWDtBQUNBLElBQUksT0FBTyxRQUFRLHNDQUFSLENBQVg7QUFDQSxJQUFJLGFBQWMsWUFBVTs7QUFFMUI7QUFDQSxNQUNBLFlBQVk7QUFDVix1QkFBb0IsRUFEVjtBQUdWLGNBQVcsV0FDVCx5QkFEUyxHQUVQLG1CQUZPLEdBR0wscUZBSEssR0FJTCw4SUFKSyxHQUtQLFFBTE8sR0FNUCxPQU5PLEdBT1AsaUNBUE8sR0FRTCwrQkFSSyxHQVNILDhCQVRHLEdBVUgsa0RBVkcsR0FXSCxnRUFYRyxHQVlMLGFB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QWdFO0FBQzlELGNBQU0sNEhBQU47QUFDRDs7QUFFRCxVQUFHLE1BQUgsRUFBVTtBQUNSLGdCQUFRLEdBQVIsQ0FBWSxpQ0FBaUMsT0FBTyxJQUFwRDtBQUNELE9BRkQsTUFFTztBQUNMLGdCQUFRLEdBQVIsQ0FBWSw2Q0FBNkMsT0FBTyxJQUFoRTtBQUNEOztBQUVEO0FBQ0EsYUFBTyxFQUFFLEdBQUYsQ0FBTSxPQUFPLElBQVAsR0FBYyxHQUFwQixFQUF5QixVQUFTLE9BQVQsRUFBaUI7QUFDL0MsZ0JBQVEsR0FBUixDQUFZLGlEQUFpRCxPQUE3RDtBQUVELE9BSE0sRUFHSixJQUhJLENBR0MsVUFBUyxHQUFULEVBQWMsVUFBZCxFQUEwQixXQUExQixFQUFzQztBQUM1QyxjQUFNLG9DQUFvQyxVQUFwQyxHQUFpRCxJQUFqRCxHQUF3RCxJQUFJLFlBQTVELEdBQTJFLElBQTNFLEdBQWtGLFdBQXhGO0FBQ0QsT0FMTSxDQUFQO0FBTUQ7QUFDRjs7QUFFRDtBQUNBLE1BQUksT0FBTyxPQUFQLElBQWtCLFdBQXRCLEVBQW1DO0FBQ2pDLFNBQUssT0FBTCxHQUFlLEVBQUMsS0FBSyxlQUFXLENBQUUsQ0FBbkIsRUFBZjtBQUNEOztBQUVEO0FBQ0EsU0FBTztBQUNMLFVBQWUsVUFEVjtBQUVMLFNBQWUsR0FGVjtBQUdMLFlBQWUsTUFIVjtBQUlMLGFBQWUsT0FKVjtBQUtMLFlBQWUsTUFMVjtBQU1MLGFBQWU7QUFOVixHQUFQO0FBU0QsQ0EzYWlCLENBMmFmLE1BM2FlLEVBMmFQLE1BM2FPLENBQWxCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuLy9TaG93IGFuZCBoaWRlIHRoZSBzcGlubmVyIGZvciBhbGwgYWpheCByZXF1ZXN0cy5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG4gIHZhclxuICAgIGluaXRNb2R1bGU7XG5cbiAgaW5pdE1vZHVsZSA9IGZ1bmN0aW9uKCl7XG4gICAgJChkb2N1bWVudClcbiAgICAgIC5hamF4U3RhcnQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcjYWpheC1zcGlubmVyJykuc2hvdygpO1xuICAgICAgICAgIC8vIEhpZGUgYW55IGJ1dHRvbnMgdGhhdCBjb3VsZCB1bnN5bmMgd2l0aCBhamF4IGVycm9yIGhhbmRsZXJzXG4gICAgICAgICAgJCgnLmFqYXgtc2Vuc2l0aXZlJykuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuYWpheFN0b3AoZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcjYWpheC1zcGlubmVyJykuaGlkZSgpO1xuICAgICAgICAgICQoJy5hamF4LXNlbnNpdGl2ZScpLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfSk7XG4gIH07XG4gIHJldHVybiB7IGluaXRNb2R1bGUgICAgIDogaW5pdE1vZHVsZSB9O1xufSgpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xudmFyIG9jcHUgPSByZXF1aXJlKCcuLi9saWIvb3BlbmNwdS5qcy9vcGVuY3B1LTAuNS1ucG0uanMnKTtcbnZhciBtb2R1bGVuYW1lID0gKGZ1bmN0aW9uKCl7XG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHZhclxuICBjb25maWdNYXAgPSB7XG4gICAgYW5jaG9yX3NjaGVtYV9tYXAgOiB7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZSA6IFN0cmluZygpICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwicm93XCI+JyArXG4gICAgICAgICAgJzxoMiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tMTAgZW0tc2VjdGlvbi10aXRsZVwiPkVNIERhdGEgRmlsZXMgPHNtYWxsPjwvc21hbGw+PC9oMj4nICtcbiAgICAgICAgICAnPGg0IGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS0yXCI+PGEgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tYmxvY2sgZW0tZW1kYXRhLWNsZWFyIGNsZWFyLWJ0biBhamF4LXNlbnNpdGl2ZSBjb2wteHMtMyBjb2wtbWQtM1wiPlJlc2V0PC9hPjwvaDQ+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzxoci8+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhLXJlc3VsdHNcIj4nICtcbiAgICAgICAgICAnPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsZWdlbmQ+R1NFQSBJbnB1dHM8L2xlZ2VuZD4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZ3NlYVwiPjwvZGl2PicgK1xuICAgICAgICAgICAgJzxwPjxzbWFsbCBjbGFzcz1cImNvbC1zbS1vZmZzZXQtMiBnc2VhLWhlbHAtYmxvY2tcIj48L3NtYWxsPjwvcD4nICtcbiAgICAgICAgICAnPC9maWVsZHNldD4nICtcbiAgICAgICAgICAnPGZpZWxkc2V0IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsZWdlbmQ+RU0gSW5wdXRzPC9sZWdlbmQ+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLWVtZGF0YS1yZXN1bHRzLWZpbGVzLWVtXCI+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW0tZXhwcmVzc2lvblwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLWVtZGF0YS1yZXN1bHRzLWZpbGVzLWVtLXBoZW5vdHlwZVwiPjwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxwPjxzbWFsbCBjbGFzcz1cImNvbC1zbS1vZmZzZXQtMiBlbS1oZWxwLWJsb2NrXCI+PC9zbWFsbD48L3A+JyArXG4gICAgICAgICAgJzwvZmllbGRzZXQ+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICc8L2Rpdj4nLFxuXG4gICAgY29kZV90ZW1wbGF0ZSA6IFN0cmluZygpICtcbiAgICAgICc8cHJlIGNsYXNzPVwiZW0tY29kZVwiPjwvcHJlPicsXG5cbiAgICBzZXR0YWJsZV9tYXAgOiB7fVxuICB9LFxuICBzdGF0ZU1hcCA9IHtcbiAgICBmaWx0ZXJfcnNlcV9zZXNzaW9uICAgICA6IG51bGwsXG4gICAgbm9ybWFsaXplX3JzZXFfc2Vzc2lvbiAgOiBudWxsLFxuICAgIGRlX3Rlc3RfcnNlcV9zZXNzaW9uICAgIDogbnVsbCxcbiAgICByYW5rX2dzZWFfc2Vzc2lvbiAgICAgICA6IG51bGwsXG4gICAgZXhwcmVzc2lvbl9lbV9zZXNzaW9uICAgOiBudWxsLFxuICAgIHBoZW9udHlwZSAgICAgICAgICAgICAgIDogbnVsbCxcbiAgICBleHByZXNzaW9uX2dzZWFfc2Vzc2lvbiA6IG51bGwsXG4gICAgcGhlbm90eXBlX2dzZWFfc2Vzc2lvbiAgOiBudWxsXG4gIH0sXG4gIGpxdWVyeU1hcCA9IHt9LFxuICByZXNldCxcbiAgc2V0SlF1ZXJ5TWFwLFxuXG4gIGZldGNoR1NFQUZpbGVzLFxuICBmZXRjaEVNRmlsZXMsXG4gIGNyZWF0ZURhdGFGaWxlcyxcblxuICBjb25maWdNb2R1bGUsXG4gIGluaXRNb2R1bGU7XG4gIC8vIC0tLS0tLS0tLS0gRU5EIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBET00gTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEJlZ2luIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cbiAgc2V0SlF1ZXJ5TWFwID0gZnVuY3Rpb24oICRjb250YWluZXIgKXtcbiAgICBqcXVlcnlNYXAgPSB7XG4gICAgICAkY29udGFpbmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIsXG4gICAgICAkZW1kYXRhX2NsZWFyICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLWVtZGF0YSAuZW0tZW1kYXRhLWNsZWFyJyksXG4gICAgICAkZW1kYXRhX3Jlc3VsdHMgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLWVtZGF0YSAuZW0tZW1kYXRhLXJlc3VsdHMnKSxcbiAgICAgICRlbWRhdGFfcmVzdWx0c19maWxlc19nc2VhICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cyAuZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZ3NlYScpLFxuICAgICAgJGVtZGF0YV9nc2VhX2hlbHAgICAgICAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1lbWRhdGEgLmVtLWVtZGF0YS1yZXN1bHRzIC5nc2VhLWhlbHAtYmxvY2snKSxcbiAgICAgICRlbWRhdGFfcmVzdWx0c19maWxlc19lbSAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cyAuZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW0nKSxcbiAgICAgICRlbWRhdGFfcmVzdWx0c19maWxlc19lbV9leHByZXNzaW9uICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cyAuZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW0gLmVtLWVtZGF0YS1yZXN1bHRzLWZpbGVzLWVtLWV4cHJlc3Npb24gJyksXG4gICAgICAkZW1kYXRhX3Jlc3VsdHNfZmlsZXNfZW1fcGhlbm90eXBlICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLWVtZGF0YSAuZW0tZW1kYXRhLXJlc3VsdHMgLmVtLWVtZGF0YS1yZXN1bHRzLWZpbGVzLWVtIC5lbS1lbWRhdGEtcmVzdWx0cy1maWxlcy1lbS1waGVub3R5cGUnKSxcbiAgICAgICRlbWRhdGFfZW1faGVscCAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cyAuZW0taGVscC1ibG9jaycpXG4gICAgfTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cblxuICAvKiBGZXRjaCBhbmQgYXBwZW5kIHRoZSB2YXJpb3VzIGZpbGVzIHJlcXVpcmVkIGZvciBFTVxuICAgKlxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciBvYmplY3QgdGhlIGpxdWVyeSBvYmplY3QgdG8gYXBwZW5kIHRvXG4gICAqIEBwYXJhbSBuZXh0IGZ1bmN0aW9uIGFuIG9wdGlvbmFsIGNhbGxiYWNrXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgZmV0Y2hFTUZpbGVzID0gZnVuY3Rpb24oICRjb250YWluZXIsIG5leHQgKXtcbiAgICB2YXJcbiAgICBqcXhocl9leHByZXNzaW9uLFxuICAgIGpxeGhyX3BoZW5vdHlwZSxcbiAgICBvbmZhaWwsXG4gICAgb25Eb25lLFxuICAgIGNiID0gbmV4dCB8fCBmdW5jdGlvbigpe307XG5cbiAgICBvbkRvbmUgPSBmdW5jdGlvbiggKXtcbiAgICAgIGpxdWVyeU1hcC4kZW1kYXRhX2VtX2hlbHAudGV4dCgnJyk7XG4gICAgfTtcblxuICAgIG9uZmFpbCA9IGZ1bmN0aW9uKCBqcVhIUiApe1xuICAgICAgdmFyIGVyclRleHQgPSBcIlNlcnZlciBlcnJvcjogXCIgKyBqcVhIUi5yZXNwb25zZVRleHQ7XG4gICAgICBjb25zb2xlLmVycm9yKGVyclRleHQpO1xuICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfZW1faGVscC50ZXh0KGVyclRleHQpO1xuICAgICAgY2IoIHRydWUgKTtcbiAgICB9O1xuXG4gICAgLy8gZmlsdGVyXG4gICAganF4aHJfZXhwcmVzc2lvbiA9IG9jcHUuY2FsbCgnZm9ybWF0X2V4cHJlc3Npb25fZ3NlYScsIHtcbiAgICAgIG5vcm1hbGl6ZWRfZGdlIDogc3RhdGVNYXAubm9ybWFsaXplX3JzZXFfc2Vzc2lvblxuICAgIH0sIGZ1bmN0aW9uKCBzZXNzaW9uICl7IHN0YXRlTWFwLmV4cHJlc3Npb25fZ3NlYV9zZXNzaW9uID0gc2Vzc2lvbjsgfSlcbiAgICAuZG9uZSggZnVuY3Rpb24oKXtcbiAgICAgIHV0aWwuZGlzcGxheUFzVGFibGUoJ0V4cHJlc3Npb24gZmlsZSAoLnR4dCknLFxuICAgICAgICBzdGF0ZU1hcC5leHByZXNzaW9uX2dzZWFfc2Vzc2lvbixcbiAgICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfcmVzdWx0c19maWxlc19lbV9leHByZXNzaW9uLFxuICAgICAgICBudWxsICk7XG4gICAgfSlcbiAgICAuZmFpbCggb25mYWlsICk7XG5cbiAgICBqcXhocl9waGVub3R5cGUgPSBqcXhocl9leHByZXNzaW9uLnRoZW4oIGZ1bmN0aW9uKCApe1xuICAgICAgcmV0dXJuIG9jcHUucnBjKCdmb3JtYXRfY2xhc3NfZ3NlYScsIHtcbiAgICAgICAgZmlsdGVyZWRfZGdlIDogc3RhdGVNYXAuZmlsdGVyX3JzZXFfc2Vzc2lvbixcbiAgICAgICAgZGVfdGVzdGVkX3R0IDogc3RhdGVNYXAuZGVfdGVzdF9yc2VxX3Nlc3Npb24sXG4gICAgICB9LCBmdW5jdGlvbiggZGF0YSApe1xuICAgICAgICAvL3NvbWUgc3Rvb3BpZCBHU0VBIGZvcm1hdC5cbiAgICAgICAgdmFyIHJ1bm5pbmcgPSBTdHJpbmcoKTtcbiAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKCBsaW5lICl7XG4gICAgICAgICAgcnVubmluZyArPSBsaW5lWzBdICsgJ1xcbic7XG4gICAgICAgIH0pO1xuICAgICAgICBqcXVlcnlNYXAuJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2VtX3BoZW5vdHlwZS5hcHBlbmQoXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1zdWNjZXNzXCI+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4nICtcbiAgICAgICAgICAgICAgJzxoMyBjbGFzcz1cInBhbmVsLXRpdGxlXCI+UGhlbm90eXBlIGZpbGUgKC5jbHMpPC9oMz4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPjxwcmUgY2xhc3M9XCJlbS1jb2RlXCI+JyArIHJ1bm5pbmcgKyAnPC9wcmU+PC9kaXY+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWZvb3RlclwiPicgK1xuICAgICAgICAgICAgICAnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgaHJlZj1cIicgKyB1dGlsLm1ha2VUZXh0RmlsZShydW5uaW5nKSArICdcIiBkb3dubG9hZD1cInBoZW5vdHlwZS5jbHNcIj5Eb3dubG9hZCAoLmNscyk8L2E+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzwvZGl2PidcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgLmRvbmUoIGZ1bmN0aW9uKCl7XG4gICAgICAvLyB1dGlsLmRpc3BsYXlBc1RhYmxlKCdQaGVub3R5cGUgZmlsZSAoLmNscyknLFxuICAgICAgLy8gICBzdGF0ZU1hcC5jbGFzc19nc2VhX3Nlc3Npb24sXG4gICAgICAvLyAgIGpxdWVyeU1hcC4kZW1kYXRhX3Jlc3VsdHNfZmlsZXNfZW1fcGhlbm90eXBlLFxuICAgICAgLy8gICBudWxsICk7XG4gICAgICBjYiggbnVsbCApO1xuICAgIH0pXG4gICAgLmZhaWwoIG9uZmFpbCApO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyogRmV0Y2ggYW5kIGFwcGVuZCB0aGUgdmFyaW91cyBmaWxlcyByZXF1aXJlZCBmb3IgR1NFQVxuICAgKlxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciBvYmplY3QgdGhlIGpxdWVyeSBvYmplY3QgdG8gYXBwZW5kIHRvXG4gICAqIEBwYXJhbSBuZXh0IGZ1bmN0aW9uIGFuIG9wdGlvbmFsIGNhbGxiYWNrXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgZmV0Y2hHU0VBRmlsZXMgPSBmdW5jdGlvbiggJGNvbnRhaW5lciwgbmV4dCApe1xuICAgIHZhclxuICAgIGpxeGhyLFxuICAgIG9uZmFpbCxcbiAgICBvbkRvbmUsXG4gICAgY2IgPSBuZXh0IHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIG9uRG9uZSA9IGZ1bmN0aW9uKCl7XG4gICAgICB1dGlsLmRpc3BsYXlBc1RhYmxlKCdSYW5rIEZpbGUgKC5ybmspJyxcbiAgICAgIHN0YXRlTWFwLnJhbmtfZ3NlYV9zZXNzaW9uLFxuICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfcmVzdWx0c19maWxlc19nc2VhLFxuICAgICAgbnVsbCApO1xuICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfZ3NlYV9oZWxwLnRleHQoJycpO1xuICAgICAgY2IoIGZhbHNlICk7XG4gICAgfTtcblxuICAgIG9uZmFpbCA9IGZ1bmN0aW9uKCBqcVhIUiApe1xuICAgICAgdmFyIGVyclRleHQgPSBcIlNlcnZlciBlcnJvcjogXCIgKyBqcVhIUi5yZXNwb25zZVRleHQ7XG4gICAgICBjb25zb2xlLmVycm9yKGVyclRleHQpO1xuICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfZ3NlYV9oZWxwLnRleHQoZXJyVGV4dCk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgIH07XG5cbiAgICAvLyBmaWx0ZXJcbiAgICBqcXhociA9IG9jcHUuY2FsbCgnZm9ybWF0X3JhbmtzX2dzZWEnLCB7XG4gICAgICBkZV90ZXN0ZWRfdHQgOiBzdGF0ZU1hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvblxuICAgIH0sIGZ1bmN0aW9uKCBzZXNzaW9uICl7IHN0YXRlTWFwLnJhbmtfZ3NlYV9zZXNzaW9uID0gc2Vzc2lvbjsgfSlcbiAgICAuZG9uZSggb25Eb25lIClcbiAgICAuZmFpbCggb25mYWlsICk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuXG4gIC8qIEZldGNoIGFuZCBhcHBlbmQgdGhlIHZhcmlvdXMgZmlsZXMgcmVxdWlyZWRcbiAgICpcbiAgICogQHBhcmFtICRjb250YWluZXIgb2JqZWN0IHRoZSBqcXVlcnkgb2JqZWN0IHRvIGFwcGVuZCB0b1xuICAgKlxuICAgKiBAcmV0dXJuIGJvb2xlYW5cbiAgICovXG4gIGNyZWF0ZURhdGFGaWxlcyA9IGZ1bmN0aW9uKCApe1xuICAgIGZldGNoR1NFQUZpbGVzKCBqcXVlcnlNYXAuJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2dzZWEsIGZ1bmN0aW9uKCBlcnIgKXtcbiAgICAgICAgaWYoIGVyciApeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgZmV0Y2hFTUZpbGVzKCBqcXVlcnlNYXAuJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2VtICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tIEVORCBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQmVnaW4gcHVibGljIG1ldGhvZCAvcmVzZXQvXG4gIC8qIFJldHVybiB0byB0aGUgZ3JvdW5kIHN0YXRlXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgcmVzZXQgPSBmdW5jdGlvbiggKSB7XG4gICAgYWxlcnQoJ3Jlc2V0IGNhbGxlZCcpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvcmVzZXQvXG5cblxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC9jb25maWdNb2R1bGUvXG4gIC8vIEV4YW1wbGUgICA6IHNwYS5jaGF0LmNvbmZpZ01vZHVsZSh7IHNsaWRlcl9vcGVuX2VtIDogMTggfSk7XG4gIC8vIFB1cnBvc2UgICA6IENvbmZpZ3VyZSB0aGUgbW9kdWxlIHByaW9yIHRvIGluaXRpYWxpemF0aW9uXG4gIC8vIEFyZ3VtZW50cyA6XG4gIC8vICAgKiBzZXRfY2hhdF9hbmNob3IgLSBhIGNhbGxiYWNrIHRvIG1vZGlmeSB0aGUgVVJJIGFuY2hvciB0b1xuICAvLyAgICAgaW5kaWNhdGUgb3BlbmVkIG9yIGNsb3NlZCBzdGF0ZS4gVGhpcyBjYWxsYmFjayBtdXN0IHJldHVyblxuICAvLyAgICAgZmFsc2UgaWYgdGhlIHJlcXVlc3RlZCBzdGF0ZSBjYW5ub3QgYmUgbWV0XG4gIC8vICAgKiBjaGF0X21vZGVsIC0gdGhlIGNoYXQgbW9kZWwgb2JqZWN0IHByb3ZpZGVzIG1ldGhvZHNcbiAgLy8gICAgICAgdG8gaW50ZXJhY3Qgd2l0aCBvdXIgaW5zdGFudCBtZXNzYWdpbmdcbiAgLy8gICAqIHBlb3BsZV9tb2RlbCAtIHRoZSBwZW9wbGUgbW9kZWwgb2JqZWN0IHdoaWNoIHByb3ZpZGVzXG4gIC8vICAgICAgIG1ldGhvZHMgdG8gbWFuYWdlIHRoZSBsaXN0IG9mIHBlb3BsZSB0aGUgbW9kZWwgbWFpbnRhaW5zXG4gIC8vICAgKiBzbGlkZXJfKiBzZXR0aW5ncy4gQWxsIHRoZXNlIGFyZSBvcHRpb25hbCBzY2FsYXJzLlxuICAvLyAgICAgICBTZWUgbWFwQ29uZmlnLnNldHRhYmxlX21hcCBmb3IgYSBmdWxsIGxpc3RcbiAgLy8gICAgICAgRXhhbXBsZTogc2xpZGVyX29wZW5fZW0gaXMgdGhlIG9wZW4gaGVpZ2h0IGluIGVtJ3NcbiAgLy8gQWN0aW9uICAgIDpcbiAgLy8gICBUaGUgaW50ZXJuYWwgY29uZmlndXJhdGlvbiBkYXRhIHN0cnVjdHVyZSAoY29uZmlnTWFwKSBpc1xuICAvLyAgIHVwZGF0ZWQgd2l0aCBwcm92aWRlZCBhcmd1bWVudHMuIE5vIG90aGVyIGFjdGlvbnMgYXJlIHRha2VuLlxuICAvLyBSZXR1cm5zICAgOiB0cnVlXG4gIC8vIFRocm93cyAgICA6IEphdmFTY3JpcHQgZXJyb3Igb2JqZWN0IGFuZCBzdGFjayB0cmFjZSBvblxuICAvLyAgICAgICAgICAgICB1bmFjY2VwdGFibGUgb3IgbWlzc2luZyBhcmd1bWVudHNcbiAgLy9cbiAgY29uZmlnTW9kdWxlID0gZnVuY3Rpb24gKCBpbnB1dF9tYXAgKSB7XG4gICAgdXRpbC5zZXRDb25maWdNYXAoe1xuICAgICAgaW5wdXRfbWFwICAgIDogaW5wdXRfbWFwLFxuICAgICAgc2V0dGFibGVfbWFwIDogY29uZmlnTWFwLnNldHRhYmxlX21hcCxcbiAgICAgIGNvbmZpZ19tYXAgICA6IGNvbmZpZ01hcFxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvY29uZmlnTW9kdWxlL1xuXG4gIC8qIGluaXRNb2R1bGVcbiAgICogQHBhcmFtIG9jcHUgKE9iamVjdCkgb2NwdSBzaW5nbGV0b25cbiAgICogQHBhcmFtICRjb250YWluZXIgKE9iamVjdCkgalF1ZXJ5IHBhcmVudFxuICAgKi9cbiAgaW5pdE1vZHVsZSA9IGZ1bmN0aW9uKCAkY29udGFpbmVyLCBtc2dfbWFwICl7XG4gICAgaWYoICEkY29udGFpbmVyICl7XG4gICAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGNvbnRhaW5lcicpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiggJC5pc0VtcHR5T2JqZWN0KCBtc2dfbWFwICkgfHxcbiAgICAgICAhbXNnX21hcC5oYXNPd25Qcm9wZXJ0eSggJ2ZpbHRlcl9yc2VxX3Nlc3Npb24nICkgfHxcbiAgICAgICAhbXNnX21hcC5oYXNPd25Qcm9wZXJ0eSggJ25vcm1hbGl6ZV9yc2VxX3Nlc3Npb24nIHx8XG4gICAgICAgIW1zZ19tYXAuaGFzT3duUHJvcGVydHkoICdkZV90ZXN0X3JzZXFfc2Vzc2lvbicgKSApKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgbXNnX21hcCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAkY29udGFpbmVyLmh0bWwoIGNvbmZpZ01hcC50ZW1wbGF0ZSApO1xuICAgIHNldEpRdWVyeU1hcCggJGNvbnRhaW5lciApO1xuICAgIGpxdWVyeU1hcC4kZW1kYXRhX2NsZWFyLmNsaWNrKCByZXNldCApO1xuXG4gICAgc3RhdGVNYXAuZmlsdGVyX3JzZXFfc2Vzc2lvbiA9IG1zZ19tYXAuZmlsdGVyX3JzZXFfc2Vzc2lvbjtcbiAgICBzdGF0ZU1hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uID0gbXNnX21hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uO1xuICAgIHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uID0gbXNnX21hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvbjtcblxuICAgIC8vIGRvIHN0dWZmXG4gICAgY3JlYXRlRGF0YUZpbGVzKCk7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0TW9kdWxlICAgICAgOiBpbml0TW9kdWxlLFxuICAgIGNvbmZpZ01vZHVsZSAgICA6IGNvbmZpZ01vZHVsZSxcbiAgICByZXNldCAgICAgICAgICAgOiByZXNldFxuICB9O1xuXG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1vZHVsZW5hbWU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHNoZWxsID0gcmVxdWlyZSgnLi9zaGVsbCcpO1xudmFyIGJvb3QgPSByZXF1aXJlKCcuL2Jvb3QnKTtcblxuLypcbiAqIE9wZW5DUFUgaXMgTk9UIGEgY29uc29sZS4uLlxuICogaHR0cHM6Ly93d3cub3BlbmNwdS5vcmcvanNsaWIuaHRtbFxuICpcbiAqICdBbHNvIG5vdGUgdGhhdCBldmVuIHdoZW4gdXNpbmcgQ09SUywgdGhlIG9wZW5jcHUuanMgbGlicmFyeSBzdGlsbCByZXF1aXJlc1xuICogdGhhdCBhbGwgUiBmdW5jdGlvbnMgdXNlZCBieSBhIGNlcnRhaW4gYXBwbGljYXRpb24gYXJlIGNvbnRhaW5lZCBpbiBhIHNpbmdsZVxuICogUiBwYWNrYWdlLiBUaGlzIGlzIG9uIHB1cnBvc2UsIHRvIGZvcmNlIHlvdSB0byBrZWVwIHRoaW5ncyBvcmdhbml6ZWQuIElmXG4gKiB5b3Ugd291bGQgbGlrZSB0byB1c2UgZnVuY3Rpb25hbGl0eSBmcm9tIHZhcmlvdXMgUiBwYWNrYWdlcywgeW91IG5lZWRcbiAqIHRvIGNyZWF0ZSBhbiBSIHBhY2thZ2UgdGhhdCBpbmNsdWRlcyBzb21lIHdyYXBwZXIgZnVuY3Rpb25zIGFuZCBmb3JtYWxseVxuICogZGVjbGFyZXMgaXRzIGRlcGVuZGVuY2llcyBvbiB0aGUgb3RoZXIgcGFja2FnZXMuIFdyaXRpbmcgYW4gUiBwYWNrYWdlIGlzXG4gKiByZWFsbHkgZWFzeSB0aGVzZSBkYXlzLCBzbyB0aGlzIHNob3VsZCBiZSBubyBwcm9ibGVtLidcbiAqL1xuKGZ1bmN0aW9uKCl7XG4gIGJvb3QuaW5pdE1vZHVsZSgpO1xuICAvLyBzaGVsbC5pbml0TW9kdWxlKFwiLy9sb2NhbGhvc3Q6ODc4Ny9vY3B1L2xpYnJhcnkvZW1STkFTZXEvUlwiLCAkKCcjZW0nKSk7XG4gIHNoZWxsLmluaXRNb2R1bGUoXCJcIiwgJCgnI2VtJykpO1xufSgpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xudmFyIG9jcHUgPSByZXF1aXJlKCcuLi9saWIvb3BlbmNwdS5qcy9vcGVuY3B1LTAuNS1ucG0uanMnKTtcblxudmFyIG11bmdlID0gKGZ1bmN0aW9uKCl7XG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHZhclxuICBjb25maWdNYXAgPSB7XG5cbiAgICB0ZW1wbGF0ZSA6IFN0cmluZygpICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiZW0tbXVuZ2VcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgICAnPGgyIGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS0xMCBlbS1zZWN0aW9uLXRpdGxlXCI+RGF0YSBNdW5nZSA8c21hbGw+PC9zbWFsbD48L2gyPicgK1xuICAgICAgICAgICc8aDQgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTJcIj48YSBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1ibG9jayBlbS1tdW5nZS1jbGVhciBjbGVhci1idG4gYWpheC1zZW5zaXRpdmUgY29sLXhzLTMgY29sLW1kLTNcIj5SZXNldDwvYT48L2g0PicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8aHIvPicgK1xuICAgICAgICAnPGZvcm0+JyArXG4gICAgICAgICAgJzxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICc8bGVnZW5kPk1ldGFkYXRhIElucHV0PC9sZWdlbmQ+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLW11bmdlLW1ldGEgcm93XCI+JyArXG4gICAgICAgICAgICAgICc8bGFiZWwgY2xhc3M9XCJjb2wtc20tMiBjb2wtZm9ybS1sYWJlbFwiPkZpbGU8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS0xMFwiPicgK1xuICAgICAgICAgICAgICAgICc8bGFiZWwgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgYnRuLWZpbGUgYnRuLW1kIGJ0bi1ibG9ja1wiIGZvcj1cImVtLW11bmdlLW1ldGEtaW5wdXRcIj5TZWxlY3Q8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cImZpbGVcIiBjbGFzcz1cImZvcm0tY29udHJvbC1maWxlXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiIGlkPVwiZW0tbXVuZ2UtbWV0YS1pbnB1dFwiIC8+JyArXG4gICAgICAgICAgICAgICAgJzxwPjxzbWFsbCBjbGFzcz1cImhlbHAtYmxvY2tcIj48L3NtYWxsPjwvcD4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwIGVtLW11bmdlLW1ldGEtcmVzdWx0c1wiPjwvZGl2PicgK1xuICAgICAgICAgICc8L2ZpZWxkc2V0PicgK1xuXG4gICAgICAgICAgJzxmaWVsZHNldCBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICc8bGVnZW5kPkRhdGEgSW5wdXQ8L2xlZ2VuZD4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tbXVuZ2Utc3BlY2llcyByb3dcIj4nICtcbiAgICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJlbS1tdW5nZS1zcGVjaWVzLWlucHV0XCIgY2xhc3M9XCJjb2wtc20tMiBjb2wtZm9ybS1sYWJlbFwiPlNwZWNpZXMgJm5ic3A8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS0xMFwiPicgK1xuICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIHBsYWNlaG9sZGVyPVwiZS5nLiBcXCdtb3VzZVxcJyAob3B0aW9uYWwpXCI+JyArXG4gICAgICAgICAgICAgICAgJzxwPjxzbWFsbCBjbGFzcz1cImhlbHAtYmxvY2tcIj48L3NtYWxsPjwvcD4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJlbS1tdW5nZS1kYXRhIHJvd1wiPicgK1xuICAgICAgICAgICAgICAnPGxhYmVsIGNsYXNzPVwiY29sLXNtLTIgY29sLWZvcm0tbGFiZWxcIj5GaWxlPC9sYWJlbD4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtc20tMTBcIj4nICtcbiAgICAgICAgICAgICAgICAnPGxhYmVsIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1maWxlIGJ0bi1tZCBidG4tYmxvY2tcIiBmb3I9XCJlbS1tdW5nZS1kYXRhLWlucHV0XCI+U2VsZWN0PC9sYWJlbD4nICtcbiAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJmaWxlXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wtZmlsZVwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBpZD1cImVtLW11bmdlLWRhdGEtaW5wdXRcIiBkaXNhYmxlZCBtdWx0aXBsZSAvPicgK1xuICAgICAgICAgICAgICAgICc8cD48c21hbGwgY2xhc3M9XCJoZWxwLWJsb2NrXCI+PC9zbWFsbD48L3A+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cCBlbS1tdW5nZS1kYXRhLXJlc3VsdHNcIj48L2Rpdj4nICtcbiAgICAgICAgICAnPC9maWVsZHNldD4nICtcbiAgICAgICAgJzwvZm9ybT4nICtcbiAgICAgICc8L2Rpdj4nLFxuXG4gICAgZGVmYXVsdF9tZXRhZGF0YV9oZWxwIDogU3RyaW5nKCkgKyAnVGFiLWRlbGltaXRlZCAoLnR4dCkuIEhlYWRlcnMgZm9yIFxcJ2lkXFwnIChmaWxlbmFtZXMpIGFuZCBcXCdjbGFzc1xcJycsXG4gICAgZGVmYXVsdF9kYXRhX2hlbHAgICAgIDogU3RyaW5nKCkgKyAnVGFiLWRlbGltaXRlZCAoLnR4dCkuIFJvd3MgaW5kaWNhdGUgZ2VuZSBhbmQgY291bnQnLFxuXG4gICAgIGNvZGVfdGVtcGxhdGUgOiBTdHJpbmcoKSArXG4gICAgICAnPHByZSBjbGFzcz1cImVtLWNvZGVcIj48L3ByZT4nLFxuICAgIHNldHRhYmxlX21hcCA6IHt9XG4gIH0sXG5cbiAgc3RhdGVNYXAgPSB7XG4gICAgbWV0YWRhdGFfc2Vzc2lvbiAgICAgICAgOiBudWxsLFxuICAgIG1ldGFkYXRhX2ZpbGUgICAgICAgICAgIDogbnVsbCxcbiAgICBkYXRhX3Nlc3Npb24gICAgICAgICAgICA6IG51bGwsXG4gICAgZGF0YV9maWxlcyAgICAgICAgICAgICAgOiBudWxsXG4gIH0sXG4gIGpxdWVyeU1hcCA9IHt9LFxuICBzZXRKUXVlcnlNYXAsXG4gIGNvbmZpZ01vZHVsZSxcbiAgdG9nZ2xlSW5wdXQsXG4gIHJlc2V0LFxuICBvbk1ldGFGaWxlQ2hhbmdlLFxuICBvbk1ldGFkYXRhUHJvY2Vzc2VkLFxuICBwcm9jZXNzTWV0YUZpbGUsXG4gIG9uRGF0YUZpbGVzQ2hhbmdlLFxuICBvbkRhdGFQcm9jZXNzZWQsXG4gIHByb2Nlc3NEYXRhRmlsZXMsXG4gIGluaXRNb2R1bGU7XG4gIC8vIC0tLS0tLS0tLS0gRU5EIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBET00gTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEJlZ2luIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cbiAgc2V0SlF1ZXJ5TWFwID0gZnVuY3Rpb24oICRjb250YWluZXIgKXtcbiAgICBqcXVlcnlNYXAgPSB7XG4gICAgICAkY29udGFpbmVyICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lcixcbiAgICAgICRtdW5nZSAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZScpLFxuICAgICAgJG11bmdlX2NsZWFyICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLW11bmdlIC5lbS1tdW5nZS1jbGVhcicpLFxuICAgICAgJG11bmdlX21ldGFkYXRhX2lucHV0ICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLW11bmdlIC5lbS1tdW5nZS1tZXRhIGlucHV0JyksXG4gICAgICAkbXVuZ2VfbWV0YWRhdGFfbGFiZWwgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLW1ldGEgbGFiZWwnKSxcbiAgICAgICRtdW5nZV9tZXRhZGF0YV9oZWxwICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtbWV0YSAuaGVscC1ibG9jaycpLFxuICAgICAgJG11bmdlX21ldGFkYXRhX3Jlc3VsdHMgICA6ICRjb250YWluZXIuZmluZCgnLmVtLW11bmdlIC5lbS1tdW5nZS1tZXRhLXJlc3VsdHMnKSxcbiAgICAgICRtdW5nZV9zcGVjX2lucHV0ICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2Utc3BlY2llcyBpbnB1dCcpLFxuICAgICAgJG11bmdlX2RhdGFfaW5wdXQgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLW11bmdlIC5lbS1tdW5nZS1kYXRhIGlucHV0JyksXG4gICAgICAkbXVuZ2VfZGF0YV9sYWJlbCAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLWRhdGEgbGFiZWwnKSxcbiAgICAgICRtdW5nZV9kYXRhX2hlbHAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtZGF0YSAuaGVscC1ibG9jaycpLFxuICAgICAgJG11bmdlX2RhdGFfcmVzdWx0cyAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLW11bmdlIC5lbS1tdW5nZS1kYXRhLXJlc3VsdHMnKVxuICAgIH07XG4gIH07XG4gIC8vIEVuZCBET00gbWV0aG9kIC9zZXRKUXVlcnlNYXAvXG5cbiAgLy8gQmVnaW4gRE9NIG1ldGhvZCAvcHJvY2Vzc01ldGFGaWxlL1xuICBwcm9jZXNzTWV0YUZpbGUgPSBmdW5jdGlvbiggZGF0YSwgY2IgKXtcbiAgICBpZiggIWRhdGEuaGFzT3duUHJvcGVydHkoJ2ZpbGVzJykgfHwgIWRhdGEuZmlsZXMubGVuZ3RoICl7XG4gICAgICBhbGVydCgnTm8gZmlsZSBzZWxlY3RlZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZU1hcC5tZXRhZGF0YV9maWxlID0gZGF0YS5maWxlc1swXTtcblxuICAgIC8vcGVyZm9ybSB0aGUgcmVxdWVzdFxuICAgIHZhciBqcXhociA9IG9jcHUuY2FsbCgnY3JlYXRlX21ldGEnLCB7XG4gICAgICBtZXRhZGF0YV9maWxlIDogc3RhdGVNYXAubWV0YWRhdGFfZmlsZVxuICAgIH0sIGZ1bmN0aW9uKHNlc3Npb24pe1xuICAgICAgc3RhdGVNYXAubWV0YWRhdGFfc2Vzc2lvbiA9IHNlc3Npb247ICAgIFxuICAgIH0pO1xuXG4gICAganF4aHIuZG9uZShmdW5jdGlvbigpe1xuICAgICAgLy9jbGVhciBhbnkgcHJldmlvdXMgaGVscCBtZXNzYWdlc1xuICAgICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9oZWxwLnRleHQoIHN0YXRlTWFwLm1ldGFkYXRhX2ZpbGUubmFtZSApO1xuICAgICAgY2IoIG51bGwsIHN0YXRlTWFwLm1ldGFkYXRhX3Nlc3Npb24gKTtcbiAgICB9KTtcblxuICAgIGpxeGhyLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgIHZhciBlcnJUZXh0ID0gXCJTZXJ2ZXIgZXJyb3I6IFwiICsganF4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgY29uc29sZS5lcnJvcihlcnJUZXh0KTtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfaGVscC50ZXh0KGVyclRleHQpO1xuICAgICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9yZXN1bHRzLmVtcHR5KCk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBET00gbWV0aG9kIC9wcm9jZXNzTWV0YUZpbGUvXG5cbiAgLy8gQmVnaW4gRE9NIG1ldGhvZCAvcHJvY2Vzc0RhdGFGaWxlcy9cbiAgcHJvY2Vzc0RhdGFGaWxlcyA9IGZ1bmN0aW9uKCBkYXRhLCBjYiApe1xuXG4gICAgaWYoICFkYXRhLmhhc093blByb3BlcnR5KCdzcGVjaWVzJykgfHxcbiAgICAgICAgIWRhdGEuaGFzT3duUHJvcGVydHkoJ2ZpbGVzJykgfHxcbiAgICAgICAgIWRhdGEuZmlsZXMubGVuZ3RoICl7XG4gICAgICBhbGVydCgnTm8gZmlsZShzKSBzZWxlY3RlZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiggIXN0YXRlTWFwLm1ldGFkYXRhX2ZpbGUgKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgbG9hZCBtZXRhZGF0YS4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZU1hcC5kYXRhX2ZpbGVzID0gZGF0YS5maWxlcztcblxuICAgIC8vIG9wZW5jcHUgb25seSBhY2NlcHRzIHNpbmdsZSBmaWxlcyBhcyBhcmd1bWVudHNcbiAgICB2YXIgYXJncyA9IHtcbiAgICAgIG1ldGFkYXRhX2ZpbGUgICA6IHN0YXRlTWFwLm1ldGFkYXRhX2ZpbGUsXG4gICAgICBzcGVjaWVzICAgICAgICAgOiBkYXRhLnNwZWNpZXNcbiAgICB9O1xuXG4gICAgLy8gbG9vcCB0aHJvdWdoIGZpbGVzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGF0ZU1hcC5kYXRhX2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBmaWxlID0gc3RhdGVNYXAuZGF0YV9maWxlcy5pdGVtKGkpO1xuICAgICAgICBhcmdzWydmaWxlJyArIGldID0gZmlsZTtcbiAgICB9XG5cbiAgICAvL3BlcmZvcm0gdGhlIHJlcXVlc3RcbiAgICB2YXIganF4aHIgPSBvY3B1LmNhbGwoJ21lcmdlX2RhdGEnLFxuICAgICAgYXJncyxcbiAgICAgIGZ1bmN0aW9uKHNlc3Npb24pe1xuICAgICAgICBzdGF0ZU1hcC5kYXRhX3Nlc3Npb24gPSBzZXNzaW9uO1xuICAgICAgICB1dGlsLmRpc3BsYXlBc1ByaW50KCdSZXN1bHRzJyxcbiAgICAgICAgICBzdGF0ZU1hcC5kYXRhX3Nlc3Npb24sXG4gICAgICAgICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX3Jlc3VsdHMpO1xuICAgIH0pO1xuXG4gICAganF4aHIuZG9uZShmdW5jdGlvbigpe1xuICAgICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX2hlbHAudGV4dCgnRmlsZXMgbWVyZ2VkOiAnICsgc3RhdGVNYXAuZGF0YV9maWxlcy5sZW5ndGgpO1xuICAgICAgY2IoIG51bGwsIHN0YXRlTWFwLmRhdGFfc2Vzc2lvbiApO1xuICAgIH0pO1xuXG4gICAganF4aHIuZmFpbChmdW5jdGlvbigpe1xuICAgICAgdmFyIGVyclRleHQgPSBcIlNlcnZlciBlcnJvcjogXCIgKyBqcXhoci5yZXNwb25zZVRleHQ7XG4gICAgICBjb25zb2xlLmVycm9yKGVyclRleHQpO1xuICAgICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX2hlbHAudGV4dChlcnJUZXh0KTtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9yZXN1bHRzLmVtcHR5KCk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBET00gbWV0aG9kIC9wcm9jZXNzRGF0YUZpbGVzL1xuICAvLyAtLS0tLS0tLS0tIEVORCBET00gTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25NZXRhRmlsZUNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyXG4gICAgc2VsZiA9ICQodGhpcyksXG4gICAgZGF0YSA9IHtcbiAgICAgIGZpbGVzICAgOiBzZWxmWzBdLmZpbGVzLFxuICAgIH07XG4gICAgcmV0dXJuIHByb2Nlc3NNZXRhRmlsZSggZGF0YSwgb25NZXRhZGF0YVByb2Nlc3NlZCApO1xuICB9O1xuXG4gIG9uTWV0YWRhdGFQcm9jZXNzZWQgPSBmdW5jdGlvbiggZXJyLCBzZXNzaW9uICl7XG4gICAgaWYoIGVyciApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdXRpbC5kaXNwbGF5QXNUYWJsZSgnUmVzdWx0cycsXG4gICAgICBzZXNzaW9uLFxuICAgICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9yZXN1bHRzLFxuICAgICAgZnVuY3Rpb24oIGVyciApe1xuICAgICAgICBpZiggZXJyICkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgdG9nZ2xlSW5wdXQoICdkYXRhJywgdHJ1ZSApO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgb25EYXRhRmlsZXNDaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIHZhciBzZWxmID0gJCh0aGlzKSxcbiAgICBkYXRhID0ge1xuICAgICAgZmlsZXMgICA6IHNlbGZbMF0uZmlsZXMsXG4gICAgICBzcGVjaWVzIDoganF1ZXJ5TWFwLiRtdW5nZV9zcGVjX2lucHV0LnZhbCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpIHx8IG51bGxcbiAgICB9O1xuICAgIHJldHVybiBwcm9jZXNzRGF0YUZpbGVzKCBkYXRhLCBvbkRhdGFQcm9jZXNzZWQgKTtcbiAgfTtcblxuICBvbkRhdGFQcm9jZXNzZWQgPSBmdW5jdGlvbiggZXJyLCBzZXNzaW9uICl7XG4gICAgaWYoIGVyciApeyByZXR1cm4gZmFsc2U7IH1cbiAgICB1dGlsLmRpc3BsYXlBc1ByaW50KCdSZXN1bHRzJyxcbiAgICAgc2Vzc2lvbixcbiAgICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX3Jlc3VsdHMsXG4gICAgIGZ1bmN0aW9uKCBlcnIgKSB7XG4gICAgICAgIGlmICggZXJyICkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgdG9nZ2xlSW5wdXQoICdtZXRhZGF0YScsIGZhbHNlICk7XG4gICAgICAgIHRvZ2dsZUlucHV0KCAnZGF0YScsIGZhbHNlICk7XG5cbiAgICAgICAgLy9NYWtlIHRoZSBkYXRhIGF2YWlsYWJsZVxuICAgICAgICAkLmdldmVudC5wdWJsaXNoKFxuICAgICAgICAgICdlbS1tdW5nZS1kYXRhJyxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRhZGF0YV9zZXNzaW9uIDogc3RhdGVNYXAubWV0YWRhdGFfc2Vzc2lvbixcbiAgICAgICAgICAgIGRhdGFfc2Vzc2lvbiAgICAgOiBzdGF0ZU1hcC5kYXRhX3Nlc3Npb25cbiAgICAgICAgICB9XG4gICAgICAgICApO1xuICAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLy8gLS0tLS0tLS0tLSBFTkQgRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEJlZ2luIHB1YmxpYyBtZXRob2QgL3RvZ2dsZUlucHV0L1xuICAvKiBUb2dnbGUgdGhlIGlucHV0IGF2YWlsYmlsaXR5IGZvciBhIG1hdGNoZWQgZWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0gbGFiZWwgdGhlIHN0YXRlTWFwIGtleSB0byBzZXRcbiAgICogQHBhcmFtIGRvX2VuYWJsZSBib29sZWFuIHRydWUgaWYgZW5hYmxlLCBmYWxzZSB0byBkaXNhYmxlXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgdG9nZ2xlSW5wdXQgPSBmdW5jdGlvbiggbGFiZWwsIGRvX2VuYWJsZSApIHtcbiAgICB2YXIgJGhhbmRsZXMgPSBsYWJlbCA9PT0gJ2RhdGEnID9cbiAgICAgIFsganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX2xhYmVsLFxuICAgICAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfaW5wdXQsXG4gICAgICAgIGpxdWVyeU1hcC4kbXVuZ2Vfc3BlY19pbnB1dCBdIDpcbiAgICAgIFsganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9sYWJlbCxcbiAgICAgICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9pbnB1dCBdO1xuXG4gICAgJC5lYWNoKCAkaGFuZGxlcywgZnVuY3Rpb24oIGluZGV4LCB2YWx1ZSApe1xuICAgICAgdmFsdWUuYXR0cignZGlzYWJsZWQnLCAhZG9fZW5hYmxlICk7XG4gICAgICB2YWx1ZS5hdHRyKCdkaXNhYmxlZCcsICFkb19lbmFibGUgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvdG9nZ2xlSW5wdXQvXG5cbiAgLy8gQmVnaW4gcHVibGljIG1ldGhvZCAvcmVzZXQvXG4gIC8qIFJldHVybiB0byB0aGUgZ3JvdW5kIHN0YXRlXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgcmVzZXQgPSBmdW5jdGlvbiggKSB7XG4gICAgLy8gTXVzdCBkbyB0aGlzIG1hbnVhbGx5XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9pbnB1dC52YWwoXCJcIik7XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9oZWxwLnRleHQoY29uZmlnTWFwLmRlZmF1bHRfbWV0YWRhdGFfaGVscCk7XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9yZXN1bHRzLmVtcHR5KCk7XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9zcGVjX2lucHV0LnZhbChcIlwiKTtcbiAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfaW5wdXQudmFsKFwiXCIpO1xuICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9oZWxwLnRleHQoY29uZmlnTWFwLmRlZmF1bHRfZGF0YV9oZWxwKTtcbiAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfcmVzdWx0cy5lbXB0eSgpO1xuXG4gICAgLy8gbXVzdCBjbGVhciBvdXQgc3RhdGVNYXAgcmVmZXJlbmNlc1xuICAgIHN0YXRlTWFwLm1ldGFkYXRhX3Nlc3Npb24gPSBudWxsO1xuICAgIHN0YXRlTWFwLm1ldGFkYXRhX2ZpbGUgICAgPSBudWxsO1xuICAgIHN0YXRlTWFwLmRhdGFfc2Vzc2lvbiAgICAgPSBudWxsO1xuICAgIHN0YXRlTWFwLmRhdGFfZmlsZXMgICAgICAgPSBudWxsO1xuXG4gICAgLy8gcmVzZXQgaW5wdXRcbiAgICB0b2dnbGVJbnB1dCggJ21ldGFkYXRhJywgdHJ1ZSApO1xuICAgIHRvZ2dsZUlucHV0KCAnZGF0YScsIGZhbHNlICk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBwdWJsaWMgbWV0aG9kIC9yZXNldC9cblxuXG4gIC8vIEJlZ2luIHB1YmxpYyBtZXRob2QgL2NvbmZpZ01vZHVsZS9cbiAgLyogVGhlIGludGVybmFsIGNvbmZpZ3VyYXRpb24gZGF0YSBzdHJ1Y3R1cmUgKGNvbmZpZ01hcCkgaXNcbiAgICogdXBkYXRlZCB3aXRoIHByb3ZpZGVkIGFyZ3VtZW50cy4gTm8gb3RoZXIgYWN0aW9ucyBhcmUgdGFrZW4uXG4gICAqXG4gICAqIEByZXR1cm4gdHJ1ZSBpZiB1cGRhdGVkIHN1Y2Nlc3NmdWxseVxuICAgKi9cbiAgY29uZmlnTW9kdWxlID0gZnVuY3Rpb24gKCBpbnB1dF9tYXAgKSB7XG4gICAgdXRpbC5zZXRDb25maWdNYXAoe1xuICAgICAgaW5wdXRfbWFwICAgIDogaW5wdXRfbWFwLFxuICAgICAgc2V0dGFibGVfbWFwIDogY29uZmlnTWFwLnNldHRhYmxlX21hcCxcbiAgICAgIGNvbmZpZ19tYXAgICA6IGNvbmZpZ01hcFxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvY29uZmlnTW9kdWxlL1xuXG4gIC8qIGluaXRNb2R1bGVcbiAgICogQHBhcmFtIG9jcHUgKE9iamVjdCkgb2NwdSBzaW5nbGV0b25cbiAgICogQHBhcmFtICRjb250YWluZXIgKE9iamVjdCkgalF1ZXJ5IHBhcmVudFxuICAgKi9cbiAgaW5pdE1vZHVsZSA9IGZ1bmN0aW9uKCAkY29udGFpbmVyICl7XG4gICAgaWYoICEkY29udGFpbmVyICl7XG4gICAgICBjb25zb2xlLmVycm9yKCAnTWlzc2luZyBjb250YWluZXInICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgJGNvbnRhaW5lci5odG1sKCBjb25maWdNYXAudGVtcGxhdGUgKTtcbiAgICBzZXRKUXVlcnlNYXAoICRjb250YWluZXIgKTtcblxuICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfaGVscC50ZXh0KCBjb25maWdNYXAuZGVmYXVsdF9tZXRhZGF0YV9oZWxwICk7XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX2hlbHAudGV4dCggY29uZmlnTWFwLmRlZmF1bHRfZGF0YV9oZWxwICk7XG5cbiAgICAvLyBiaW5kIGZpbGUgY2hhbmdlIEhBTkRMRVJTXG4gICAganF1ZXJ5TWFwLiRtdW5nZV9tZXRhZGF0YV9pbnB1dC5jaGFuZ2UoIG9uTWV0YUZpbGVDaGFuZ2UgKTtcbiAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfaW5wdXQuY2hhbmdlKCBvbkRhdGFGaWxlc0NoYW5nZSApO1xuICAgIHRvZ2dsZUlucHV0KCAnbWV0YWRhdGEnLCB0cnVlICk7XG4gICAgdG9nZ2xlSW5wdXQoICdkYXRhJywgZmFsc2UgKTtcblxuICAgIGpxdWVyeU1hcC4kbXVuZ2VfY2xlYXIuY2xpY2soIHJlc2V0ICk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLy8gLS0tLS0tLS0tLSBFTkQgUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZXR1cm4ge1xuICAgIGluaXRNb2R1bGUgICAgICA6IGluaXRNb2R1bGUsXG4gICAgY29uZmlnTW9kdWxlICAgIDogY29uZmlnTW9kdWxlLFxuICAgIHJlc2V0ICAgICAgICAgICA6IHJlc2V0XG4gIH07XG5cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbXVuZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcbnZhciBvY3B1ID0gcmVxdWlyZSgnLi4vbGliL29wZW5jcHUuanMvb3BlbmNwdS0wLjUtbnBtLmpzJyk7XG5cbnZhciBwcm9jZXNzX3JzZXEgPSAoZnVuY3Rpb24oKXtcbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHZhclxuICBjb25maWdNYXAgPSB7XG4gICAgYW5jaG9yX3NjaGVtYV9tYXAgOiB7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZSA6IFN0cmluZygpICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiZW0tcHJvY2Vzc19yc2VxXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwicm93XCI+JyArXG4gICAgICAgICAgJzxoMiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tMTAgZW0tc2VjdGlvbi10aXRsZVwiPlJOQSBTZXF1ZW5jaW5nIEFuYWx5c2lzIDxzbWFsbD48L3NtYWxsPjwvaDI+JyArXG4gICAgICAgICAgJzxoNCBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tMlwiPjxhIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLWJsb2NrIGVtLXByb2Nlc3NfcnNlcS1jbGVhciBjbGVhci1idG4gYWpheC1zZW5zaXRpdmUgY29sLXhzLTMgY29sLW1kLTNcIj5SZXNldDwvYT48L2g0PicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8aHIvPicgK1xuICAgICAgICAnPGZvcm0gY2xhc3M9XCJmb3JtLWhvcml6b250YWwgZW0tcHJvY2Vzc19yc2VxLWNsYXNzXCI+JyArXG4gICAgICAgICAgJzxmaWVsZHNldD4nICtcbiAgICAgICAgICAgICc8bGVnZW5kPkRpZmZlcmVudGlhbCBFeHByZXNzaW9uIFRlc3Rpbmc8L2xlZ2VuZD4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgICAnPGxhYmVsIGZvcj1cImVtLXByb2Nlc3NfcnNlcS1jbGFzcy10ZXN0XCIgY2xhc3M9XCJjb2wtc20tMiBjb250cm9sLWxhYmVsXCI+VGVzdCBDbGFzczwvbGFiZWw+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLXNtLTEwXCI+JyArXG4gICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJlbS1wcm9jZXNzX3JzZXEtY2xhc3MtdGVzdFwiIHBsYWNlaG9sZGVyPVwiVGVzdFwiPicgK1xuICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJlbS1wcm9jZXNzX3JzZXEtY2xhc3MtYmFzZWxpbmVcIiBjbGFzcz1cImNvbC1zbS0yIGNvbnRyb2wtbGFiZWxcIj5CYXNlbGluZTwvbGFiZWw+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLXNtLTEwXCI+JyArXG4gICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJlbS1wcm9jZXNzX3JzZXEtY2xhc3MtYmFzZWxpbmVcIiBwbGFjZWhvbGRlcj1cIkJhc2VsaW5lXCI+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS1vZmZzZXQtMiBjb2wtc20tMTBcIj4nICtcbiAgICAgICAgICAgICAgICAnPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgYnRuLWJsb2NrIGVtLXByb2Nlc3NfcnNlcS1jbGFzcy1zdWJtaXRcIj5TdWJtaXQ8L2J1dHRvbj4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxwPjxzbWFsbCBjbGFzcz1cImNvbC1zbS1vZmZzZXQtMiBoZWxwLWJsb2NrXCI+PC9zbWFsbD48L3A+JyArXG4gICAgICAgICAgJzwvZmllbGRzZXQ+JyArXG4gICAgICAgICc8L2Zvcm0+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHNcIj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtc20tb2Zmc2V0LTIgY29sLXNtLTEwXCI+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MgZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMtcHJvZ3Jlc3NcIj4nICtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItZGFuZ2VyXCIgc3R5bGU9XCJ3aWR0aDogNTAlO1wiPicgK1xuICAgICAgICAgICAgICAgICAgJzxzcGFuPkZpbHRlcmluZzwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLXByaW1hcnlcIiBzdHlsZT1cIndpZHRoOiAyNSU7XCI+JyArXG4gICAgICAgICAgICAgICAgICAnPHNwYW4+Tm9ybWFsaXppbmc8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1zdWNjZXNzXCIgc3R5bGU9XCJ3aWR0aDogMjUlO1wiPicgK1xuICAgICAgICAgICAgICAgICAgJzxzcGFuPlRlc3Rpbmc8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMtZGV0ZXN0XCI+PC9kaXY+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJlbS1wcm9jZXNzX3JzZXEtcmVzdWx0cy1kZXBsb3QgcnBsb3RcIj48L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgJzwvZGl2PicsXG5cbiAgICBzZXR0YWJsZV9tYXAgOiB7fVxuICB9LFxuICBzdGF0ZU1hcCA9IHtcbiAgICBtZXRhZGF0YV9zZXNzaW9uICAgICAgICA6IG51bGwsXG4gICAgZGF0YV9zZXNzaW9uICAgICAgICAgICAgOiBudWxsLFxuICAgIGZpbHRlcl9yc2VxX3Nlc3Npb24gICAgIDogbnVsbCxcbiAgICBub3JtYWxpemVfcnNlcV9zZXNzaW9uICA6IG51bGwsXG4gICAgZGVfdGVzdF9yc2VxX3Nlc3Npb24gICAgOiBudWxsLFxuICAgIGNsYXNzZXMgICAgICAgICAgICAgICAgIDogW10sXG4gICAgdGVzdF9jbGFzcyAgICAgICAgICAgICAgOiBudWxsLFxuICAgIGJhc2VsaW5lX2NsYXNzICAgICAgICAgIDogbnVsbFxuICB9LFxuICBqcXVlcnlNYXAgPSB7fSxcbiAgcmVzZXQsXG4gIHNldEpRdWVyeU1hcCxcbiAgY29uZmlnTW9kdWxlLFxuICBvblN1Ym1pdENsYXNzLFxuICBwcm9jZXNzUk5BU2VxLFxuICBvblJOQVNlcVByb2Nlc3NlZCxcbiAgdG9nZ2xlSW5wdXQsXG4gIGluaXRNb2R1bGU7XG4gIC8vIC0tLS0tLS0tLS0gRU5EIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgLy8gLS0tLS0tLS0tLSBCZWdpbiBVVElMSVRZIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIC0tLS0tLS0tLS0gRW5kIFVUSUxJVFkgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBET00gTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEJlZ2luIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cbiAgc2V0SlF1ZXJ5TWFwID0gZnVuY3Rpb24oICRjb250YWluZXIgKXtcbiAgICBqcXVlcnlNYXAgPSB7XG4gICAgICAkY29udGFpbmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIsXG4gICAgICAkZW1fcHJvY2Vzc19yc2VxX2NsZWFyICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXByb2Nlc3NfcnNlcSAuZW0tcHJvY2Vzc19yc2VxLWNsZWFyJyksXG4gICAgICAkZW1fcHJvY2Vzc19yc2VxX2NsYXNzX3Rlc3RfaW5wdXQgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXByb2Nlc3NfcnNlcSAuZW0tcHJvY2Vzc19yc2VxLWNsYXNzICNlbS1wcm9jZXNzX3JzZXEtY2xhc3MtdGVzdCcpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19iYXNlbGluZV9pbnB1dCAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1jbGFzcyAjZW0tcHJvY2Vzc19yc2VxLWNsYXNzLWJhc2VsaW5lJyksXG4gICAgICAkZW1fcHJvY2Vzc19yc2VxX2NsYXNzX2Zvcm0gICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXByb2Nlc3NfcnNlcSAuZW0tcHJvY2Vzc19yc2VxLWNsYXNzJyksXG4gICAgICAkZW1fcHJvY2Vzc19yc2VxX2NsYXNzX3N1Ym1pdCAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXByb2Nlc3NfcnNlcSAuZW0tcHJvY2Vzc19yc2VxLWNsYXNzIC5lbS1wcm9jZXNzX3JzZXEtY2xhc3Mtc3VibWl0JyksXG4gICAgICAkZW1fcHJvY2Vzc19yc2VxX2NsYXNzX2hlbHAgICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXByb2Nlc3NfcnNlcSAuaGVscC1ibG9jaycpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX2RldGVzdCAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzIC5lbS1wcm9jZXNzX3JzZXEtcmVzdWx0cy1kZXRlc3QnKSxcbiAgICAgICRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19kZXBsb3QgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tcHJvY2Vzc19yc2VxIC5lbS1wcm9jZXNzX3JzZXEtcmVzdWx0cyAuZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMtZGVwbG90JyksXG4gICAgICAkZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfcHJvZ3Jlc3MgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXByb2Nlc3NfcnNlcSAuZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMgLmVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzLXByb2dyZXNzJylcbiAgICB9O1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvc2V0SlF1ZXJ5TWFwL1xuXG4gIC8vIEJlZ2luIERPTSBtZXRob2QgL3Byb2Nlc3NSTkFTZXEvXG4gIHByb2Nlc3NSTkFTZXEgPSBmdW5jdGlvbiggYmFzZWxpbmUsIHRlc3QsIGNiICl7XG5cbiAgICB2YXJcbiAgICBqcXhocl9maWx0ZXIsXG4gICAganF4aHJfbm9ybWFsaXplLFxuICAgIGpxeGhyX3Rlc3QsXG4gICAgb25mYWlsLFxuICAgIG9uRG9uZTtcblxuICAgIG9uRG9uZSA9IGZ1bmN0aW9uKCBuICl7XG4gICAgICB2YXIgJGJhciA9IGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfcHJvZ3Jlc3MuZmluZCggJy5wcm9ncmVzcy1iYXI6bnRoLWNoaWxkKCcgKyBuICsgJyknICk7XG4gICAgICAgICRiYXIudG9nZ2xlKCB0cnVlICk7XG4gICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19oZWxwLnRleHQoJycpO1xuICAgIH07XG5cbiAgICBvbmZhaWwgPSBmdW5jdGlvbigganFYSFIgKXtcbiAgICAgIHZhciBlcnJUZXh0ID0gXCJTZXJ2ZXIgZXJyb3I6IFwiICsganFYSFIucmVzcG9uc2VUZXh0O1xuICAgICAgY29uc29sZS5lcnJvcihlcnJUZXh0KTtcbiAgICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX2hlbHAudGV4dChlcnJUZXh0KTtcbiAgICAgIGNiKCB0cnVlICk7XG4gICAgfTtcblxuICAgIC8vIGZpbHRlclxuICAgIGpxeGhyX2ZpbHRlciA9IG9jcHUuY2FsbCgnZmlsdGVyX3JzZXEnLCB7XG4gICAgICBzZSAgICAgICAgICA6IHN0YXRlTWFwLmRhdGFfc2Vzc2lvbixcbiAgICAgIGJhc2VsaW5lICAgIDogYmFzZWxpbmUsXG4gICAgICB0ZXN0ICAgICAgICA6IHRlc3QsXG4gICAgICBtaW5fY291bnRzICA6IDFcbiAgICB9LCBmdW5jdGlvbiggc2Vzc2lvbiApeyBzdGF0ZU1hcC5maWx0ZXJfcnNlcV9zZXNzaW9uID0gc2Vzc2lvbjsgfSlcbiAgICAuZG9uZShmdW5jdGlvbigpeyBvbkRvbmUoIDEgKTsgfSlcbiAgICAuZmFpbCggb25mYWlsICk7XG5cbiAgICBqcXhocl9ub3JtYWxpemUgPSBqcXhocl9maWx0ZXIudGhlbiggZnVuY3Rpb24oICl7XG4gICAgICByZXR1cm4gb2NwdS5jYWxsKCdub3JtYWxpemVfcnNlcScsIHtcbiAgICAgICAgZmlsdGVyZWRfZGdlICA6IHN0YXRlTWFwLmZpbHRlcl9yc2VxX3Nlc3Npb25cbiAgICAgIH0sIGZ1bmN0aW9uKCBzZXNzaW9uICl7IHN0YXRlTWFwLm5vcm1hbGl6ZV9yc2VxX3Nlc3Npb24gPSBzZXNzaW9uOyB9KTtcbiAgICB9KVxuICAgIC5kb25lKCBmdW5jdGlvbigpeyBvbkRvbmUoIDIgKTsgfSApXG4gICAgLmZhaWwoIG9uZmFpbCApO1xuXG4gICAganF4aHJfdGVzdCA9IGpxeGhyX25vcm1hbGl6ZS50aGVuKCBmdW5jdGlvbiggKXtcbiAgICAgIHJldHVybiBvY3B1LmNhbGwoJ2RlX3Rlc3RfcnNlcScsIHtcbiAgICAgICAgbm9ybWFsaXplZF9kZ2UgIDogc3RhdGVNYXAubm9ybWFsaXplX3JzZXFfc2Vzc2lvbixcbiAgICAgICAgYmFzZWxpbmUgICAgICAgIDogYmFzZWxpbmUsXG4gICAgICAgIHRlc3QgICAgICAgICAgICA6IHRlc3RcbiAgICAgIH0sIGZ1bmN0aW9uKCBzZXNzaW9uICl7IHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uID0gc2Vzc2lvbjsgfSk7XG4gICAgfSlcbiAgICAuZG9uZSggZnVuY3Rpb24oKXtcbiAgICAgIG9uRG9uZSggMyApO1xuICAgICAgdG9nZ2xlSW5wdXQoICdjbGFzcycsIGZhbHNlICk7XG4gICAgICBjYiggbnVsbCwgc3RhdGVNYXAuZGVfdGVzdF9yc2VxX3Nlc3Npb24gKTtcbiAgICB9KVxuICAgIC5mYWlsKCBvbmZhaWwgKTtcbiAgICAvLyB0ZXN0XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL3Byb2Nlc3NSTkFTZXEvXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvblN1Ym1pdENsYXNzID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfaGVscC50ZXh0KFwiXCIpO1xuXG4gICAgdmFyXG4gICAgICBwcm9wb3NlZF90ZXN0X2NsYXNzID0ganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfdGVzdF9pbnB1dC52YWwoKSxcbiAgICAgIHByb3Bvc2VkX2Jhc2VsaW5lX2NsYXNzID0ganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfYmFzZWxpbmVfaW5wdXQudmFsKCksXG4gICAgICBpc09LID0gKCBzdGF0ZU1hcC5jbGFzc2VzLmluZGV4T2YocHJvcG9zZWRfdGVzdF9jbGFzcykgPiAtMSAmJlxuICAgICAgIHN0YXRlTWFwLmNsYXNzZXMuaW5kZXhPZihwcm9wb3NlZF9iYXNlbGluZV9jbGFzcykgPiAtMSApO1xuXG4gICAgICBpZiggIWlzT0sgKSB7XG4gICAgICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX2hlbHBcbiAgICAgICAgICAudGV4dChbJ0ludmFsaWQgY2xhc3MgZGVjbGFyYXRpb25zOiAnLFxuICAgICAgICAgICAgICAgIHByb3Bvc2VkX3Rlc3RfY2xhc3MsXG4gICAgICAgICAgICAgICAgcHJvcG9zZWRfYmFzZWxpbmVfY2xhc3NdLmpvaW4oJyAnKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19wcm9ncmVzc1xuICAgICAgICAudG9nZ2xlKCB0cnVlICk7XG5cbiAgICAgIHJldHVybiBwcm9jZXNzUk5BU2VxKCBwcm9wb3NlZF9iYXNlbGluZV9jbGFzcyxcbiAgICAgICAgcHJvcG9zZWRfdGVzdF9jbGFzcyxcbiAgICAgICAgb25STkFTZXFQcm9jZXNzZWQgKTtcbiAgfTtcblxuXG5cbiAgb25STkFTZXFQcm9jZXNzZWQgPSBmdW5jdGlvbiggZXJyLCBkZV90ZXN0X3JzZXFfc2Vzc2lvbiApe1xuICAgIGlmKCBlcnIgKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgdmFyXG4gICAgbmFtZSA9ICdwbG90X2RlJyxcbiAgICBhcmdzID0ge1xuICAgICAgICBmaWx0ZXJlZF9kZ2UgIDogc3RhdGVNYXAuZmlsdGVyX3JzZXFfc2Vzc2lvbixcbiAgICAgICAgZGVfdGVzdGVkX3R0ICA6IHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uLFxuICAgICAgICBiYXNlbGluZSAgICAgIDogc3RhdGVNYXAuYmFzZWxpbmVfY2xhc3MsXG4gICAgICAgIHRlc3QgICAgICAgICAgOiBzdGF0ZU1hcC50ZXN0X2NsYXNzLFxuICAgICAgICB0aHJlc2hvbGQgICAgIDogMC4wNVxuICAgICAgfTtcblxuICAgIHV0aWwuZGlzcGxheUFzUHJpbnQoICdERSBUZXN0aW5nIFJlc3VsdHMnLFxuICAgICAgZGVfdGVzdF9yc2VxX3Nlc3Npb24sXG4gICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX2RldGVzdCxcbiAgICAgIGZ1bmN0aW9uKCBlcnIgKXtcbiAgICAgICAgaWYoIGVyciApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgLy9NYWtlIHRoZSBkYXRhIGF2YWlsYWJsZVxuICAgICAgICB1dGlsLmdyYXBoaWNSKCAnREUgR2VuZXMnLFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgYXJncyxcbiAgICAgICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX2RlcGxvdCxcbiAgICAgICAgICBmdW5jdGlvbiggZXJyICl7XG4gICAgICAgICAgICBpZiggZXJyICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICAgICAgICAgLy9NYWtlIHRoZSBkYXRhIGF2YWlsYWJsZVxuICAgICAgICAgICAgJC5nZXZlbnQucHVibGlzaChcbiAgICAgICAgICAgICAgJ2VtLXByb2Nlc3NfcnNlcScsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJfcnNlcV9zZXNzaW9uICAgICA6IHN0YXRlTWFwLmZpbHRlcl9yc2VxX3Nlc3Npb24sXG4gICAgICAgICAgICAgICAgbm9ybWFsaXplX3JzZXFfc2Vzc2lvbiAgOiBzdGF0ZU1hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uLFxuICAgICAgICAgICAgICAgIGRlX3Rlc3RfcnNlcV9zZXNzaW9uICAgIDogc3RhdGVNYXAuZGVfdGVzdF9yc2VxX3Nlc3Npb25cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC90b2dnbGVJbnB1dC9cbiAgLyogVG9nZ2xlIHRoZSBpbnB1dCBhdmFpbGJpbGl0eSBmb3IgYSBtYXRjaGVkIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtIGxhYmVsIHRoZSBzdGF0ZU1hcCBrZXkgdG8gc2V0XG4gICAqIEBwYXJhbSBkb19lbmFibGUgYm9vbGVhbiB0cnVlIGlmIGVuYWJsZSwgZmFsc2UgdG8gZGlzYWJsZVxuICAgKlxuICAgKiBAcmV0dXJuIGJvb2xlYW5cbiAgICovXG4gIHRvZ2dsZUlucHV0ID0gZnVuY3Rpb24oIGxhYmVsLCBkb19lbmFibGUgKSB7XG4gICAgdmFyICRoYW5kbGVzID0gbGFiZWwgPT09ICdjbGFzcycgP1xuICAgICAgWyBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc190ZXN0X2lucHV0LFxuICAgICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19iYXNlbGluZV9pbnB1dCxcbiAgICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3Nfc3VibWl0IF0gOlxuICAgICAgW107XG5cbiAgICAkLmVhY2goICRoYW5kbGVzLCBmdW5jdGlvbiggaW5kZXgsIHZhbHVlICl7XG4gICAgICB2YWx1ZS5hdHRyKCdkaXNhYmxlZCcsICFkb19lbmFibGUgKTtcbiAgICAgIHZhbHVlLmF0dHIoJ2Rpc2FibGVkJywgIWRvX2VuYWJsZSApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBwdWJsaWMgbWV0aG9kIC90b2dnbGVJbnB1dC9cblxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC9yZXNldC9cbiAgLyogUmV0dXJuIHRvIHRoZSBncm91bmQgc3RhdGVcbiAgICpcbiAgICogQHJldHVybiBib29sZWFuXG4gICAqL1xuICByZXNldCA9IGZ1bmN0aW9uKCApIHtcblxuICAgIHN0YXRlTWFwLmZpbHRlcl9yc2VxX3Nlc3Npb24gICAgPSBudWxsO1xuICAgIHN0YXRlTWFwLm5vcm1hbGl6ZV9yc2VxX3Nlc3Npb24gPSBudWxsO1xuICAgIHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uICAgPSBudWxsO1xuICAgIHN0YXRlTWFwLnRlc3RfY2xhc3MgICAgICAgICAgICAgPSBudWxsO1xuICAgIHN0YXRlTWFwLmJhc2VsaW5lX2NsYXNzICAgICAgICAgPSBudWxsO1xuXG4gICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19wcm9ncmVzcy5maW5kKCAnLnByb2dyZXNzLWJhcicgKS50b2dnbGUoIGZhbHNlICk7XG4gICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19wcm9ncmVzcy50b2dnbGUoIGZhbHNlICk7XG5cbiAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX2RldGVzdC5lbXB0eSgpO1xuICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfZGVwbG90LmVtcHR5KCk7XG5cbiAgICB0b2dnbGVJbnB1dCggJ2NsYXNzJywgdHJ1ZSApO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBwdWJsaWMgbWV0aG9kIC9yZXNldC9cblxuXG4gIC8vIEJlZ2luIHB1YmxpYyBtZXRob2QgL2NvbmZpZ01vZHVsZS9cbiAgLy8gRXhhbXBsZSAgIDogc3BhLmNoYXQuY29uZmlnTW9kdWxlKHsgc2xpZGVyX29wZW5fZW0gOiAxOCB9KTtcbiAgLy8gUHVycG9zZSAgIDogQ29uZmlndXJlIHRoZSBtb2R1bGUgcHJpb3IgdG8gaW5pdGlhbGl6YXRpb25cbiAgLy8gQXJndW1lbnRzIDpcbiAgLy8gICAqIHNldF9jaGF0X2FuY2hvciAtIGEgY2FsbGJhY2sgdG8gbW9kaWZ5IHRoZSBVUkkgYW5jaG9yIHRvXG4gIC8vICAgICBpbmRpY2F0ZSBvcGVuZWQgb3IgY2xvc2VkIHN0YXRlLiBUaGlzIGNhbGxiYWNrIG11c3QgcmV0dXJuXG4gIC8vICAgICBmYWxzZSBpZiB0aGUgcmVxdWVzdGVkIHN0YXRlIGNhbm5vdCBiZSBtZXRcbiAgLy8gICAqIGNoYXRfbW9kZWwgLSB0aGUgY2hhdCBtb2RlbCBvYmplY3QgcHJvdmlkZXMgbWV0aG9kc1xuICAvLyAgICAgICB0byBpbnRlcmFjdCB3aXRoIG91ciBpbnN0YW50IG1lc3NhZ2luZ1xuICAvLyAgICogcGVvcGxlX21vZGVsIC0gdGhlIHBlb3BsZSBtb2RlbCBvYmplY3Qgd2hpY2ggcHJvdmlkZXNcbiAgLy8gICAgICAgbWV0aG9kcyB0byBtYW5hZ2UgdGhlIGxpc3Qgb2YgcGVvcGxlIHRoZSBtb2RlbCBtYWludGFpbnNcbiAgLy8gICAqIHNsaWRlcl8qIHNldHRpbmdzLiBBbGwgdGhlc2UgYXJlIG9wdGlvbmFsIHNjYWxhcnMuXG4gIC8vICAgICAgIFNlZSBtYXBDb25maWcuc2V0dGFibGVfbWFwIGZvciBhIGZ1bGwgbGlzdFxuICAvLyAgICAgICBFeGFtcGxlOiBzbGlkZXJfb3Blbl9lbSBpcyB0aGUgb3BlbiBoZWlnaHQgaW4gZW0nc1xuICAvLyBBY3Rpb24gICAgOlxuICAvLyAgIFRoZSBpbnRlcm5hbCBjb25maWd1cmF0aW9uIGRhdGEgc3RydWN0dXJlIChjb25maWdNYXApIGlzXG4gIC8vICAgdXBkYXRlZCB3aXRoIHByb3ZpZGVkIGFyZ3VtZW50cy4gTm8gb3RoZXIgYWN0aW9ucyBhcmUgdGFrZW4uXG4gIC8vIFJldHVybnMgICA6IHRydWVcbiAgLy8gVGhyb3dzICAgIDogSmF2YVNjcmlwdCBlcnJvciBvYmplY3QgYW5kIHN0YWNrIHRyYWNlIG9uXG4gIC8vICAgICAgICAgICAgIHVuYWNjZXB0YWJsZSBvciBtaXNzaW5nIGFyZ3VtZW50c1xuICAvL1xuICBjb25maWdNb2R1bGUgPSBmdW5jdGlvbiAoIGlucHV0X21hcCApIHtcbiAgICB1dGlsLnNldENvbmZpZ01hcCh7XG4gICAgICBpbnB1dF9tYXAgICAgOiBpbnB1dF9tYXAsXG4gICAgICBzZXR0YWJsZV9tYXAgOiBjb25maWdNYXAuc2V0dGFibGVfbWFwLFxuICAgICAgY29uZmlnX21hcCAgIDogY29uZmlnTWFwXG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBwdWJsaWMgbWV0aG9kIC9jb25maWdNb2R1bGUvXG5cbiAgLyogaW5pdE1vZHVsZVxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciAoT2JqZWN0KSBqUXVlcnkgcGFyZW50XG4gICAqIEBwYXJhbSBtc2dfbWFwIE9iamVjdCB0aGUgcGFyZW50IHNlc3Npb25cbiAgICovXG4gIGluaXRNb2R1bGUgPSBmdW5jdGlvbiggJGNvbnRhaW5lciwgbXNnX21hcCApe1xuICAgIGlmKCAhJGNvbnRhaW5lciApe1xuICAgICAgY29uc29sZS5lcnJvcignTWlzc2luZyBjb250YWluZXInKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYoICQuaXNFbXB0eU9iamVjdCggbXNnX21hcCApIHx8XG4gICAgICAgIW1zZ19tYXAuaGFzT3duUHJvcGVydHkoICdtZXRhZGF0YV9zZXNzaW9uJyApIHx8XG4gICAgICAgIW1zZ19tYXAuaGFzT3duUHJvcGVydHkoICdkYXRhX3Nlc3Npb24nICkpe1xuICAgICAgY29uc29sZS5lcnJvcignTWlzc2luZyBtc2dfbWFwJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgICRjb250YWluZXIuaHRtbCggY29uZmlnTWFwLnRlbXBsYXRlICk7XG5cbiAgICBzZXRKUXVlcnlNYXAoICRjb250YWluZXIgKTtcbiAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX3Byb2dyZXNzLmZpbmQoICcucHJvZ3Jlc3MtYmFyJyApLnRvZ2dsZSggZmFsc2UgKTtcbiAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX3Byb2dyZXNzLnRvZ2dsZSggZmFsc2UgKTtcblxuICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsZWFyLmNsaWNrKCByZXNldCApO1xuXG4gICAgc3RhdGVNYXAubWV0YWRhdGFfc2Vzc2lvbiA9IG1zZ19tYXAubWV0YWRhdGFfc2Vzc2lvbjtcbiAgICBzdGF0ZU1hcC5kYXRhX3Nlc3Npb24gPSBtc2dfbWFwLmRhdGFfc2Vzc2lvbjtcblxuICAgIC8vIHBvcHVsYXRlIHRoZSBjb21wYXJpc29ucyBieSBkZWZhdWx0XG4gICAgc3RhdGVNYXAubWV0YWRhdGFfc2Vzc2lvbi5nZXRPYmplY3QoZnVuY3Rpb24oIGRhdGEgKXtcbiAgICAgIGlmKCAhZGF0YS5sZW5ndGggKXsgcmV0dXJuOyB9XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGFbMF0pO1xuICAgICAgdmFyIGNsYXNzZXMgPSBkYXRhLm1hcChmdW5jdGlvbiggdmFsICl7IHJldHVybiB2YWxba2V5c1sxXV07IH0pO1xuXG4gICAgICAvLyBTZXQgdGhlIGNsYXNzZXMgaW50aGUgc3RhdGVNYXBcbiAgICAgIHZhciB1bmlxdWUgPSB1dGlsLnVuaXF1ZSggY2xhc3NlcyApO1xuICAgICAgaWYoIHVuaXF1ZS5sZW5ndGggIT09IDIgKXtcbiAgICAgICAgY29uc29sZS5lcnJvciggJ1RoZXJlIGFyZSBub3QgZXhhY3RseSAyIGNsYXNzZXMnICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgc3RhdGVNYXAuY2xhc3NlcyA9IHVuaXF1ZTtcbiAgICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX3Rlc3RfaW5wdXRcbiAgICAgICAgLmF0dHIoICdwbGFjZWhvbGRlcicsIHN0YXRlTWFwLmNsYXNzZXNbMF0gKVxuICAgICAgICAudmFsKCBzdGF0ZU1hcC5jbGFzc2VzWzBdICk7XG4gICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19iYXNlbGluZV9pbnB1dFxuICAgICAgICAuYXR0ciggJ3BsYWNlaG9sZGVyJywgc3RhdGVNYXAuY2xhc3Nlc1sxXSApXG4gICAgICAgIC52YWwoIHN0YXRlTWFwLmNsYXNzZXNbMV0gKTtcbiAgICB9KTtcblxuICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX2Zvcm0uc3VibWl0KCBvblN1Ym1pdENsYXNzICk7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0TW9kdWxlICAgICAgOiBpbml0TW9kdWxlLFxuICAgIGNvbmZpZ01vZHVsZSAgICA6IGNvbmZpZ01vZHVsZSxcbiAgICByZXNldCAgICAgICAgICAgOiByZXNldFxuICB9O1xuXG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2Nlc3NfcnNlcTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xudmFyIG11bmdlID0gcmVxdWlyZSgnLi9tdW5nZS5qcycpO1xudmFyIHByb2Nlc3NfcnNlcSA9IHJlcXVpcmUoJy4vcHJvY2Vzc19yc2VxLmpzJyk7XG52YXIgZW1kYXRhID0gcmVxdWlyZSgnLi9lbWRhdGEuanMnKTtcbnZhciBvY3B1ID0gcmVxdWlyZSgnLi4vbGliL29wZW5jcHUuanMvb3BlbmNwdS0wLjUtbnBtLmpzJyk7XG5cbi8vaW5pdCB0aGlzIHNjcmlwdCB3aGVuIHRoZSBwYWdlIGhhcyBsb2FkZWRcbnZhciBzaGVsbCA9IChmdW5jdGlvbigpe1xuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB2YXJcbiAgY29uZmlnTWFwID0ge1xuICAgIGFuY2hvcl9zY2hlbWFfbWFwIDoge1xuICAgICAgbWV0YWRhdGEgIDogeyBlbmFibGVkOiB0cnVlLCBkaXNhYmxlZDogdHJ1ZSB9LFxuICAgICAgZGF0YSAgICAgIDogeyBlbmFibGVkOiB0cnVlLCBkaXNhYmxlZDogdHJ1ZSB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZSA6IFN0cmluZygpICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiY29udGFpbmVyIGVtLXNoZWxsXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tc2hlbGwtbXVuZ2VcIj48L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJlbS1zaGVsbC1wcm9jZXNzX3JzZXFcIj48L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJlbS1zaGVsbC1lbWRhdGFcIj48L2Rpdj4nICtcbiAgICAgICc8L2Rpdj4nXG4gIH0sXG4gIC8vIHN0YXRlTWFwID0ge30sXG4gIGpxdWVyeU1hcCA9IHt9LFxuICBzZXRKUXVlcnlNYXAsXG4gIGNsZWFySW5wdXQsXG4gIGluaXRNb2R1bGU7XG4gIC8vIC0tLS0tLS0tLS0gRU5EIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBVVElMSVRZIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIC0tLS0tLS0tLS0gRU5EIFVUSUxJVFkgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBET00gTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEJlZ2luIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cbiAgc2V0SlF1ZXJ5TWFwID0gZnVuY3Rpb24oICRjb250YWluZXIgKXtcbiAgICBqcXVlcnlNYXAgPSB7XG4gICAgICAkY29udGFpbmVyICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lcixcbiAgICAgICRzaGVsbCAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1zaGVsbCcpLFxuICAgICAgJG11bmdlX2NvbnRhaW5lciAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXNoZWxsIC5lbS1zaGVsbC1tdW5nZScpLFxuICAgICAgJHByb2Nlc3NfcnNlcV9jb250YWluZXIgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXNoZWxsIC5lbS1zaGVsbC1wcm9jZXNzX3JzZXEnKSxcbiAgICAgICRlbWRhdGFfY29udGFpbmVyICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1zaGVsbCAuZW0tc2hlbGwtZW1kYXRhJylcbiAgICB9O1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvc2V0SlF1ZXJ5TWFwL1xuXG4gIC8vIEJlZ2luIERPTSBtZXRob2QgL2NsZWFySW5wdXQvXG4gIC8qIENsZWFycyB0aGUgaW5wdXQgYW5kIHJlc2V0cyB0aGUgc3RhdGUgdG8gZ3JvdW5kIHplcm9cbiAgICpcbiAgICogQHJldHVybiAgYm9vbGVhbiBXaGV0aGVyIHRoZSBhbmNob3IgcG9ydGlvbiBjb3VsZCBiZSB1cGRhdGVkXG4gICAqL1xuICBjbGVhcklucHV0ID0gZnVuY3Rpb24oICl7XG4gICAgcmV0dXJuIG11bmdlLnJlc2V0KCApO1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvY2xlYXJJbnB1dC9cbiAgLy8gLS0tLS0tLS0tLSBFTkQgRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIC0tLS0tLS0tLS0gRU5EIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBDQUxMQkFDS1MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIENBTExCQUNLUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLyogaW5pdE1vZHVsZVxuICAgKiBAcGFyYW0gcGF0aCAoU3RyaW5nKSBwYXRoXG4gICAqIEBwYXJhbSAkY29udGFpbmVyIChPYmplY3QpIGpRdWVyeSBwYXJlbnRcbiAgICovXG4gIGluaXRNb2R1bGUgPSBmdW5jdGlvbihwYXRoLCAkY29udGFpbmVyKXtcbiAgICBpZighb2NwdSl7IGFsZXJ0KCdzZXJ2ZXIgZXJyb3InKTsgcmV0dXJuOyB9XG4gICAgaWYocGF0aCl7XG4gICAgICBjb25zb2xlLmluZm8oJ3NldHRpbmcgcGF0aCAlcycsIHBhdGgpO1xuICAgICAgb2NwdS5zZXR1cmwocGF0aCk7XG4gICAgfVxuICAgICRjb250YWluZXIuaHRtbCggY29uZmlnTWFwLnRlbXBsYXRlICk7XG4gICAgc2V0SlF1ZXJ5TWFwKCAkY29udGFpbmVyICk7XG5cbiAgICAvLyBjb25maWd1cmUgYW5kIGluaXRpYWxpemUgZmVhdHVyZSBtb2R1bGVzXG4gICAgJC5nZXZlbnQuc3Vic2NyaWJlKFxuICAgICAganF1ZXJ5TWFwLiRwcm9jZXNzX3JzZXFfY29udGFpbmVyLFxuICAgICAgJ2VtLW11bmdlLWRhdGEnLFxuICAgICAgZnVuY3Rpb24gKCBldmVudCwgbXNnX21hcCApIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdlbS1tdW5nZS1kYXRhJywgdXRpbC5zZXJpYWxpemUobXNnX21hcCkgKTtcbiAgICAgICAgcHJvY2Vzc19yc2VxLmNvbmZpZ01vZHVsZSh7fSk7XG4gICAgICAgIHByb2Nlc3NfcnNlcS5pbml0TW9kdWxlKCBqcXVlcnlNYXAuJHByb2Nlc3NfcnNlcV9jb250YWluZXIsIG1zZ19tYXAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgICAkLmdldmVudC5zdWJzY3JpYmUoXG4gICAgICBqcXVlcnlNYXAuJGVtZGF0YV9jb250YWluZXIsXG4gICAgICAnZW0tcHJvY2Vzc19yc2VxJyxcbiAgICAgIGZ1bmN0aW9uICggZXZlbnQsIG1zZ19tYXAgKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZW0tcHJvY2Vzc19yc2VxJywgdXRpbC5zZXJpYWxpemUobXNnX21hcCkgKTtcbiAgICAgICAgZW1kYXRhLmNvbmZpZ01vZHVsZSh7fSk7XG4gICAgICAgIGVtZGF0YS5pbml0TW9kdWxlKCBqcXVlcnlNYXAuJGVtZGF0YV9jb250YWluZXIsIG1zZ19tYXAgICk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIG11bmdlLmNvbmZpZ01vZHVsZSh7fSk7XG4gICAgbXVuZ2UuaW5pdE1vZHVsZSgganF1ZXJ5TWFwLiRtdW5nZV9jb250YWluZXIgKTtcbiAgICAvLyB2YXIgbXNnX21hcCA9IHV0aWwuZGVzZXJpYWxpemVTZXNzaW9uRGF0YSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oICdlbS1tdW5nZS1kYXRhJyApICk7XG4gICAgLy8gcHJvY2Vzc19yc2VxLmNvbmZpZ01vZHVsZSh7fSk7XG4gICAgLy8gcHJvY2Vzc19yc2VxLmluaXRNb2R1bGUoIGpxdWVyeU1hcC4kcHJvY2Vzc19yc2VxX2NvbnRhaW5lciwgbXNnX21hcCApO1xuICAgIC8vIHZhciBtc2dfbWFwID0gdXRpbC5kZXNlcmlhbGl6ZVNlc3Npb25EYXRhKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSggJ2VtLXByb2Nlc3NfcnNlcScgKSApO1xuICAgIC8vIGVtZGF0YS5jb25maWdNb2R1bGUoe30pO1xuICAgIC8vIGVtZGF0YS5pbml0TW9kdWxlKCBqcXVlcnlNYXAuJGVtZGF0YV9jb250YWluZXIsIG1zZ19tYXAgICk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLy8gLS0tLS0tLS0tLSBFTkQgUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZXR1cm4ge1xuICAgIGluaXRNb2R1bGUgICAgOiBpbml0TW9kdWxlXG4gIH07XG5cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2hlbGw7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgb2NwdSA9IHJlcXVpcmUoJy4uL2xpYi9vcGVuY3B1LmpzL29wZW5jcHUtMC41LW5wbS5qcycpO1xuXG4vL1Nob3cgYW5kIGhpZGUgdGhlIHNwaW5uZXIgZm9yIGFsbCBhamF4IHJlcXVlc3RzLlxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICB2YXIgbWFrZUVycm9yLCBzZXRDb25maWdNYXAsXG4gICBzZXJpYWxpemUsXG4gICBkZXNlcmlhbGl6ZVNlc3Npb25EYXRhLFxuICAgZGlzcGxheUFzUHJpbnQsXG4gICBkaXNwbGF5QXNUYWJsZSxcbiAgIGdyYXBoaWNSLFxuICAgbWFrZVRleHRGaWxlLFxuICAgdW5pcXVlO1xuXG4gIC8qIEJlZ2luIFB1YmxpYyBtZXRob2QgL3NlcmlhbGl6ZS9cbiAgICogQSBjb252ZW5pZW5jZSB3cmFwcGVyIHRvIGNyZWF0ZSBhIHNlcmlhbGl6ZWQgdmVyc2lvbiBvZiBkYXRhXG4gICAqXG4gICAqIEBwYXJhbSBvYmplY3QgYSBzZXJpYWxpemVhYmxlIG9iamVjdFxuICAgKlxuICAgKiBAcmV0dXJuIHN0cmluZyByZXByZXNlbnRhdGlvbiBkYXRhXG4gICAqIEB0aHJvd3MgSmF2YVNjcmlwdCBlcnJvciBvYmplY3QgYW5kIHN0YWNrIHRyYWNlIG9uIHVuYWNjZXB0YWJsZSBhcmd1bWVudHNcbiAgICovXG4gIHNlcmlhbGl6ZSA9IGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICB2YXIgc2VyaWFsaXplZDtcbiAgICB0cnkge1xuICAgICAgICBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoIGRhdGEgKTtcbiAgICB9IGNhdGNoKCBlICkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgICByZXR1cm4gc2VyaWFsaXplZDtcbiAgfTtcbiAgLy8gRW5kIFB1YmxpYyBtZXRob2QgL3NlcmlhbGl6ZS9cblxuICAvKiBCZWdpbiBQdWJsaWMgbWV0aG9kIC9kZXNlcmlhbGl6ZVNlc3Npb25EYXRhL1xuICAgKiBBIGNvbnZlbmllbmNlIHdyYXBwZXIgdG8gY3JlYXRlIGEgU2Vzc2lvbnMgZnJvbSBzZXJpYWxpemVkXG4gICAqIGRhdGEuIEVhY2ggb2JqZWN0IHZhbHVlIG11c3QgYmUgYSBTZXNzaW9uXG4gICAqXG4gICAqIEBwYXJhbSBzdHJpbmcgYSBzZXJpYWxpemVkIHJlcHJlc2VudGF0aW9uXG4gICAqXG4gICAqIEByZXR1cm4gYW4gb2JqZWN0IHdpdGggU2Vzc2lvbiB2YWx1ZXMgcmVzdG9yZWRcbiAgICogQHRocm93cyBKYXZhU2NyaXB0IGVycm9yIG9iamVjdCBhbmQgc3RhY2sgdHJhY2Ugb24gdW5hY2NlcHRhYmxlIGFyZ3VtZW50c1xuICAgKi9cbiAgZGVzZXJpYWxpemVTZXNzaW9uRGF0YSA9IGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICB2YXIgZGVzZXJpYWxpemVkID0ge307XG4gICAgdHJ5IHtcbiAgICAgIHZhciByYXcgPSBKU09OLnBhcnNlKCBkYXRhICk7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyggcmF3IClcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgICAgICAgICBkZXNlcmlhbGl6ZWRbIGtleSBdID0gbmV3IG9jcHUuU2Vzc2lvbiggcmF3W2tleV0ubG9jLCByYXdba2V5XS5rZXksIHJhd1trZXldLnR4dCApO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCggZSApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlc2VyaWFsaXplZDtcbiAgfTtcbiAgLy8gRW5kIFB1YmxpYyBtZXRob2QgL2Rlc2VyaWFsaXplU2Vzc2lvbkRhdGEvXG5cbiAgLy8gQmVnaW4gUHVibGljIGNvbnN0cnVjdG9yIC9tYWtlRXJyb3IvXG4gIC8vIFB1cnBvc2U6IGEgY29udmVuaWVuY2Ugd3JhcHBlciB0byBjcmVhdGUgYW4gZXJyb3Igb2JqZWN0XG4gIC8vIEFyZ3VtZW50czpcbiAgLy8gICAqIG5hbWVfdGV4dCAtIHRoZSBlcnJvciBuYW1lXG4gIC8vICAgKiBtc2dfdGV4dCAgLSBsb25nIGVycm9yIG1lc3NhZ2VcbiAgLy8gICAqIGRhdGEgICAgICAtIG9wdGlvbmFsIGRhdGEgYXR0YWNoZWQgdG8gZXJyb3Igb2JqZWN0XG4gIC8vIFJldHVybnMgIDogbmV3bHkgY29uc3RydWN0ZWQgZXJyb3Igb2JqZWN0XG4gIC8vIFRocm93cyAgIDogbm9uZVxuICAvL1xuICBtYWtlRXJyb3IgPSBmdW5jdGlvbiAoIG5hbWVfdGV4dCwgbXNnX3RleHQsIGRhdGEgKSB7XG4gICAgdmFyIGVycm9yICAgICA9IG5ldyBFcnJvcigpO1xuICAgIGVycm9yLm5hbWUgICAgPSBuYW1lX3RleHQ7XG4gICAgZXJyb3IubWVzc2FnZSA9IG1zZ190ZXh0O1xuXG4gICAgaWYgKCBkYXRhICl7IGVycm9yLmRhdGEgPSBkYXRhOyB9XG5cbiAgICByZXR1cm4gZXJyb3I7XG4gIH07XG4gIC8vIEVuZCBQdWJsaWMgY29uc3RydWN0b3IgL21ha2VFcnJvci9cblxuICAvLyBCZWdpbiBQdWJsaWMgbWV0aG9kIC9zZXRDb25maWdNYXAvXG4gIC8vIFB1cnBvc2U6IENvbW1vbiBjb2RlIHRvIHNldCBjb25maWdzIGluIGZlYXR1cmUgbW9kdWxlc1xuICAvLyBBcmd1bWVudHM6XG4gIC8vICAgKiBpbnB1dF9tYXAgICAgLSBtYXAgb2Yga2V5LXZhbHVlcyB0byBzZXQgaW4gY29uZmlnXG4gIC8vICAgKiBzZXR0YWJsZV9tYXAgLSBtYXAgb2YgYWxsb3dhYmxlIGtleXMgdG8gc2V0XG4gIC8vICAgKiBjb25maWdfbWFwICAgLSBtYXAgdG8gYXBwbHkgc2V0dGluZ3MgdG9cbiAgLy8gUmV0dXJuczogdHJ1ZVxuICAvLyBUaHJvd3MgOiBFeGNlcHRpb24gaWYgaW5wdXQga2V5IG5vdCBhbGxvd2VkXG4gIC8vXG4gIHNldENvbmZpZ01hcCA9IGZ1bmN0aW9uICggYXJnX21hcCApe1xuICAgIHZhclxuICAgICAgaW5wdXRfbWFwICAgID0gYXJnX21hcC5pbnB1dF9tYXAsXG4gICAgICBzZXR0YWJsZV9tYXAgPSBhcmdfbWFwLnNldHRhYmxlX21hcCxcbiAgICAgIGNvbmZpZ19tYXAgICA9IGFyZ19tYXAuY29uZmlnX21hcCxcbiAgICAgIGtleV9uYW1lLCBlcnJvcjtcblxuICAgIGZvciAoIGtleV9uYW1lIGluIGlucHV0X21hcCApe1xuICAgICAgaWYgKCBpbnB1dF9tYXAuaGFzT3duUHJvcGVydHkoIGtleV9uYW1lICkgKXtcbiAgICAgICAgaWYgKCBzZXR0YWJsZV9tYXAuaGFzT3duUHJvcGVydHkoIGtleV9uYW1lICkgKXtcbiAgICAgICAgICBjb25maWdfbWFwW2tleV9uYW1lXSA9IGlucHV0X21hcFtrZXlfbmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZXJyb3IgPSBtYWtlRXJyb3IoICdCYWQgSW5wdXQnLFxuICAgICAgICAgICAgJ1NldHRpbmcgY29uZmlnIGtleSB8JyArIGtleV9uYW1lICsgJ3wgaXMgbm90IHN1cHBvcnRlZCdcbiAgICAgICAgICApO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuICAvLyBFbmQgUHVibGljIG1ldGhvZCAvc2V0Q29uZmlnTWFwL1xuXG4gIC8qIEJlZ2luIFB1YmxpYyBtZXRob2QgL2Rpc3BsYXlBc1ByaW50L1xuICAgKiBBIGNvbnZlbmllbmNlIHdyYXBwZXIgdG8gZGlzcGxheSB0aGUgUiBvYmplY3QgdGV4dCBkZXNjcmlwdGlvbiBpbiBhXG4gICAqIEJvb3RzdHJhcCBwYW5lbC4gQWxzbyBwcm92aWRlcyBsaW5rIHRvIGRvd25sb2FkIG9iamVjdCBhcyAucmRzIGZpbGUuXG4gICAqXG4gICAqIEBwYXJhbSB0ZXh0IHNvbWUgZGVzY3JpcHRpdmUgdGV4dCBmb3IgdGhlIGhlYWRlclxuICAgKiBAcGFyYW0gc2Vzc2lvbiBUaGUgb2NwdSBTZXNzaW9uXG4gICAqIEBwYXJhbSAkY29udGFpbmVyIGpRdWVyeSBvYmplY3QgdG8gcGxhY2UgcGFuZWwgaW5zaWRlIHdpdGggdGV4dFxuICAgKiBAcGFyYW0gbmV4dCB0aGUgb3B0aW9uYWwgY2FsbGJhY2tcbiAgICovXG4gIGRpc3BsYXlBc1ByaW50ID0gZnVuY3Rpb24odGV4dCwgc2Vzc2lvbiwgJGNvbnRhaW5lciwgbmV4dCApe1xuICAgIHZhciB1cmwgPSBzZXNzaW9uLmdldExvYygpICsgJ1IvLnZhbC9wcmludCc7XG4gICAgdmFyIGNiID0gbmV4dCB8fCBmdW5jdGlvbigpe307XG5cbiAgICAkLmdldCh1cmwsIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgLy8gRE9NIG1hbmlwdWxhdGlvbnNcbiAgICAgIHZhciAkY29kZSA9ICQoJzxwcmUgY2xhc3M9XCJlbS1jb2RlXCI+PC9wcmU+Jyk7XG4gICAgICAkY29kZS5odG1sKGRhdGEpO1xuICAgICAgdmFyICRwYW5lbCA9ICQoJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1zdWNjZXNzXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICc8aDMgY2xhc3M9XCJwYW5lbC10aXRsZVwiPjwvaDM+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5IGZpeGVkLXBhbmVsXCI+PC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtZm9vdGVyXCI+PC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAnPC9kaXY+Jyk7XG4gICAgICAkcGFuZWwuZmluZCgnLnBhbmVsLXRpdGxlJykudGV4dCh0ZXh0KTtcbiAgICAgICRwYW5lbC5maW5kKCcucGFuZWwtYm9keScpLmFwcGVuZCgkY29kZSk7XG4gICAgICAkcGFuZWwuZmluZCgnLnBhbmVsLWZvb3RlcicpLmFwcGVuZCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgaHJlZj1cIicgK1xuICAgICAgIHNlc3Npb24uZ2V0TG9jKCkgKyAnUi8udmFsL3Jkc1wiPkRvd25sb2FkICgucmRzKTwvYT4nKTtcbiAgICAgICRjb250YWluZXIuZW1wdHkoKTtcbiAgICAgICRjb250YWluZXIuYXBwZW5kKCRwYW5lbCk7XG4gICAgfSlcbiAgICAuZG9uZSggZnVuY3Rpb24oKXsgY2IoIG51bGwgKTsgfSApXG4gICAgLmZhaWwoIGZ1bmN0aW9uKCl7IGNiKCB0cnVlICk7IH0gKTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL2Rpc3BsYXlBc1ByaW50L1xuXG4gIC8qIEJlZ2luIFB1YmxpYyBtZXRob2QgL2Rpc3BsYXlBc1RhYmxlL1xuICAgKiBBIGNvbnZlbmllbmNlIHdyYXBwZXIgdG8gZGlzcGxheSB0aGUgUiBvYmplY3QgdGV4dCBkZXNjcmlwdGlvbiBhcyBhXG4gICAqIHRhYmxlIGluc2lkZSBhIEJvb3N0cmFwIHBhbmVsLlxuICAgKiBBbHNvIHByb3ZpZGVzIGxpbmsgdG8gZG93bmxvYWQgb2JqZWN0IGFzIC5yZHMgZmlsZS5cbiAgICpcbiAgICogQHBhcmFtIHRleHQgc29tZSBkZXNjcmlwdGl2ZSB0ZXh0IGZvciB0aGUgaGVhZGVyXG4gICAqIEBwYXJhbSBzZXNzaW9uIFRoZSBvY3B1IFNlc3Npb25cbiAgICogQHBhcmFtICRjb250YWluZXIgalF1ZXJ5IG9iamVjdCB0byBwbGFjZSBwYW5lbCBpbnNpZGUgd2l0aCB0ZXh0XG4gICAqIEBwYXJhbSBuZXh0IHRoZSBvcHRpb25hbCBjYWxsYmFja1xuICAgKi9cblxuICBkaXNwbGF5QXNUYWJsZSA9IGZ1bmN0aW9uKCB0ZXh0LCBzZXNzaW9uLCAkY29udGFpbmVyLCBuZXh0ICl7XG4gICAgdmFyIGNiID0gbmV4dCB8fCBmdW5jdGlvbigpe307XG4gICAgc2Vzc2lvbi5nZXRPYmplY3QoZnVuY3Rpb24oZGF0YSl7XG4gICAgICBpZighZGF0YS5sZW5ndGgpeyByZXR1cm47IH1cblxuICAgICAgLy8gRGF0YSBtYW5pcHVsYXRpb25zXG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGFbMF0pO1xuICAgICAgdmFyIGhlYWRlcnMgPSBrZXlzLm1hcChmdW5jdGlvbih2KXtcbiAgICAgICAgcmV0dXJuICc8dGg+JyArIHYgKyAnPC90aD4nO1xuICAgICAgfSk7XG4gICAgICB2YXIgYW9Db2x1bW5zID0ga2V5cy5tYXAoZnVuY3Rpb24odil7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgIFwibURhdGFQcm9wXCI6IHZcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBET00gbWFuaXB1bGF0aW9uc1xuICAgICAgdmFyICR0YWJsZSA9ICQoJzxkaXYgY2xhc3M9XCJ0YWJsZS1yZXNwb25zaXZlXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgJzx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWNvbmRlbnNlZCB0YWJsZS1zdHJpcGVkIHRhYmxlLWJvcmRlcmVkIGVtLXRhYmxlXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHRoZWFkPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnPHRyPjwvdHI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC90aGVhZD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPC90YWJsZT4nICtcbiAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nKTtcbiAgICAgIGlmKGhlYWRlcnMubGVuZ3RoKXtcbiAgICAgICAgJHRhYmxlLmZpbmQoJ3RoZWFkIHRyJykuaHRtbCgkKGhlYWRlcnMuam9pbignJykpKTtcbiAgICAgIH1cbiAgICAgIHZhciAkcGFuZWwgPSAkKCAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLXN1Y2Nlc3NcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnPGgzIGNsYXNzPVwicGFuZWwtdGl0bGVcIj48L2gzPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+PC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWZvb3RlclwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImJ0bi1ncm91cCBkcm9wdXBcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgZHJvcGRvd24tdG9nZ2xlXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiIGFyaWEtaGFzcG9wdXA9XCJ0cnVlXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCI+JyAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Rvd25sb2FkcyA8c3BhbiBjbGFzcz1cImNhcmV0XCI+PC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2J1dHRvbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48YSBocmVmPVwiJyArIHNlc3Npb24uZ2V0TG9jKCkgKyAnUi8udmFsL2pzb24nICsgJ1wiIGRvd25sb2FkPkpTT048L2E+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PGEgaHJlZj1cIicgKyBzZXNzaW9uLmdldExvYygpICsgJ1IvLnZhbC9jc3YnICsgJ1wiIGRvd25sb2FkPkNTVjwvYT48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48YSBocmVmPVwiJyArIHNlc3Npb24uZ2V0TG9jKCkgKyAnUi8udmFsL3RhYicgKyAnXCIgZG93bmxvYWQ+VEFCPC9hPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCInICsgc2Vzc2lvbi5nZXRMb2MoKSArICdSLy52YWwvbWQnICsgJ1wiIGRvd25sb2FkPk1EPC9hPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpIHJvbGU9XCJzZXBhcmF0b3JcIiBjbGFzcz1cImRpdmlkZXJcIj48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48YSBocmVmPVwiJyArIHNlc3Npb24uZ2V0TG9jKCkgKyAnUi8udmFsL3Jkc1wiIGRvd25sb2FkPlJEUzwvYT48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L3VsPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicpO1xuICAgICAgJHBhbmVsLmZpbmQoJy5wYW5lbC10aXRsZScpLnRleHQodGV4dCk7XG4gICAgICAkcGFuZWwuZmluZCgnLnBhbmVsLWJvZHknKS5hcHBlbmQoJHRhYmxlKTtcbiAgICAgICRwYW5lbC5maW5kKCcucGFuZWwtZm9vdGVyJykuYXBwZW5kKCcnKTtcbiAgICAgICRjb250YWluZXIuZW1wdHkoKTtcbiAgICAgICRjb250YWluZXIuYXBwZW5kKCRwYW5lbCk7XG4gICAgICAkdGFibGUuZmluZCgndGFibGUnKS5EYXRhVGFibGUoe1xuICAgICAgICAgICAgXCJhYURhdGFcIjogZGF0YSxcbiAgICAgICAgICAgIFwiYW9Db2x1bW5zXCI6IGFvQ29sdW1uc1xuICAgICAgICAgIH0pO1xuICAgIH0pXG4gICAgLmRvbmUoIGZ1bmN0aW9uKCl7IGNiKCBudWxsICk7fSApXG4gICAgLmZhaWwoIGZ1bmN0aW9uKCl7IGNiKCB0cnVlICk7fSApO1xuICB9O1xuICAvLyBFbmQgUHVibGljIG1ldGhvZCAvZGlzcGxheUFzVGFibGUvXG5cbiAgLyogQmVnaW4gUHVibGljIG1ldGhvZCAvdW5pcXVlL1xuICAgKiBBIGNvbnZlbmllbmNlIHdyYXBwZXIgdG8gcmVkdWNlIGFuIGFycmF5IHRvIHVuaXF1ZSBlbGVtZW50c1xuICAgKlxuICAgKiBAcGFyYW0gYXJyYXkgYW4gYXJyYXlcbiAgICpcbiAgICogQHJldHVybiBhbiBhcnJheSBvZiB1bmlxdWUgZWxlbWVudHNcbiAgICovXG4gIHVuaXF1ZSA9IGZ1bmN0aW9uKCBhcnJheSApIHtcbiAgXHR2YXIgbiA9IFtdO1xuICBcdGZvcih2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICBcdFx0aWYgKG4uaW5kZXhPZihhcnJheVtpXSkgPT09IC0xKXtcbiAgICAgICAgbi5wdXNoKGFycmF5W2ldKTtcbiAgICAgIH1cbiAgXHR9XG4gIFx0cmV0dXJuIG47XG4gIH07XG4gIC8vIEVuZCBQdWJsaWMgbWV0aG9kIC91bmlxdWUvXG5cbiAgLyogQmVnaW4gUHVibGljIG1ldGhvZCAvbWFrZVRleHRGaWxlL1xuICAgKiBDcmVhdGUgYSB0ZXh0IGZpbGUgb24gdGhlIGNsaWVudCB0aGF0IGNhbiBiZSB1c2VkIHRvIGRvd25sb2FkXG4gICAqXG4gICAqIEBleGFtcGxlIDxhIGhyZWY9bWFrZVRleHRGaWxlKCdzb21ldGV4dCcpIGRvd25sb2FkPVwiZmlsZS50eHRcIj5kb3dubG9hZG1lITwvYT5cbiAgICogQHBhcmFtIHRleHQgc3RyaW5nIHRvIGNvbnZlcnQgdG8gZmlsZVxuICAgKlxuICAgKiBAcmV0dXJuIFVSTCBmb3IgdGhlIGZpbGVcbiAgICovXG4gIG1ha2VUZXh0RmlsZSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICB2YXIgZGF0YSA9IG5ldyBCbG9iKFt0ZXh0XSwge3R5cGU6ICd0ZXh0L3BsYWluJ30pO1xuXG4gICAgLy8gSWYgd2UgYXJlIHJlcGxhY2luZyBhIHByZXZpb3VzbHkgZ2VuZXJhdGVkIGZpbGUgd2UgbmVlZCB0b1xuICAgIC8vIG1hbnVhbGx5IHJldm9rZSB0aGUgb2JqZWN0IFVSTCB0byBhdm9pZCBtZW1vcnkgbGVha3MuXG4gICAgaWYgKHRleHRGaWxlICE9PSBudWxsKSB7XG4gICAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh0ZXh0RmlsZSk7XG4gICAgfVxuXG4gICAgdmFyIHRleHRGaWxlID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoZGF0YSk7XG5cbiAgICAvLyByZXR1cm5zIGEgVVJMIHlvdSBjYW4gdXNlIGFzIGEgaHJlZlxuICAgIHJldHVybiB0ZXh0RmlsZTtcbiAgfTtcblxuICAvKiBCZWdpbiBQdWJsaWMgbWV0aG9kIC9ncmFwaGljUi9cbiAgICogQSBjb252ZW5pZW5jZSB3cmFwcGVyIGZvciBmb3JtYXR0aW5nIGEgZ3JhcGhpY1xuICAgKlxuICAgKiBAcGFyYW0gdGl0bGUgc3RyaW5nIGZvciB0aGUgcGFuZWxcbiAgICogQHBhcmFtIGZ1bmMgc3RyaW5nIHRoZSBmdW5jdGlvbiB0byBjYWxsXG4gICAqIEBwYXJhbSBhcmdzIG9iamVjdCBvZiBmdW5jdGlvbiBwYXJhbWV0ZXJzXG4gICAqIEBwYXJhbSAkY29udGFpbmVyIHRoZSBqcXVlcnkgb2JqZWN0IHRvIGluc2VydCB0aGUgaW1hZ2VcbiAgICogQHBhcmFtIG5leHQgdGhlIG9wdGlvbmFsIGNhbGxiYWNrXG4gICAqXG4gICAqIEByZXR1cm4gYW4gYXJyYXkgb2YgdW5pcXVlIGVsZW1lbnRzXG4gICAqL1xuICBncmFwaGljUiA9IGZ1bmN0aW9uKCB0aXRsZSwgZnVuYywgYXJncywgJGNvbnRhaW5lciwgbmV4dCApe1xuXG4gICAgdmFyXG4gICAganF4aHIsXG4gICAgb25mYWlsLFxuICAgIG9uRG9uZSxcbiAgICBjYiA9IG5leHQgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgb25Eb25lID0gZnVuY3Rpb24oICl7XG4gICAgICBjYiAoIG51bGwgKTtcbiAgICB9O1xuXG4gICAgb25mYWlsID0gZnVuY3Rpb24oIGpxWEhSICl7XG4gICAgICB2YXIgZXJyVGV4dCA9IFwiU2VydmVyIGVycm9yOiBcIiArIGpxWEhSLnJlc3BvbnNlVGV4dDtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyVGV4dCk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgIH07XG5cbiAgICAvLyBmaWx0ZXJcbiAgICBqcXhociA9IG9jcHUuY2FsbChmdW5jLCBhcmdzLCBmdW5jdGlvbiggc2Vzc2lvbiApe1xuICAgICAgdmFyICRwYW5lbCA9ICQoJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1zdWNjZXNzXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAnPGgzIGNsYXNzPVwicGFuZWwtdGl0bGVcIj4nICsgdGl0bGUgKyAnPC9oMz4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPGltZyBzcmM9XCJcIiBjbGFzcz1cImltZy1yZXNwb25zaXZlXCIgYWx0PVwiUmVzcG9uc2l2ZSBpbWFnZVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtZm9vdGVyXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJidG4tZ3JvdXAgZHJvcHVwXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgZHJvcGRvd24tdG9nZ2xlXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiIGFyaWEtaGFzcG9wdXA9XCJ0cnVlXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCI+JyAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnRG93bmxvYWRzIDxzcGFuIGNsYXNzPVwiY2FyZXRcIj48L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9idXR0b24+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCInICsgc2Vzc2lvbi5nZXRMb2MoKSArICdncmFwaGljcy8xL3BuZycgKyAnXCIgZG93bmxvYWQ+UE5HPC9hPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PGEgaHJlZj1cIicgKyBzZXNzaW9uLmdldExvYygpICsgJ2dyYXBoaWNzLzEvc3ZnJyArICdcIiBkb3dubG9hZD5TVkc8L2E+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48YSBocmVmPVwiJyArIHNlc3Npb24uZ2V0TG9jKCkgKyAnZ3JhcGhpY3MvMS9wZGYnICsgJ1wiIGRvd25sb2FkPlBERjwvYT48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpIHJvbGU9XCJzZXBhcmF0b3JcIiBjbGFzcz1cImRpdmlkZXJcIj48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCInICsgc2Vzc2lvbi5nZXRMb2MoKSArICdSLy52YWwvcmRzXCIgZG93bmxvYWQ+UkRTPC9hPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC91bD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAnPC9kaXY+Jyk7XG4gICAgICB2YXIgJGltZyA9ICRwYW5lbC5maW5kKCcuaW1nLXJlc3BvbnNpdmUnKTtcbiAgICAgICAgICAkaW1nLmF0dHIoJ3NyYycsIHNlc3Npb24uZ2V0TG9jKCkgKyAnZ3JhcGhpY3MvMS9wbmcnICk7XG4gICAgICAkY29udGFpbmVyLmFwcGVuZCgkcGFuZWwpO1xuICAgIH0pXG4gICAgLmRvbmUoIG9uRG9uZSApXG4gICAgLmZhaWwoIG9uZmFpbCApO1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvcGxvdFIvXG5cbiAgcmV0dXJuIHtcbiAgICBtYWtlRXJyb3IgICAgICAgICAgICAgICA6IG1ha2VFcnJvcixcbiAgICBzZXRDb25maWdNYXAgICAgICAgICAgICA6IHNldENvbmZpZ01hcCxcbiAgICBzZXJpYWxpemUgICAgICAgICAgICAgICA6IHNlcmlhbGl6ZSxcbiAgICBkZXNlcmlhbGl6ZVNlc3Npb25EYXRhICA6IGRlc2VyaWFsaXplU2Vzc2lvbkRhdGEsXG4gICAgZGlzcGxheUFzUHJpbnQgICAgICAgICAgOiBkaXNwbGF5QXNQcmludCxcbiAgICBkaXNwbGF5QXNUYWJsZSAgICAgICAgICA6IGRpc3BsYXlBc1RhYmxlLFxuICAgIHVuaXF1ZSAgICAgICAgICAgICAgICAgIDogdW5pcXVlLFxuICAgIGdyYXBoaWNSICAgICAgICAgICAgICAgIDogZ3JhcGhpY1IsXG4gICAgbWFrZVRleHRGaWxlICAgICAgICAgICAgOiBtYWtlVGV4dEZpbGVcbiAgfTtcbn0oKSk7XG4iLCIvKipcbiAqIEphdmFzY3JpcHQgY2xpZW50IGxpYnJhcnkgZm9yIE9wZW5DUFVcbiAqIFZlcnNpb24gMC41LjBcbiAqIERlcGVuZHM6IGpRdWVyeVxuICogUmVxdWlyZXMgSFRNTDUgRm9ybURhdGEgc3VwcG9ydCBmb3IgZmlsZSB1cGxvYWRzXG4gKiBodHRwOi8vZ2l0aHViLmNvbS9qZXJvZW5vb21zL29wZW5jcHUuanNcbiAqXG4gKiBJbmNsdWRlIHRoaXMgZmlsZSBpbiB5b3VyIGFwcHMgYW5kIHBhY2thZ2VzLlxuICogWW91IG9ubHkgbmVlZCB0byB1c2Ugb2NwdS5zZXR1cmwgaWYgdGhpcyBwYWdlIGlzIGhvc3RlZCBvdXRzaWRlIG9mIHRoZSBPcGVuQ1BVIHBhY2thZ2UuIEZvciBleGFtcGxlOlxuICpcbiAqIG9jcHUuc2V0dXJsKFwiLi4vUlwiKSAvL2RlZmF1bHQsIHVzZSBmb3IgYXBwc1xuICogb2NwdS5zZXR1cmwoXCIvL3B1YmxpYy5vcGVuY3B1Lm9yZy9vY3B1L2xpYnJhcnkvbXlwYWNrYWdlL1JcIikgLy9DT1JTXG4gKiBvY3B1LnNldHVybChcIi9vY3B1L2xpYnJhcnkvbXlwYWNrYWdlL1JcIikgLy9oYXJkY29kZSBwYXRoXG4gKiBvY3B1LnNldHVybChcImh0dHBzOi8vdXNlcjpzZWNyZXQvbXkuc2VydmVyLmNvbS9vY3B1L2xpYnJhcnkvcGtnL1JcIikgLy8gYmFzaWMgYXV0aFxuICovXG5cbi8vV2FybmluZyBmb3IgdGhlIG5ld2JpZXNcbmlmKCF3aW5kb3cualF1ZXJ5KSB7XG4gIGFsZXJ0KFwiQ291bGQgbm90IGZpbmQgalF1ZXJ5ISBUaGUgSFRNTCBtdXN0IGluY2x1ZGUganF1ZXJ5LmpzIGJlZm9yZSBvcGVuY3B1LmpzIVwiKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoIHdpbmRvdywgJCApIHtcblxuICAvL2dsb2JhbCB2YXJpYWJsZVxuICB2YXIgcl9jb3JzID0gZmFsc2U7XG4gIHZhciByX3BhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIHJfcGF0aC5ocmVmID0gXCIuLi9SXCI7XG5cblxuICAvL25ldyBTZXNzaW9uKClcbiAgZnVuY3Rpb24gU2Vzc2lvbihsb2MsIGtleSwgdHh0KXtcbiAgICB0aGlzLmxvYyA9IGxvYztcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnR4dCA9IHR4dDtcbiAgICB0aGlzLm91dHB1dCA9IHR4dC5zcGxpdCgvXFxyXFxufFxccnxcXG4vZyk7XG5cbiAgICB0aGlzLmdldEtleSA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH07XG5cbiAgICB0aGlzLmdldExvYyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbG9jO1xuICAgIH07XG5cbiAgICB0aGlzLmdldEZpbGVVUkwgPSBmdW5jdGlvbihwYXRoKXtcbiAgICAgIHZhciBuZXdfdXJsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgbmV3X3VybC5ocmVmID0gdGhpcy5nZXRMb2MoKSArIFwiZmlsZXMvXCIgKyBwYXRoO1xuICAgICAgbmV3X3VybC51c2VybmFtZSA9IHJfcGF0aC51c2VybmFtZTtcbiAgICAgIG5ld191cmwucGFzc3dvcmQgPSByX3BhdGgucGFzc3dvcmRcbiAgICAgIHJldHVybiBuZXdfdXJsLmhyZWY7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0RmlsZSA9IGZ1bmN0aW9uKHBhdGgsIHN1Y2Nlc3Mpe1xuICAgICAgdmFyIHVybCA9IHRoaXMuZ2V0RmlsZVVSTChwYXRoKTtcbiAgICAgIHJldHVybiAkLmdldCh1cmwsIHN1Y2Nlc3MpO1xuICAgIH07XG5cbiAgICB0aGlzLmdldE9iamVjdCA9IGZ1bmN0aW9uKG5hbWUsIGRhdGEsIHN1Y2Nlc3Mpe1xuICAgICAgLy9pbiBjYXNlIG9mIG5vIGFyZ3VtZW50c1xuICAgICAgbmFtZSA9IG5hbWUgfHwgXCIudmFsXCI7XG5cbiAgICAgIC8vZmlyc3QgYXJnIGlzIGEgZnVuY3Rpb25cbiAgICAgIGlmKG5hbWUgaW5zdGFuY2VvZiBGdW5jdGlvbil7XG4gICAgICAgIC8vcGFzcyBvbiB0byBzZWNvbmQgYXJnXG4gICAgICAgIHN1Y2Nlc3MgPSBuYW1lO1xuICAgICAgICBuYW1lID0gXCIudmFsXCI7XG4gICAgICB9XG5cbiAgICAgIHZhciB1cmwgPSB0aGlzLmdldExvYygpICsgXCJSL1wiICsgbmFtZSArIFwiL2pzb25cIjtcbiAgICAgIHJldHVybiAkLmdldCh1cmwsIGRhdGEsIHN1Y2Nlc3MpO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFN0ZG91dCA9IGZ1bmN0aW9uKHN1Y2Nlc3Mpe1xuICAgICAgdmFyIHVybCA9IHRoaXMuZ2V0TG9jKCkgKyBcInN0ZG91dC90ZXh0XCI7XG4gICAgICByZXR1cm4gJC5nZXQodXJsLCBzdWNjZXNzKTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRDb25zb2xlID0gZnVuY3Rpb24oc3VjY2Vzcyl7XG4gICAgICB2YXIgdXJsID0gdGhpcy5nZXRMb2MoKSArIFwiY29uc29sZS90ZXh0XCI7XG4gICAgICByZXR1cm4gJC5nZXQodXJsLCBzdWNjZXNzKTtcbiAgICB9O1xuICB9XG5cbiAgLy9mb3IgUE9TVGluZyByYXcgY29kZSBzbmlwcGV0c1xuICAvL25ldyBTbmlwcGV0KFwicm5vcm0oMTAwKVwiKVxuICBmdW5jdGlvbiBTbmlwcGV0KGNvZGUpe1xuICAgIHRoaXMuY29kZSA9IGNvZGUgfHwgXCJOVUxMXCI7XG5cbiAgICB0aGlzLmdldENvZGUgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGNvZGU7XG4gICAgfTtcbiAgfVxuXG4gIC8vZm9yIFBPU1RpbmcgZmlsZXNcbiAgLy9uZXcgVXBsb2FkKCQoJyNmaWxlJylbMF0uZmlsZXMpXG4gIGZ1bmN0aW9uIFVwbG9hZChmaWxlKXtcbiAgICBpZihmaWxlIGluc3RhbmNlb2YgRmlsZSl7XG4gICAgICB0aGlzLmZpbGUgPSBmaWxlO1xuICAgIH0gZWxzZSBpZihmaWxlIGluc3RhbmNlb2YgRmlsZUxpc3Qpe1xuICAgICAgdGhpcy5maWxlID0gZmlsZVswXTtcbiAgICB9IGVsc2UgaWYgKGZpbGUuZmlsZXMgaW5zdGFuY2VvZiBGaWxlTGlzdCl7XG4gICAgICB0aGlzLmZpbGUgPSBmaWxlLmZpbGVzWzBdO1xuICAgIH0gZWxzZSBpZiAoZmlsZS5sZW5ndGggPiAwICYmIGZpbGVbMF0uZmlsZXMgaW5zdGFuY2VvZiBGaWxlTGlzdCl7XG4gICAgICB0aGlzLmZpbGUgPSBmaWxlWzBdLmZpbGVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyAnaW52YWxpZCBuZXcgVXBsb2FkKGZpbGUpLiBBcmd1bWVudCBmaWxlIG11c3QgYmUgYSBIVE1MIDxpbnB1dCB0eXBlPVwiZmlsZVwiPjwvaW5wdXQ+JztcbiAgICB9XG5cbiAgICB0aGlzLmdldEZpbGUgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGZpbGU7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0cmluZ2lmeSh4KXtcbiAgICBpZih4IGluc3RhbmNlb2YgU2Vzc2lvbil7XG4gICAgICByZXR1cm4geC5nZXRLZXkoKTtcbiAgICB9IGVsc2UgaWYoeCBpbnN0YW5jZW9mIFNuaXBwZXQpe1xuICAgICAgcmV0dXJuIHguZ2V0Q29kZSgpO1xuICAgIH0gZWxzZSBpZih4IGluc3RhbmNlb2YgVXBsb2FkKXtcbiAgICAgIHJldHVybiB4LmdldEZpbGUoKTtcbiAgICB9IGVsc2UgaWYoeCBpbnN0YW5jZW9mIEZpbGUpe1xuICAgICAgcmV0dXJuIHg7XG4gICAgfSBlbHNlIGlmKHggaW5zdGFuY2VvZiBGaWxlTGlzdCl7XG4gICAgICByZXR1cm4geFswXTtcbiAgICB9IGVsc2UgaWYoeCAmJiB4LmZpbGVzIGluc3RhbmNlb2YgRmlsZUxpc3Qpe1xuICAgICAgcmV0dXJuIHguZmlsZXNbMF07XG4gICAgfSBlbHNlIGlmKHggJiYgeC5sZW5ndGggJiYgeFswXS5maWxlcyBpbnN0YW5jZW9mIEZpbGVMaXN0KXtcbiAgICAgIHJldHVybiB4WzBdLmZpbGVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeCk7XG4gICAgfVxuICB9XG5cbiAgLy9sb3cgbGV2ZWwgY2FsbFxuICBmdW5jdGlvbiByX2Z1bl9hamF4KGZ1biwgc2V0dGluZ3MsIGhhbmRsZXIpe1xuICAgIC8vdmFsaWRhdGUgaW5wdXRcbiAgICBpZighZnVuKSB0aHJvdyBcInJfZnVuX2NhbGwgY2FsbGVkIHdpdGhvdXQgZnVuXCI7XG4gICAgc2V0dGluZ3MgPSBzZXR0aW5ncyB8fCB7fTtcbiAgICBoYW5kbGVyID0gaGFuZGxlciB8fCBmdW5jdGlvbigpe307XG5cbiAgICAvL3NldCBnbG9iYWwgc2V0dGluZ3NcbiAgICBzZXR0aW5ncy51cmwgPSBzZXR0aW5ncy51cmwgfHwgKHJfcGF0aC5ocmVmICsgXCIvXCIgKyBmdW4pO1xuICAgIHNldHRpbmdzLnR5cGUgPSBzZXR0aW5ncy50eXBlIHx8IFwiUE9TVFwiO1xuICAgIHNldHRpbmdzLmRhdGEgPSBzZXR0aW5ncy5kYXRhIHx8IHt9O1xuICAgIHNldHRpbmdzLmRhdGFUeXBlID0gc2V0dGluZ3MuZGF0YVR5cGUgfHwgXCJ0ZXh0XCI7XG5cbiAgICAvL2FqYXggY2FsbFxuICAgIHZhciBqcXhociA9ICQuYWpheChzZXR0aW5ncykuZG9uZShmdW5jdGlvbigpe1xuICAgICAgdmFyIGxvYyA9IGpxeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdMb2NhdGlvbicpIHx8IGNvbnNvbGUubG9nKFwiTG9jYXRpb24gcmVzcG9uc2UgaGVhZGVyIG1pc3NpbmcuXCIpO1xuICAgICAgdmFyIGtleSA9IGpxeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLW9jcHUtc2Vzc2lvbicpIHx8IGNvbnNvbGUubG9nKFwiWC1vY3B1LXNlc3Npb24gcmVzcG9uc2UgaGVhZGVyIG1pc3NpbmcuXCIpO1xuICAgICAgdmFyIHR4dCA9IGpxeGhyLnJlc3BvbnNlVGV4dDtcblxuICAgICAgLy9pbiBjYXNlIG9mIGNvcnMgd2UgdHJhbnNsYXRlIHJlbGF0aXZlIHBhdGhzIHRvIHRoZSB0YXJnZXQgZG9tYWluXG4gICAgICBpZihyX2NvcnMgJiYgbG9jLm1hdGNoKFwiXi9bXi9dXCIpKXtcbiAgICAgICAgbG9jID0gcl9wYXRoLnByb3RvY29sICsgXCIvL1wiICsgcl9wYXRoLmhvc3QgKyBsb2M7XG4gICAgICB9XG4gICAgICBoYW5kbGVyKG5ldyBTZXNzaW9uKGxvYywga2V5LCB0eHQpKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XG4gICAgICBjb25zb2xlLmxvZyhcIk9wZW5DUFUgZXJyb3IgSFRUUCBcIiArIGpxeGhyLnN0YXR1cyArIFwiXFxuXCIgKyBqcXhoci5yZXNwb25zZVRleHQpO1xuICAgIH0pO1xuXG4gICAgLy9mdW5jdGlvbiBjaGFpbmluZ1xuICAgIHJldHVybiBqcXhocjtcbiAgfVxuXG4gIC8vY2FsbCBhIGZ1bmN0aW9uIHVzaW5nIHVzb24gYXJndW1lbnRzXG4gIGZ1bmN0aW9uIHJfZnVuX2NhbGxfanNvbihmdW4sIGFyZ3MsIGhhbmRsZXIpe1xuICAgIHJldHVybiByX2Z1bl9hamF4KGZ1biwge1xuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoYXJncyB8fCB7fSksXG4gICAgICBjb250ZW50VHlwZSA6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIH0sIGhhbmRsZXIpO1xuICB9XG5cbiAgLy9jYWxsIGZ1bmN0aW9uIHVzaW5nIHVybCBlbmNvZGluZ1xuICAvL25lZWRzIHRvIHdyYXAgYXJndW1lbnRzIGluIHF1b3RlcywgZXRjXG4gIGZ1bmN0aW9uIHJfZnVuX2NhbGxfdXJsZW5jb2RlZChmdW4sIGFyZ3MsIGhhbmRsZXIpe1xuICAgIHZhciBkYXRhID0ge307XG4gICAgJC5lYWNoKGFyZ3MsIGZ1bmN0aW9uKGtleSwgdmFsKXtcbiAgICAgIGRhdGFba2V5XSA9IHN0cmluZ2lmeSh2YWwpO1xuICAgIH0pO1xuICAgIHJldHVybiByX2Z1bl9hamF4KGZ1biwge1xuICAgICAgZGF0YTogJC5wYXJhbShkYXRhKVxuICAgIH0sIGhhbmRsZXIpO1xuICB9XG5cbiAgLy9jYWxsIGEgZnVuY3Rpb24gdXNpbmcgbXVsdGlwYXJ0L2Zvcm0tZGF0YVxuICAvL3VzZSBmb3IgZmlsZSB1cGxvYWRzLiBSZXF1aXJlcyBIVE1MNVxuICBmdW5jdGlvbiByX2Z1bl9jYWxsX211bHRpcGFydChmdW4sIGFyZ3MsIGhhbmRsZXIpe1xuICAgIHRlc3RodG1sNSgpO1xuICAgIHZhciBmb3JtZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICQuZWFjaChhcmdzLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICBmb3JtZGF0YS5hcHBlbmQoa2V5LCBzdHJpbmdpZnkodmFsdWUpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcl9mdW5fYWpheChmdW4sIHtcbiAgICAgIGRhdGE6IGZvcm1kYXRhLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlXG4gICAgfSwgaGFuZGxlcik7XG4gIH1cblxuICAvL0F1dG9tYXRpY2FsbHkgZGV0ZXJtaW5lcyB0eXBlIGJhc2VkIG9uIGFyZ3VtZW50IGNsYXNzZXMuXG4gIGZ1bmN0aW9uIHJfZnVuX2NhbGwoZnVuLCBhcmdzLCBoYW5kbGVyKXtcbiAgICBhcmdzID0gYXJncyB8fCB7fTtcbiAgICB2YXIgaGFzZmlsZXMgPSBmYWxzZTtcbiAgICB2YXIgaGFzY29kZSA9IGZhbHNlO1xuXG4gICAgLy9maW5kIGFyZ3VtZW50IHR5cGVzXG4gICAgJC5lYWNoKGFyZ3MsIGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgaWYodmFsdWUgaW5zdGFuY2VvZiBGaWxlIHx8IHZhbHVlIGluc3RhbmNlb2YgVXBsb2FkIHx8IHZhbHVlIGluc3RhbmNlb2YgRmlsZUxpc3Qpe1xuICAgICAgICBoYXNmaWxlcyA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgU25pcHBldCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFNlc3Npb24pe1xuICAgICAgICBoYXNjb2RlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vZGV0ZXJtaW5lIHR5cGVcbiAgICBpZihoYXNmaWxlcyl7XG4gICAgICByZXR1cm4gcl9mdW5fY2FsbF9tdWx0aXBhcnQoZnVuLCBhcmdzLCBoYW5kbGVyKTtcbiAgICB9IGVsc2UgaWYoaGFzY29kZSl7XG4gICAgICByZXR1cm4gcl9mdW5fY2FsbF91cmxlbmNvZGVkKGZ1biwgYXJncywgaGFuZGxlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByX2Z1bl9jYWxsX2pzb24oZnVuLCBhcmdzLCBoYW5kbGVyKTtcbiAgICB9XG4gIH1cblxuICAvL2NhbGwgYSBmdW5jdGlvbiBhbmQgcmV0dXJuIEpTT05cbiAgZnVuY3Rpb24gcnBjKGZ1biwgYXJncywgaGFuZGxlcil7XG4gICAgcmV0dXJuIHJfZnVuX2NhbGwoZnVuLCBhcmdzLCBmdW5jdGlvbihzZXNzaW9uKXtcbiAgICAgIHNlc3Npb24uZ2V0T2JqZWN0KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICBpZihoYW5kbGVyKSBoYW5kbGVyKGRhdGEpO1xuICAgICAgfSkuZmFpbChmdW5jdGlvbigpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBnZXQgSlNPTiByZXNwb25zZSBmb3IgXCIgKyBzZXNzaW9uLmdldExvYygpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLy9wbG90dGluZyB3aWRnZXRcbiAgLy90byBiZSBjYWxsZWQgb24gYW4gKGVtcHR5KSBkaXYuXG4gICQuZm4ucnBsb3QgPSBmdW5jdGlvbihmdW4sIGFyZ3MsIGNiKSB7XG4gICAgdmFyIHRhcmdldGRpdiA9IHRoaXM7XG4gICAgdmFyIG15cGxvdCA9IGluaXRwbG90KHRhcmdldGRpdik7XG5cbiAgICAvL3Jlc2V0IHN0YXRlXG4gICAgbXlwbG90LnNldGxvY2F0aW9uKCk7XG4gICAgbXlwbG90LnNwaW5uZXIuc2hvdygpO1xuXG4gICAgLy8gY2FsbCB0aGUgZnVuY3Rpb25cbiAgICByZXR1cm4gcl9mdW5fY2FsbChmdW4sIGFyZ3MsIGZ1bmN0aW9uKHRtcCkge1xuICAgICAgbXlwbG90LnNldGxvY2F0aW9uKHRtcC5nZXRMb2MoKSk7XG5cbiAgICAgIC8vY2FsbCBzdWNjZXNzIGhhbmRsZXIgYXMgd2VsbFxuICAgICAgaWYoY2IpIGNiKHRtcCk7XG4gICAgfSkuYWx3YXlzKGZ1bmN0aW9uKCl7XG4gICAgICBteXBsb3Quc3Bpbm5lci5oaWRlKCk7XG4gICAgfSk7XG4gIH07XG5cbiAgJC5mbi5ncmFwaGljID0gZnVuY3Rpb24oc2Vzc2lvbiwgbil7XG4gICAgaW5pdHBsb3QodGhpcykuc2V0bG9jYXRpb24oc2Vzc2lvbi5nZXRMb2MoKSwgbiB8fCBcImxhc3RcIik7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0cGxvdCh0YXJnZXRkaXYpe1xuICAgIGlmKHRhcmdldGRpdi5kYXRhKFwib2NwdXBsb3RcIikpe1xuICAgICAgcmV0dXJuIHRhcmdldGRpdi5kYXRhKFwib2NwdXBsb3RcIik7XG4gICAgfVxuICAgIHZhciBvY3B1cGxvdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAvL2xvY2FsIHZhcmlhYmxlc1xuICAgICAgdmFyIExvY2F0aW9uO1xuICAgICAgdmFyIG4gPSBcImxhc3RcIjtcbiAgICAgIHZhciBwbmd3aWR0aDtcbiAgICAgIHZhciBwbmdoZWlnaHQ7XG5cbiAgICAgIHZhciBwbG90ZGl2ID0gJCgnPGRpdiAvPicpLmF0dHIoe1xuICAgICAgICBzdHlsZTogXCJ3aWR0aDogMTAwJTsgaGVpZ2h0OjEwMCU7IG1pbi13aWR0aDogMTAwcHg7IG1pbi1oZWlnaHQ6IDEwMHB4OyBwb3NpdGlvbjpyZWxhdGl2ZTsgYmFja2dyb3VuZC1yZXBlYXQ6bm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMTAwJTtcIlxuICAgICAgfSkuYXBwZW5kVG8odGFyZ2V0ZGl2KS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwibm9uZVwiKTtcblxuICAgICAgdmFyIHNwaW5uZXIgPSAkKCc8c3BhbiAvPicpLmF0dHIoe1xuICAgICAgICBzdHlsZSA6IFwicG9zaXRpb246IGFic29sdXRlOyB0b3A6IDIwcHg7IGxlZnQ6IDIwcHg7IHotaW5kZXg6MTAwMDsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTtcIlxuICAgICAgfSkudGV4dChcImxvYWRpbmcuLi5cIikuYXBwZW5kVG8ocGxvdGRpdikuaGlkZSgpO1xuXG4gICAgICB2YXIgcGRmID0gJCgnPGEgLz4nKS5hdHRyKHtcbiAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wiLFxuICAgICAgICBzdHlsZTogXCJwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMTBweDsgcmlnaHQ6IDEwcHg7IHotaW5kZXg6MTAwMDsgdGV4dC1kZWNvcmF0aW9uOnVuZGVybGluZTsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTtcIlxuICAgICAgfSkudGV4dChcInBkZlwiKS5hcHBlbmRUbyhwbG90ZGl2KTtcblxuICAgICAgdmFyIHN2ZyA9ICQoJzxhIC8+JykuYXR0cih7XG4gICAgICAgIHRhcmdldDogXCJfYmxhbmtcIixcbiAgICAgICAgc3R5bGU6IFwicG9zaXRpb246IGFic29sdXRlOyB0b3A6IDMwcHg7IHJpZ2h0OiAxMHB4OyB6LWluZGV4OjEwMDA7IHRleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmU7IGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7XCJcbiAgICAgIH0pLnRleHQoXCJzdmdcIikuYXBwZW5kVG8ocGxvdGRpdik7XG5cbiAgICAgIHZhciBwbmcgPSAkKCc8YSAvPicpLmF0dHIoe1xuICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICAgIHN0eWxlOiBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiA1MHB4OyByaWdodDogMTBweDsgei1pbmRleDoxMDAwOyB0ZXh0LWRlY29yYXRpb246dW5kZXJsaW5lOyBmb250LWZhbWlseTogbW9ub3NwYWNlO1wiXG4gICAgICB9KS50ZXh0KFwicG5nXCIpLmFwcGVuZFRvKHBsb3RkaXYpO1xuXG4gICAgICBmdW5jdGlvbiB1cGRhdGVwbmcoKXtcbiAgICAgICAgaWYoIUxvY2F0aW9uKSByZXR1cm47XG4gICAgICAgIHBuZ3dpZHRoID0gcGxvdGRpdi53aWR0aCgpO1xuICAgICAgICBwbmdoZWlnaHQgPSBwbG90ZGl2LmhlaWdodCgpO1xuICAgICAgICBwbG90ZGl2LmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgXCJ1cmwoXCIgKyBMb2NhdGlvbiArIFwiZ3JhcGhpY3MvXCIgKyBuICsgXCIvcG5nP3dpZHRoPVwiICsgcG5nd2lkdGggKyBcIiZoZWlnaHQ9XCIgKyBwbmdoZWlnaHQgKyBcIilcIik7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldGxvY2F0aW9uKG5ld2xvYywgbmV3bil7XG4gICAgICAgIG4gPSBuZXduIHx8IG47XG4gICAgICAgIExvY2F0aW9uID0gbmV3bG9jO1xuICAgICAgICBpZighTG9jYXRpb24pe1xuICAgICAgICAgIHBkZi5oaWRlKCk7XG4gICAgICAgICAgc3ZnLmhpZGUoKTtcbiAgICAgICAgICBwbmcuaGlkZSgpO1xuICAgICAgICAgIHBsb3RkaXYuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBcIlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwZGYuYXR0cihcImhyZWZcIiwgTG9jYXRpb24gKyBcImdyYXBoaWNzL1wiICsgbiArIFwiL3BkZj93aWR0aD0xMS42OSZoZWlnaHQ9OC4yNyZwYXBlcj1hNHJcIikuc2hvdygpO1xuICAgICAgICAgIHN2Zy5hdHRyKFwiaHJlZlwiLCBMb2NhdGlvbiArIFwiZ3JhcGhpY3MvXCIgKyBuICsgXCIvc3ZnP3dpZHRoPTExJmhlaWdodD02XCIpLnNob3coKTtcbiAgICAgICAgICBwbmcuYXR0cihcImhyZWZcIiwgTG9jYXRpb24gKyBcImdyYXBoaWNzL1wiICsgbiArIFwiL3BuZz93aWR0aD04MDAmaGVpZ2h0PTYwMFwiKS5zaG93KCk7XG4gICAgICAgICAgdXBkYXRlcG5nKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZnVuY3Rpb24gdG8gdXBkYXRlIHRoZSBwbmcgaW1hZ2VcbiAgICAgIHZhciBvbnJlc2l6ZSA9IGRlYm91bmNlKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYocG5nd2lkdGggPT0gcGxvdGRpdi53aWR0aCgpICYmIHBuZ2hlaWdodCA9PSBwbG90ZGl2LmhlaWdodCgpKXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYocGxvdGRpdi5pcyhcIjp2aXNpYmxlXCIpKXtcbiAgICAgICAgICB1cGRhdGVwbmcoKTtcbiAgICAgICAgfVxuICAgICAgfSwgNTAwKTtcblxuICAgICAgLy8gcmVnaXN0ZXIgdXBkYXRlIGhhbmRsZXJzXG4gICAgICBwbG90ZGl2Lm9uKFwicmVzaXplXCIsIG9ucmVzaXplKTtcbiAgICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCBvbnJlc2l6ZSk7XG5cbiAgICAgIC8vcmV0dXJuIG9iamVjdHNcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNldGxvY2F0aW9uOiBzZXRsb2NhdGlvbixcbiAgICAgICAgc3Bpbm5lciA6IHNwaW5uZXJcbiAgICAgIH07XG4gICAgfSgpO1xuXG4gICAgdGFyZ2V0ZGl2LmRhdGEoXCJvY3B1cGxvdFwiLCBvY3B1cGxvdCk7XG4gICAgcmV0dXJuIG9jcHVwbG90O1xuICB9XG5cbiAgLy8gZnJvbSB1bmRlcnN0b3JlLmpzXG4gIGZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpXG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIH07XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KVxuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gdGVzdGh0bWw1KCl7XG4gICAgaWYoIHdpbmRvdy5Gb3JtRGF0YSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgYWxlcnQoXCJVcGxvYWRpbmcgb2YgZmlsZXMgcmVxdWlyZXMgSFRNTDUuIEl0IGxvb2tzIGxpa2UgeW91IGFyZSB1c2luZyBhbiBvdXRkYXRlZCBicm93c2VyIHRoYXQgZG9lcyBub3Qgc3VwcG9ydCB0aGlzLiBQbGVhc2UgaW5zdGFsbCBGaXJlZm94LCBDaHJvbWUgb3IgSW50ZXJuZXQgRXhwbG9yZXIgMTArXCIpO1xuICAgICAgdGhyb3cgXCJIVE1MNSByZXF1aXJlZC5cIjtcbiAgICB9XG4gIH1cblxuICAvL2dsb2JhbCBzZXR0aW5nc1xuICBmdW5jdGlvbiBzZXR1cmwobmV3cGF0aCl7XG4gICAgaWYoIW5ld3BhdGgubWF0Y2goXCIvUiRcIikpe1xuICAgICAgYWxlcnQoXCJFUlJPUiEgVHJ5aW5nIHRvIHNldCBSIHVybCB0bzogXCIgKyBuZXdwYXRoICtcIi4gUGF0aCB0byBhbiBPcGVuQ1BVIFIgcGFja2FnZSBtdXN0IGVuZCB3aXRoICcvUidcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJfcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHJfcGF0aC5ocmVmID0gbmV3cGF0aDtcbiAgICAgIHJfcGF0aC5ocmVmID0gcl9wYXRoLmhyZWY7IC8vSUUgbmVlZHMgdGhpc1xuXG4gICAgICBpZihsb2NhdGlvbi5wcm90b2NvbCAhPSByX3BhdGgucHJvdG9jb2wgfHwgbG9jYXRpb24uaG9zdCAhPSByX3BhdGguaG9zdCl7XG4gICAgICAgIHJfY29ycyA9IHRydWU7XG4gICAgICAgIGlmICghKCd3aXRoQ3JlZGVudGlhbHMnIGluIG5ldyBYTUxIdHRwUmVxdWVzdCgpKSkge1xuICAgICAgICAgIGFsZXJ0KFwiVGhpcyBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgQ09SUy4gVHJ5IHVzaW5nIEZpcmVmb3ggb3IgQ2hyb21lLlwiKTtcbiAgICAgICAgfSBlbHNlIGlmKHJfcGF0aC51c2VybmFtZSAmJiByX3BhdGgucGFzc3dvcmQpIHtcbiAgICAgICAgICAvL3Nob3VsZCBvbmx5IGRvIHRoaXMgZm9yIGNhbGxzIHRvIG9wZW5jcHUgbWF5YmVcbiAgICAgICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKHJfcGF0aC5ob3N0KTtcbiAgICAgICAgICAkLmFqYXhTZXR1cCh7XG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbih4aHIsIHNldHRpbmdzKSB7XG4gICAgICAgICAgICAgIC8vb25seSB1c2UgYXV0aCBmb3IgYWpheCByZXF1ZXN0cyB0byBvY3B1XG4gICAgICAgICAgICAgIGlmKHJlZ2V4LnRlc3Qoc2V0dGluZ3MudXJsKSl7XG4gICAgICAgICAgICAgICAgLy9zZXR0aW5ncy51c2VybmFtZSA9IHJfcGF0aC51c2VybmFtZTtcbiAgICAgICAgICAgICAgICAvL3NldHRpbmdzLnBhc3N3b3JkID0gcl9wYXRoLnBhc3N3b3JkO1xuXG4gICAgICAgICAgICAgICAgLyogdGFrZSBvdXQgdXNlcjpwYXNzIGZyb20gdGFyZ2V0IHVybCAqL1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmhyZWYgPSBzZXR0aW5ncy51cmw7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MudXJsID0gdGFyZ2V0LnByb3RvY29sICsgXCIvL1wiICsgdGFyZ2V0Lmhvc3QgKyB0YXJnZXQucGF0aG5hbWVcblxuICAgICAgICAgICAgICAgIC8qIHNldCBiYXNpYyBhdXRoIGhlYWRlciAqL1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLnhockZpZWxkcyA9IHNldHRpbmdzLnhockZpZWxkcyB8fCB7fTtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy54aHJGaWVsZHMud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5jcm9zc0RvbWFpbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJBdXRob3JpemF0aW9uXCIsIFwiQmFzaWMgXCIgKyBidG9hKHJfcGF0aC51c2VybmFtZSArIFwiOlwiICsgcl9wYXRoLnBhc3N3b3JkKSk7XG5cbiAgICAgICAgICAgICAgICAvKiBkZWJ1ZyAqL1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXV0aGVudGljYXRlZCByZXF1ZXN0IHRvOiBcIiArIHNldHRpbmdzLnVybCArIFwiIChcIiArIHJfcGF0aC51c2VybmFtZSArIFwiLCBcIiArIHJfcGF0aC5wYXNzd29yZCArIFwiKVwiKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYobG9jYXRpb24ucHJvdG9jb2wgPT0gXCJodHRwczpcIiAmJiByX3BhdGgucHJvdG9jb2wgIT0gXCJodHRwczpcIil7XG4gICAgICAgIGFsZXJ0KFwiUGFnZSBpcyBob3N0ZWQgb24gSFRUUFMgYnV0IHVzaW5nIGEgKG5vbi1TU0wpIEhUVFAgT3BlbkNQVSBzZXJ2ZXIuIFRoaXMgaXMgaW5zZWN1cmUgYW5kIG1vc3QgYnJvd3NlcnMgd2lsbCBub3QgYWxsb3cgdGhpcy5cIilcbiAgICAgIH1cblxuICAgICAgaWYocl9jb3JzKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXR0aW5nIHBhdGggdG8gQ09SUyBzZXJ2ZXIgXCIgKyByX3BhdGguaHJlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNldHRpbmcgcGF0aCB0byBsb2NhbCAobm9uLUNPUlMpIHNlcnZlciBcIiArIHJfcGF0aC5ocmVmKTtcbiAgICAgIH1cblxuICAgICAgLy9DT1JTIGRpc2FsbG93cyByZWRpcmVjdHMuXG4gICAgICByZXR1cm4gJC5nZXQocl9wYXRoLmhyZWYgKyBcIi9cIiwgZnVuY3Rpb24ocmVzZGF0YSl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUGF0aCB1cGRhdGVkLiBBdmFpbGFibGUgb2JqZWN0cy9mdW5jdGlvbnM6XFxuXCIgKyByZXNkYXRhKTtcblxuICAgICAgfSkuZmFpbChmdW5jdGlvbih4aHIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKXtcbiAgICAgICAgYWxlcnQoXCJDb25uZWN0aW9uIHRvIE9wZW5DUFUgZmFpbGVkOlxcblwiICsgdGV4dFN0YXR1cyArIFwiXFxuXCIgKyB4aHIucmVzcG9uc2VUZXh0ICsgXCJcXG5cIiArIGVycm9yVGhyb3duKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vZm9yIGlubmVybmV0eiBleHBsb2RlclxuICBpZiAodHlwZW9mIGNvbnNvbGUgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHRoaXMuY29uc29sZSA9IHtsb2c6IGZ1bmN0aW9uKCkge319O1xuICB9XG5cbiAgLy9leHBvcnRcbiAgcmV0dXJuIHtcbiAgICBjYWxsICAgICAgICA6ICByX2Z1bl9jYWxsLFxuICAgIHJwYyAgICAgICAgIDogIHJwYyxcbiAgICBzZXR1cmwgICAgICA6ICBzZXR1cmwsXG4gICAgU25pcHBldCAgICAgOiAgU25pcHBldCxcbiAgICBVcGxvYWQgICAgICA6ICBVcGxvYWQsXG4gICAgU2Vzc2lvbiAgICAgOiAgU2Vzc2lvblxuICB9O1xuXG59KCB3aW5kb3csIGpRdWVyeSApKTtcbiJdfQ==
