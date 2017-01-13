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
  // shell.initModule( $('#em'), "//localhost:8717/ocpu/library/emRNASeq/R" );
  shell.initModule($('#em'));
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
    default_path: '//localhost:8080/R',
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
  initModule = function initModule($container, path) {
    if (!ocpu) {
      alert('server error');return;
    }

    var jqxhr;
    path = path || configMap.default_path;
    jqxhr = ocpu.seturl(path);
    jqxhr.fail(function () {
      console.error('Could not set server path %s', path);
      return false;
    });

    jqxhr.done(function () {
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
    });

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
        // alert("Connection to OpenCPU failed:\n" + textStatus + "\n" + xhr.responseText + "\n" + errorThrown);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYm9vdC5qcyIsInNyYy9qcy9lbWRhdGEuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tdW5nZS5qcyIsInNyYy9qcy9wcm9jZXNzX3JzZXEuanMiLCJzcmMvanMvc2hlbGwuanMiLCJzcmMvanMvdXRpbC5qcyIsInNyYy9saWIvb3BlbmNwdS5qcy9vcGVuY3B1LTAuNS1ucG0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7QUFDQSxPQUFPLE9BQVAsR0FBa0IsWUFBVTtBQUMxQixNQUNFLFVBREY7O0FBR0EsZUFBYSxzQkFBVTtBQUNyQixNQUFFLFFBQUYsRUFDRyxTQURILENBQ2EsWUFBVTtBQUNqQixRQUFFLGVBQUYsRUFBbUIsSUFBbkI7QUFDQTtBQUNBLFFBQUUsaUJBQUYsRUFBcUIsSUFBckIsQ0FBMEIsVUFBMUIsRUFBc0MsSUFBdEM7QUFDSCxLQUxILEVBTUcsUUFOSCxDQU1ZLFlBQVU7QUFDaEIsUUFBRSxlQUFGLEVBQW1CLElBQW5CO0FBQ0EsUUFBRSxpQkFBRixFQUFxQixJQUFyQixDQUEwQixVQUExQixFQUFzQyxLQUF0QztBQUNILEtBVEg7QUFVRCxHQVhEO0FBWUEsU0FBTyxFQUFFLFlBQWlCLFVBQW5CLEVBQVA7QUFDRCxDQWpCaUIsRUFBbEI7OztBQ0hBOztBQUVBLElBQUksT0FBTyxRQUFRLFdBQVIsQ0FBWDtBQUNBLElBQUksT0FBTyxRQUFRLHNDQUFSLENBQVg7QUFDQSxJQUFJLGFBQWMsWUFBVTs7QUFFMUI7QUFDQSxNQUNBLFlBQVk7QUFDVix1QkFBb0IsRUFEVjtBQUdWLGNBQVcsV0FDVCx5QkFEUyxHQUVQLG1CQUZPLEdBR0wscUZBSEssR0FJTCw4SUFKSyxHQUtQLFFBTE8sR0FNUCxPQU5PLEdBT1AsaUNBUE8sR0FRTCwrQkFSSyxHQVNILDhCQVRHLEdBVUgsa0RBVkcsR0FXSCxnRUFYRyxHQVlMLGFB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UUFBNUQsR0FBdUUsSUFBdkUsR0FBOEUsT0FBTyxRQUFyRixHQUFnRyxHQUE1RztBQUNEO0FBQ0Y7QUFyQlMsV0FBWjtBQXVCRDtBQUNGOztBQUVELFVBQUcsU0FBUyxRQUFULElBQXFCLFFBQXJCLElBQWlDLE9BQU8sUUFBUCxJQUFtQixRQUF2RCxFQUFnRTtBQUM5RCxjQUFNLDRIQUFOO0FBQ0Q7O0FBRUQsVUFBRyxNQUFILEVBQVU7QUFDUixnQkFBUSxHQUFSLENBQVksaUNBQWlDLE9BQU8sSUFBcEQ7QUFDRCxPQUZELE1BRU87QUFDTCxnQkFBUSxHQUFSLENBQVksNkNBQTZDLE9BQU8sSUFBaEU7QUFDRDs7QUFFRDtBQUNBLGFBQU8sRUFBRSxHQUFGLENBQU0sT0FBTyxJQUFQLEdBQWMsR0FBcEIsRUFBeUIsVUFBUyxPQUFULEVBQWlCO0FBQy9DLGdCQUFRLEdBQVIsQ0FBWSxpREFBaUQsT0FBN0Q7QUFFRCxPQUhNLEVBR0osSUFISSxDQUdDLFVBQVMsR0FBVCxFQUFjLFVBQWQsRUFBMEIsV0FBMUIsRUFBc0M7QUFDNUM7QUFDRCxPQUxNLENBQVA7QUFNRDtBQUNGOztBQUVEO0FBQ0EsTUFBSSxPQUFPLE9BQVAsSUFBa0IsV0FBdEIsRUFBbUM7QUFDakMsU0FBSyxPQUFMLEdBQWUsRUFBQyxLQUFLLGVBQVcsQ0FBRSxDQUFuQixFQUFmO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFPO0FBQ0wsVUFBZSxVQURWO0FBRUwsU0FBZSxHQUZWO0FBR0wsWUFBZSxNQUhWO0FBSUwsYUFBZSxPQUpWO0FBS0wsWUFBZSxNQUxWO0FBTUwsYUFBZTtBQU5WLEdBQVA7QUFTRCxDQTNhaUIsQ0EyYWYsTUEzYWUsRUEyYVAsTUEzYU8sQ0FBbEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1Nob3cgYW5kIGhpZGUgdGhlIHNwaW5uZXIgZm9yIGFsbCBhamF4IHJlcXVlc3RzLlxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcbiAgdmFyXG4gICAgaW5pdE1vZHVsZTtcblxuICBpbml0TW9kdWxlID0gZnVuY3Rpb24oKXtcbiAgICAkKGRvY3VtZW50KVxuICAgICAgLmFqYXhTdGFydChmdW5jdGlvbigpe1xuICAgICAgICAgICQoJyNhamF4LXNwaW5uZXInKS5zaG93KCk7XG4gICAgICAgICAgLy8gSGlkZSBhbnkgYnV0dG9ucyB0aGF0IGNvdWxkIHVuc3luYyB3aXRoIGFqYXggZXJyb3IgaGFuZGxlcnNcbiAgICAgICAgICAkKCcuYWpheC1zZW5zaXRpdmUnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgfSlcbiAgICAgIC5hamF4U3RvcChmdW5jdGlvbigpe1xuICAgICAgICAgICQoJyNhamF4LXNwaW5uZXInKS5oaWRlKCk7XG4gICAgICAgICAgJCgnLmFqYXgtc2Vuc2l0aXZlJykuYXR0cignZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIHsgaW5pdE1vZHVsZSAgICAgOiBpbml0TW9kdWxlIH07XG59KCkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG52YXIgb2NwdSA9IHJlcXVpcmUoJy4uL2xpYi9vcGVuY3B1LmpzL29wZW5jcHUtMC41LW5wbS5qcycpO1xudmFyIG1vZHVsZW5hbWUgPSAoZnVuY3Rpb24oKXtcblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdmFyXG4gIGNvbmZpZ01hcCA9IHtcbiAgICBhbmNob3Jfc2NoZW1hX21hcCA6IHtcbiAgICB9LFxuICAgIHRlbXBsYXRlIDogU3RyaW5nKCkgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJlbS1lbWRhdGFcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgICAnPGgyIGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS0xMCBlbS1zZWN0aW9uLXRpdGxlXCI+RU0gRGF0YSBGaWxlcyA8c21hbGw+PC9zbWFsbD48L2gyPicgK1xuICAgICAgICAgICc8aDQgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTJcIj48YSBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1ibG9jayBlbS1lbWRhdGEtY2xlYXIgY2xlYXItYnRuIGFqYXgtc2Vuc2l0aXZlIGNvbC14cy0zIGNvbC1tZC0zXCI+UmVzZXQ8L2E+PC9oND4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGhyLz4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJlbS1lbWRhdGEtcmVzdWx0c1wiPicgK1xuICAgICAgICAgICc8ZmllbGRzZXQgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxlZ2VuZD5HU0VBIElucHV0czwvbGVnZW5kPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJlbS1lbWRhdGEtcmVzdWx0cy1maWxlcy1nc2VhXCI+PC9kaXY+JyArXG4gICAgICAgICAgICAnPHA+PHNtYWxsIGNsYXNzPVwiY29sLXNtLW9mZnNldC0yIGdzZWEtaGVscC1ibG9ja1wiPjwvc21hbGw+PC9wPicgK1xuICAgICAgICAgICc8L2ZpZWxkc2V0PicgK1xuICAgICAgICAgICc8ZmllbGRzZXQgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxlZ2VuZD5FTSBJbnB1dHM8L2xlZ2VuZD4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW1cIj4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJlbS1lbWRhdGEtcmVzdWx0cy1maWxlcy1lbS1leHByZXNzaW9uXCI+PC9kaXY+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW0tcGhlbm90eXBlXCI+PC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPHA+PHNtYWxsIGNsYXNzPVwiY29sLXNtLW9mZnNldC0yIGVtLWhlbHAtYmxvY2tcIj48L3NtYWxsPjwvcD4nICtcbiAgICAgICAgICAnPC9maWVsZHNldD4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgJzwvZGl2PicsXG5cbiAgICBjb2RlX3RlbXBsYXRlIDogU3RyaW5nKCkgK1xuICAgICAgJzxwcmUgY2xhc3M9XCJlbS1jb2RlXCI+PC9wcmU+JyxcblxuICAgIHNldHRhYmxlX21hcCA6IHt9XG4gIH0sXG4gIHN0YXRlTWFwID0ge1xuICAgIGZpbHRlcl9yc2VxX3Nlc3Npb24gICAgIDogbnVsbCxcbiAgICBub3JtYWxpemVfcnNlcV9zZXNzaW9uICA6IG51bGwsXG4gICAgZGVfdGVzdF9yc2VxX3Nlc3Npb24gICAgOiBudWxsLFxuICAgIHJhbmtfZ3NlYV9zZXNzaW9uICAgICAgIDogbnVsbCxcbiAgICBleHByZXNzaW9uX2VtX3Nlc3Npb24gICA6IG51bGwsXG4gICAgcGhlb250eXBlICAgICAgICAgICAgICAgOiBudWxsLFxuICAgIGV4cHJlc3Npb25fZ3NlYV9zZXNzaW9uIDogbnVsbCxcbiAgICBwaGVub3R5cGVfZ3NlYV9zZXNzaW9uICA6IG51bGxcbiAgfSxcbiAganF1ZXJ5TWFwID0ge30sXG4gIHJlc2V0LFxuICBzZXRKUXVlcnlNYXAsXG5cbiAgZmV0Y2hHU0VBRmlsZXMsXG4gIGZldGNoRU1GaWxlcyxcbiAgY3JlYXRlRGF0YUZpbGVzLFxuXG4gIGNvbmZpZ01vZHVsZSxcbiAgaW5pdE1vZHVsZTtcbiAgLy8gLS0tLS0tLS0tLSBFTkQgTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQmVnaW4gRE9NIG1ldGhvZCAvc2V0SlF1ZXJ5TWFwL1xuICBzZXRKUXVlcnlNYXAgPSBmdW5jdGlvbiggJGNvbnRhaW5lciApe1xuICAgIGpxdWVyeU1hcCA9IHtcbiAgICAgICRjb250YWluZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lcixcbiAgICAgICRlbWRhdGFfY2xlYXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtY2xlYXInKSxcbiAgICAgICRlbWRhdGFfcmVzdWx0cyAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cycpLFxuICAgICAgJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2dzZWEgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1lbWRhdGEgLmVtLWVtZGF0YS1yZXN1bHRzIC5lbS1lbWRhdGEtcmVzdWx0cy1maWxlcy1nc2VhJyksXG4gICAgICAkZW1kYXRhX2dzZWFfaGVscCAgICAgICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLWVtZGF0YSAuZW0tZW1kYXRhLXJlc3VsdHMgLmdzZWEtaGVscC1ibG9jaycpLFxuICAgICAgJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2VtICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1lbWRhdGEgLmVtLWVtZGF0YS1yZXN1bHRzIC5lbS1lbWRhdGEtcmVzdWx0cy1maWxlcy1lbScpLFxuICAgICAgJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2VtX2V4cHJlc3Npb24gICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1lbWRhdGEgLmVtLWVtZGF0YS1yZXN1bHRzIC5lbS1lbWRhdGEtcmVzdWx0cy1maWxlcy1lbSAuZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW0tZXhwcmVzc2lvbiAnKSxcbiAgICAgICRlbWRhdGFfcmVzdWx0c19maWxlc19lbV9waGVub3R5cGUgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tZW1kYXRhIC5lbS1lbWRhdGEtcmVzdWx0cyAuZW0tZW1kYXRhLXJlc3VsdHMtZmlsZXMtZW0gLmVtLWVtZGF0YS1yZXN1bHRzLWZpbGVzLWVtLXBoZW5vdHlwZScpLFxuICAgICAgJGVtZGF0YV9lbV9oZWxwICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1lbWRhdGEgLmVtLWVtZGF0YS1yZXN1bHRzIC5lbS1oZWxwLWJsb2NrJylcbiAgICB9O1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvc2V0SlF1ZXJ5TWFwL1xuXG4gIC8qIEZldGNoIGFuZCBhcHBlbmQgdGhlIHZhcmlvdXMgZmlsZXMgcmVxdWlyZWQgZm9yIEVNXG4gICAqXG4gICAqIEBwYXJhbSAkY29udGFpbmVyIG9iamVjdCB0aGUganF1ZXJ5IG9iamVjdCB0byBhcHBlbmQgdG9cbiAgICogQHBhcmFtIG5leHQgZnVuY3Rpb24gYW4gb3B0aW9uYWwgY2FsbGJhY2tcbiAgICpcbiAgICogQHJldHVybiBib29sZWFuXG4gICAqL1xuICBmZXRjaEVNRmlsZXMgPSBmdW5jdGlvbiggJGNvbnRhaW5lciwgbmV4dCApe1xuICAgIHZhclxuICAgIGpxeGhyX2V4cHJlc3Npb24sXG4gICAganF4aHJfcGhlbm90eXBlLFxuICAgIG9uZmFpbCxcbiAgICBvbkRvbmUsXG4gICAgY2IgPSBuZXh0IHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIG9uRG9uZSA9IGZ1bmN0aW9uKCApe1xuICAgICAganF1ZXJ5TWFwLiRlbWRhdGFfZW1faGVscC50ZXh0KCcnKTtcbiAgICB9O1xuXG4gICAgb25mYWlsID0gZnVuY3Rpb24oIGpxWEhSICl7XG4gICAgICB2YXIgZXJyVGV4dCA9IFwiU2VydmVyIGVycm9yOiBcIiArIGpxWEhSLnJlc3BvbnNlVGV4dDtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyVGV4dCk7XG4gICAgICBqcXVlcnlNYXAuJGVtZGF0YV9lbV9oZWxwLnRleHQoZXJyVGV4dCk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgIH07XG5cbiAgICAvLyBmaWx0ZXJcbiAgICBqcXhocl9leHByZXNzaW9uID0gb2NwdS5jYWxsKCdmb3JtYXRfZXhwcmVzc2lvbl9nc2VhJywge1xuICAgICAgbm9ybWFsaXplZF9kZ2UgOiBzdGF0ZU1hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uXG4gICAgfSwgZnVuY3Rpb24oIHNlc3Npb24gKXsgc3RhdGVNYXAuZXhwcmVzc2lvbl9nc2VhX3Nlc3Npb24gPSBzZXNzaW9uOyB9KVxuICAgIC5kb25lKCBmdW5jdGlvbigpe1xuICAgICAgdXRpbC5kaXNwbGF5QXNUYWJsZSgnRXhwcmVzc2lvbiBmaWxlICgudHh0KScsXG4gICAgICAgIHN0YXRlTWFwLmV4cHJlc3Npb25fZ3NlYV9zZXNzaW9uLFxuICAgICAgICBqcXVlcnlNYXAuJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2VtX2V4cHJlc3Npb24sXG4gICAgICAgIG51bGwgKTtcbiAgICB9KVxuICAgIC5mYWlsKCBvbmZhaWwgKTtcblxuICAgIGpxeGhyX3BoZW5vdHlwZSA9IGpxeGhyX2V4cHJlc3Npb24udGhlbiggZnVuY3Rpb24oICl7XG4gICAgICByZXR1cm4gb2NwdS5ycGMoJ2Zvcm1hdF9jbGFzc19nc2VhJywge1xuICAgICAgICBmaWx0ZXJlZF9kZ2UgOiBzdGF0ZU1hcC5maWx0ZXJfcnNlcV9zZXNzaW9uLFxuICAgICAgICBkZV90ZXN0ZWRfdHQgOiBzdGF0ZU1hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvbixcbiAgICAgIH0sIGZ1bmN0aW9uKCBkYXRhICl7XG4gICAgICAgIC8vc29tZSBzdG9vcGlkIEdTRUEgZm9ybWF0LlxuICAgICAgICB2YXIgcnVubmluZyA9IFN0cmluZygpO1xuICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oIGxpbmUgKXtcbiAgICAgICAgICBydW5uaW5nICs9IGxpbmVbMF0gKyAnXFxuJztcbiAgICAgICAgfSk7XG4gICAgICAgIGpxdWVyeU1hcC4kZW1kYXRhX3Jlc3VsdHNfZmlsZXNfZW1fcGhlbm90eXBlLmFwcGVuZChcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLXN1Y2Nlc3NcIj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPicgK1xuICAgICAgICAgICAgICAnPGgzIGNsYXNzPVwicGFuZWwtdGl0bGVcIj5QaGVub3R5cGUgZmlsZSAoLmNscyk8L2gzPicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+PHByZSBjbGFzcz1cImVtLWNvZGVcIj4nICsgcnVubmluZyArICc8L3ByZT48L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtZm9vdGVyXCI+JyArXG4gICAgICAgICAgICAgICc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBocmVmPVwiJyArIHV0aWwubWFrZVRleHRGaWxlKHJ1bm5pbmcpICsgJ1wiIGRvd25sb2FkPVwicGhlbm90eXBlLmNsc1wiPkRvd25sb2FkICguY2xzKTwvYT4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPC9kaXY+J1xuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSlcbiAgICAuZG9uZSggZnVuY3Rpb24oKXtcbiAgICAgIC8vIHV0aWwuZGlzcGxheUFzVGFibGUoJ1BoZW5vdHlwZSBmaWxlICguY2xzKScsXG4gICAgICAvLyAgIHN0YXRlTWFwLmNsYXNzX2dzZWFfc2Vzc2lvbixcbiAgICAgIC8vICAganF1ZXJ5TWFwLiRlbWRhdGFfcmVzdWx0c19maWxlc19lbV9waGVub3R5cGUsXG4gICAgICAvLyAgIG51bGwgKTtcbiAgICAgIGNiKCBudWxsICk7XG4gICAgfSlcbiAgICAuZmFpbCggb25mYWlsICk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKiBGZXRjaCBhbmQgYXBwZW5kIHRoZSB2YXJpb3VzIGZpbGVzIHJlcXVpcmVkIGZvciBHU0VBXG4gICAqXG4gICAqIEBwYXJhbSAkY29udGFpbmVyIG9iamVjdCB0aGUganF1ZXJ5IG9iamVjdCB0byBhcHBlbmQgdG9cbiAgICogQHBhcmFtIG5leHQgZnVuY3Rpb24gYW4gb3B0aW9uYWwgY2FsbGJhY2tcbiAgICpcbiAgICogQHJldHVybiBib29sZWFuXG4gICAqL1xuICBmZXRjaEdTRUFGaWxlcyA9IGZ1bmN0aW9uKCAkY29udGFpbmVyLCBuZXh0ICl7XG4gICAgdmFyXG4gICAganF4aHIsXG4gICAgb25mYWlsLFxuICAgIG9uRG9uZSxcbiAgICBjYiA9IG5leHQgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgb25Eb25lID0gZnVuY3Rpb24oKXtcbiAgICAgIHV0aWwuZGlzcGxheUFzVGFibGUoJ1JhbmsgRmlsZSAoLnJuayknLFxuICAgICAgc3RhdGVNYXAucmFua19nc2VhX3Nlc3Npb24sXG4gICAgICBqcXVlcnlNYXAuJGVtZGF0YV9yZXN1bHRzX2ZpbGVzX2dzZWEsXG4gICAgICBudWxsICk7XG4gICAgICBqcXVlcnlNYXAuJGVtZGF0YV9nc2VhX2hlbHAudGV4dCgnJyk7XG4gICAgICBjYiggZmFsc2UgKTtcbiAgICB9O1xuXG4gICAgb25mYWlsID0gZnVuY3Rpb24oIGpxWEhSICl7XG4gICAgICB2YXIgZXJyVGV4dCA9IFwiU2VydmVyIGVycm9yOiBcIiArIGpxWEhSLnJlc3BvbnNlVGV4dDtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyVGV4dCk7XG4gICAgICBqcXVlcnlNYXAuJGVtZGF0YV9nc2VhX2hlbHAudGV4dChlcnJUZXh0KTtcbiAgICAgIGNiKCB0cnVlICk7XG4gICAgfTtcblxuICAgIC8vIGZpbHRlclxuICAgIGpxeGhyID0gb2NwdS5jYWxsKCdmb3JtYXRfcmFua3NfZ3NlYScsIHtcbiAgICAgIGRlX3Rlc3RlZF90dCA6IHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uXG4gICAgfSwgZnVuY3Rpb24oIHNlc3Npb24gKXsgc3RhdGVNYXAucmFua19nc2VhX3Nlc3Npb24gPSBzZXNzaW9uOyB9KVxuICAgIC5kb25lKCBvbkRvbmUgKVxuICAgIC5mYWlsKCBvbmZhaWwgKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG5cbiAgLyogRmV0Y2ggYW5kIGFwcGVuZCB0aGUgdmFyaW91cyBmaWxlcyByZXF1aXJlZFxuICAgKlxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciBvYmplY3QgdGhlIGpxdWVyeSBvYmplY3QgdG8gYXBwZW5kIHRvXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgY3JlYXRlRGF0YUZpbGVzID0gZnVuY3Rpb24oICl7XG4gICAgZmV0Y2hHU0VBRmlsZXMoIGpxdWVyeU1hcC4kZW1kYXRhX3Jlc3VsdHNfZmlsZXNfZ3NlYSwgZnVuY3Rpb24oIGVyciApe1xuICAgICAgICBpZiggZXJyICl7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICBmZXRjaEVNRmlsZXMoIGpxdWVyeU1hcC4kZW1kYXRhX3Jlc3VsdHNfZmlsZXNfZW0gKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLy8gLS0tLS0tLS0tLSBFTkQgRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIC0tLS0tLS0tLS0gRU5EIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC9yZXNldC9cbiAgLyogUmV0dXJuIHRvIHRoZSBncm91bmQgc3RhdGVcbiAgICpcbiAgICogQHJldHVybiBib29sZWFuXG4gICAqL1xuICByZXNldCA9IGZ1bmN0aW9uKCApIHtcbiAgICBhbGVydCgncmVzZXQgY2FsbGVkJyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBwdWJsaWMgbWV0aG9kIC9yZXNldC9cblxuXG4gIC8vIEJlZ2luIHB1YmxpYyBtZXRob2QgL2NvbmZpZ01vZHVsZS9cbiAgLy8gRXhhbXBsZSAgIDogc3BhLmNoYXQuY29uZmlnTW9kdWxlKHsgc2xpZGVyX29wZW5fZW0gOiAxOCB9KTtcbiAgLy8gUHVycG9zZSAgIDogQ29uZmlndXJlIHRoZSBtb2R1bGUgcHJpb3IgdG8gaW5pdGlhbGl6YXRpb25cbiAgLy8gQXJndW1lbnRzIDpcbiAgLy8gICAqIHNldF9jaGF0X2FuY2hvciAtIGEgY2FsbGJhY2sgdG8gbW9kaWZ5IHRoZSBVUkkgYW5jaG9yIHRvXG4gIC8vICAgICBpbmRpY2F0ZSBvcGVuZWQgb3IgY2xvc2VkIHN0YXRlLiBUaGlzIGNhbGxiYWNrIG11c3QgcmV0dXJuXG4gIC8vICAgICBmYWxzZSBpZiB0aGUgcmVxdWVzdGVkIHN0YXRlIGNhbm5vdCBiZSBtZXRcbiAgLy8gICAqIGNoYXRfbW9kZWwgLSB0aGUgY2hhdCBtb2RlbCBvYmplY3QgcHJvdmlkZXMgbWV0aG9kc1xuICAvLyAgICAgICB0byBpbnRlcmFjdCB3aXRoIG91ciBpbnN0YW50IG1lc3NhZ2luZ1xuICAvLyAgICogcGVvcGxlX21vZGVsIC0gdGhlIHBlb3BsZSBtb2RlbCBvYmplY3Qgd2hpY2ggcHJvdmlkZXNcbiAgLy8gICAgICAgbWV0aG9kcyB0byBtYW5hZ2UgdGhlIGxpc3Qgb2YgcGVvcGxlIHRoZSBtb2RlbCBtYWludGFpbnNcbiAgLy8gICAqIHNsaWRlcl8qIHNldHRpbmdzLiBBbGwgdGhlc2UgYXJlIG9wdGlvbmFsIHNjYWxhcnMuXG4gIC8vICAgICAgIFNlZSBtYXBDb25maWcuc2V0dGFibGVfbWFwIGZvciBhIGZ1bGwgbGlzdFxuICAvLyAgICAgICBFeGFtcGxlOiBzbGlkZXJfb3Blbl9lbSBpcyB0aGUgb3BlbiBoZWlnaHQgaW4gZW0nc1xuICAvLyBBY3Rpb24gICAgOlxuICAvLyAgIFRoZSBpbnRlcm5hbCBjb25maWd1cmF0aW9uIGRhdGEgc3RydWN0dXJlIChjb25maWdNYXApIGlzXG4gIC8vICAgdXBkYXRlZCB3aXRoIHByb3ZpZGVkIGFyZ3VtZW50cy4gTm8gb3RoZXIgYWN0aW9ucyBhcmUgdGFrZW4uXG4gIC8vIFJldHVybnMgICA6IHRydWVcbiAgLy8gVGhyb3dzICAgIDogSmF2YVNjcmlwdCBlcnJvciBvYmplY3QgYW5kIHN0YWNrIHRyYWNlIG9uXG4gIC8vICAgICAgICAgICAgIHVuYWNjZXB0YWJsZSBvciBtaXNzaW5nIGFyZ3VtZW50c1xuICAvL1xuICBjb25maWdNb2R1bGUgPSBmdW5jdGlvbiAoIGlucHV0X21hcCApIHtcbiAgICB1dGlsLnNldENvbmZpZ01hcCh7XG4gICAgICBpbnB1dF9tYXAgICAgOiBpbnB1dF9tYXAsXG4gICAgICBzZXR0YWJsZV9tYXAgOiBjb25maWdNYXAuc2V0dGFibGVfbWFwLFxuICAgICAgY29uZmlnX21hcCAgIDogY29uZmlnTWFwXG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBwdWJsaWMgbWV0aG9kIC9jb25maWdNb2R1bGUvXG5cbiAgLyogaW5pdE1vZHVsZVxuICAgKiBAcGFyYW0gb2NwdSAoT2JqZWN0KSBvY3B1IHNpbmdsZXRvblxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciAoT2JqZWN0KSBqUXVlcnkgcGFyZW50XG4gICAqL1xuICBpbml0TW9kdWxlID0gZnVuY3Rpb24oICRjb250YWluZXIsIG1zZ19tYXAgKXtcbiAgICBpZiggISRjb250YWluZXIgKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgY29udGFpbmVyJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmKCAkLmlzRW1wdHlPYmplY3QoIG1zZ19tYXAgKSB8fFxuICAgICAgICFtc2dfbWFwLmhhc093blByb3BlcnR5KCAnZmlsdGVyX3JzZXFfc2Vzc2lvbicgKSB8fFxuICAgICAgICFtc2dfbWFwLmhhc093blByb3BlcnR5KCAnbm9ybWFsaXplX3JzZXFfc2Vzc2lvbicgfHxcbiAgICAgICAhbXNnX21hcC5oYXNPd25Qcm9wZXJ0eSggJ2RlX3Rlc3RfcnNlcV9zZXNzaW9uJyApICkpe1xuICAgICAgY29uc29sZS5lcnJvcignTWlzc2luZyBtc2dfbWFwJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgICRjb250YWluZXIuaHRtbCggY29uZmlnTWFwLnRlbXBsYXRlICk7XG4gICAgc2V0SlF1ZXJ5TWFwKCAkY29udGFpbmVyICk7XG4gICAganF1ZXJ5TWFwLiRlbWRhdGFfY2xlYXIuY2xpY2soIHJlc2V0ICk7XG5cbiAgICBzdGF0ZU1hcC5maWx0ZXJfcnNlcV9zZXNzaW9uID0gbXNnX21hcC5maWx0ZXJfcnNlcV9zZXNzaW9uO1xuICAgIHN0YXRlTWFwLm5vcm1hbGl6ZV9yc2VxX3Nlc3Npb24gPSBtc2dfbWFwLm5vcm1hbGl6ZV9yc2VxX3Nlc3Npb247XG4gICAgc3RhdGVNYXAuZGVfdGVzdF9yc2VxX3Nlc3Npb24gPSBtc2dfbWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uO1xuXG4gICAgLy8gZG8gc3R1ZmZcbiAgICBjcmVhdGVEYXRhRmlsZXMoKTtcbiAgfTtcbiAgLy8gLS0tLS0tLS0tLSBFTkQgUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZXR1cm4ge1xuICAgIGluaXRNb2R1bGUgICAgICA6IGluaXRNb2R1bGUsXG4gICAgY29uZmlnTW9kdWxlICAgIDogY29uZmlnTW9kdWxlLFxuICAgIHJlc2V0ICAgICAgICAgICA6IHJlc2V0XG4gIH07XG5cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbW9kdWxlbmFtZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc2hlbGwgPSByZXF1aXJlKCcuL3NoZWxsJyk7XG52YXIgYm9vdCA9IHJlcXVpcmUoJy4vYm9vdCcpO1xuXG4vKlxuICogT3BlbkNQVSBpcyBOT1QgYSBjb25zb2xlLi4uXG4gKiBodHRwczovL3d3dy5vcGVuY3B1Lm9yZy9qc2xpYi5odG1sXG4gKlxuICogJ0Fsc28gbm90ZSB0aGF0IGV2ZW4gd2hlbiB1c2luZyBDT1JTLCB0aGUgb3BlbmNwdS5qcyBsaWJyYXJ5IHN0aWxsIHJlcXVpcmVzXG4gKiB0aGF0IGFsbCBSIGZ1bmN0aW9ucyB1c2VkIGJ5IGEgY2VydGFpbiBhcHBsaWNhdGlvbiBhcmUgY29udGFpbmVkIGluIGEgc2luZ2xlXG4gKiBSIHBhY2thZ2UuIFRoaXMgaXMgb24gcHVycG9zZSwgdG8gZm9yY2UgeW91IHRvIGtlZXAgdGhpbmdzIG9yZ2FuaXplZC4gSWZcbiAqIHlvdSB3b3VsZCBsaWtlIHRvIHVzZSBmdW5jdGlvbmFsaXR5IGZyb20gdmFyaW91cyBSIHBhY2thZ2VzLCB5b3UgbmVlZFxuICogdG8gY3JlYXRlIGFuIFIgcGFja2FnZSB0aGF0IGluY2x1ZGVzIHNvbWUgd3JhcHBlciBmdW5jdGlvbnMgYW5kIGZvcm1hbGx5XG4gKiBkZWNsYXJlcyBpdHMgZGVwZW5kZW5jaWVzIG9uIHRoZSBvdGhlciBwYWNrYWdlcy4gV3JpdGluZyBhbiBSIHBhY2thZ2UgaXNcbiAqIHJlYWxseSBlYXN5IHRoZXNlIGRheXMsIHNvIHRoaXMgc2hvdWxkIGJlIG5vIHByb2JsZW0uJ1xuICovXG4oZnVuY3Rpb24oKXtcbiAgYm9vdC5pbml0TW9kdWxlKCk7XG4gIC8vIHNoZWxsLmluaXRNb2R1bGUoICQoJyNlbScpLCBcIi8vbG9jYWxob3N0Ojg3MTcvb2NwdS9saWJyYXJ5L2VtUk5BU2VxL1JcIiApO1xuICBzaGVsbC5pbml0TW9kdWxlKCQoJyNlbScpKTtcbn0oKSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcbnZhciBvY3B1ID0gcmVxdWlyZSgnLi4vbGliL29wZW5jcHUuanMvb3BlbmNwdS0wLjUtbnBtLmpzJyk7XG5cbnZhciBtdW5nZSA9IChmdW5jdGlvbigpe1xuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB2YXJcbiAgY29uZmlnTWFwID0ge1xuXG4gICAgdGVtcGxhdGUgOiBTdHJpbmcoKSArXG4gICAgICAnPGRpdiBjbGFzcz1cImVtLW11bmdlXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwicm93XCI+JyArXG4gICAgICAgICAgJzxoMiBjbGFzcz1cImNvbC14cy0xMiBjb2wtc20tMTAgZW0tc2VjdGlvbi10aXRsZVwiPkRhdGEgTXVuZ2UgPHNtYWxsPjwvc21hbGw+PC9oMj4nICtcbiAgICAgICAgICAnPGg0IGNsYXNzPVwiY29sLXhzLTEyIGNvbC1zbS0yXCI+PGEgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tYmxvY2sgZW0tbXVuZ2UtY2xlYXIgY2xlYXItYnRuIGFqYXgtc2Vuc2l0aXZlIGNvbC14cy0zIGNvbC1tZC0zXCI+UmVzZXQ8L2E+PC9oND4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGhyLz4nICtcbiAgICAgICAgJzxmb3JtPicgK1xuICAgICAgICAgICc8ZmllbGRzZXQgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxlZ2VuZD5NZXRhZGF0YSBJbnB1dDwvbGVnZW5kPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJlbS1tdW5nZS1tZXRhIHJvd1wiPicgK1xuICAgICAgICAgICAgICAnPGxhYmVsIGNsYXNzPVwiY29sLXNtLTIgY29sLWZvcm0tbGFiZWxcIj5GaWxlPC9sYWJlbD4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtc20tMTBcIj4nICtcbiAgICAgICAgICAgICAgICAnPGxhYmVsIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1maWxlIGJ0bi1tZCBidG4tYmxvY2tcIiBmb3I9XCJlbS1tdW5nZS1tZXRhLWlucHV0XCI+U2VsZWN0PC9sYWJlbD4nICtcbiAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJmaWxlXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wtZmlsZVwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBpZD1cImVtLW11bmdlLW1ldGEtaW5wdXRcIiAvPicgK1xuICAgICAgICAgICAgICAgICc8cD48c21hbGwgY2xhc3M9XCJoZWxwLWJsb2NrXCI+PC9zbWFsbD48L3A+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cCBlbS1tdW5nZS1tZXRhLXJlc3VsdHNcIj48L2Rpdj4nICtcbiAgICAgICAgICAnPC9maWVsZHNldD4nICtcblxuICAgICAgICAgICc8ZmllbGRzZXQgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxlZ2VuZD5EYXRhIElucHV0PC9sZWdlbmQ+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLW11bmdlLXNwZWNpZXMgcm93XCI+JyArXG4gICAgICAgICAgICAgICc8bGFiZWwgZm9yPVwiZW0tbXVuZ2Utc3BlY2llcy1pbnB1dFwiIGNsYXNzPVwiY29sLXNtLTIgY29sLWZvcm0tbGFiZWxcIj5TcGVjaWVzICZuYnNwPC9sYWJlbD4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtc20tMTBcIj4nICtcbiAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBwbGFjZWhvbGRlcj1cImUuZy4gXFwnbW91c2VcXCcgKG9wdGlvbmFsKVwiPicgK1xuICAgICAgICAgICAgICAgICc8cD48c21hbGwgY2xhc3M9XCJoZWxwLWJsb2NrXCI+PC9zbWFsbD48L3A+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tbXVuZ2UtZGF0YSByb3dcIj4nICtcbiAgICAgICAgICAgICAgJzxsYWJlbCBjbGFzcz1cImNvbC1zbS0yIGNvbC1mb3JtLWxhYmVsXCI+RmlsZTwvbGFiZWw+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLXNtLTEwXCI+JyArXG4gICAgICAgICAgICAgICAgJzxsYWJlbCBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4tZmlsZSBidG4tbWQgYnRuLWJsb2NrXCIgZm9yPVwiZW0tbXVuZ2UtZGF0YS1pbnB1dFwiPlNlbGVjdDwvbGFiZWw+JyArXG4gICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwiZmlsZVwiIGNsYXNzPVwiZm9ybS1jb250cm9sLWZpbGVcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCIgaWQ9XCJlbS1tdW5nZS1kYXRhLWlucHV0XCIgZGlzYWJsZWQgbXVsdGlwbGUgLz4nICtcbiAgICAgICAgICAgICAgICAnPHA+PHNtYWxsIGNsYXNzPVwiaGVscC1ibG9ja1wiPjwvc21hbGw+PC9wPicgK1xuICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgZW0tbXVuZ2UtZGF0YS1yZXN1bHRzXCI+PC9kaXY+JyArXG4gICAgICAgICAgJzwvZmllbGRzZXQ+JyArXG4gICAgICAgICc8L2Zvcm0+JyArXG4gICAgICAnPC9kaXY+JyxcblxuICAgIGRlZmF1bHRfbWV0YWRhdGFfaGVscCA6IFN0cmluZygpICsgJ1RhYi1kZWxpbWl0ZWQgKC50eHQpLiBIZWFkZXJzIGZvciBcXCdpZFxcJyAoZmlsZW5hbWVzKSBhbmQgXFwnY2xhc3NcXCcnLFxuICAgIGRlZmF1bHRfZGF0YV9oZWxwICAgICA6IFN0cmluZygpICsgJ1RhYi1kZWxpbWl0ZWQgKC50eHQpLiBSb3dzIGluZGljYXRlIGdlbmUgYW5kIGNvdW50JyxcblxuICAgICBjb2RlX3RlbXBsYXRlIDogU3RyaW5nKCkgK1xuICAgICAgJzxwcmUgY2xhc3M9XCJlbS1jb2RlXCI+PC9wcmU+JyxcbiAgICBzZXR0YWJsZV9tYXAgOiB7fVxuICB9LFxuXG4gIHN0YXRlTWFwID0ge1xuICAgIG1ldGFkYXRhX3Nlc3Npb24gICAgICAgIDogbnVsbCxcbiAgICBtZXRhZGF0YV9maWxlICAgICAgICAgICA6IG51bGwsXG4gICAgZGF0YV9zZXNzaW9uICAgICAgICAgICAgOiBudWxsLFxuICAgIGRhdGFfZmlsZXMgICAgICAgICAgICAgIDogbnVsbFxuICB9LFxuICBqcXVlcnlNYXAgPSB7fSxcbiAgc2V0SlF1ZXJ5TWFwLFxuICBjb25maWdNb2R1bGUsXG4gIHRvZ2dsZUlucHV0LFxuICByZXNldCxcbiAgb25NZXRhRmlsZUNoYW5nZSxcbiAgb25NZXRhZGF0YVByb2Nlc3NlZCxcbiAgcHJvY2Vzc01ldGFGaWxlLFxuICBvbkRhdGFGaWxlc0NoYW5nZSxcbiAgb25EYXRhUHJvY2Vzc2VkLFxuICBwcm9jZXNzRGF0YUZpbGVzLFxuICBpbml0TW9kdWxlO1xuICAvLyAtLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9zZXRKUXVlcnlNYXAvXG4gIHNldEpRdWVyeU1hcCA9IGZ1bmN0aW9uKCAkY29udGFpbmVyICl7XG4gICAganF1ZXJ5TWFwID0ge1xuICAgICAgJGNvbnRhaW5lciAgICAgICAgICAgICAgICA6ICRjb250YWluZXIsXG4gICAgICAkbXVuZ2UgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UnKSxcbiAgICAgICRtdW5nZV9jbGVhciAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtY2xlYXInKSxcbiAgICAgICRtdW5nZV9tZXRhZGF0YV9pbnB1dCAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtbWV0YSBpbnB1dCcpLFxuICAgICAgJG11bmdlX21ldGFkYXRhX2xhYmVsICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLW11bmdlIC5lbS1tdW5nZS1tZXRhIGxhYmVsJyksXG4gICAgICAkbXVuZ2VfbWV0YWRhdGFfaGVscCAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLW1ldGEgLmhlbHAtYmxvY2snKSxcbiAgICAgICRtdW5nZV9tZXRhZGF0YV9yZXN1bHRzICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtbWV0YS1yZXN1bHRzJyksXG4gICAgICAkbXVuZ2Vfc3BlY19pbnB1dCAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLXNwZWNpZXMgaW5wdXQnKSxcbiAgICAgICRtdW5nZV9kYXRhX2lucHV0ICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtZGF0YSBpbnB1dCcpLFxuICAgICAgJG11bmdlX2RhdGFfbGFiZWwgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLW11bmdlIC5lbS1tdW5nZS1kYXRhIGxhYmVsJyksXG4gICAgICAkbXVuZ2VfZGF0YV9oZWxwICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tbXVuZ2UgLmVtLW11bmdlLWRhdGEgLmhlbHAtYmxvY2snKSxcbiAgICAgICRtdW5nZV9kYXRhX3Jlc3VsdHMgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1tdW5nZSAuZW0tbXVuZ2UtZGF0YS1yZXN1bHRzJylcbiAgICB9O1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvc2V0SlF1ZXJ5TWFwL1xuXG4gIC8vIEJlZ2luIERPTSBtZXRob2QgL3Byb2Nlc3NNZXRhRmlsZS9cbiAgcHJvY2Vzc01ldGFGaWxlID0gZnVuY3Rpb24oIGRhdGEsIGNiICl7XG4gICAgaWYoICFkYXRhLmhhc093blByb3BlcnR5KCdmaWxlcycpIHx8ICFkYXRhLmZpbGVzLmxlbmd0aCApe1xuICAgICAgYWxlcnQoJ05vIGZpbGUgc2VsZWN0ZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3RhdGVNYXAubWV0YWRhdGFfZmlsZSA9IGRhdGEuZmlsZXNbMF07XG5cbiAgICAvL3BlcmZvcm0gdGhlIHJlcXVlc3RcbiAgICB2YXIganF4aHIgPSBvY3B1LmNhbGwoJ2NyZWF0ZV9tZXRhJywge1xuICAgICAgbWV0YWRhdGFfZmlsZSA6IHN0YXRlTWFwLm1ldGFkYXRhX2ZpbGVcbiAgICB9LCBmdW5jdGlvbihzZXNzaW9uKXtcbiAgICAgIHN0YXRlTWFwLm1ldGFkYXRhX3Nlc3Npb24gPSBzZXNzaW9uOyAgICBcbiAgICB9KTtcblxuICAgIGpxeGhyLmRvbmUoZnVuY3Rpb24oKXtcbiAgICAgIC8vY2xlYXIgYW55IHByZXZpb3VzIGhlbHAgbWVzc2FnZXNcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfaGVscC50ZXh0KCBzdGF0ZU1hcC5tZXRhZGF0YV9maWxlLm5hbWUgKTtcbiAgICAgIGNiKCBudWxsLCBzdGF0ZU1hcC5tZXRhZGF0YV9zZXNzaW9uICk7XG4gICAgfSk7XG5cbiAgICBqcXhoci5mYWlsKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZXJyVGV4dCA9IFwiU2VydmVyIGVycm9yOiBcIiArIGpxeGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyVGV4dCk7XG4gICAgICBqcXVlcnlNYXAuJG11bmdlX21ldGFkYXRhX2hlbHAudGV4dChlcnJUZXh0KTtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfcmVzdWx0cy5lbXB0eSgpO1xuICAgICAgY2IoIHRydWUgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvcHJvY2Vzc01ldGFGaWxlL1xuXG4gIC8vIEJlZ2luIERPTSBtZXRob2QgL3Byb2Nlc3NEYXRhRmlsZXMvXG4gIHByb2Nlc3NEYXRhRmlsZXMgPSBmdW5jdGlvbiggZGF0YSwgY2IgKXtcblxuICAgIGlmKCAhZGF0YS5oYXNPd25Qcm9wZXJ0eSgnc3BlY2llcycpIHx8XG4gICAgICAgICFkYXRhLmhhc093blByb3BlcnR5KCdmaWxlcycpIHx8XG4gICAgICAgICFkYXRhLmZpbGVzLmxlbmd0aCApe1xuICAgICAgYWxlcnQoJ05vIGZpbGUocykgc2VsZWN0ZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoICFzdGF0ZU1hcC5tZXRhZGF0YV9maWxlICl7XG4gICAgICBhbGVydCgnUGxlYXNlIGxvYWQgbWV0YWRhdGEuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3RhdGVNYXAuZGF0YV9maWxlcyA9IGRhdGEuZmlsZXM7XG5cbiAgICAvLyBvcGVuY3B1IG9ubHkgYWNjZXB0cyBzaW5nbGUgZmlsZXMgYXMgYXJndW1lbnRzXG4gICAgdmFyIGFyZ3MgPSB7XG4gICAgICBtZXRhZGF0YV9maWxlICAgOiBzdGF0ZU1hcC5tZXRhZGF0YV9maWxlLFxuICAgICAgc3BlY2llcyAgICAgICAgIDogZGF0YS5zcGVjaWVzXG4gICAgfTtcblxuICAgIC8vIGxvb3AgdGhyb3VnaCBmaWxlc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGVNYXAuZGF0YV9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZmlsZSA9IHN0YXRlTWFwLmRhdGFfZmlsZXMuaXRlbShpKTtcbiAgICAgICAgYXJnc1snZmlsZScgKyBpXSA9IGZpbGU7XG4gICAgfVxuXG4gICAgLy9wZXJmb3JtIHRoZSByZXF1ZXN0XG4gICAgdmFyIGpxeGhyID0gb2NwdS5jYWxsKCdtZXJnZV9kYXRhJyxcbiAgICAgIGFyZ3MsXG4gICAgICBmdW5jdGlvbihzZXNzaW9uKXtcbiAgICAgICAgc3RhdGVNYXAuZGF0YV9zZXNzaW9uID0gc2Vzc2lvbjtcbiAgICAgICAgdXRpbC5kaXNwbGF5QXNQcmludCgnUmVzdWx0cycsXG4gICAgICAgICAgc3RhdGVNYXAuZGF0YV9zZXNzaW9uLFxuICAgICAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9yZXN1bHRzKTtcbiAgICB9KTtcblxuICAgIGpxeGhyLmRvbmUoZnVuY3Rpb24oKXtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9oZWxwLnRleHQoJ0ZpbGVzIG1lcmdlZDogJyArIHN0YXRlTWFwLmRhdGFfZmlsZXMubGVuZ3RoKTtcbiAgICAgIGNiKCBudWxsLCBzdGF0ZU1hcC5kYXRhX3Nlc3Npb24gKTtcbiAgICB9KTtcblxuICAgIGpxeGhyLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgIHZhciBlcnJUZXh0ID0gXCJTZXJ2ZXIgZXJyb3I6IFwiICsganF4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgY29uc29sZS5lcnJvcihlcnJUZXh0KTtcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9oZWxwLnRleHQoZXJyVGV4dCk7XG4gICAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfcmVzdWx0cy5lbXB0eSgpO1xuICAgICAgY2IoIHRydWUgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvcHJvY2Vzc0RhdGFGaWxlcy9cbiAgLy8gLS0tLS0tLS0tLSBFTkQgRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gLS0tLS0tLS0tLSBCRUdJTiBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uTWV0YUZpbGVDaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIHZhclxuICAgIHNlbGYgPSAkKHRoaXMpLFxuICAgIGRhdGEgPSB7XG4gICAgICBmaWxlcyAgIDogc2VsZlswXS5maWxlcyxcbiAgICB9O1xuICAgIHJldHVybiBwcm9jZXNzTWV0YUZpbGUoIGRhdGEsIG9uTWV0YWRhdGFQcm9jZXNzZWQgKTtcbiAgfTtcblxuICBvbk1ldGFkYXRhUHJvY2Vzc2VkID0gZnVuY3Rpb24oIGVyciwgc2Vzc2lvbiApe1xuICAgIGlmKCBlcnIgKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIHV0aWwuZGlzcGxheUFzVGFibGUoJ1Jlc3VsdHMnLFxuICAgICAgc2Vzc2lvbixcbiAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfcmVzdWx0cyxcbiAgICAgIGZ1bmN0aW9uKCBlcnIgKXtcbiAgICAgICAgaWYoIGVyciApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIHRvZ2dsZUlucHV0KCAnZGF0YScsIHRydWUgKTtcbiAgICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIG9uRGF0YUZpbGVzQ2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgZGF0YSA9IHtcbiAgICAgIGZpbGVzICAgOiBzZWxmWzBdLmZpbGVzLFxuICAgICAgc3BlY2llcyA6IGpxdWVyeU1hcC4kbXVuZ2Vfc3BlY19pbnB1dC52YWwoKS50cmltKCkudG9Mb3dlckNhc2UoKSB8fCBudWxsXG4gICAgfTtcbiAgICByZXR1cm4gcHJvY2Vzc0RhdGFGaWxlcyggZGF0YSwgb25EYXRhUHJvY2Vzc2VkICk7XG4gIH07XG5cbiAgb25EYXRhUHJvY2Vzc2VkID0gZnVuY3Rpb24oIGVyciwgc2Vzc2lvbiApe1xuICAgIGlmKCBlcnIgKXsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdXRpbC5kaXNwbGF5QXNQcmludCgnUmVzdWx0cycsXG4gICAgIHNlc3Npb24sXG4gICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9yZXN1bHRzLFxuICAgICBmdW5jdGlvbiggZXJyICkge1xuICAgICAgICBpZiAoIGVyciApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIHRvZ2dsZUlucHV0KCAnbWV0YWRhdGEnLCBmYWxzZSApO1xuICAgICAgICB0b2dnbGVJbnB1dCggJ2RhdGEnLCBmYWxzZSApO1xuXG4gICAgICAgIC8vTWFrZSB0aGUgZGF0YSBhdmFpbGFibGVcbiAgICAgICAgJC5nZXZlbnQucHVibGlzaChcbiAgICAgICAgICAnZW0tbXVuZ2UtZGF0YScsXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0YWRhdGFfc2Vzc2lvbiA6IHN0YXRlTWFwLm1ldGFkYXRhX3Nlc3Npb24sXG4gICAgICAgICAgICBkYXRhX3Nlc3Npb24gICAgIDogc3RhdGVNYXAuZGF0YV9zZXNzaW9uXG4gICAgICAgICAgfVxuICAgICAgICAgKTtcbiAgICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC90b2dnbGVJbnB1dC9cbiAgLyogVG9nZ2xlIHRoZSBpbnB1dCBhdmFpbGJpbGl0eSBmb3IgYSBtYXRjaGVkIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtIGxhYmVsIHRoZSBzdGF0ZU1hcCBrZXkgdG8gc2V0XG4gICAqIEBwYXJhbSBkb19lbmFibGUgYm9vbGVhbiB0cnVlIGlmIGVuYWJsZSwgZmFsc2UgdG8gZGlzYWJsZVxuICAgKlxuICAgKiBAcmV0dXJuIGJvb2xlYW5cbiAgICovXG4gIHRvZ2dsZUlucHV0ID0gZnVuY3Rpb24oIGxhYmVsLCBkb19lbmFibGUgKSB7XG4gICAgdmFyICRoYW5kbGVzID0gbGFiZWwgPT09ICdkYXRhJyA/XG4gICAgICBbIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9sYWJlbCxcbiAgICAgICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX2lucHV0LFxuICAgICAgICBqcXVlcnlNYXAuJG11bmdlX3NwZWNfaW5wdXQgXSA6XG4gICAgICBbIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfbGFiZWwsXG4gICAgICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfaW5wdXQgXTtcblxuICAgICQuZWFjaCggJGhhbmRsZXMsIGZ1bmN0aW9uKCBpbmRleCwgdmFsdWUgKXtcbiAgICAgIHZhbHVlLmF0dHIoJ2Rpc2FibGVkJywgIWRvX2VuYWJsZSApO1xuICAgICAgdmFsdWUuYXR0cignZGlzYWJsZWQnLCAhZG9fZW5hYmxlICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLy8gRW5kIHB1YmxpYyBtZXRob2QgL3RvZ2dsZUlucHV0L1xuXG4gIC8vIEJlZ2luIHB1YmxpYyBtZXRob2QgL3Jlc2V0L1xuICAvKiBSZXR1cm4gdG8gdGhlIGdyb3VuZCBzdGF0ZVxuICAgKlxuICAgKiBAcmV0dXJuIGJvb2xlYW5cbiAgICovXG4gIHJlc2V0ID0gZnVuY3Rpb24oICkge1xuICAgIC8vIE11c3QgZG8gdGhpcyBtYW51YWxseVxuICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfaW5wdXQudmFsKFwiXCIpO1xuICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfaGVscC50ZXh0KGNvbmZpZ01hcC5kZWZhdWx0X21ldGFkYXRhX2hlbHApO1xuICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfcmVzdWx0cy5lbXB0eSgpO1xuICAgIGpxdWVyeU1hcC4kbXVuZ2Vfc3BlY19pbnB1dC52YWwoXCJcIik7XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX2lucHV0LnZhbChcIlwiKTtcbiAgICBqcXVlcnlNYXAuJG11bmdlX2RhdGFfaGVscC50ZXh0KGNvbmZpZ01hcC5kZWZhdWx0X2RhdGFfaGVscCk7XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX3Jlc3VsdHMuZW1wdHkoKTtcblxuICAgIC8vIG11c3QgY2xlYXIgb3V0IHN0YXRlTWFwIHJlZmVyZW5jZXNcbiAgICBzdGF0ZU1hcC5tZXRhZGF0YV9zZXNzaW9uID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5tZXRhZGF0YV9maWxlICAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5kYXRhX3Nlc3Npb24gICAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5kYXRhX2ZpbGVzICAgICAgID0gbnVsbDtcblxuICAgIC8vIHJlc2V0IGlucHV0XG4gICAgdG9nZ2xlSW5wdXQoICdtZXRhZGF0YScsIHRydWUgKTtcbiAgICB0b2dnbGVJbnB1dCggJ2RhdGEnLCBmYWxzZSApO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvcmVzZXQvXG5cblxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC9jb25maWdNb2R1bGUvXG4gIC8qIFRoZSBpbnRlcm5hbCBjb25maWd1cmF0aW9uIGRhdGEgc3RydWN0dXJlIChjb25maWdNYXApIGlzXG4gICAqIHVwZGF0ZWQgd2l0aCBwcm92aWRlZCBhcmd1bWVudHMuIE5vIG90aGVyIGFjdGlvbnMgYXJlIHRha2VuLlxuICAgKlxuICAgKiBAcmV0dXJuIHRydWUgaWYgdXBkYXRlZCBzdWNjZXNzZnVsbHlcbiAgICovXG4gIGNvbmZpZ01vZHVsZSA9IGZ1bmN0aW9uICggaW5wdXRfbWFwICkge1xuICAgIHV0aWwuc2V0Q29uZmlnTWFwKHtcbiAgICAgIGlucHV0X21hcCAgICA6IGlucHV0X21hcCxcbiAgICAgIHNldHRhYmxlX21hcCA6IGNvbmZpZ01hcC5zZXR0YWJsZV9tYXAsXG4gICAgICBjb25maWdfbWFwICAgOiBjb25maWdNYXBcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgLy8gRW5kIHB1YmxpYyBtZXRob2QgL2NvbmZpZ01vZHVsZS9cblxuICAvKiBpbml0TW9kdWxlXG4gICAqIEBwYXJhbSBvY3B1IChPYmplY3QpIG9jcHUgc2luZ2xldG9uXG4gICAqIEBwYXJhbSAkY29udGFpbmVyIChPYmplY3QpIGpRdWVyeSBwYXJlbnRcbiAgICovXG4gIGluaXRNb2R1bGUgPSBmdW5jdGlvbiggJGNvbnRhaW5lciApe1xuICAgIGlmKCAhJGNvbnRhaW5lciApe1xuICAgICAgY29uc29sZS5lcnJvciggJ01pc3NpbmcgY29udGFpbmVyJyApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgICRjb250YWluZXIuaHRtbCggY29uZmlnTWFwLnRlbXBsYXRlICk7XG4gICAgc2V0SlF1ZXJ5TWFwKCAkY29udGFpbmVyICk7XG5cbiAgICBqcXVlcnlNYXAuJG11bmdlX21ldGFkYXRhX2hlbHAudGV4dCggY29uZmlnTWFwLmRlZmF1bHRfbWV0YWRhdGFfaGVscCApO1xuICAgIGpxdWVyeU1hcC4kbXVuZ2VfZGF0YV9oZWxwLnRleHQoIGNvbmZpZ01hcC5kZWZhdWx0X2RhdGFfaGVscCApO1xuXG4gICAgLy8gYmluZCBmaWxlIGNoYW5nZSBIQU5ETEVSU1xuICAgIGpxdWVyeU1hcC4kbXVuZ2VfbWV0YWRhdGFfaW5wdXQuY2hhbmdlKCBvbk1ldGFGaWxlQ2hhbmdlICk7XG4gICAganF1ZXJ5TWFwLiRtdW5nZV9kYXRhX2lucHV0LmNoYW5nZSggb25EYXRhRmlsZXNDaGFuZ2UgKTtcbiAgICB0b2dnbGVJbnB1dCggJ21ldGFkYXRhJywgdHJ1ZSApO1xuICAgIHRvZ2dsZUlucHV0KCAnZGF0YScsIGZhbHNlICk7XG5cbiAgICBqcXVlcnlNYXAuJG11bmdlX2NsZWFyLmNsaWNrKCByZXNldCApO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIC0tLS0tLS0tLS0gRU5EIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmV0dXJuIHtcbiAgICBpbml0TW9kdWxlICAgICAgOiBpbml0TW9kdWxlLFxuICAgIGNvbmZpZ01vZHVsZSAgICA6IGNvbmZpZ01vZHVsZSxcbiAgICByZXNldCAgICAgICAgICAgOiByZXNldFxuICB9O1xuXG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG11bmdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG52YXIgb2NwdSA9IHJlcXVpcmUoJy4uL2xpYi9vcGVuY3B1LmpzL29wZW5jcHUtMC41LW5wbS5qcycpO1xuXG52YXIgcHJvY2Vzc19yc2VxID0gKGZ1bmN0aW9uKCl7XG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB2YXJcbiAgY29uZmlnTWFwID0ge1xuICAgIGFuY2hvcl9zY2hlbWFfbWFwIDoge1xuICAgIH0sXG4gICAgdGVtcGxhdGUgOiBTdHJpbmcoKSArXG4gICAgICAnPGRpdiBjbGFzcz1cImVtLXByb2Nlc3NfcnNlcVwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAgICc8aDIgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTEwIGVtLXNlY3Rpb24tdGl0bGVcIj5STkEgU2VxdWVuY2luZyBBbmFseXNpcyA8c21hbGw+PC9zbWFsbD48L2gyPicgK1xuICAgICAgICAgICc8aDQgY2xhc3M9XCJjb2wteHMtMTIgY29sLXNtLTJcIj48YSBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1ibG9jayBlbS1wcm9jZXNzX3JzZXEtY2xlYXIgY2xlYXItYnRuIGFqYXgtc2Vuc2l0aXZlIGNvbC14cy0zIGNvbC1tZC0zXCI+UmVzZXQ8L2E+PC9oND4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGhyLz4nICtcbiAgICAgICAgJzxmb3JtIGNsYXNzPVwiZm9ybS1ob3Jpem9udGFsIGVtLXByb2Nlc3NfcnNlcS1jbGFzc1wiPicgK1xuICAgICAgICAgICc8ZmllbGRzZXQ+JyArXG4gICAgICAgICAgICAnPGxlZ2VuZD5EaWZmZXJlbnRpYWwgRXhwcmVzc2lvbiBUZXN0aW5nPC9sZWdlbmQ+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJlbS1wcm9jZXNzX3JzZXEtY2xhc3MtdGVzdFwiIGNsYXNzPVwiY29sLXNtLTIgY29udHJvbC1sYWJlbFwiPlRlc3QgQ2xhc3M8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS0xMFwiPicgK1xuICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZW0tcHJvY2Vzc19yc2VxLWNsYXNzLXRlc3RcIiBwbGFjZWhvbGRlcj1cIlRlc3RcIj4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAgICc8bGFiZWwgZm9yPVwiZW0tcHJvY2Vzc19yc2VxLWNsYXNzLWJhc2VsaW5lXCIgY2xhc3M9XCJjb2wtc20tMiBjb250cm9sLWxhYmVsXCI+QmFzZWxpbmU8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS0xMFwiPicgK1xuICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZW0tcHJvY2Vzc19yc2VxLWNsYXNzLWJhc2VsaW5lXCIgcGxhY2Vob2xkZXI9XCJCYXNlbGluZVwiPicgK1xuICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtc20tb2Zmc2V0LTIgY29sLXNtLTEwXCI+JyArXG4gICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9jayBlbS1wcm9jZXNzX3JzZXEtY2xhc3Mtc3VibWl0XCI+U3VibWl0PC9idXR0b24+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8cD48c21hbGwgY2xhc3M9XCJjb2wtc20tb2Zmc2V0LTIgaGVscC1ibG9ja1wiPjwvc21hbGw+PC9wPicgK1xuICAgICAgICAgICc8L2ZpZWxkc2V0PicgK1xuICAgICAgICAnPC9mb3JtPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzXCI+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLXNtLW9mZnNldC0yIGNvbC1zbS0xMFwiPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInByb2dyZXNzIGVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzLXByb2dyZXNzXCI+JyArXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLWRhbmdlclwiIHN0eWxlPVwid2lkdGg6IDUwJTtcIj4nICtcbiAgICAgICAgICAgICAgICAgICc8c3Bhbj5GaWx0ZXJpbmc8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1wcmltYXJ5XCIgc3R5bGU9XCJ3aWR0aDogMjUlO1wiPicgK1xuICAgICAgICAgICAgICAgICAgJzxzcGFuPk5vcm1hbGl6aW5nPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItc3VjY2Vzc1wiIHN0eWxlPVwid2lkdGg6IDI1JTtcIj4nICtcbiAgICAgICAgICAgICAgICAgICc8c3Bhbj5UZXN0aW5nPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzLWRldGVzdFwiPjwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMtZGVwbG90IHJwbG90XCI+PC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICc8L2Rpdj4nLFxuXG4gICAgc2V0dGFibGVfbWFwIDoge31cbiAgfSxcbiAgc3RhdGVNYXAgPSB7XG4gICAgbWV0YWRhdGFfc2Vzc2lvbiAgICAgICAgOiBudWxsLFxuICAgIGRhdGFfc2Vzc2lvbiAgICAgICAgICAgIDogbnVsbCxcbiAgICBmaWx0ZXJfcnNlcV9zZXNzaW9uICAgICA6IG51bGwsXG4gICAgbm9ybWFsaXplX3JzZXFfc2Vzc2lvbiAgOiBudWxsLFxuICAgIGRlX3Rlc3RfcnNlcV9zZXNzaW9uICAgIDogbnVsbCxcbiAgICBjbGFzc2VzICAgICAgICAgICAgICAgICA6IFtdLFxuICAgIHRlc3RfY2xhc3MgICAgICAgICAgICAgIDogbnVsbCxcbiAgICBiYXNlbGluZV9jbGFzcyAgICAgICAgICA6IG51bGxcbiAgfSxcbiAganF1ZXJ5TWFwID0ge30sXG4gIHJlc2V0LFxuICBzZXRKUXVlcnlNYXAsXG4gIGNvbmZpZ01vZHVsZSxcbiAgb25TdWJtaXRDbGFzcyxcbiAgcHJvY2Vzc1JOQVNlcSxcbiAgb25STkFTZXFQcm9jZXNzZWQsXG4gIHRvZ2dsZUlucHV0LFxuICBpbml0TW9kdWxlO1xuICAvLyAtLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIC0tLS0tLS0tLS0gQmVnaW4gVVRJTElUWSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tIEVuZCBVVElMSVRZIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9zZXRKUXVlcnlNYXAvXG4gIHNldEpRdWVyeU1hcCA9IGZ1bmN0aW9uKCAkY29udGFpbmVyICl7XG4gICAganF1ZXJ5TWFwID0ge1xuICAgICAgJGNvbnRhaW5lciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGVhciAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1jbGVhcicpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc190ZXN0X2lucHV0ICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1jbGFzcyAjZW0tcHJvY2Vzc19yc2VxLWNsYXNzLXRlc3QnKSxcbiAgICAgICRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfYmFzZWxpbmVfaW5wdXQgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tcHJvY2Vzc19yc2VxIC5lbS1wcm9jZXNzX3JzZXEtY2xhc3MgI2VtLXByb2Nlc3NfcnNlcS1jbGFzcy1iYXNlbGluZScpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19mb3JtICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1jbGFzcycpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19zdWJtaXQgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1jbGFzcyAuZW0tcHJvY2Vzc19yc2VxLWNsYXNzLXN1Ym1pdCcpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19oZWxwICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmhlbHAtYmxvY2snKSxcbiAgICAgICRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19kZXRlc3QgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tcHJvY2Vzc19yc2VxIC5lbS1wcm9jZXNzX3JzZXEtcmVzdWx0cyAuZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMtZGV0ZXN0JyksXG4gICAgICAkZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfZGVwbG90ICAgICAgICAgICA6ICRjb250YWluZXIuZmluZCgnLmVtLXByb2Nlc3NfcnNlcSAuZW0tcHJvY2Vzc19yc2VxLXJlc3VsdHMgLmVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzLWRlcGxvdCcpLFxuICAgICAgJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX3Byb2dyZXNzICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1wcm9jZXNzX3JzZXEgLmVtLXByb2Nlc3NfcnNlcS1yZXN1bHRzIC5lbS1wcm9jZXNzX3JzZXEtcmVzdWx0cy1wcm9ncmVzcycpXG4gICAgfTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cblxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9wcm9jZXNzUk5BU2VxL1xuICBwcm9jZXNzUk5BU2VxID0gZnVuY3Rpb24oIGJhc2VsaW5lLCB0ZXN0LCBjYiApe1xuXG4gICAgdmFyXG4gICAganF4aHJfZmlsdGVyLFxuICAgIGpxeGhyX25vcm1hbGl6ZSxcbiAgICBqcXhocl90ZXN0LFxuICAgIG9uZmFpbCxcbiAgICBvbkRvbmU7XG5cbiAgICBvbkRvbmUgPSBmdW5jdGlvbiggbiApe1xuICAgICAgdmFyICRiYXIgPSBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX3Byb2dyZXNzLmZpbmQoICcucHJvZ3Jlc3MtYmFyOm50aC1jaGlsZCgnICsgbiArICcpJyApO1xuICAgICAgICAkYmFyLnRvZ2dsZSggdHJ1ZSApO1xuICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfaGVscC50ZXh0KCcnKTtcbiAgICB9O1xuXG4gICAgb25mYWlsID0gZnVuY3Rpb24oIGpxWEhSICl7XG4gICAgICB2YXIgZXJyVGV4dCA9IFwiU2VydmVyIGVycm9yOiBcIiArIGpxWEhSLnJlc3BvbnNlVGV4dDtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyVGV4dCk7XG4gICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19oZWxwLnRleHQoZXJyVGV4dCk7XG4gICAgICBjYiggdHJ1ZSApO1xuICAgIH07XG5cbiAgICAvLyBmaWx0ZXJcbiAgICBqcXhocl9maWx0ZXIgPSBvY3B1LmNhbGwoJ2ZpbHRlcl9yc2VxJywge1xuICAgICAgc2UgICAgICAgICAgOiBzdGF0ZU1hcC5kYXRhX3Nlc3Npb24sXG4gICAgICBiYXNlbGluZSAgICA6IGJhc2VsaW5lLFxuICAgICAgdGVzdCAgICAgICAgOiB0ZXN0LFxuICAgICAgbWluX2NvdW50cyAgOiAxXG4gICAgfSwgZnVuY3Rpb24oIHNlc3Npb24gKXsgc3RhdGVNYXAuZmlsdGVyX3JzZXFfc2Vzc2lvbiA9IHNlc3Npb247IH0pXG4gICAgLmRvbmUoZnVuY3Rpb24oKXsgb25Eb25lKCAxICk7IH0pXG4gICAgLmZhaWwoIG9uZmFpbCApO1xuXG4gICAganF4aHJfbm9ybWFsaXplID0ganF4aHJfZmlsdGVyLnRoZW4oIGZ1bmN0aW9uKCApe1xuICAgICAgcmV0dXJuIG9jcHUuY2FsbCgnbm9ybWFsaXplX3JzZXEnLCB7XG4gICAgICAgIGZpbHRlcmVkX2RnZSAgOiBzdGF0ZU1hcC5maWx0ZXJfcnNlcV9zZXNzaW9uXG4gICAgICB9LCBmdW5jdGlvbiggc2Vzc2lvbiApeyBzdGF0ZU1hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uID0gc2Vzc2lvbjsgfSk7XG4gICAgfSlcbiAgICAuZG9uZSggZnVuY3Rpb24oKXsgb25Eb25lKCAyICk7IH0gKVxuICAgIC5mYWlsKCBvbmZhaWwgKTtcblxuICAgIGpxeGhyX3Rlc3QgPSBqcXhocl9ub3JtYWxpemUudGhlbiggZnVuY3Rpb24oICl7XG4gICAgICByZXR1cm4gb2NwdS5jYWxsKCdkZV90ZXN0X3JzZXEnLCB7XG4gICAgICAgIG5vcm1hbGl6ZWRfZGdlICA6IHN0YXRlTWFwLm5vcm1hbGl6ZV9yc2VxX3Nlc3Npb24sXG4gICAgICAgIGJhc2VsaW5lICAgICAgICA6IGJhc2VsaW5lLFxuICAgICAgICB0ZXN0ICAgICAgICAgICAgOiB0ZXN0XG4gICAgICB9LCBmdW5jdGlvbiggc2Vzc2lvbiApeyBzdGF0ZU1hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvbiA9IHNlc3Npb247IH0pO1xuICAgIH0pXG4gICAgLmRvbmUoIGZ1bmN0aW9uKCl7XG4gICAgICBvbkRvbmUoIDMgKTtcbiAgICAgIHRvZ2dsZUlucHV0KCAnY2xhc3MnLCBmYWxzZSApO1xuICAgICAgY2IoIG51bGwsIHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uICk7XG4gICAgfSlcbiAgICAuZmFpbCggb25mYWlsICk7XG4gICAgLy8gdGVzdFxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIC8vIEVuZCBET00gbWV0aG9kIC9wcm9jZXNzUk5BU2VxL1xuICAvLyAtLS0tLS0tLS0tIEJFR0lOIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25TdWJtaXRDbGFzcyA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX2hlbHAudGV4dChcIlwiKTtcblxuICAgIHZhclxuICAgICAgcHJvcG9zZWRfdGVzdF9jbGFzcyA9IGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX3Rlc3RfaW5wdXQudmFsKCksXG4gICAgICBwcm9wb3NlZF9iYXNlbGluZV9jbGFzcyA9IGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX2Jhc2VsaW5lX2lucHV0LnZhbCgpLFxuICAgICAgaXNPSyA9ICggc3RhdGVNYXAuY2xhc3Nlcy5pbmRleE9mKHByb3Bvc2VkX3Rlc3RfY2xhc3MpID4gLTEgJiZcbiAgICAgICBzdGF0ZU1hcC5jbGFzc2VzLmluZGV4T2YocHJvcG9zZWRfYmFzZWxpbmVfY2xhc3MpID4gLTEgKTtcblxuICAgICAgaWYoICFpc09LICkge1xuICAgICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19oZWxwXG4gICAgICAgICAgLnRleHQoWydJbnZhbGlkIGNsYXNzIGRlY2xhcmF0aW9uczogJyxcbiAgICAgICAgICAgICAgICBwcm9wb3NlZF90ZXN0X2NsYXNzLFxuICAgICAgICAgICAgICAgIHByb3Bvc2VkX2Jhc2VsaW5lX2NsYXNzXS5qb2luKCcgJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfcHJvZ3Jlc3NcbiAgICAgICAgLnRvZ2dsZSggdHJ1ZSApO1xuXG4gICAgICByZXR1cm4gcHJvY2Vzc1JOQVNlcSggcHJvcG9zZWRfYmFzZWxpbmVfY2xhc3MsXG4gICAgICAgIHByb3Bvc2VkX3Rlc3RfY2xhc3MsXG4gICAgICAgIG9uUk5BU2VxUHJvY2Vzc2VkICk7XG4gIH07XG5cblxuXG4gIG9uUk5BU2VxUHJvY2Vzc2VkID0gZnVuY3Rpb24oIGVyciwgZGVfdGVzdF9yc2VxX3Nlc3Npb24gKXtcbiAgICBpZiggZXJyICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIHZhclxuICAgIG5hbWUgPSAncGxvdF9kZScsXG4gICAgYXJncyA9IHtcbiAgICAgICAgZmlsdGVyZWRfZGdlICA6IHN0YXRlTWFwLmZpbHRlcl9yc2VxX3Nlc3Npb24sXG4gICAgICAgIGRlX3Rlc3RlZF90dCAgOiBzdGF0ZU1hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvbixcbiAgICAgICAgYmFzZWxpbmUgICAgICA6IHN0YXRlTWFwLmJhc2VsaW5lX2NsYXNzLFxuICAgICAgICB0ZXN0ICAgICAgICAgIDogc3RhdGVNYXAudGVzdF9jbGFzcyxcbiAgICAgICAgdGhyZXNob2xkICAgICA6IDAuMDVcbiAgICAgIH07XG5cbiAgICB1dGlsLmRpc3BsYXlBc1ByaW50KCAnREUgVGVzdGluZyBSZXN1bHRzJyxcbiAgICAgIGRlX3Rlc3RfcnNlcV9zZXNzaW9uLFxuICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19kZXRlc3QsXG4gICAgICBmdW5jdGlvbiggZXJyICl7XG4gICAgICAgIGlmKCBlcnIgKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgICAgIC8vTWFrZSB0aGUgZGF0YSBhdmFpbGFibGVcbiAgICAgICAgdXRpbC5ncmFwaGljUiggJ0RFIEdlbmVzJyxcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19kZXBsb3QsXG4gICAgICAgICAgZnVuY3Rpb24oIGVyciApe1xuICAgICAgICAgICAgaWYoIGVyciApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgICAgIC8vTWFrZSB0aGUgZGF0YSBhdmFpbGFibGVcbiAgICAgICAgICAgICQuZ2V2ZW50LnB1Ymxpc2goXG4gICAgICAgICAgICAgICdlbS1wcm9jZXNzX3JzZXEnLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmlsdGVyX3JzZXFfc2Vzc2lvbiAgICAgOiBzdGF0ZU1hcC5maWx0ZXJfcnNlcV9zZXNzaW9uLFxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZV9yc2VxX3Nlc3Npb24gIDogc3RhdGVNYXAubm9ybWFsaXplX3JzZXFfc2Vzc2lvbixcbiAgICAgICAgICAgICAgICBkZV90ZXN0X3JzZXFfc2Vzc2lvbiAgICA6IHN0YXRlTWFwLmRlX3Rlc3RfcnNlcV9zZXNzaW9uXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyAtLS0tLS0tLS0tIEVORCBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQmVnaW4gcHVibGljIG1ldGhvZCAvdG9nZ2xlSW5wdXQvXG4gIC8qIFRvZ2dsZSB0aGUgaW5wdXQgYXZhaWxiaWxpdHkgZm9yIGEgbWF0Y2hlZCBlbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSBsYWJlbCB0aGUgc3RhdGVNYXAga2V5IHRvIHNldFxuICAgKiBAcGFyYW0gZG9fZW5hYmxlIGJvb2xlYW4gdHJ1ZSBpZiBlbmFibGUsIGZhbHNlIHRvIGRpc2FibGVcbiAgICpcbiAgICogQHJldHVybiBib29sZWFuXG4gICAqL1xuICB0b2dnbGVJbnB1dCA9IGZ1bmN0aW9uKCBsYWJlbCwgZG9fZW5hYmxlICkge1xuICAgIHZhciAkaGFuZGxlcyA9IGxhYmVsID09PSAnY2xhc3MnID9cbiAgICAgIFsganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfdGVzdF9pbnB1dCxcbiAgICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfYmFzZWxpbmVfaW5wdXQsXG4gICAgICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX2NsYXNzX3N1Ym1pdCBdIDpcbiAgICAgIFtdO1xuXG4gICAgJC5lYWNoKCAkaGFuZGxlcywgZnVuY3Rpb24oIGluZGV4LCB2YWx1ZSApe1xuICAgICAgdmFsdWUuYXR0cignZGlzYWJsZWQnLCAhZG9fZW5hYmxlICk7XG4gICAgICB2YWx1ZS5hdHRyKCdkaXNhYmxlZCcsICFkb19lbmFibGUgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvdG9nZ2xlSW5wdXQvXG5cbiAgLy8gQmVnaW4gcHVibGljIG1ldGhvZCAvcmVzZXQvXG4gIC8qIFJldHVybiB0byB0aGUgZ3JvdW5kIHN0YXRlXG4gICAqXG4gICAqIEByZXR1cm4gYm9vbGVhblxuICAgKi9cbiAgcmVzZXQgPSBmdW5jdGlvbiggKSB7XG5cbiAgICBzdGF0ZU1hcC5maWx0ZXJfcnNlcV9zZXNzaW9uICAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5ub3JtYWxpemVfcnNlcV9zZXNzaW9uID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5kZV90ZXN0X3JzZXFfc2Vzc2lvbiAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC50ZXN0X2NsYXNzICAgICAgICAgICAgID0gbnVsbDtcbiAgICBzdGF0ZU1hcC5iYXNlbGluZV9jbGFzcyAgICAgICAgID0gbnVsbDtcblxuICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfcHJvZ3Jlc3MuZmluZCggJy5wcm9ncmVzcy1iYXInICkudG9nZ2xlKCBmYWxzZSApO1xuICAgIGpxdWVyeU1hcC4kZW1fcHJvY2Vzc19yc2VxX3Jlc3VsdHNfcHJvZ3Jlc3MudG9nZ2xlKCBmYWxzZSApO1xuXG4gICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19kZXRlc3QuZW1wdHkoKTtcbiAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9yZXN1bHRzX2RlcGxvdC5lbXB0eSgpO1xuXG4gICAgdG9nZ2xlSW5wdXQoICdjbGFzcycsIHRydWUgKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvcmVzZXQvXG5cblxuICAvLyBCZWdpbiBwdWJsaWMgbWV0aG9kIC9jb25maWdNb2R1bGUvXG4gIC8vIEV4YW1wbGUgICA6IHNwYS5jaGF0LmNvbmZpZ01vZHVsZSh7IHNsaWRlcl9vcGVuX2VtIDogMTggfSk7XG4gIC8vIFB1cnBvc2UgICA6IENvbmZpZ3VyZSB0aGUgbW9kdWxlIHByaW9yIHRvIGluaXRpYWxpemF0aW9uXG4gIC8vIEFyZ3VtZW50cyA6XG4gIC8vICAgKiBzZXRfY2hhdF9hbmNob3IgLSBhIGNhbGxiYWNrIHRvIG1vZGlmeSB0aGUgVVJJIGFuY2hvciB0b1xuICAvLyAgICAgaW5kaWNhdGUgb3BlbmVkIG9yIGNsb3NlZCBzdGF0ZS4gVGhpcyBjYWxsYmFjayBtdXN0IHJldHVyblxuICAvLyAgICAgZmFsc2UgaWYgdGhlIHJlcXVlc3RlZCBzdGF0ZSBjYW5ub3QgYmUgbWV0XG4gIC8vICAgKiBjaGF0X21vZGVsIC0gdGhlIGNoYXQgbW9kZWwgb2JqZWN0IHByb3ZpZGVzIG1ldGhvZHNcbiAgLy8gICAgICAgdG8gaW50ZXJhY3Qgd2l0aCBvdXIgaW5zdGFudCBtZXNzYWdpbmdcbiAgLy8gICAqIHBlb3BsZV9tb2RlbCAtIHRoZSBwZW9wbGUgbW9kZWwgb2JqZWN0IHdoaWNoIHByb3ZpZGVzXG4gIC8vICAgICAgIG1ldGhvZHMgdG8gbWFuYWdlIHRoZSBsaXN0IG9mIHBlb3BsZSB0aGUgbW9kZWwgbWFpbnRhaW5zXG4gIC8vICAgKiBzbGlkZXJfKiBzZXR0aW5ncy4gQWxsIHRoZXNlIGFyZSBvcHRpb25hbCBzY2FsYXJzLlxuICAvLyAgICAgICBTZWUgbWFwQ29uZmlnLnNldHRhYmxlX21hcCBmb3IgYSBmdWxsIGxpc3RcbiAgLy8gICAgICAgRXhhbXBsZTogc2xpZGVyX29wZW5fZW0gaXMgdGhlIG9wZW4gaGVpZ2h0IGluIGVtJ3NcbiAgLy8gQWN0aW9uICAgIDpcbiAgLy8gICBUaGUgaW50ZXJuYWwgY29uZmlndXJhdGlvbiBkYXRhIHN0cnVjdHVyZSAoY29uZmlnTWFwKSBpc1xuICAvLyAgIHVwZGF0ZWQgd2l0aCBwcm92aWRlZCBhcmd1bWVudHMuIE5vIG90aGVyIGFjdGlvbnMgYXJlIHRha2VuLlxuICAvLyBSZXR1cm5zICAgOiB0cnVlXG4gIC8vIFRocm93cyAgICA6IEphdmFTY3JpcHQgZXJyb3Igb2JqZWN0IGFuZCBzdGFjayB0cmFjZSBvblxuICAvLyAgICAgICAgICAgICB1bmFjY2VwdGFibGUgb3IgbWlzc2luZyBhcmd1bWVudHNcbiAgLy9cbiAgY29uZmlnTW9kdWxlID0gZnVuY3Rpb24gKCBpbnB1dF9tYXAgKSB7XG4gICAgdXRpbC5zZXRDb25maWdNYXAoe1xuICAgICAgaW5wdXRfbWFwICAgIDogaW5wdXRfbWFwLFxuICAgICAgc2V0dGFibGVfbWFwIDogY29uZmlnTWFwLnNldHRhYmxlX21hcCxcbiAgICAgIGNvbmZpZ19tYXAgICA6IGNvbmZpZ01hcFxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyBFbmQgcHVibGljIG1ldGhvZCAvY29uZmlnTW9kdWxlL1xuXG4gIC8qIGluaXRNb2R1bGVcbiAgICogQHBhcmFtICRjb250YWluZXIgKE9iamVjdCkgalF1ZXJ5IHBhcmVudFxuICAgKiBAcGFyYW0gbXNnX21hcCBPYmplY3QgdGhlIHBhcmVudCBzZXNzaW9uXG4gICAqL1xuICBpbml0TW9kdWxlID0gZnVuY3Rpb24oICRjb250YWluZXIsIG1zZ19tYXAgKXtcbiAgICBpZiggISRjb250YWluZXIgKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgY29udGFpbmVyJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmKCAkLmlzRW1wdHlPYmplY3QoIG1zZ19tYXAgKSB8fFxuICAgICAgICFtc2dfbWFwLmhhc093blByb3BlcnR5KCAnbWV0YWRhdGFfc2Vzc2lvbicgKSB8fFxuICAgICAgICFtc2dfbWFwLmhhc093blByb3BlcnR5KCAnZGF0YV9zZXNzaW9uJyApKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgbXNnX21hcCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAkY29udGFpbmVyLmh0bWwoIGNvbmZpZ01hcC50ZW1wbGF0ZSApO1xuXG4gICAgc2V0SlF1ZXJ5TWFwKCAkY29udGFpbmVyICk7XG4gICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19wcm9ncmVzcy5maW5kKCAnLnByb2dyZXNzLWJhcicgKS50b2dnbGUoIGZhbHNlICk7XG4gICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfcmVzdWx0c19wcm9ncmVzcy50b2dnbGUoIGZhbHNlICk7XG5cbiAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGVhci5jbGljayggcmVzZXQgKTtcblxuICAgIHN0YXRlTWFwLm1ldGFkYXRhX3Nlc3Npb24gPSBtc2dfbWFwLm1ldGFkYXRhX3Nlc3Npb247XG4gICAgc3RhdGVNYXAuZGF0YV9zZXNzaW9uID0gbXNnX21hcC5kYXRhX3Nlc3Npb247XG5cbiAgICAvLyBwb3B1bGF0ZSB0aGUgY29tcGFyaXNvbnMgYnkgZGVmYXVsdFxuICAgIHN0YXRlTWFwLm1ldGFkYXRhX3Nlc3Npb24uZ2V0T2JqZWN0KGZ1bmN0aW9uKCBkYXRhICl7XG4gICAgICBpZiggIWRhdGEubGVuZ3RoICl7IHJldHVybjsgfVxuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhWzBdKTtcbiAgICAgIHZhciBjbGFzc2VzID0gZGF0YS5tYXAoZnVuY3Rpb24oIHZhbCApeyByZXR1cm4gdmFsW2tleXNbMV1dOyB9KTtcblxuICAgICAgLy8gU2V0IHRoZSBjbGFzc2VzIGludGhlIHN0YXRlTWFwXG4gICAgICB2YXIgdW5pcXVlID0gdXRpbC51bmlxdWUoIGNsYXNzZXMgKTtcbiAgICAgIGlmKCB1bmlxdWUubGVuZ3RoICE9PSAyICl7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoICdUaGVyZSBhcmUgbm90IGV4YWN0bHkgMiBjbGFzc2VzJyApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHN0YXRlTWFwLmNsYXNzZXMgPSB1bmlxdWU7XG4gICAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc190ZXN0X2lucHV0XG4gICAgICAgIC5hdHRyKCAncGxhY2Vob2xkZXInLCBzdGF0ZU1hcC5jbGFzc2VzWzBdIClcbiAgICAgICAgLnZhbCggc3RhdGVNYXAuY2xhc3Nlc1swXSApO1xuICAgICAganF1ZXJ5TWFwLiRlbV9wcm9jZXNzX3JzZXFfY2xhc3NfYmFzZWxpbmVfaW5wdXRcbiAgICAgICAgLmF0dHIoICdwbGFjZWhvbGRlcicsIHN0YXRlTWFwLmNsYXNzZXNbMV0gKVxuICAgICAgICAudmFsKCBzdGF0ZU1hcC5jbGFzc2VzWzFdICk7XG4gICAgfSk7XG5cbiAgICBqcXVlcnlNYXAuJGVtX3Byb2Nlc3NfcnNlcV9jbGFzc19mb3JtLnN1Ym1pdCggb25TdWJtaXRDbGFzcyApO1xuICB9O1xuICAvLyAtLS0tLS0tLS0tIEVORCBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJldHVybiB7XG4gICAgaW5pdE1vZHVsZSAgICAgIDogaW5pdE1vZHVsZSxcbiAgICBjb25maWdNb2R1bGUgICAgOiBjb25maWdNb2R1bGUsXG4gICAgcmVzZXQgICAgICAgICAgIDogcmVzZXRcbiAgfTtcblxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwcm9jZXNzX3JzZXE7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcbnZhciBtdW5nZSA9IHJlcXVpcmUoJy4vbXVuZ2UuanMnKTtcbnZhciBwcm9jZXNzX3JzZXEgPSByZXF1aXJlKCcuL3Byb2Nlc3NfcnNlcS5qcycpO1xudmFyIGVtZGF0YSA9IHJlcXVpcmUoJy4vZW1kYXRhLmpzJyk7XG52YXIgb2NwdSA9IHJlcXVpcmUoJy4uL2xpYi9vcGVuY3B1LmpzL29wZW5jcHUtMC41LW5wbS5qcycpO1xuXG4vL2luaXQgdGhpcyBzY3JpcHQgd2hlbiB0aGUgcGFnZSBoYXMgbG9hZGVkXG52YXIgc2hlbGwgPSAoZnVuY3Rpb24oKXtcblxuICAvLyAtLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdmFyXG4gIGNvbmZpZ01hcCA9IHtcbiAgICBkZWZhdWx0X3BhdGggOiAnLy9sb2NhbGhvc3Q6ODA4MC9SJyxcbiAgICBhbmNob3Jfc2NoZW1hX21hcCA6IHtcbiAgICAgIG1ldGFkYXRhICA6IHsgZW5hYmxlZDogdHJ1ZSwgZGlzYWJsZWQ6IHRydWUgfSxcbiAgICAgIGRhdGEgICAgICA6IHsgZW5hYmxlZDogdHJ1ZSwgZGlzYWJsZWQ6IHRydWUgfVxuICAgIH0sXG4gICAgdGVtcGxhdGUgOiBTdHJpbmcoKSArXG4gICAgICAnPGRpdiBjbGFzcz1cImNvbnRhaW5lciBlbS1zaGVsbFwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImVtLXNoZWxsLW11bmdlXCI+PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tc2hlbGwtcHJvY2Vzc19yc2VxXCI+PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZW0tc2hlbGwtZW1kYXRhXCI+PC9kaXY+JyArXG4gICAgICAnPC9kaXY+J1xuICB9LFxuICAvLyBzdGF0ZU1hcCA9IHt9LFxuICBqcXVlcnlNYXAgPSB7fSxcbiAgc2V0SlF1ZXJ5TWFwLFxuICBjbGVhcklucHV0LFxuICBpbml0TW9kdWxlO1xuICAvLyAtLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gVVRJTElUWSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tIEVORCBVVElMSVRZIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9zZXRKUXVlcnlNYXAvXG4gIHNldEpRdWVyeU1hcCA9IGZ1bmN0aW9uKCAkY29udGFpbmVyICl7XG4gICAganF1ZXJ5TWFwID0ge1xuICAgICAgJGNvbnRhaW5lciAgICAgICAgICAgICAgICA6ICRjb250YWluZXIsXG4gICAgICAkc2hlbGwgICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tc2hlbGwnKSxcbiAgICAgICRtdW5nZV9jb250YWluZXIgICAgICAgICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1zaGVsbCAuZW0tc2hlbGwtbXVuZ2UnKSxcbiAgICAgICRwcm9jZXNzX3JzZXFfY29udGFpbmVyICAgOiAkY29udGFpbmVyLmZpbmQoJy5lbS1zaGVsbCAuZW0tc2hlbGwtcHJvY2Vzc19yc2VxJyksXG4gICAgICAkZW1kYXRhX2NvbnRhaW5lciAgICAgICAgIDogJGNvbnRhaW5lci5maW5kKCcuZW0tc2hlbGwgLmVtLXNoZWxsLWVtZGF0YScpXG4gICAgfTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL3NldEpRdWVyeU1hcC9cblxuICAvLyBCZWdpbiBET00gbWV0aG9kIC9jbGVhcklucHV0L1xuICAvKiBDbGVhcnMgdGhlIGlucHV0IGFuZCByZXNldHMgdGhlIHN0YXRlIHRvIGdyb3VuZCB6ZXJvXG4gICAqXG4gICAqIEByZXR1cm4gIGJvb2xlYW4gV2hldGhlciB0aGUgYW5jaG9yIHBvcnRpb24gY291bGQgYmUgdXBkYXRlZFxuICAgKi9cbiAgY2xlYXJJbnB1dCA9IGZ1bmN0aW9uKCApe1xuICAgIHJldHVybiBtdW5nZS5yZXNldCggKTtcbiAgfTtcbiAgLy8gRW5kIERPTSBtZXRob2QgL2NsZWFySW5wdXQvXG4gIC8vIC0tLS0tLS0tLS0gRU5EIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tIEVORCBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gQ0FMTEJBQ0tTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEVORCBDQUxMQkFDS1MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0gQkVHSU4gUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qIGluaXRNb2R1bGVcbiAgICogQHBhcmFtIHBhdGggKFN0cmluZykgcGF0aFxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciAoT2JqZWN0KSBqUXVlcnkgcGFyZW50XG4gICAqL1xuICBpbml0TW9kdWxlID0gZnVuY3Rpb24oICRjb250YWluZXIsIHBhdGggKXtcbiAgICBpZighb2NwdSl7IGFsZXJ0KCdzZXJ2ZXIgZXJyb3InKTsgcmV0dXJuOyB9XG5cbiAgICB2YXIganF4aHI7XG4gICAgcGF0aCA9IHBhdGggfHwgY29uZmlnTWFwLmRlZmF1bHRfcGF0aDtcbiAgICBqcXhociA9IG9jcHUuc2V0dXJsKCBwYXRoICk7XG4gICAganF4aHIuZmFpbChmdW5jdGlvbigpe1xuICAgICAgY29uc29sZS5lcnJvciggJ0NvdWxkIG5vdCBzZXQgc2VydmVyIHBhdGggJXMnLCBwYXRoICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICBqcXhoci5kb25lKGZ1bmN0aW9uKCl7XG4gICAgICAkY29udGFpbmVyLmh0bWwoIGNvbmZpZ01hcC50ZW1wbGF0ZSApO1xuICAgICAgc2V0SlF1ZXJ5TWFwKCAkY29udGFpbmVyICk7XG5cbiAgICAgIC8vIGNvbmZpZ3VyZSBhbmQgaW5pdGlhbGl6ZSBmZWF0dXJlIG1vZHVsZXNcbiAgICAgICQuZ2V2ZW50LnN1YnNjcmliZShcbiAgICAgICAganF1ZXJ5TWFwLiRwcm9jZXNzX3JzZXFfY29udGFpbmVyLFxuICAgICAgICAnZW0tbXVuZ2UtZGF0YScsXG4gICAgICAgIGZ1bmN0aW9uICggZXZlbnQsIG1zZ19tYXAgKSB7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdlbS1tdW5nZS1kYXRhJywgdXRpbC5zZXJpYWxpemUobXNnX21hcCkgKTtcbiAgICAgICAgICBwcm9jZXNzX3JzZXEuY29uZmlnTW9kdWxlKHt9KTtcbiAgICAgICAgICBwcm9jZXNzX3JzZXEuaW5pdE1vZHVsZSgganF1ZXJ5TWFwLiRwcm9jZXNzX3JzZXFfY29udGFpbmVyLCBtc2dfbWFwICApO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgJC5nZXZlbnQuc3Vic2NyaWJlKFxuICAgICAgICBqcXVlcnlNYXAuJGVtZGF0YV9jb250YWluZXIsXG4gICAgICAgICdlbS1wcm9jZXNzX3JzZXEnLFxuICAgICAgICBmdW5jdGlvbiAoIGV2ZW50LCBtc2dfbWFwICkge1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZW0tcHJvY2Vzc19yc2VxJywgdXRpbC5zZXJpYWxpemUobXNnX21hcCkgKTtcbiAgICAgICAgICBlbWRhdGEuY29uZmlnTW9kdWxlKHt9KTtcbiAgICAgICAgICBlbWRhdGEuaW5pdE1vZHVsZSgganF1ZXJ5TWFwLiRlbWRhdGFfY29udGFpbmVyLCBtc2dfbWFwICApO1xuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICBtdW5nZS5jb25maWdNb2R1bGUoe30pO1xuICAgICAgbXVuZ2UuaW5pdE1vZHVsZSgganF1ZXJ5TWFwLiRtdW5nZV9jb250YWluZXIgKTtcbiAgICAgIC8vIHZhciBtc2dfbWFwID0gdXRpbC5kZXNlcmlhbGl6ZVNlc3Npb25EYXRhKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSggJ2VtLW11bmdlLWRhdGEnICkgKTtcbiAgICAgIC8vIHByb2Nlc3NfcnNlcS5jb25maWdNb2R1bGUoe30pO1xuICAgICAgLy8gcHJvY2Vzc19yc2VxLmluaXRNb2R1bGUoIGpxdWVyeU1hcC4kcHJvY2Vzc19yc2VxX2NvbnRhaW5lciwgbXNnX21hcCApO1xuICAgICAgLy8gdmFyIG1zZ19tYXAgPSB1dGlsLmRlc2VyaWFsaXplU2Vzc2lvbkRhdGEoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCAnZW0tcHJvY2Vzc19yc2VxJyApICk7XG4gICAgICAvLyBlbWRhdGEuY29uZmlnTW9kdWxlKHt9KTtcbiAgICAgIC8vIGVtZGF0YS5pbml0TW9kdWxlKCBqcXVlcnlNYXAuJGVtZGF0YV9jb250YWluZXIsIG1zZ19tYXAgICk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICAvLyAtLS0tLS0tLS0tIEVORCBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJldHVybiB7XG4gICAgaW5pdE1vZHVsZSAgICA6IGluaXRNb2R1bGVcbiAgfTtcblxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaGVsbDtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBvY3B1ID0gcmVxdWlyZSgnLi4vbGliL29wZW5jcHUuanMvb3BlbmNwdS0wLjUtbnBtLmpzJyk7XG5cbi8vU2hvdyBhbmQgaGlkZSB0aGUgc3Bpbm5lciBmb3IgYWxsIGFqYXggcmVxdWVzdHMuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHZhciBtYWtlRXJyb3IsIHNldENvbmZpZ01hcCxcbiAgIHNlcmlhbGl6ZSxcbiAgIGRlc2VyaWFsaXplU2Vzc2lvbkRhdGEsXG4gICBkaXNwbGF5QXNQcmludCxcbiAgIGRpc3BsYXlBc1RhYmxlLFxuICAgZ3JhcGhpY1IsXG4gICBtYWtlVGV4dEZpbGUsXG4gICB1bmlxdWU7XG5cbiAgLyogQmVnaW4gUHVibGljIG1ldGhvZCAvc2VyaWFsaXplL1xuICAgKiBBIGNvbnZlbmllbmNlIHdyYXBwZXIgdG8gY3JlYXRlIGEgc2VyaWFsaXplZCB2ZXJzaW9uIG9mIGRhdGFcbiAgICpcbiAgICogQHBhcmFtIG9iamVjdCBhIHNlcmlhbGl6ZWFibGUgb2JqZWN0XG4gICAqXG4gICAqIEByZXR1cm4gc3RyaW5nIHJlcHJlc2VudGF0aW9uIGRhdGFcbiAgICogQHRocm93cyBKYXZhU2NyaXB0IGVycm9yIG9iamVjdCBhbmQgc3RhY2sgdHJhY2Ugb24gdW5hY2NlcHRhYmxlIGFyZ3VtZW50c1xuICAgKi9cbiAgc2VyaWFsaXplID0gZnVuY3Rpb24gKCBkYXRhICkge1xuICAgIHZhciBzZXJpYWxpemVkO1xuICAgIHRyeSB7XG4gICAgICAgIHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeSggZGF0YSApO1xuICAgIH0gY2F0Y2goIGUgKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICAgIHJldHVybiBzZXJpYWxpemVkO1xuICB9O1xuICAvLyBFbmQgUHVibGljIG1ldGhvZCAvc2VyaWFsaXplL1xuXG4gIC8qIEJlZ2luIFB1YmxpYyBtZXRob2QgL2Rlc2VyaWFsaXplU2Vzc2lvbkRhdGEvXG4gICAqIEEgY29udmVuaWVuY2Ugd3JhcHBlciB0byBjcmVhdGUgYSBTZXNzaW9ucyBmcm9tIHNlcmlhbGl6ZWRcbiAgICogZGF0YS4gRWFjaCBvYmplY3QgdmFsdWUgbXVzdCBiZSBhIFNlc3Npb25cbiAgICpcbiAgICogQHBhcmFtIHN0cmluZyBhIHNlcmlhbGl6ZWQgcmVwcmVzZW50YXRpb25cbiAgICpcbiAgICogQHJldHVybiBhbiBvYmplY3Qgd2l0aCBTZXNzaW9uIHZhbHVlcyByZXN0b3JlZFxuICAgKiBAdGhyb3dzIEphdmFTY3JpcHQgZXJyb3Igb2JqZWN0IGFuZCBzdGFjayB0cmFjZSBvbiB1bmFjY2VwdGFibGUgYXJndW1lbnRzXG4gICAqL1xuICBkZXNlcmlhbGl6ZVNlc3Npb25EYXRhID0gZnVuY3Rpb24gKCBkYXRhICkge1xuICAgIHZhciBkZXNlcmlhbGl6ZWQgPSB7fTtcbiAgICB0cnkge1xuICAgICAgdmFyIHJhdyA9IEpTT04ucGFyc2UoIGRhdGEgKTtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKCByYXcgKVxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24oIGtleSApIHtcbiAgICAgICAgICAgIGRlc2VyaWFsaXplZFsga2V5IF0gPSBuZXcgb2NwdS5TZXNzaW9uKCByYXdba2V5XS5sb2MsIHJhd1trZXldLmtleSwgcmF3W2tleV0udHh0ICk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoKCBlICkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgICByZXR1cm4gZGVzZXJpYWxpemVkO1xuICB9O1xuICAvLyBFbmQgUHVibGljIG1ldGhvZCAvZGVzZXJpYWxpemVTZXNzaW9uRGF0YS9cblxuICAvLyBCZWdpbiBQdWJsaWMgY29uc3RydWN0b3IgL21ha2VFcnJvci9cbiAgLy8gUHVycG9zZTogYSBjb252ZW5pZW5jZSB3cmFwcGVyIHRvIGNyZWF0ZSBhbiBlcnJvciBvYmplY3RcbiAgLy8gQXJndW1lbnRzOlxuICAvLyAgICogbmFtZV90ZXh0IC0gdGhlIGVycm9yIG5hbWVcbiAgLy8gICAqIG1zZ190ZXh0ICAtIGxvbmcgZXJyb3IgbWVzc2FnZVxuICAvLyAgICogZGF0YSAgICAgIC0gb3B0aW9uYWwgZGF0YSBhdHRhY2hlZCB0byBlcnJvciBvYmplY3RcbiAgLy8gUmV0dXJucyAgOiBuZXdseSBjb25zdHJ1Y3RlZCBlcnJvciBvYmplY3RcbiAgLy8gVGhyb3dzICAgOiBub25lXG4gIC8vXG4gIG1ha2VFcnJvciA9IGZ1bmN0aW9uICggbmFtZV90ZXh0LCBtc2dfdGV4dCwgZGF0YSApIHtcbiAgICB2YXIgZXJyb3IgICAgID0gbmV3IEVycm9yKCk7XG4gICAgZXJyb3IubmFtZSAgICA9IG5hbWVfdGV4dDtcbiAgICBlcnJvci5tZXNzYWdlID0gbXNnX3RleHQ7XG5cbiAgICBpZiAoIGRhdGEgKXsgZXJyb3IuZGF0YSA9IGRhdGE7IH1cblxuICAgIHJldHVybiBlcnJvcjtcbiAgfTtcbiAgLy8gRW5kIFB1YmxpYyBjb25zdHJ1Y3RvciAvbWFrZUVycm9yL1xuXG4gIC8vIEJlZ2luIFB1YmxpYyBtZXRob2QgL3NldENvbmZpZ01hcC9cbiAgLy8gUHVycG9zZTogQ29tbW9uIGNvZGUgdG8gc2V0IGNvbmZpZ3MgaW4gZmVhdHVyZSBtb2R1bGVzXG4gIC8vIEFyZ3VtZW50czpcbiAgLy8gICAqIGlucHV0X21hcCAgICAtIG1hcCBvZiBrZXktdmFsdWVzIHRvIHNldCBpbiBjb25maWdcbiAgLy8gICAqIHNldHRhYmxlX21hcCAtIG1hcCBvZiBhbGxvd2FibGUga2V5cyB0byBzZXRcbiAgLy8gICAqIGNvbmZpZ19tYXAgICAtIG1hcCB0byBhcHBseSBzZXR0aW5ncyB0b1xuICAvLyBSZXR1cm5zOiB0cnVlXG4gIC8vIFRocm93cyA6IEV4Y2VwdGlvbiBpZiBpbnB1dCBrZXkgbm90IGFsbG93ZWRcbiAgLy9cbiAgc2V0Q29uZmlnTWFwID0gZnVuY3Rpb24gKCBhcmdfbWFwICl7XG4gICAgdmFyXG4gICAgICBpbnB1dF9tYXAgICAgPSBhcmdfbWFwLmlucHV0X21hcCxcbiAgICAgIHNldHRhYmxlX21hcCA9IGFyZ19tYXAuc2V0dGFibGVfbWFwLFxuICAgICAgY29uZmlnX21hcCAgID0gYXJnX21hcC5jb25maWdfbWFwLFxuICAgICAga2V5X25hbWUsIGVycm9yO1xuXG4gICAgZm9yICgga2V5X25hbWUgaW4gaW5wdXRfbWFwICl7XG4gICAgICBpZiAoIGlucHV0X21hcC5oYXNPd25Qcm9wZXJ0eSgga2V5X25hbWUgKSApe1xuICAgICAgICBpZiAoIHNldHRhYmxlX21hcC5oYXNPd25Qcm9wZXJ0eSgga2V5X25hbWUgKSApe1xuICAgICAgICAgIGNvbmZpZ19tYXBba2V5X25hbWVdID0gaW5wdXRfbWFwW2tleV9uYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBlcnJvciA9IG1ha2VFcnJvciggJ0JhZCBJbnB1dCcsXG4gICAgICAgICAgICAnU2V0dGluZyBjb25maWcga2V5IHwnICsga2V5X25hbWUgKyAnfCBpcyBub3Qgc3VwcG9ydGVkJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIC8vIEVuZCBQdWJsaWMgbWV0aG9kIC9zZXRDb25maWdNYXAvXG5cbiAgLyogQmVnaW4gUHVibGljIG1ldGhvZCAvZGlzcGxheUFzUHJpbnQvXG4gICAqIEEgY29udmVuaWVuY2Ugd3JhcHBlciB0byBkaXNwbGF5IHRoZSBSIG9iamVjdCB0ZXh0IGRlc2NyaXB0aW9uIGluIGFcbiAgICogQm9vdHN0cmFwIHBhbmVsLiBBbHNvIHByb3ZpZGVzIGxpbmsgdG8gZG93bmxvYWQgb2JqZWN0IGFzIC5yZHMgZmlsZS5cbiAgICpcbiAgICogQHBhcmFtIHRleHQgc29tZSBkZXNjcmlwdGl2ZSB0ZXh0IGZvciB0aGUgaGVhZGVyXG4gICAqIEBwYXJhbSBzZXNzaW9uIFRoZSBvY3B1IFNlc3Npb25cbiAgICogQHBhcmFtICRjb250YWluZXIgalF1ZXJ5IG9iamVjdCB0byBwbGFjZSBwYW5lbCBpbnNpZGUgd2l0aCB0ZXh0XG4gICAqIEBwYXJhbSBuZXh0IHRoZSBvcHRpb25hbCBjYWxsYmFja1xuICAgKi9cbiAgZGlzcGxheUFzUHJpbnQgPSBmdW5jdGlvbih0ZXh0LCBzZXNzaW9uLCAkY29udGFpbmVyLCBuZXh0ICl7XG4gICAgdmFyIHVybCA9IHNlc3Npb24uZ2V0TG9jKCkgKyAnUi8udmFsL3ByaW50JztcbiAgICB2YXIgY2IgPSBuZXh0IHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgICQuZ2V0KHVybCwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAvLyBET00gbWFuaXB1bGF0aW9uc1xuICAgICAgdmFyICRjb2RlID0gJCgnPHByZSBjbGFzcz1cImVtLWNvZGVcIj48L3ByZT4nKTtcbiAgICAgICRjb2RlLmh0bWwoZGF0YSk7XG4gICAgICB2YXIgJHBhbmVsID0gJCgnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLXN1Y2Nlc3NcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzxoMyBjbGFzcz1cInBhbmVsLXRpdGxlXCI+PC9oMz4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWJvZHkgZml4ZWQtcGFuZWxcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1mb290ZXJcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nKTtcbiAgICAgICRwYW5lbC5maW5kKCcucGFuZWwtdGl0bGUnKS50ZXh0KHRleHQpO1xuICAgICAgJHBhbmVsLmZpbmQoJy5wYW5lbC1ib2R5JykuYXBwZW5kKCRjb2RlKTtcbiAgICAgICRwYW5lbC5maW5kKCcucGFuZWwtZm9vdGVyJykuYXBwZW5kKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBocmVmPVwiJyArXG4gICAgICAgc2Vzc2lvbi5nZXRMb2MoKSArICdSLy52YWwvcmRzXCI+RG93bmxvYWQgKC5yZHMpPC9hPicpO1xuICAgICAgJGNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgJGNvbnRhaW5lci5hcHBlbmQoJHBhbmVsKTtcbiAgICB9KVxuICAgIC5kb25lKCBmdW5jdGlvbigpeyBjYiggbnVsbCApOyB9IClcbiAgICAuZmFpbCggZnVuY3Rpb24oKXsgY2IoIHRydWUgKTsgfSApO1xuICB9O1xuICAvLyBFbmQgRE9NIG1ldGhvZCAvZGlzcGxheUFzUHJpbnQvXG5cbiAgLyogQmVnaW4gUHVibGljIG1ldGhvZCAvZGlzcGxheUFzVGFibGUvXG4gICAqIEEgY29udmVuaWVuY2Ugd3JhcHBlciB0byBkaXNwbGF5IHRoZSBSIG9iamVjdCB0ZXh0IGRlc2NyaXB0aW9uIGFzIGFcbiAgICogdGFibGUgaW5zaWRlIGEgQm9vc3RyYXAgcGFuZWwuXG4gICAqIEFsc28gcHJvdmlkZXMgbGluayB0byBkb3dubG9hZCBvYmplY3QgYXMgLnJkcyBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gdGV4dCBzb21lIGRlc2NyaXB0aXZlIHRleHQgZm9yIHRoZSBoZWFkZXJcbiAgICogQHBhcmFtIHNlc3Npb24gVGhlIG9jcHUgU2Vzc2lvblxuICAgKiBAcGFyYW0gJGNvbnRhaW5lciBqUXVlcnkgb2JqZWN0IHRvIHBsYWNlIHBhbmVsIGluc2lkZSB3aXRoIHRleHRcbiAgICogQHBhcmFtIG5leHQgdGhlIG9wdGlvbmFsIGNhbGxiYWNrXG4gICAqL1xuXG4gIGRpc3BsYXlBc1RhYmxlID0gZnVuY3Rpb24oIHRleHQsIHNlc3Npb24sICRjb250YWluZXIsIG5leHQgKXtcbiAgICB2YXIgY2IgPSBuZXh0IHx8IGZ1bmN0aW9uKCl7fTtcbiAgICBzZXNzaW9uLmdldE9iamVjdChmdW5jdGlvbihkYXRhKXtcbiAgICAgIGlmKCFkYXRhLmxlbmd0aCl7IHJldHVybjsgfVxuXG4gICAgICAvLyBEYXRhIG1hbmlwdWxhdGlvbnNcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YVswXSk7XG4gICAgICB2YXIgaGVhZGVycyA9IGtleXMubWFwKGZ1bmN0aW9uKHYpe1xuICAgICAgICByZXR1cm4gJzx0aD4nICsgdiArICc8L3RoPic7XG4gICAgICB9KTtcbiAgICAgIHZhciBhb0NvbHVtbnMgPSBrZXlzLm1hcChmdW5jdGlvbih2KXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgXCJtRGF0YVByb3BcIjogdlxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIERPTSBtYW5pcHVsYXRpb25zXG4gICAgICB2YXIgJHRhYmxlID0gJCgnPGRpdiBjbGFzcz1cInRhYmxlLXJlc3BvbnNpdmVcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtY29uZGVuc2VkIHRhYmxlLXN0cmlwZWQgdGFibGUtYm9yZGVyZWQgZW0tdGFibGVcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8dGhlYWQ+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8dHI+PC90cj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L3RoZWFkPicgK1xuICAgICAgICAgICAgICAgICAgICAgICc8L3RhYmxlPicgK1xuICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicpO1xuICAgICAgaWYoaGVhZGVycy5sZW5ndGgpe1xuICAgICAgICAkdGFibGUuZmluZCgndGhlYWQgdHInKS5odG1sKCQoaGVhZGVycy5qb2luKCcnKSkpO1xuICAgICAgfVxuICAgICAgdmFyICRwYW5lbCA9ICQoICc8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtc3VjY2Vzc1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8aDMgY2xhc3M9XCJwYW5lbC10aXRsZVwiPjwvaDM+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtZm9vdGVyXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiYnRuLWdyb3VwIGRyb3B1cFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCIgYXJpYS1oYXNwb3B1cD1cInRydWVcIiBhcmlhLWV4cGFuZGVkPVwiZmFsc2VcIj4nICArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRG93bmxvYWRzIDxzcGFuIGNsYXNzPVwiY2FyZXRcIj48L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvYnV0dG9uPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8dWwgY2xhc3M9XCJkcm9wZG93bi1tZW51XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCInICsgc2Vzc2lvbi5nZXRMb2MoKSArICdSLy52YWwvanNvbicgKyAnXCIgZG93bmxvYWQ+SlNPTjwvYT48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48YSBocmVmPVwiJyArIHNlc3Npb24uZ2V0TG9jKCkgKyAnUi8udmFsL2NzdicgKyAnXCIgZG93bmxvYWQ+Q1NWPC9hPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCInICsgc2Vzc2lvbi5nZXRMb2MoKSArICdSLy52YWwvdGFiJyArICdcIiBkb3dubG9hZD5UQUI8L2E+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PGEgaHJlZj1cIicgKyBzZXNzaW9uLmdldExvYygpICsgJ1IvLnZhbC9tZCcgKyAnXCIgZG93bmxvYWQ+TUQ8L2E+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGkgcm9sZT1cInNlcGFyYXRvclwiIGNsYXNzPVwiZGl2aWRlclwiPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCInICsgc2Vzc2lvbi5nZXRMb2MoKSArICdSLy52YWwvcmRzXCIgZG93bmxvYWQ+UkRTPC9hPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvdWw+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+Jyk7XG4gICAgICAkcGFuZWwuZmluZCgnLnBhbmVsLXRpdGxlJykudGV4dCh0ZXh0KTtcbiAgICAgICRwYW5lbC5maW5kKCcucGFuZWwtYm9keScpLmFwcGVuZCgkdGFibGUpO1xuICAgICAgJHBhbmVsLmZpbmQoJy5wYW5lbC1mb290ZXInKS5hcHBlbmQoJycpO1xuICAgICAgJGNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgJGNvbnRhaW5lci5hcHBlbmQoJHBhbmVsKTtcbiAgICAgICR0YWJsZS5maW5kKCd0YWJsZScpLkRhdGFUYWJsZSh7XG4gICAgICAgICAgICBcImFhRGF0YVwiOiBkYXRhLFxuICAgICAgICAgICAgXCJhb0NvbHVtbnNcIjogYW9Db2x1bW5zXG4gICAgICAgICAgfSk7XG4gICAgfSlcbiAgICAuZG9uZSggZnVuY3Rpb24oKXsgY2IoIG51bGwgKTt9IClcbiAgICAuZmFpbCggZnVuY3Rpb24oKXsgY2IoIHRydWUgKTt9ICk7XG4gIH07XG4gIC8vIEVuZCBQdWJsaWMgbWV0aG9kIC9kaXNwbGF5QXNUYWJsZS9cblxuICAvKiBCZWdpbiBQdWJsaWMgbWV0aG9kIC91bmlxdWUvXG4gICAqIEEgY29udmVuaWVuY2Ugd3JhcHBlciB0byByZWR1Y2UgYW4gYXJyYXkgdG8gdW5pcXVlIGVsZW1lbnRzXG4gICAqXG4gICAqIEBwYXJhbSBhcnJheSBhbiBhcnJheVxuICAgKlxuICAgKiBAcmV0dXJuIGFuIGFycmF5IG9mIHVuaXF1ZSBlbGVtZW50c1xuICAgKi9cbiAgdW5pcXVlID0gZnVuY3Rpb24oIGFycmF5ICkge1xuICBcdHZhciBuID0gW107XG4gIFx0Zm9yKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gIFx0XHRpZiAobi5pbmRleE9mKGFycmF5W2ldKSA9PT0gLTEpe1xuICAgICAgICBuLnB1c2goYXJyYXlbaV0pO1xuICAgICAgfVxuICBcdH1cbiAgXHRyZXR1cm4gbjtcbiAgfTtcbiAgLy8gRW5kIFB1YmxpYyBtZXRob2QgL3VuaXF1ZS9cblxuICAvKiBCZWdpbiBQdWJsaWMgbWV0aG9kIC9tYWtlVGV4dEZpbGUvXG4gICAqIENyZWF0ZSBhIHRleHQgZmlsZSBvbiB0aGUgY2xpZW50IHRoYXQgY2FuIGJlIHVzZWQgdG8gZG93bmxvYWRcbiAgICpcbiAgICogQGV4YW1wbGUgPGEgaHJlZj1tYWtlVGV4dEZpbGUoJ3NvbWV0ZXh0JykgZG93bmxvYWQ9XCJmaWxlLnR4dFwiPmRvd25sb2FkbWUhPC9hPlxuICAgKiBAcGFyYW0gdGV4dCBzdHJpbmcgdG8gY29udmVydCB0byBmaWxlXG4gICAqXG4gICAqIEByZXR1cm4gVVJMIGZvciB0aGUgZmlsZVxuICAgKi9cbiAgbWFrZVRleHRGaWxlID0gZnVuY3Rpb24odGV4dCkge1xuICAgIHZhciBkYXRhID0gbmV3IEJsb2IoW3RleHRdLCB7dHlwZTogJ3RleHQvcGxhaW4nfSk7XG5cbiAgICAvLyBJZiB3ZSBhcmUgcmVwbGFjaW5nIGEgcHJldmlvdXNseSBnZW5lcmF0ZWQgZmlsZSB3ZSBuZWVkIHRvXG4gICAgLy8gbWFudWFsbHkgcmV2b2tlIHRoZSBvYmplY3QgVVJMIHRvIGF2b2lkIG1lbW9yeSBsZWFrcy5cbiAgICBpZiAodGV4dEZpbGUgIT09IG51bGwpIHtcbiAgICAgIHdpbmRvdy5VUkwucmV2b2tlT2JqZWN0VVJMKHRleHRGaWxlKTtcbiAgICB9XG5cbiAgICB2YXIgdGV4dEZpbGUgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChkYXRhKTtcblxuICAgIC8vIHJldHVybnMgYSBVUkwgeW91IGNhbiB1c2UgYXMgYSBocmVmXG4gICAgcmV0dXJuIHRleHRGaWxlO1xuICB9O1xuXG4gIC8qIEJlZ2luIFB1YmxpYyBtZXRob2QgL2dyYXBoaWNSL1xuICAgKiBBIGNvbnZlbmllbmNlIHdyYXBwZXIgZm9yIGZvcm1hdHRpbmcgYSBncmFwaGljXG4gICAqXG4gICAqIEBwYXJhbSB0aXRsZSBzdHJpbmcgZm9yIHRoZSBwYW5lbFxuICAgKiBAcGFyYW0gZnVuYyBzdHJpbmcgdGhlIGZ1bmN0aW9uIHRvIGNhbGxcbiAgICogQHBhcmFtIGFyZ3Mgb2JqZWN0IG9mIGZ1bmN0aW9uIHBhcmFtZXRlcnNcbiAgICogQHBhcmFtICRjb250YWluZXIgdGhlIGpxdWVyeSBvYmplY3QgdG8gaW5zZXJ0IHRoZSBpbWFnZVxuICAgKiBAcGFyYW0gbmV4dCB0aGUgb3B0aW9uYWwgY2FsbGJhY2tcbiAgICpcbiAgICogQHJldHVybiBhbiBhcnJheSBvZiB1bmlxdWUgZWxlbWVudHNcbiAgICovXG4gIGdyYXBoaWNSID0gZnVuY3Rpb24oIHRpdGxlLCBmdW5jLCBhcmdzLCAkY29udGFpbmVyLCBuZXh0ICl7XG5cbiAgICB2YXJcbiAgICBqcXhocixcbiAgICBvbmZhaWwsXG4gICAgb25Eb25lLFxuICAgIGNiID0gbmV4dCB8fCBmdW5jdGlvbigpe307XG5cbiAgICBvbkRvbmUgPSBmdW5jdGlvbiggKXtcbiAgICAgIGNiICggbnVsbCApO1xuICAgIH07XG5cbiAgICBvbmZhaWwgPSBmdW5jdGlvbigganFYSFIgKXtcbiAgICAgIHZhciBlcnJUZXh0ID0gXCJTZXJ2ZXIgZXJyb3I6IFwiICsganFYSFIucmVzcG9uc2VUZXh0O1xuICAgICAgY29uc29sZS5lcnJvcihlcnJUZXh0KTtcbiAgICAgIGNiKCB0cnVlICk7XG4gICAgfTtcblxuICAgIC8vIGZpbHRlclxuICAgIGpxeGhyID0gb2NwdS5jYWxsKGZ1bmMsIGFyZ3MsIGZ1bmN0aW9uKCBzZXNzaW9uICl7XG4gICAgICB2YXIgJHBhbmVsID0gJCgnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLXN1Y2Nlc3NcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICc8aDMgY2xhc3M9XCJwYW5lbC10aXRsZVwiPicgKyB0aXRsZSArICc8L2gzPicgK1xuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICc8aW1nIHNyYz1cIlwiIGNsYXNzPVwiaW1nLXJlc3BvbnNpdmVcIiBhbHQ9XCJSZXNwb25zaXZlIGltYWdlXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1mb290ZXJcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImJ0bi1ncm91cCBkcm9wdXBcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBkcm9wZG93bi10b2dnbGVcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCIgYXJpYS1oYXNwb3B1cD1cInRydWVcIiBhcmlhLWV4cGFuZGVkPVwiZmFsc2VcIj4nICArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdEb3dubG9hZHMgPHNwYW4gY2xhc3M9XCJjYXJldFwiPjwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2J1dHRvbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8dWwgY2xhc3M9XCJkcm9wZG93bi1tZW51XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PGEgaHJlZj1cIicgKyBzZXNzaW9uLmdldExvYygpICsgJ2dyYXBoaWNzLzEvcG5nJyArICdcIiBkb3dubG9hZD5QTkc8L2E+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48YSBocmVmPVwiJyArIHNlc3Npb24uZ2V0TG9jKCkgKyAnZ3JhcGhpY3MvMS9zdmcnICsgJ1wiIGRvd25sb2FkPlNWRzwvYT48L2xpPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCInICsgc2Vzc2lvbi5nZXRMb2MoKSArICdncmFwaGljcy8xL3BkZicgKyAnXCIgZG93bmxvYWQ+UERGPC9hPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8bGkgcm9sZT1cInNlcGFyYXRvclwiIGNsYXNzPVwiZGl2aWRlclwiPjwvbGk+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PGEgaHJlZj1cIicgKyBzZXNzaW9uLmdldExvYygpICsgJ1IvLnZhbC9yZHNcIiBkb3dubG9hZD5SRFM8L2E+PC9saT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L3VsPicgK1xuICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nKTtcbiAgICAgIHZhciAkaW1nID0gJHBhbmVsLmZpbmQoJy5pbWctcmVzcG9uc2l2ZScpO1xuICAgICAgICAgICRpbWcuYXR0cignc3JjJywgc2Vzc2lvbi5nZXRMb2MoKSArICdncmFwaGljcy8xL3BuZycgKTtcbiAgICAgICRjb250YWluZXIuYXBwZW5kKCRwYW5lbCk7XG4gICAgfSlcbiAgICAuZG9uZSggb25Eb25lIClcbiAgICAuZmFpbCggb25mYWlsICk7XG4gIH07XG4gIC8vIEVuZCBET00gbWV0aG9kIC9wbG90Ui9cblxuICByZXR1cm4ge1xuICAgIG1ha2VFcnJvciAgICAgICAgICAgICAgIDogbWFrZUVycm9yLFxuICAgIHNldENvbmZpZ01hcCAgICAgICAgICAgIDogc2V0Q29uZmlnTWFwLFxuICAgIHNlcmlhbGl6ZSAgICAgICAgICAgICAgIDogc2VyaWFsaXplLFxuICAgIGRlc2VyaWFsaXplU2Vzc2lvbkRhdGEgIDogZGVzZXJpYWxpemVTZXNzaW9uRGF0YSxcbiAgICBkaXNwbGF5QXNQcmludCAgICAgICAgICA6IGRpc3BsYXlBc1ByaW50LFxuICAgIGRpc3BsYXlBc1RhYmxlICAgICAgICAgIDogZGlzcGxheUFzVGFibGUsXG4gICAgdW5pcXVlICAgICAgICAgICAgICAgICAgOiB1bmlxdWUsXG4gICAgZ3JhcGhpY1IgICAgICAgICAgICAgICAgOiBncmFwaGljUixcbiAgICBtYWtlVGV4dEZpbGUgICAgICAgICAgICA6IG1ha2VUZXh0RmlsZVxuICB9O1xufSgpKTtcbiIsIi8qKlxuICogSmF2YXNjcmlwdCBjbGllbnQgbGlicmFyeSBmb3IgT3BlbkNQVVxuICogVmVyc2lvbiAwLjUuMFxuICogRGVwZW5kczogalF1ZXJ5XG4gKiBSZXF1aXJlcyBIVE1MNSBGb3JtRGF0YSBzdXBwb3J0IGZvciBmaWxlIHVwbG9hZHNcbiAqIGh0dHA6Ly9naXRodWIuY29tL2plcm9lbm9vbXMvb3BlbmNwdS5qc1xuICpcbiAqIEluY2x1ZGUgdGhpcyBmaWxlIGluIHlvdXIgYXBwcyBhbmQgcGFja2FnZXMuXG4gKiBZb3Ugb25seSBuZWVkIHRvIHVzZSBvY3B1LnNldHVybCBpZiB0aGlzIHBhZ2UgaXMgaG9zdGVkIG91dHNpZGUgb2YgdGhlIE9wZW5DUFUgcGFja2FnZS4gRm9yIGV4YW1wbGU6XG4gKlxuICogb2NwdS5zZXR1cmwoXCIuLi9SXCIpIC8vZGVmYXVsdCwgdXNlIGZvciBhcHBzXG4gKiBvY3B1LnNldHVybChcIi8vcHVibGljLm9wZW5jcHUub3JnL29jcHUvbGlicmFyeS9teXBhY2thZ2UvUlwiKSAvL0NPUlNcbiAqIG9jcHUuc2V0dXJsKFwiL29jcHUvbGlicmFyeS9teXBhY2thZ2UvUlwiKSAvL2hhcmRjb2RlIHBhdGhcbiAqIG9jcHUuc2V0dXJsKFwiaHR0cHM6Ly91c2VyOnNlY3JldC9teS5zZXJ2ZXIuY29tL29jcHUvbGlicmFyeS9wa2cvUlwiKSAvLyBiYXNpYyBhdXRoXG4gKi9cblxuLy9XYXJuaW5nIGZvciB0aGUgbmV3Ymllc1xuaWYoIXdpbmRvdy5qUXVlcnkpIHtcbiAgYWxlcnQoXCJDb3VsZCBub3QgZmluZCBqUXVlcnkhIFRoZSBIVE1MIG11c3QgaW5jbHVkZSBqcXVlcnkuanMgYmVmb3JlIG9wZW5jcHUuanMhXCIpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICggd2luZG93LCAkICkge1xuXG4gIC8vZ2xvYmFsIHZhcmlhYmxlXG4gIHZhciByX2NvcnMgPSBmYWxzZTtcbiAgdmFyIHJfcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgcl9wYXRoLmhyZWYgPSBcIi4uL1JcIjtcblxuXG4gIC8vbmV3IFNlc3Npb24oKVxuICBmdW5jdGlvbiBTZXNzaW9uKGxvYywga2V5LCB0eHQpe1xuICAgIHRoaXMubG9jID0gbG9jO1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudHh0ID0gdHh0O1xuICAgIHRoaXMub3V0cHV0ID0gdHh0LnNwbGl0KC9cXHJcXG58XFxyfFxcbi9nKTtcblxuICAgIHRoaXMuZ2V0S2V5ID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBrZXk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0TG9jID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBsb2M7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0RmlsZVVSTCA9IGZ1bmN0aW9uKHBhdGgpe1xuICAgICAgdmFyIG5ld191cmwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBuZXdfdXJsLmhyZWYgPSB0aGlzLmdldExvYygpICsgXCJmaWxlcy9cIiArIHBhdGg7XG4gICAgICBuZXdfdXJsLnVzZXJuYW1lID0gcl9wYXRoLnVzZXJuYW1lO1xuICAgICAgbmV3X3VybC5wYXNzd29yZCA9IHJfcGF0aC5wYXNzd29yZFxuICAgICAgcmV0dXJuIG5ld191cmwuaHJlZjtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRGaWxlID0gZnVuY3Rpb24ocGF0aCwgc3VjY2Vzcyl7XG4gICAgICB2YXIgdXJsID0gdGhpcy5nZXRGaWxlVVJMKHBhdGgpO1xuICAgICAgcmV0dXJuICQuZ2V0KHVybCwgc3VjY2Vzcyk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0T2JqZWN0ID0gZnVuY3Rpb24obmFtZSwgZGF0YSwgc3VjY2Vzcyl7XG4gICAgICAvL2luIGNhc2Ugb2Ygbm8gYXJndW1lbnRzXG4gICAgICBuYW1lID0gbmFtZSB8fCBcIi52YWxcIjtcblxuICAgICAgLy9maXJzdCBhcmcgaXMgYSBmdW5jdGlvblxuICAgICAgaWYobmFtZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKXtcbiAgICAgICAgLy9wYXNzIG9uIHRvIHNlY29uZCBhcmdcbiAgICAgICAgc3VjY2VzcyA9IG5hbWU7XG4gICAgICAgIG5hbWUgPSBcIi52YWxcIjtcbiAgICAgIH1cblxuICAgICAgdmFyIHVybCA9IHRoaXMuZ2V0TG9jKCkgKyBcIlIvXCIgKyBuYW1lICsgXCIvanNvblwiO1xuICAgICAgcmV0dXJuICQuZ2V0KHVybCwgZGF0YSwgc3VjY2Vzcyk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0U3Rkb3V0ID0gZnVuY3Rpb24oc3VjY2Vzcyl7XG4gICAgICB2YXIgdXJsID0gdGhpcy5nZXRMb2MoKSArIFwic3Rkb3V0L3RleHRcIjtcbiAgICAgIHJldHVybiAkLmdldCh1cmwsIHN1Y2Nlc3MpO1xuICAgIH07XG5cbiAgICB0aGlzLmdldENvbnNvbGUgPSBmdW5jdGlvbihzdWNjZXNzKXtcbiAgICAgIHZhciB1cmwgPSB0aGlzLmdldExvYygpICsgXCJjb25zb2xlL3RleHRcIjtcbiAgICAgIHJldHVybiAkLmdldCh1cmwsIHN1Y2Nlc3MpO1xuICAgIH07XG4gIH1cblxuICAvL2ZvciBQT1NUaW5nIHJhdyBjb2RlIHNuaXBwZXRzXG4gIC8vbmV3IFNuaXBwZXQoXCJybm9ybSgxMDApXCIpXG4gIGZ1bmN0aW9uIFNuaXBwZXQoY29kZSl7XG4gICAgdGhpcy5jb2RlID0gY29kZSB8fCBcIk5VTExcIjtcblxuICAgIHRoaXMuZ2V0Q29kZSA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gY29kZTtcbiAgICB9O1xuICB9XG5cbiAgLy9mb3IgUE9TVGluZyBmaWxlc1xuICAvL25ldyBVcGxvYWQoJCgnI2ZpbGUnKVswXS5maWxlcylcbiAgZnVuY3Rpb24gVXBsb2FkKGZpbGUpe1xuICAgIGlmKGZpbGUgaW5zdGFuY2VvZiBGaWxlKXtcbiAgICAgIHRoaXMuZmlsZSA9IGZpbGU7XG4gICAgfSBlbHNlIGlmKGZpbGUgaW5zdGFuY2VvZiBGaWxlTGlzdCl7XG4gICAgICB0aGlzLmZpbGUgPSBmaWxlWzBdO1xuICAgIH0gZWxzZSBpZiAoZmlsZS5maWxlcyBpbnN0YW5jZW9mIEZpbGVMaXN0KXtcbiAgICAgIHRoaXMuZmlsZSA9IGZpbGUuZmlsZXNbMF07XG4gICAgfSBlbHNlIGlmIChmaWxlLmxlbmd0aCA+IDAgJiYgZmlsZVswXS5maWxlcyBpbnN0YW5jZW9mIEZpbGVMaXN0KXtcbiAgICAgIHRoaXMuZmlsZSA9IGZpbGVbMF0uZmlsZXNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93ICdpbnZhbGlkIG5ldyBVcGxvYWQoZmlsZSkuIEFyZ3VtZW50IGZpbGUgbXVzdCBiZSBhIEhUTUwgPGlucHV0IHR5cGU9XCJmaWxlXCI+PC9pbnB1dD4nO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0RmlsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZmlsZTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gc3RyaW5naWZ5KHgpe1xuICAgIGlmKHggaW5zdGFuY2VvZiBTZXNzaW9uKXtcbiAgICAgIHJldHVybiB4LmdldEtleSgpO1xuICAgIH0gZWxzZSBpZih4IGluc3RhbmNlb2YgU25pcHBldCl7XG4gICAgICByZXR1cm4geC5nZXRDb2RlKCk7XG4gICAgfSBlbHNlIGlmKHggaW5zdGFuY2VvZiBVcGxvYWQpe1xuICAgICAgcmV0dXJuIHguZ2V0RmlsZSgpO1xuICAgIH0gZWxzZSBpZih4IGluc3RhbmNlb2YgRmlsZSl7XG4gICAgICByZXR1cm4geDtcbiAgICB9IGVsc2UgaWYoeCBpbnN0YW5jZW9mIEZpbGVMaXN0KXtcbiAgICAgIHJldHVybiB4WzBdO1xuICAgIH0gZWxzZSBpZih4ICYmIHguZmlsZXMgaW5zdGFuY2VvZiBGaWxlTGlzdCl7XG4gICAgICByZXR1cm4geC5maWxlc1swXTtcbiAgICB9IGVsc2UgaWYoeCAmJiB4Lmxlbmd0aCAmJiB4WzBdLmZpbGVzIGluc3RhbmNlb2YgRmlsZUxpc3Qpe1xuICAgICAgcmV0dXJuIHhbMF0uZmlsZXNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh4KTtcbiAgICB9XG4gIH1cblxuICAvL2xvdyBsZXZlbCBjYWxsXG4gIGZ1bmN0aW9uIHJfZnVuX2FqYXgoZnVuLCBzZXR0aW5ncywgaGFuZGxlcil7XG4gICAgLy92YWxpZGF0ZSBpbnB1dFxuICAgIGlmKCFmdW4pIHRocm93IFwicl9mdW5fY2FsbCBjYWxsZWQgd2l0aG91dCBmdW5cIjtcbiAgICBzZXR0aW5ncyA9IHNldHRpbmdzIHx8IHt9O1xuICAgIGhhbmRsZXIgPSBoYW5kbGVyIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIC8vc2V0IGdsb2JhbCBzZXR0aW5nc1xuICAgIHNldHRpbmdzLnVybCA9IHNldHRpbmdzLnVybCB8fCAocl9wYXRoLmhyZWYgKyBcIi9cIiArIGZ1bik7XG4gICAgc2V0dGluZ3MudHlwZSA9IHNldHRpbmdzLnR5cGUgfHwgXCJQT1NUXCI7XG4gICAgc2V0dGluZ3MuZGF0YSA9IHNldHRpbmdzLmRhdGEgfHwge307XG4gICAgc2V0dGluZ3MuZGF0YVR5cGUgPSBzZXR0aW5ncy5kYXRhVHlwZSB8fCBcInRleHRcIjtcblxuICAgIC8vYWpheCBjYWxsXG4gICAgdmFyIGpxeGhyID0gJC5hamF4KHNldHRpbmdzKS5kb25lKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbG9jID0ganF4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0xvY2F0aW9uJykgfHwgY29uc29sZS5sb2coXCJMb2NhdGlvbiByZXNwb25zZSBoZWFkZXIgbWlzc2luZy5cIik7XG4gICAgICB2YXIga2V5ID0ganF4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtb2NwdS1zZXNzaW9uJykgfHwgY29uc29sZS5sb2coXCJYLW9jcHUtc2Vzc2lvbiByZXNwb25zZSBoZWFkZXIgbWlzc2luZy5cIik7XG4gICAgICB2YXIgdHh0ID0ganF4aHIucmVzcG9uc2VUZXh0O1xuXG4gICAgICAvL2luIGNhc2Ugb2YgY29ycyB3ZSB0cmFuc2xhdGUgcmVsYXRpdmUgcGF0aHMgdG8gdGhlIHRhcmdldCBkb21haW5cbiAgICAgIGlmKHJfY29ycyAmJiBsb2MubWF0Y2goXCJeL1teL11cIikpe1xuICAgICAgICBsb2MgPSByX3BhdGgucHJvdG9jb2wgKyBcIi8vXCIgKyByX3BhdGguaG9zdCArIGxvYztcbiAgICAgIH1cbiAgICAgIGhhbmRsZXIobmV3IFNlc3Npb24obG9jLCBrZXksIHR4dCkpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiT3BlbkNQVSBlcnJvciBIVFRQIFwiICsganF4aHIuc3RhdHVzICsgXCJcXG5cIiArIGpxeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgfSk7XG5cbiAgICAvL2Z1bmN0aW9uIGNoYWluaW5nXG4gICAgcmV0dXJuIGpxeGhyO1xuICB9XG5cbiAgLy9jYWxsIGEgZnVuY3Rpb24gdXNpbmcgdXNvbiBhcmd1bWVudHNcbiAgZnVuY3Rpb24gcl9mdW5fY2FsbF9qc29uKGZ1biwgYXJncywgaGFuZGxlcil7XG4gICAgcmV0dXJuIHJfZnVuX2FqYXgoZnVuLCB7XG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShhcmdzIHx8IHt9KSxcbiAgICAgIGNvbnRlbnRUeXBlIDogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgfSwgaGFuZGxlcik7XG4gIH1cblxuICAvL2NhbGwgZnVuY3Rpb24gdXNpbmcgdXJsIGVuY29kaW5nXG4gIC8vbmVlZHMgdG8gd3JhcCBhcmd1bWVudHMgaW4gcXVvdGVzLCBldGNcbiAgZnVuY3Rpb24gcl9mdW5fY2FsbF91cmxlbmNvZGVkKGZ1biwgYXJncywgaGFuZGxlcil7XG4gICAgdmFyIGRhdGEgPSB7fTtcbiAgICAkLmVhY2goYXJncywgZnVuY3Rpb24oa2V5LCB2YWwpe1xuICAgICAgZGF0YVtrZXldID0gc3RyaW5naWZ5KHZhbCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJfZnVuX2FqYXgoZnVuLCB7XG4gICAgICBkYXRhOiAkLnBhcmFtKGRhdGEpXG4gICAgfSwgaGFuZGxlcik7XG4gIH1cblxuICAvL2NhbGwgYSBmdW5jdGlvbiB1c2luZyBtdWx0aXBhcnQvZm9ybS1kYXRhXG4gIC8vdXNlIGZvciBmaWxlIHVwbG9hZHMuIFJlcXVpcmVzIEhUTUw1XG4gIGZ1bmN0aW9uIHJfZnVuX2NhbGxfbXVsdGlwYXJ0KGZ1biwgYXJncywgaGFuZGxlcil7XG4gICAgdGVzdGh0bWw1KCk7XG4gICAgdmFyIGZvcm1kYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgJC5lYWNoKGFyZ3MsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIGZvcm1kYXRhLmFwcGVuZChrZXksIHN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgIH0pO1xuICAgIHJldHVybiByX2Z1bl9hamF4KGZ1biwge1xuICAgICAgZGF0YTogZm9ybWRhdGEsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgICBwcm9jZXNzRGF0YTogZmFsc2VcbiAgICB9LCBoYW5kbGVyKTtcbiAgfVxuXG4gIC8vQXV0b21hdGljYWxseSBkZXRlcm1pbmVzIHR5cGUgYmFzZWQgb24gYXJndW1lbnQgY2xhc3Nlcy5cbiAgZnVuY3Rpb24gcl9mdW5fY2FsbChmdW4sIGFyZ3MsIGhhbmRsZXIpe1xuICAgIGFyZ3MgPSBhcmdzIHx8IHt9O1xuICAgIHZhciBoYXNmaWxlcyA9IGZhbHNlO1xuICAgIHZhciBoYXNjb2RlID0gZmFsc2U7XG5cbiAgICAvL2ZpbmQgYXJndW1lbnQgdHlwZXNcbiAgICAkLmVhY2goYXJncywgZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICBpZih2YWx1ZSBpbnN0YW5jZW9mIEZpbGUgfHwgdmFsdWUgaW5zdGFuY2VvZiBVcGxvYWQgfHwgdmFsdWUgaW5zdGFuY2VvZiBGaWxlTGlzdCl7XG4gICAgICAgIGhhc2ZpbGVzID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBTbmlwcGV0IHx8IHZhbHVlIGluc3RhbmNlb2YgU2Vzc2lvbil7XG4gICAgICAgIGhhc2NvZGUgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9kZXRlcm1pbmUgdHlwZVxuICAgIGlmKGhhc2ZpbGVzKXtcbiAgICAgIHJldHVybiByX2Z1bl9jYWxsX211bHRpcGFydChmdW4sIGFyZ3MsIGhhbmRsZXIpO1xuICAgIH0gZWxzZSBpZihoYXNjb2RlKXtcbiAgICAgIHJldHVybiByX2Z1bl9jYWxsX3VybGVuY29kZWQoZnVuLCBhcmdzLCBoYW5kbGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJfZnVuX2NhbGxfanNvbihmdW4sIGFyZ3MsIGhhbmRsZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vY2FsbCBhIGZ1bmN0aW9uIGFuZCByZXR1cm4gSlNPTlxuICBmdW5jdGlvbiBycGMoZnVuLCBhcmdzLCBoYW5kbGVyKXtcbiAgICByZXR1cm4gcl9mdW5fY2FsbChmdW4sIGFyZ3MsIGZ1bmN0aW9uKHNlc3Npb24pe1xuICAgICAgc2Vzc2lvbi5nZXRPYmplY3QoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGlmKGhhbmRsZXIpIGhhbmRsZXIoZGF0YSk7XG4gICAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGdldCBKU09OIHJlc3BvbnNlIGZvciBcIiArIHNlc3Npb24uZ2V0TG9jKCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvL3Bsb3R0aW5nIHdpZGdldFxuICAvL3RvIGJlIGNhbGxlZCBvbiBhbiAoZW1wdHkpIGRpdi5cbiAgJC5mbi5ycGxvdCA9IGZ1bmN0aW9uKGZ1biwgYXJncywgY2IpIHtcbiAgICB2YXIgdGFyZ2V0ZGl2ID0gdGhpcztcbiAgICB2YXIgbXlwbG90ID0gaW5pdHBsb3QodGFyZ2V0ZGl2KTtcblxuICAgIC8vcmVzZXQgc3RhdGVcbiAgICBteXBsb3Quc2V0bG9jYXRpb24oKTtcbiAgICBteXBsb3Quc3Bpbm5lci5zaG93KCk7XG5cbiAgICAvLyBjYWxsIHRoZSBmdW5jdGlvblxuICAgIHJldHVybiByX2Z1bl9jYWxsKGZ1biwgYXJncywgZnVuY3Rpb24odG1wKSB7XG4gICAgICBteXBsb3Quc2V0bG9jYXRpb24odG1wLmdldExvYygpKTtcblxuICAgICAgLy9jYWxsIHN1Y2Nlc3MgaGFuZGxlciBhcyB3ZWxsXG4gICAgICBpZihjYikgY2IodG1wKTtcbiAgICB9KS5hbHdheXMoZnVuY3Rpb24oKXtcbiAgICAgIG15cGxvdC5zcGlubmVyLmhpZGUoKTtcbiAgICB9KTtcbiAgfTtcblxuICAkLmZuLmdyYXBoaWMgPSBmdW5jdGlvbihzZXNzaW9uLCBuKXtcbiAgICBpbml0cGxvdCh0aGlzKS5zZXRsb2NhdGlvbihzZXNzaW9uLmdldExvYygpLCBuIHx8IFwibGFzdFwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRwbG90KHRhcmdldGRpdil7XG4gICAgaWYodGFyZ2V0ZGl2LmRhdGEoXCJvY3B1cGxvdFwiKSl7XG4gICAgICByZXR1cm4gdGFyZ2V0ZGl2LmRhdGEoXCJvY3B1cGxvdFwiKTtcbiAgICB9XG4gICAgdmFyIG9jcHVwbG90ID0gZnVuY3Rpb24oKXtcbiAgICAgIC8vbG9jYWwgdmFyaWFibGVzXG4gICAgICB2YXIgTG9jYXRpb247XG4gICAgICB2YXIgbiA9IFwibGFzdFwiO1xuICAgICAgdmFyIHBuZ3dpZHRoO1xuICAgICAgdmFyIHBuZ2hlaWdodDtcblxuICAgICAgdmFyIHBsb3RkaXYgPSAkKCc8ZGl2IC8+JykuYXR0cih7XG4gICAgICAgIHN0eWxlOiBcIndpZHRoOiAxMDAlOyBoZWlnaHQ6MTAwJTsgbWluLXdpZHRoOiAxMDBweDsgbWluLWhlaWdodDogMTAwcHg7IHBvc2l0aW9uOnJlbGF0aXZlOyBiYWNrZ3JvdW5kLXJlcGVhdDpuby1yZXBlYXQ7IGJhY2tncm91bmQtc2l6ZTogMTAwJSAxMDAlO1wiXG4gICAgICB9KS5hcHBlbmRUbyh0YXJnZXRkaXYpLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgXCJub25lXCIpO1xuXG4gICAgICB2YXIgc3Bpbm5lciA9ICQoJzxzcGFuIC8+JykuYXR0cih7XG4gICAgICAgIHN0eWxlIDogXCJwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMjBweDsgbGVmdDogMjBweDsgei1pbmRleDoxMDAwOyBmb250LWZhbWlseTogbW9ub3NwYWNlO1wiXG4gICAgICB9KS50ZXh0KFwibG9hZGluZy4uLlwiKS5hcHBlbmRUbyhwbG90ZGl2KS5oaWRlKCk7XG5cbiAgICAgIHZhciBwZGYgPSAkKCc8YSAvPicpLmF0dHIoe1xuICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICAgIHN0eWxlOiBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAxMHB4OyByaWdodDogMTBweDsgei1pbmRleDoxMDAwOyB0ZXh0LWRlY29yYXRpb246dW5kZXJsaW5lOyBmb250LWZhbWlseTogbW9ub3NwYWNlO1wiXG4gICAgICB9KS50ZXh0KFwicGRmXCIpLmFwcGVuZFRvKHBsb3RkaXYpO1xuXG4gICAgICB2YXIgc3ZnID0gJCgnPGEgLz4nKS5hdHRyKHtcbiAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wiLFxuICAgICAgICBzdHlsZTogXCJwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMzBweDsgcmlnaHQ6IDEwcHg7IHotaW5kZXg6MTAwMDsgdGV4dC1kZWNvcmF0aW9uOnVuZGVybGluZTsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTtcIlxuICAgICAgfSkudGV4dChcInN2Z1wiKS5hcHBlbmRUbyhwbG90ZGl2KTtcblxuICAgICAgdmFyIHBuZyA9ICQoJzxhIC8+JykuYXR0cih7XG4gICAgICAgIHRhcmdldDogXCJfYmxhbmtcIixcbiAgICAgICAgc3R5bGU6IFwicG9zaXRpb246IGFic29sdXRlOyB0b3A6IDUwcHg7IHJpZ2h0OiAxMHB4OyB6LWluZGV4OjEwMDA7IHRleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmU7IGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7XCJcbiAgICAgIH0pLnRleHQoXCJwbmdcIikuYXBwZW5kVG8ocGxvdGRpdik7XG5cbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZXBuZygpe1xuICAgICAgICBpZighTG9jYXRpb24pIHJldHVybjtcbiAgICAgICAgcG5nd2lkdGggPSBwbG90ZGl2LndpZHRoKCk7XG4gICAgICAgIHBuZ2hlaWdodCA9IHBsb3RkaXYuaGVpZ2h0KCk7XG4gICAgICAgIHBsb3RkaXYuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBcInVybChcIiArIExvY2F0aW9uICsgXCJncmFwaGljcy9cIiArIG4gKyBcIi9wbmc/d2lkdGg9XCIgKyBwbmd3aWR0aCArIFwiJmhlaWdodD1cIiArIHBuZ2hlaWdodCArIFwiKVwiKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0bG9jYXRpb24obmV3bG9jLCBuZXduKXtcbiAgICAgICAgbiA9IG5ld24gfHwgbjtcbiAgICAgICAgTG9jYXRpb24gPSBuZXdsb2M7XG4gICAgICAgIGlmKCFMb2NhdGlvbil7XG4gICAgICAgICAgcGRmLmhpZGUoKTtcbiAgICAgICAgICBzdmcuaGlkZSgpO1xuICAgICAgICAgIHBuZy5oaWRlKCk7XG4gICAgICAgICAgcGxvdGRpdi5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwiXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBkZi5hdHRyKFwiaHJlZlwiLCBMb2NhdGlvbiArIFwiZ3JhcGhpY3MvXCIgKyBuICsgXCIvcGRmP3dpZHRoPTExLjY5JmhlaWdodD04LjI3JnBhcGVyPWE0clwiKS5zaG93KCk7XG4gICAgICAgICAgc3ZnLmF0dHIoXCJocmVmXCIsIExvY2F0aW9uICsgXCJncmFwaGljcy9cIiArIG4gKyBcIi9zdmc/d2lkdGg9MTEmaGVpZ2h0PTZcIikuc2hvdygpO1xuICAgICAgICAgIHBuZy5hdHRyKFwiaHJlZlwiLCBMb2NhdGlvbiArIFwiZ3JhcGhpY3MvXCIgKyBuICsgXCIvcG5nP3dpZHRoPTgwMCZoZWlnaHQ9NjAwXCIpLnNob3coKTtcbiAgICAgICAgICB1cGRhdGVwbmcoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBmdW5jdGlvbiB0byB1cGRhdGUgdGhlIHBuZyBpbWFnZVxuICAgICAgdmFyIG9ucmVzaXplID0gZGVib3VuY2UoZnVuY3Rpb24oZSkge1xuICAgICAgICBpZihwbmd3aWR0aCA9PSBwbG90ZGl2LndpZHRoKCkgJiYgcG5naGVpZ2h0ID09IHBsb3RkaXYuaGVpZ2h0KCkpe1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZihwbG90ZGl2LmlzKFwiOnZpc2libGVcIikpe1xuICAgICAgICAgIHVwZGF0ZXBuZygpO1xuICAgICAgICB9XG4gICAgICB9LCA1MDApO1xuXG4gICAgICAvLyByZWdpc3RlciB1cGRhdGUgaGFuZGxlcnNcbiAgICAgIHBsb3RkaXYub24oXCJyZXNpemVcIiwgb25yZXNpemUpO1xuICAgICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIG9ucmVzaXplKTtcblxuICAgICAgLy9yZXR1cm4gb2JqZWN0c1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2V0bG9jYXRpb246IHNldGxvY2F0aW9uLFxuICAgICAgICBzcGlubmVyIDogc3Bpbm5lclxuICAgICAgfTtcbiAgICB9KCk7XG5cbiAgICB0YXJnZXRkaXYuZGF0YShcIm9jcHVwbG90XCIsIG9jcHVwbG90KTtcbiAgICByZXR1cm4gb2NwdXBsb3Q7XG4gIH1cblxuICAvLyBmcm9tIHVuZGVyc3RvcmUuanNcbiAgZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICB2YXIgdGltZW91dCA9IG51bGw7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBpZiAoIWltbWVkaWF0ZSlcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgfTtcbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgaWYgKGNhbGxOb3cpXG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB0ZXN0aHRtbDUoKXtcbiAgICBpZiggd2luZG93LkZvcm1EYXRhID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBhbGVydChcIlVwbG9hZGluZyBvZiBmaWxlcyByZXF1aXJlcyBIVE1MNS4gSXQgbG9va3MgbGlrZSB5b3UgYXJlIHVzaW5nIGFuIG91dGRhdGVkIGJyb3dzZXIgdGhhdCBkb2VzIG5vdCBzdXBwb3J0IHRoaXMuIFBsZWFzZSBpbnN0YWxsIEZpcmVmb3gsIENocm9tZSBvciBJbnRlcm5ldCBFeHBsb3JlciAxMCtcIik7XG4gICAgICB0aHJvdyBcIkhUTUw1IHJlcXVpcmVkLlwiO1xuICAgIH1cbiAgfVxuXG4gIC8vZ2xvYmFsIHNldHRpbmdzXG4gIGZ1bmN0aW9uIHNldHVybChuZXdwYXRoKXtcbiAgICBpZighbmV3cGF0aC5tYXRjaChcIi9SJFwiKSl7XG4gICAgICBhbGVydChcIkVSUk9SISBUcnlpbmcgdG8gc2V0IFIgdXJsIHRvOiBcIiArIG5ld3BhdGggK1wiLiBQYXRoIHRvIGFuIE9wZW5DUFUgUiBwYWNrYWdlIG11c3QgZW5kIHdpdGggJy9SJ1wiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcl9wYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgcl9wYXRoLmhyZWYgPSBuZXdwYXRoO1xuICAgICAgcl9wYXRoLmhyZWYgPSByX3BhdGguaHJlZjsgLy9JRSBuZWVkcyB0aGlzXG5cbiAgICAgIGlmKGxvY2F0aW9uLnByb3RvY29sICE9IHJfcGF0aC5wcm90b2NvbCB8fCBsb2NhdGlvbi5ob3N0ICE9IHJfcGF0aC5ob3N0KXtcbiAgICAgICAgcl9jb3JzID0gdHJ1ZTtcbiAgICAgICAgaWYgKCEoJ3dpdGhDcmVkZW50aWFscycgaW4gbmV3IFhNTEh0dHBSZXF1ZXN0KCkpKSB7XG4gICAgICAgICAgYWxlcnQoXCJUaGlzIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBDT1JTLiBUcnkgdXNpbmcgRmlyZWZveCBvciBDaHJvbWUuXCIpO1xuICAgICAgICB9IGVsc2UgaWYocl9wYXRoLnVzZXJuYW1lICYmIHJfcGF0aC5wYXNzd29yZCkge1xuICAgICAgICAgIC8vc2hvdWxkIG9ubHkgZG8gdGhpcyBmb3IgY2FsbHMgdG8gb3BlbmNwdSBtYXliZVxuICAgICAgICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAocl9wYXRoLmhvc3QpO1xuICAgICAgICAgICQuYWpheFNldHVwKHtcbiAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uKHhociwgc2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgLy9vbmx5IHVzZSBhdXRoIGZvciBhamF4IHJlcXVlc3RzIHRvIG9jcHVcbiAgICAgICAgICAgICAgaWYocmVnZXgudGVzdChzZXR0aW5ncy51cmwpKXtcbiAgICAgICAgICAgICAgICAvL3NldHRpbmdzLnVzZXJuYW1lID0gcl9wYXRoLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIC8vc2V0dGluZ3MucGFzc3dvcmQgPSByX3BhdGgucGFzc3dvcmQ7XG5cbiAgICAgICAgICAgICAgICAvKiB0YWtlIG91dCB1c2VyOnBhc3MgZnJvbSB0YXJnZXQgdXJsICovXG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICB0YXJnZXQuaHJlZiA9IHNldHRpbmdzLnVybDtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy51cmwgPSB0YXJnZXQucHJvdG9jb2wgKyBcIi8vXCIgKyB0YXJnZXQuaG9zdCArIHRhcmdldC5wYXRobmFtZVxuXG4gICAgICAgICAgICAgICAgLyogc2V0IGJhc2ljIGF1dGggaGVhZGVyICovXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MueGhyRmllbGRzID0gc2V0dGluZ3MueGhyRmllbGRzIHx8IHt9O1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLnhockZpZWxkcy53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmNyb3NzRG9tYWluID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkF1dGhvcml6YXRpb25cIiwgXCJCYXNpYyBcIiArIGJ0b2Eocl9wYXRoLnVzZXJuYW1lICsgXCI6XCIgKyByX3BhdGgucGFzc3dvcmQpKTtcblxuICAgICAgICAgICAgICAgIC8qIGRlYnVnICovXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJBdXRoZW50aWNhdGVkIHJlcXVlc3QgdG86IFwiICsgc2V0dGluZ3MudXJsICsgXCIgKFwiICsgcl9wYXRoLnVzZXJuYW1lICsgXCIsIFwiICsgcl9wYXRoLnBhc3N3b3JkICsgXCIpXCIpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihsb2NhdGlvbi5wcm90b2NvbCA9PSBcImh0dHBzOlwiICYmIHJfcGF0aC5wcm90b2NvbCAhPSBcImh0dHBzOlwiKXtcbiAgICAgICAgYWxlcnQoXCJQYWdlIGlzIGhvc3RlZCBvbiBIVFRQUyBidXQgdXNpbmcgYSAobm9uLVNTTCkgSFRUUCBPcGVuQ1BVIHNlcnZlci4gVGhpcyBpcyBpbnNlY3VyZSBhbmQgbW9zdCBicm93c2VycyB3aWxsIG5vdCBhbGxvdyB0aGlzLlwiKVxuICAgICAgfVxuXG4gICAgICBpZihyX2NvcnMpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNldHRpbmcgcGF0aCB0byBDT1JTIHNlcnZlciBcIiArIHJfcGF0aC5ocmVmKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2V0dGluZyBwYXRoIHRvIGxvY2FsIChub24tQ09SUykgc2VydmVyIFwiICsgcl9wYXRoLmhyZWYpO1xuICAgICAgfVxuXG4gICAgICAvL0NPUlMgZGlzYWxsb3dzIHJlZGlyZWN0cy5cbiAgICAgIHJldHVybiAkLmdldChyX3BhdGguaHJlZiArIFwiL1wiLCBmdW5jdGlvbihyZXNkYXRhKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJQYXRoIHVwZGF0ZWQuIEF2YWlsYWJsZSBvYmplY3RzL2Z1bmN0aW9uczpcXG5cIiArIHJlc2RhdGEpO1xuXG4gICAgICB9KS5mYWlsKGZ1bmN0aW9uKHhociwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pe1xuICAgICAgICAvLyBhbGVydChcIkNvbm5lY3Rpb24gdG8gT3BlbkNQVSBmYWlsZWQ6XFxuXCIgKyB0ZXh0U3RhdHVzICsgXCJcXG5cIiArIHhoci5yZXNwb25zZVRleHQgKyBcIlxcblwiICsgZXJyb3JUaHJvd24pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy9mb3IgaW5uZXJuZXR6IGV4cGxvZGVyXG4gIGlmICh0eXBlb2YgY29uc29sZSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdGhpcy5jb25zb2xlID0ge2xvZzogZnVuY3Rpb24oKSB7fX07XG4gIH1cblxuICAvL2V4cG9ydFxuICByZXR1cm4ge1xuICAgIGNhbGwgICAgICAgIDogIHJfZnVuX2NhbGwsXG4gICAgcnBjICAgICAgICAgOiAgcnBjLFxuICAgIHNldHVybCAgICAgIDogIHNldHVybCxcbiAgICBTbmlwcGV0ICAgICA6ICBTbmlwcGV0LFxuICAgIFVwbG9hZCAgICAgIDogIFVwbG9hZCxcbiAgICBTZXNzaW9uICAgICA6ICBTZXNzaW9uXG4gIH07XG5cbn0oIHdpbmRvdywgalF1ZXJ5ICkpO1xuIl19
