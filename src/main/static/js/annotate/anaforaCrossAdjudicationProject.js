function AnaforaCrossAdjudicationProject(schema, annotatorName, task) {
	AnaforaProject.call(this, schema, annotatorName, task);
	this.projectList = undefined;
	this.subTaskNameList = undefined;
	this.subTaskCharLength = undefined;
}

AnaforaCrossAdjudicationProject.prototype = new AnaforaCrossProject();
AnaforaCrossAdjudicationProject.prototype.constructor = AnaforaCrossAdjudicationProject;

/*
AnaforaCrossAdjudicationProject.prototype.addAnaforaProjectList = function(projectList) {
	for (var subTaskName in projectList) {
	  if(!(projectList[subTaskName] instanceof AnaforaAdjudicationProject))
		throw "The input project is not a adjudication project";
	}
	AnaforaCrossProject.prototype.addAnaforaProjectList(projectList);
}
*/

/*
AnaforaCrossAdjudicationProject.prototype.readFromXMLDOM = function(xml, subTaskNameList, annotateFrameDivList) {
	var xmlDOM = $(xml);
	var infojjOM = xmlDOM.find("info");
	this.completed = (infoDOM.find("progress").text() == "completed");
	var schemaDOM = xmlDOM.find("schema");
	var annotationDOM = xmlDOM.find("annotations");
	var _self = this;
	this.projectList = {};
	$.each(subTaskNameList, function(sTaskIdx, subTaskName) {
		_self.projectList[subTaskName] = new AnaforaAdjudicationProject(_self.schema, subTaskName);
		_self.projectList[subTaskName].setParentProject(_self);
	});

	$(annotationDOM).children().each( function() {
		try {
		var id = this.getElementsByTagName("id")[0].childNodes[0].nodeValue;
		var aObj = undefined;
		if(this.tagName == "entity") {
			aObj = Entity.genFromDOM(this, _self.schema);
		}
		else if(this.tagName == "relation") {
			aObj = Relation.genFromDOM(this, _self.schema);
		}
		else {
			throw new ErrorException("XML Wrong format: " + this.tagName );
		}

		_self.addTypeCount(aObj.type);
		var taskName = aObj.getTaskName();
		var targetAProject = undefined;
		if(taskName == _self.task) {
			targetAProject = _self;
		}
		else if(taskName in _self.projectList) {
			targetAProject = _self.projectList[taskName];
		}
		else {
			throw new ErrorException("Task name ''" + taskName + "'' not exist");
		}
		var sIdx = parseInt(aObj.id.split("@")[0]);
		if(aObj instanceof Entity) {
			targetAProject.entityList[sIdx] = aObj;
		}
		else {
			targetAProject.relationList[sIdx] = aObj;
		}
		}
		catch(err) {
			console.log(err);
			throw new ErrorException(err + "\nwith XMLDOM: \n" + this.innerHTML); }
	});


	$.each($.map(this.projectList, function(value, key) {return value;}).concat([_self]), function(aIdx, aProject) {

		aProject.maxEntityIdx = Object.keys(aProject.entityList).max();
		aProject.maxRelationIdx = Object.keys(aProject.relationList).max();

		if(aProject.maxEntityIdx == -Infinity)
			aProject.maxEntityIdx = 0;

		if(aProject.maxRelationIdx == -Infinity)
			aProject.maxRelationIdx = 0;

		if(aProject != _self) {
			aProject.setAnnotateFrame(new AnnotateFrame($(annotateFrameDivList[aProject.task]), _setting, $(annotateFrameDivList[aProject.task]).text()));
			// update link
			$.each(aProject.entityList, function(eIdx, entity) {
				aProject.updateLinking(entity.type, entity);
				aProject.annotateFrame.updatePosIndex(entity);
			});
	
			$.each(aProject.relationList, function(rIdx, relation) {
				aProject.updateLinking(relation.type, relation);
				if(aProject == _self) {
					_self.projectList[subTaskNameList[0]].annotateFrame.updatePosIndex(relation);
				}
				else
					aProject.annotateFrame.updatePosIndex(relation);
			});
		}
	});

	$.each(this.projectList, function(aIdx, aProject) {
		aProject.annotateFrame.generateAllAnnotateOverlapList();
	});
}
*/
