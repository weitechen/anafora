module( "project selector module", {
  setup: function() {
	this.setting = {
		schemaMap: {"PropBank":0, "Temporal":["Entity", "Relation"], "EVENTCoref":0, "SHARPn":0, "Coreference":0},
		app_name: "annotate",
		isAdjudication: false,
		remoteUser: "wech5560",
		projectName: "",
		taskName: "",
		schema: "",
		annotator: "wech5560",
		corpusName: "",
		root_url: "/~wech5560/anafora"
		};

	this.projectSelector = undefined;

	this.htmlElement = $('<div id="mask"></div> <div id="projectSelectorWindow"> <div id="projectSelector"> <h4></h4> <div><h5></h5><ul></ul></div> <div><h5></h5><ul></ul></div> <div><h5></h5><ul></ul></div> </div> <div id="schemaSelector"> <h4>Select Schema and Mode</h4> <div><h5 style="display:block">Schema</h5><ul></ul></div> <div><h5 style="display:block">Mode</h5><ul></ul></div> <div><h5 style="display:block">Adjudication</h5><ul><li>Adjudication</li></ul></div> </div> <div class="btnArea"> <div class="btnEnable">Cancel</div><div class="btnDisable">Open</div> </div> </div>');
	$("#attachElement").empty();
	$("#attachElement").append(this.htmlElement);
  }
});

test( "constructor Test", function() {
	raises(function() {ProjectSelector();}, "setting is undefined in ProjectSelector constructor", "test ProjectSelector no setting error");

	this.setting.projectName = "Temporal";
	this.setting.corpusName = "ColonCancer";
	this.setting.taskName = "ID005_clinic_013";
	this.setting.schema = "Temporal.Entity.Adjudication";
	this.setting.isAdjudication = true;
	this.projectSelector = new ProjectSelector(this.setting);

	deepEqual(this.projectSelector.windowElement, $("#projectSelectorWindow"), "test project window element");
	equal(this.projectSelector.schemaElement.children("h5").text(), "Schema", "test schema element");
	equal(this.projectSelector.modeElement.children("h5").text(), "Mode", "test mode element");
	equal(this.projectSelector.adjudicationElement.children("h5").text(), "Adjudication", "test adjudication element");

	equal(this.projectSelector.schema, "Temporal");
	equal(this.projectSelector.mode, "Entity");
	ok(this.projectSelector.adjudication);
});

test( "getDir Test", function() {
	this.projectSelector = new ProjectSelector(this.setting);

	var projectList = this.projectSelector.getDir();
	deepEqual(projectList, ["Demo","EPIC", "EventWorkshop", "SHARP", "Temporal", "Training" ], "test getDir for project");

	var corpusList = this.projectSelector.getDir("Temporal");
	deepEqual(corpusList, ["BrainCancer", "ColonCancer"], "test getDir for corpus");
	raises(function() {this.projectSelector.getDir("temporal");}, "getDir fail", "test getDir with error project name" );

	var taskDict = this.projectSelector.getDir("Temporal", "ColonCancer", "Temporal.Entity", false);
	equal(taskDict["n"].length, 478);
	equal(taskDict["i"].length, 0);
	equal(taskDict["c"].length, 0);
	
	raises(function() {this.projectSelector.getDir("Temporal", "ColonCancer","Temporal");}, "getDir fail", "test getDir with error schema name" );
	raises(function() {this.projectSelector.getDir("Temporal", "ColonCancer");}, "should provide both corpusName and schema Name", "test getDir with not provide schema name" );

	var adjTaskDict = this.projectSelector.getDir("Temporal", "ColonCancer", "Temporal.Entity", true);
	equal(adjTaskDict["n"].length, 144);
	equal(adjTaskDict["i"].length, 0);
	equal(adjTaskDict["c"].length, 0);
});

test( "initial display test", function() {
	// empty initial
	this.projectSelector = new ProjectSelector(this.setting);
	ok(!this.projectSelector.adjudication);
	deepEqual(this.projectSelector.projectDir, {"Demo":{}, "EventWorkshop":{}, "SHARP":{}, "Temporal":{}, "EPIC":{}, "Training":{} });
	deepEqual(this.projectSelector.divElement.children("h4").text(), "Select Project");
	deepEqual(this.projectSelector.divElement.children("div:first").children("h5").text(), "");
	deepEqual(this.projectSelector.divElement.children("div:first").children("ul").children().length, 6);
	deepEqual(this.projectSelector.divElement.children("div:first").children("ul").text(), "DemoEPICEventWorkshopSHARPTemporalTraining");
	ok(!this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	ok(!this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 5);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) { return elem.innerHTML; }), ["PropBank", "Temporal", "EVENTCoref", "SHARPn", "Coreference"], "test schema correct" );
	ok(!this.projectSelector.modeElement.is(":visible"));
	ok(this.projectSelector.adjudicationElement.is(":visible"));
	ok(!this.projectSelector.adjudicationElement.children("ul").children("li").hasClass("selected"));

	// setting projectName
	this.setting.projectName = "Temporal";
	this.projectSelector = new ProjectSelector(this.setting);
	ok(!this.projectSelector.adjudication);
	deepEqual(this.projectSelector.projectDir, {"Demo":{}, "EventWorkshop":{}, "SHARP":{}, "Temporal":{"ColonCancer":null, "BrainCancer":null}, "EPIC":{}, "Training":{} });
	deepEqual(this.projectSelector.divElement.children("h4").text(), "Select Corpus");
	deepEqual(this.projectSelector.divElement.children("div:first").children("h5").text(), "");
	deepEqual(this.projectSelector.divElement.children("div:first").children("ul").children().length, 2);
	deepEqual(this.projectSelector.divElement.children("div:first").children("ul").text(), "BrainCancerColonCancer");
	ok(!this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	ok(!this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 5);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) { return elem.innerHTML; }), ["PropBank", "Temporal", "EVENTCoref", "SHARPn", "Coreference"], "test schema correct" );
	ok(!this.projectSelector.modeElement.is(":visible"));
	ok(this.projectSelector.adjudicationElement.is(":visible"));
	ok(!this.projectSelector.adjudicationElement.children("ul").children("li").hasClass("selected"));

	// setting projectname and corpus name
	this.setting.projectName = "Temporal";
	this.setting.corpusName = "ColonCancer";
	this.projectSelector = new ProjectSelector(this.setting);
	ok(!this.projectSelector.adjudication);
	deepEqual(this.projectSelector.projectDir, {"Demo":{}, "EventWorkshop":{}, "SHARP":{}, "Temporal":{"ColonCancer":null, "BrainCancer":null}, "EPIC":{}, "Training":{} });
	deepEqual(this.projectSelector.divElement.children("h4").text(), "Select Corpus");
	deepEqual(this.projectSelector.divElement.children("div:first").children("h5").text(), "");
	deepEqual(this.projectSelector.divElement.children("div:first").children("ul").children().length, 2);
	deepEqual(this.projectSelector.divElement.children("div:first").children("ul").text(), "BrainCancerColonCancer");
	ok(!this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	ok(!this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 5);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) { return elem.innerHTML; }), ["PropBank", "Temporal", "EVENTCoref", "SHARPn", "Coreference"], "test schema correct" );
	ok(!this.projectSelector.modeElement.is(":visible"));
	ok(this.projectSelector.adjudicationElement.is(":visible"));
	ok(!this.projectSelector.adjudicationElement.children("ul").children("li").hasClass("selected"));

	// setting with projectname, corpusname and scheman name -> display task
	this.setting.projectName = "Temporal";
	this.setting.corpusName = "ColonCancer";
	this.setting.schema = "Temporal.Entity";
	this.projectSelector = new ProjectSelector(this.setting);
	equal(this.projectSelector.schema, "Temporal");
	equal(this.projectSelector.mode, "Entity");
	ok(!this.projectSelector.adjudication);
	deepEqual(this.projectSelector.projectDir, {"Demo":{}, "EventWorkshop":{}, "SHARP":{}, "Temporal":{"ColonCancer":null, "BrainCancer":null}, "EPIC":{}, "Training":{} });
	deepEqual(this.projectSelector.divElement.children("h4").text(), "Select Task");
	deepEqual(this.projectSelector.divElement.children("div").eq(0).children("h5").text(), "New Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(0).children("ul").children().length, 478);

	ok(this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	deepEqual(this.projectSelector.divElement.children("div").eq(1).children("h5").text(), "In-progress Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(1).children("ul").children().length, 0);

	ok(this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	deepEqual(this.projectSelector.divElement.children("div").eq(2).children("h5").text(), "Completed Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(2).children("ul").children().length, 0);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 1);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) {return elem.innerHTML;}), ["Temporal"]);
	ok(this.projectSelector.schemaElement.children("ul").children("li").hasClass("selected"));
	ok(this.projectSelector.modeElement.is(":visible"));
	deepEqual(this.projectSelector.modeElement.children("ul").children().length, 1);
	deepEqual(this.projectSelector.modeElement.children("ul").children().text(), "Entity");
	ok(this.projectSelector.modeElement.children("ul").children("li").hasClass("selected"));
	ok(this.projectSelector.adjudicationElement.is(":visible"));
	ok(!this.projectSelector.adjudicationElement.children("ul").children("li").hasClass("selected"));

	// Given project, corpus, schema and isAdjudication
	this.setting.projectName = "Temporal";
	this.setting.corpusName = "ColonCancer";
	this.setting.schema = "Temporal.Entity";
	this.setting.isAdjudication = true;
	this.projectSelector = new ProjectSelector(this.setting);
	equal(this.projectSelector.schema, "Temporal");
	equal(this.projectSelector.mode, "Entity");
	ok(this.projectSelector.adjudication);
	deepEqual(this.projectSelector.projectDir, {"Demo":{}, "EventWorkshop":{}, "SHARP":{}, "Temporal":{"ColonCancer":null, "BrainCancer":null}, "EPIC":{}, "Training":{} });
	deepEqual(this.projectSelector.divElement.children("h4").text(), "Select Task");
	deepEqual(this.projectSelector.divElement.children("div").eq(0).children("h5").text(), "New Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(0).children("ul").children("li").length, 144);

	ok(this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	deepEqual(this.projectSelector.divElement.children("div").eq(1).children("h5").text(), "In-progress Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(1).children("ul").children().length, 0);

	ok(this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	deepEqual(this.projectSelector.divElement.children("div").eq(2).children("h5").text(), "Completed Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(2).children("ul").children().length, 0);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 1);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) {return elem.innerHTML;}), ["Temporal"]);
	ok(this.projectSelector.schemaElement.children("ul").children("li").hasClass("selected"));
	ok(this.projectSelector.modeElement.is(":visible"));
	deepEqual(this.projectSelector.modeElement.children("ul").children().length, 1);
	deepEqual(this.projectSelector.modeElement.children("ul").children().text(), "Entity");
	ok(this.projectSelector.modeElement.children("ul").children("li").hasClass("selected"));
	ok(this.projectSelector.adjudicationElement.is(":visible"));
	ok(this.projectSelector.adjudicationElement.children("ul").children("li").hasClass("selected"));

	// no mode schema
	this.setting.projectName = "Temporal";
	this.setting.corpusName = "ColonCancer";
	this.setting.schema = "Coreference";
	this.setting.isAdjudication = false;
	this.projectSelector = new ProjectSelector(this.setting);
	equal(this.projectSelector.schema, "Coreference");
	equal(this.projectSelector.mode, false);
	ok(!this.projectSelector.adjudication);
	deepEqual(this.projectSelector.projectDir, {"Demo":{}, "EventWorkshop":{}, "SHARP":{}, "Temporal":{"ColonCancer":null, "BrainCancer":null}, "EPIC":{}, "Training":{} });
	deepEqual(this.projectSelector.divElement.children("h4").text(), "Select Task");
	deepEqual(this.projectSelector.divElement.children("div").eq(0).children("h5").text(), "New Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(0).children("ul").children("li").length, 654);

	ok(this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	deepEqual(this.projectSelector.divElement.children("div").eq(1).children("h5").text(), "In-progress Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(1).children("ul").children().length, 0);

	ok(this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	deepEqual(this.projectSelector.divElement.children("div").eq(2).children("h5").text(), "Completed Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(2).children("ul").children().length, 0);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 1);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) {return elem.innerHTML;}), ["Coreference"]);
	ok(this.projectSelector.schemaElement.children("ul").children("li").hasClass("selected"));
	ok(!this.projectSelector.modeElement.is(":visible"));
	ok(this.projectSelector.adjudicationElement.is(":visible"));
	ok(!this.projectSelector.adjudicationElement.children("ul").children("li").hasClass("selected"));

	// no mode schema, adjudication
	this.setting.projectName = "Temporal";
	this.setting.corpusName = "ColonCancer";
	this.setting.schema = "Coreference";
	this.setting.isAdjudication = true;
	this.projectSelector = new ProjectSelector(this.setting);
	equal(this.projectSelector.schema, "Coreference");
	equal(this.projectSelector.mode, false);
	ok(this.projectSelector.adjudication);
	deepEqual(this.projectSelector.projectDir, {"Demo":{}, "EventWorkshop":{}, "SHARP":{}, "Temporal":{"ColonCancer":null, "BrainCancer":null}, "EPIC":{}, "Training":{} });
	deepEqual(this.projectSelector.divElement.children("h4").text(), "Select Task");
	deepEqual(this.projectSelector.divElement.children("div").eq(0).children("h5").text(), "New Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(0).children("ul").children("li").length, 0);

	ok(this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	deepEqual(this.projectSelector.divElement.children("div").eq(1).children("h5").text(), "In-progress Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(1).children("ul").children().length, 0);

	ok(this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	deepEqual(this.projectSelector.divElement.children("div").eq(2).children("h5").text(), "Completed Tasks");
	deepEqual(this.projectSelector.divElement.children("div").eq(2).children("ul").children().length, 0);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 1);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) {return elem.innerHTML;}), ["Coreference"]);
	ok(this.projectSelector.schemaElement.children("ul").children("li").hasClass("selected"));
	ok(!this.projectSelector.modeElement.is(":visible"));
	ok(this.projectSelector.adjudicationElement.is(":visible"));
	ok(this.projectSelector.adjudicationElement.children("ul").children("li").hasClass("selected"));
});

test("test projectSelector event", function() {
	// test select project
	this.projectSelector = new ProjectSelector(this.setting);
	this.projectSelector.divElement.find("div:first>ul>li").eq(4).trigger('click');

	deepEqual(this.projectSelector.divElement.children("h4").text(), "Select Corpus");
	deepEqual(this.projectSelector.divElement.children("div:first").children("h5").text(), "");
	deepEqual(this.projectSelector.divElement.children("div:first").children("ul").children().length, 2);
	deepEqual(this.projectSelector.divElement.children("div:first").children("ul").text(), "BrainCancerColonCancer");
	ok(!this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	ok(!this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "", "task": ""});
	equal(this.projectSelector.schema, undefined);
	equal(this.projectSelector.mode, undefined);
	ok(!this.projectSelector.openBtn.hasClass("btnEnable"));

	// test select corpus without select schema
	raises(function() {this.projectSelector.divElement.find("div:first>ul>li").eq(1).trigger('click');}, "Select Schema First", "Test select corpus without select schema first");
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "", "task": ""});
	equal(this.projectSelector.schema, undefined);
	equal(this.projectSelector.mode, undefined);
	ok(!this.projectSelector.openBtn.hasClass("btnEnable"));

	// test schema select
	this.projectSelector.schemaElement.find("ul>li").eq(1).trigger('click');
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 1);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) {return elem.innerHTML;}), ["Temporal"]);
	ok(this.projectSelector.schemaElement.children("ul").children("li").hasClass("selected"));
	deepEqual(this.projectSelector.modeElement.children("ul").children().length, 2);
	deepEqual(this.projectSelector.modeElement.children("ul").children().toArray().map(function(elem) {return elem.innerHTML;}), ["Entity", "Relation"]);
	ok(this.projectSelector.modeElement.is(":visible"));
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "", "task": ""});
	equal(this.projectSelector.schema, "Temporal");
	equal(this.projectSelector.mode, undefined);
	ok(!this.projectSelector.openBtn.hasClass("btnEnable"));

	// test select corpus without select mode
	raises(function() {this.projectSelector.divElement.find("div:first>ul>li").eq(1).trigger('click');}, "Select Mode First");
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "", "task": ""});
	equal(this.projectSelector.schema, "Temporal");
	equal(this.projectSelector.mode, undefined);
	ok(!this.projectSelector.openBtn.hasClass("btnEnable"));

	// test mode select
	this.projectSelector.modeElement.find("ul>li").eq(0).trigger('click');
	deepEqual(this.projectSelector.modeElement.children("ul").children().length, 1);
	deepEqual(this.projectSelector.modeElement.children("ul").children().toArray().map(function(elem) {return elem.innerHTML;}), ["Entity"]);
	ok(this.projectSelector.modeElement.is(":visible"));
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "", "task": ""});
	equal(this.projectSelector.schema, "Temporal");
	equal(this.projectSelector.mode, "Entity");
	ok(!this.projectSelector.openBtn.hasClass("btnEnable"));

	// unselect schema
	this.projectSelector.schemaElement.find("ul>li").eq(0).trigger('click');
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 5);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) {return elem.innerHTML;}), ["PropBank", "Temporal", "EVENTCoref", "SHARPn", "Coreference"]);
	ok(!this.projectSelector.schemaElement.children("ul").children("li").hasClass("selected"));
	ok(!this.projectSelector.modeElement.is(":visible"));
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "", "task": ""});
	equal(this.projectSelector.schema, undefined);
	equal(this.projectSelector.mode, undefined);
	ok(!this.projectSelector.openBtn.hasClass("btnEnable"));

	// select schema without mode
	this.projectSelector.schemaElement.find("ul>li").eq(4).trigger('click');
	deepEqual(this.projectSelector.schemaElement.children("ul").children().length, 1);
	deepEqual(this.projectSelector.schemaElement.children("ul").children().toArray().map(function(elem) {return elem.innerHTML;}), ["Coreference"]);
	ok(this.projectSelector.schemaElement.children("ul").children("li").hasClass("selected"));
	ok(!this.projectSelector.modeElement.is(":visible"));
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "", "task": ""});
	equal(this.projectSelector.schema, "Coreference");
	equal(this.projectSelector.mode, false);
	ok(!this.projectSelector.openBtn.hasClass("btnEnable"));

	// test adjudication select
	this.projectSelector.adjudicationElement.find("ul>li").trigger("click");
	ok(this.projectSelector.adjudicationElement.find("ul>li").hasClass("selected"));
	ok(this.projectSelector.adjudication);
	this.projectSelector.adjudicationElement.find("ul>li").trigger("click");
	ok(!this.projectSelector.adjudicationElement.children("ul").children("li").hasClass("selected"));
	ok(!this.projectSelector.adjudication);
	ok(!this.projectSelector.openBtn.hasClass("btnEnable"));

	// test click corpus with Temporal.Entity
	this.projectSelector.schemaElement.find("ul>li").eq(0).trigger('click');
	this.projectSelector.schemaElement.find("ul>li").eq(1).trigger('click');
	this.projectSelector.modeElement.find("ul>li").eq(0).trigger('click');
	this.projectSelector.divElement.find("div:first>ul>li").eq(1).trigger('click');
	deepEqual(this.projectSelector.divElement.children("h4").text(), "Select Task");
	equal(this.projectSelector.divElement.children("div:first").children("h5").text(), "New Tasks");
	equal(this.projectSelector.divElement.children("div:first").children("ul").children().length, 478);
	ok(this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	equal(this.projectSelector.divElement.children("div").eq(1).children("h5").text(), "In-progress Tasks");
	equal(this.projectSelector.divElement.children("div").eq(1).children("ul").children().length, 0);
	ok(this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	equal(this.projectSelector.divElement.children("div").eq(2).children("h5").text(), "Completed Tasks");
	equal(this.projectSelector.divElement.children("div").eq(2).children("ul").children().length, 0);
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "ColonCancer", "task": ""});
	equal(this.projectSelector.schema, "Temporal");
	equal(this.projectSelector.mode, "Entity");
	ok(!this.projectSelector.openBtn.hasClass("btnEnable"));

	// test click task
	this.projectSelector.divElement.children("div").eq(0).find("ul>li").eq(0).trigger('click');
	equal(this.projectSelector.divElement.children("div").eq(0).children("ul").children().length, 478);
	ok(this.projectSelector.divElement.children("div").eq(0).children("ul").children().eq(0).hasClass("selected"));
	equal(this.projectSelector.divElement.children("div").eq(0).children("ul").children(".selected").length, 1);
	ok(this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	equal(this.projectSelector.divElement.children("div").eq(1).children("ul").children().length, 0);
	ok(this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	equal(this.projectSelector.divElement.children("div").eq(2).children("ul").children().length, 0);
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "ColonCancer", "task": "ID045_path_131"});
	equal(this.projectSelector.schema, "Temporal");
	equal(this.projectSelector.mode, "Entity");
	ok(this.projectSelector.openBtn.hasClass("btnEnable"));

	// test re-click task
	this.projectSelector.divElement.children("div").eq(0).find("ul>li").eq(5).trigger('click');
	equal(this.projectSelector.divElement.children("div").eq(0).children("ul").children().length, 478);
	ok(this.projectSelector.divElement.children("div").eq(0).children("ul").children().eq(5).hasClass("selected"));
	equal(this.projectSelector.divElement.children("div").eq(0).children("ul").children(".selected").length, 1);
	ok(this.projectSelector.divElement.children("div").eq(1).is(":visible"));
	equal(this.projectSelector.divElement.children("div").eq(1).children("ul").children().length, 0);
	ok(this.projectSelector.divElement.children("div").eq(2).is(":visible"));
	equal(this.projectSelector.divElement.children("div").eq(2).children("ul").children().length, 0);
	deepEqual(this.projectSelector.selected, {"project":"Temporal", "corpus": "ColonCancer", "task": "ID047_clinic_136"});
	equal(this.projectSelector.schema, "Temporal");
	equal(this.projectSelector.mode, "Entity");
	ok(this.projectSelector.openBtn.hasClass("btnEnable"));
});
