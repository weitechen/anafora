
function ProjectSelector(setting) {
	if(setting == undefined)
		throw "setting is undefined in ProjectSelector constructor";

	var _self = this;
	this.windowElement = $("#projectSelectorWindow");
	this.divElement = $("#projectSelector");
	this.schemaElement = $("#schemaSelector").children("div").eq(0);
	this.modeElement = $("#schemaSelector").children("div").eq(1);
	this.adjudicationElement = $("#schemaSelector").children("div").eq(2);
	this.mask = $("#mask");

	this.cancelBtn = this.windowElement.children("div").eq(2).children("div").eq(0);
	this.openBtn = this.windowElement.children("div").eq(2).children("div").eq(1);

	this.cancelBtn.bind('click', function() { _self.cancelBtnClick(); });

	this.adjudicationElement.find("ul>li").bind('click', function(evt) {ProjectSelector.clickAdjudicationSelect(_self, evt.target);});

	this.projectDir = undefined;
	this.schemaMap = setting.schemaMap;
	this.adjSourceSchema = undefined;
	this.mode = undefined;
	if(setting.schema == "")
		this.schema = undefined;
	else {
		if(setting.schema.indexOf(".") >=0) {
			var t=setting.schema.split(".");
			this.schema = t[0];
			this.mode = t[1];
		}
		else {
			this.schema = setting.schema;
			this.mode = false;
		}
	}

	if(setting.isAdjudication == undefined)
		this.adjudication = false;
	else
		this.adjudication = setting.isAdjudication;

	this.selected = {"project": setting.projectName, "corpus": setting.corpusName, "task": setting.taskName};
	
	this.baseURL = setting.root_url + "/" + setting.app_name + "/";
	this.initialProjectDir();
}

ProjectSelector.prototype.initialProjectDir = function() {
	var _self = this;

	this.schemaSelect();
	this.modeSelect();
	this.adjudicationSelect();

	if(this.projectDir == undefined) {
		this.projectDir = {};
		var projectList = this.getDir();
		$.each(projectList, function(idx, pName) {
			_self.projectDir[pName] = {};
		});
	}

	if(this.selected.project === "") {
		this.selectProject();
	}
	else {
		var corpusList = this.getDir(this.selected.project);
		$.each(corpusList, function(idx, cName) {
			_self.projectDir[_self.selected.project][cName] = null;
		});

		if(this.selected.corpus === "" || this.schema === undefined) {
			this.selectCorpus();
		}
		else {
			this.selectTask();
			this.windowElement.hide();
			this.mask.hide();
			return ;
		}
	}
	this.popup();
}

ProjectSelector.prototype.getDir = function(projectName, corpusName, schemaName, isAdjudication) {
	var jsonURL = this.baseURL + "getDir/";
	if(projectName != undefined)
		jsonURL += projectName + "/";

	if(corpusName != undefined || schemaName != undefined) {
		if(corpusName == undefined || schemaName == undefined)
			throw "should provide both corpusName and schema Name";

		jsonURL += corpusName + "/" +  schemaName;
		if(isAdjudication != undefined && isAdjudication)
			jsonURL += ".Adjudication";

		jsonURL += "/";
	}

	var dirJSON = $.ajax({ type: "GET", url: jsonURL, cache: false, async: false, fail: function() {throw "getDir fail";}, error: function() {throw "getDir error";}}).responseText;
	var dir = $.parseJSON(dirJSON);

	return dir;
}

/*
ProjectSelector.prototype.getProject = function() {
	return this.getDir();
}
*/

/*
ProjectSelector.prototype.getCorpusFromProjectName = function(projectName) {
	if(projectName in this.projectDir) {
		if(Object.keys(this.projectDir[projectName]).length === 0) {
			//var corpusJSON = $.ajax({ type: "GET", url: _setting.root_url + "/" + _setting.app_name + "/getDir/" + projectName + "/", cache: false, async: false}).responseText;
			//var corpusList = $.parseJSON(corpusJSON);
			var corpusList = this.getDir(projectName);
			var _self = this;
			$.each(corpusList, function(index, element) {
				_self.projectDir[projectName][element] = null;
				
			});
		}
	}

	return this.projectDir[projectName];
}
*/

/*
ProjectSelector.prototype.getTaskFromProjectCorpusName = function(projectName, corpusName) {
	var taskJSON = "";
	
*/
	/*
	if(this.adjudication) {
		var adjSrcSchemaModeList = Object.keys(_setting.schemaMap[this.schema]).sort();
		var adjIdx = adjSrcSchemaModeList.indexOf("Adjudication");
		var adjSrcSchemaMode = adjSrcSchemaModeList[(adjIdx+1) % adjSrcSchemaModeList.length];
		taskJSON = $.ajax({ type: "GET", url: _setting.root_url + "/" + _setting.app_name + "/getDir/" + projectName + "/" + corpusName + "/" + this.schema + "." + adjSrcSchemaMode + "/" + this.schema + (this.mode==undefined ? "" : "."+this.mode) + "/" , cache: false, async: false}).responseText;
	}
	else
		taskJSON = $.ajax({ type: "GET", url: _setting.root_url + "/" + _setting.app_name + "/getDir/" + projectName + "/" + corpusName + "/" + this.schema + (this.mode==undefined ? "" : "."+this.mode) + "/" , cache: false, async: false}).responseText;
	var taskList = $.parseJSON(taskJSON);
	*/
/*
	taskList = this.getDir(projectName, corpusName, this.schema, this.isAdjudication);

	return taskList;
}
*/

ProjectSelector.prototype.selectProject = function() {
	this.updateSelectMenu("Select Project" ,Object.keys(this.projectDir), ProjectSelector.clickProject);
	//this.schemaSelect();
	this.fixPosition();
	// this.popup();
}

ProjectSelector.prototype.selectCorpus = function() {
	var _self = this;
	if(Object.keys(this.projectDir[this.selected.project]).length === 0) {
		var corpusList = this.getDir(this.selected.project);
		$.each(corpusList, function(idx, cName) {
			_self.projectDir[_self.selected.project][cName] = null;
		});
	} 

	this.updateSelectMenu("Select Corpus", Object.keys(this.projectDir[this.selected.project]), ProjectSelector.clickCorpus);
	// this.popup();
	this.fixPosition();
}

ProjectSelector.prototype.selectTask = function() {
	if(this.schema == undefined) {
		throw "Select Schema First";
	}
	else if ( this.mode !== false && this.mode === undefined ) {
		throw "Select Mode First";
	}
	else {
		var taskList =this.getDir(this.selected.project, this.selected.corpus, this.schema + ((this.mode === false || this.mode === undefined)?"":"."+this.mode) , this.adjudication);
		this.updateSelectMenu("Select Task", taskList, ProjectSelector.clickTask);
		// this.popup();
	}

	this.fixPosition();
}

ProjectSelector.prototype.selectComplete = function() {
	var _self = this;
	this.openBtn.bind('click', function() { _self.openNewProject(); } );
	this.openBtn.removeClass().addClass("btnEnable");
	
}
ProjectSelector.prototype.cancelBtnClick = function() {
	if(_setting.projectName != "" && _setting.corpusName != "" && _setting.taskName != "") {

		this.windowElement.hide();
		this.mask.hide();
	}
	else {
		;
	}
}
ProjectSelector.prototype.openNewProject = function() {
	if(this.selected.project == "" || this.selected.corpus == "" || this.selected.task == "" || this.schema == undefined)
		throw "openNewProject error: required selected project, corpus, task or schema";

	window.location = this.baseURL + this.selected.project + "/" + this.selected.corpus + "/" + this.selected.task + "/" + this.schema + (this.mode === false || this.mode===undefined ?  "" : "."+this.mode) + (this.adjudication ? ".Adjudication" : "" ) +  "/";
}

ProjectSelector.clickProject = function(_self, target ) {
	_self.selected.project = target.innerHTML;
	_self.selectCorpus();
	_self.popup();
}

ProjectSelector.clickCorpus = function(_self, target ) {
	var idx = _self.divElement.children("ul").children("li").index(target);
	_self.selected.corpus = target.innerHTML;
	try{
		_self.selectTask();
		_self.popup();
	}
	catch(err) {
		_self.selected.corpus = "";
		throw err;
	}
}

ProjectSelector.clickTask = function(_self, target ) {
	_self.divElement.find("li").removeClass();
	_self.selected.task = target.innerHTML;
	$(target).addClass("selected");	
	_self.selectComplete();
	_self.popup();
}

ProjectSelector.prototype.updateSelectMenu = function(title, itemList, callback) {
	this.divElement.children("h4").text(title);
	var rStr = "";
	var _self = this;

	if(itemList instanceof Array) {
		// update project and corpus
		$.each(itemList, function() {
			rStr += "<li>" + this + "</li>";
		});
		this.divElement.children("div:first").children("ul").html(rStr);
		this.divElement.children("div:first").find("li").bind('click', function(evt) {
		try{callback(_self, evt.target);}catch(err){alert(err);throw err;}});
	
		this.divElement.children("div").eq(1).hide();
		this.divElement.children("div").eq(2).hide();
	}
	else {
		// update new and completeddtask
		//// new task
		this.divElement.children("div").eq(0).children("h5").text("New Tasks");
		$.each(itemList.n, function() {
			rStr += "<li>" + this + "</li>";
		});

		this.divElement.children("div").eq(0).children("ul").html(rStr);

		//// In-progress task
		rStr = "";
		this.divElement.children("div").eq(1).children("h5").text("In-progress Tasks");
		$.each(itemList.i, function() {
			rStr += "<li>" + this + "</li>";
		});
		this.divElement.children("div").eq(1).children("ul").html(rStr);
		this.divElement.children("div").eq(1).show();

		//// complete task
		rStr = "";
		this.divElement.children("div").eq(2).children("h5").text("Completed Tasks");
		$.each(itemList.c, function() {
			rStr += "<li>" + this + "</li>";
		});

		this.divElement.children("div").eq(2).children("ul").html(rStr);
		this.divElement.children("div").eq(2).show();

		this.divElement.children("div").find("li").bind('click', function(evt) {
		callback(_self, evt.target);});
		this.divElement.children("div").children("h5").show();
	}
}

ProjectSelector.clickSchemaSelect = function(_self, target) {
	_self.schema = target.innerHTML;
	_self.schemaSelect();

	if(_self.schemaMap[_self.schema] == 0)
		_self.mode = false;
	else {
		_self.mode = undefined;
		_self.modeSelect();
	}
	
}

ProjectSelector.clickSchemaReselect = function(_self) {
	_self.schema = undefined;
	_self.schemaSelect();

	_self.mode = undefined;
	_self.modeElement.hide();
}

ProjectSelector.clickModeSelect = function(_self, target) {
	_self.mode = target.innerHTML;
	_self.modeSelect();
}

ProjectSelector.clickModeReselect = function(_self, target) {
	_self.mode = undefined;
	_self.modeSelect();
}

ProjectSelector.clickAdjudicationSelect = function(_self, target) {
	_self.adjudication = !_self.adjudication;
	_self.adjudicationSelect();
}
/*
ProjectSelector.clickAdjudicationReelect = function(_self, target) {
	_self.adjudication = false;
	_self.adjudicationSelect();
}
*/
ProjectSelector.prototype.modeSelect = function() {
	var _self = this;
	if(this.schema != undefined && this.mode !== false) {
		if(this.mode == undefined) {
			var modeStr = "";
			for(var idx in this.schemaMap[this.schema]) {
				if((typeof this.schemaMap[this.schema][idx]) == "string") {
					modeStr += "<li>" + this.schemaMap[this.schema][idx] + "</li>";
				}
			}
			this.modeElement.children("ul").html(modeStr);

			this.modeElement.find("li").bind("click", function(evt) { ProjectSelector.clickModeSelect(_self, evt.target); });
		}
		else {
			this.modeElement.children("ul").html('<li class="selected">' + this.mode + "</li>");
			this.modeElement.find("li").bind("click", function(evt) { ProjectSelector.clickModeReselect(_self); });
		}
		this.modeElement.show();
		this.popup();
	}
	else
		this.modeElement.hide();

	this.fixPosition();
}

ProjectSelector.prototype.schemaSelect = function() {
	var _self = this;
	if(this.schema == undefined) {
		var schemaStr = "";
		for(var schemaName in this.schemaMap) {
			schemaStr += "<li>" + schemaName + "</li>";
		}
		this.schemaElement.children("ul").html(schemaStr);
		this.schemaElement.find("li").bind("click", function(evt) {ProjectSelector.clickSchemaSelect(_self, evt.target);});
		this.modeElement.hide();
	}
	else {
		this.schemaElement.children("ul").html('<li class="selected">' + this.schema + "</li>");
		this.schemaElement.find("li").bind("click", function(evt) {ProjectSelector.clickSchemaReselect(_self);});

	}
	this.fixPosition();
}

ProjectSelector.prototype.adjudicationSelect = function() {
	var _self = this;
	if(this.adjudication) {
		this.adjudicationElement.find("ul>li").addClass("selected");
	}
	else {
		this.adjudicationElement.find("ul>li").removeClass("selected");

	}
}

ProjectSelector.prototype.fixPosition = function() {
	var popMargTop = (this.windowElement.height()) / 2;
	var popMargLeft = (this.windowElement.width()) / 2;
	this.windowElement.css({ 
			'margin-top' : -popMargTop,
			'margin-left' : -popMargLeft
	});
}

ProjectSelector.prototype.popup = function() {
	this.windowElement.fadeIn(300);
	this.mask.fadeIn(300);
}
