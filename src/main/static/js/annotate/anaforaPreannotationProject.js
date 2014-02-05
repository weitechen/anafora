function AnaforaPreannotationProject(schema, annotator, task) {
	AnaforaProject.call(this, schema, annotator, task);
}

AnaforaPreannotationProject.prototype = new AnaforaProject();
AnaforaPreannotationProject.prototype.constructor = AnaforaPreannotationProject;

AnaforaPreannotationProject.prototype.readFromXMLDOM = function(xmlDOM) {
	AnaforaProject.prototype.readFromXMLDOM.call(this, xmlDOM);
	var _self = this;

	/*
	$.each(this.entityList, function(idx) {
		_self.entityList[idx].id = _self.entityList[idx].id.replace("@preannotation", "@" + _self.annotator);	
	});

	$.each(this.relationList, function(idx) {
		_self.relationList[idx].id = _self.entityList[idx].id.replace("@preannotation", "@" + _self.annotator);	
	});
	*/
}
/*
AnaforaPreannotationProject.prototype.moveOutPreannotation = function(aObj) {
	console.log("move out from preannotation");
	if(aObj == undefined)
		aObj = this.selectedAObj;
	var term = aObj.id.split("@");
	if(term[3] == "preannotation") {
		var oldIdx = parseInt( term[0] );
		var newID;
		if(aObj instanceof Entity)
			newID = this.getNewEntityId();
		else
			newID = this.getNewRelationId();

		var newIdx = parseInt( newID.split("@")[0] );
		aObj.id = newID;
		
		if(aObj instanceof Entity) {
			delete this.entityList[oldIdx];
			this.entityList[newIdx] = aObj;
		}
		else {
			delete this.relationList[idx];
			this.relationList[newIdx] = aObj;

		}
	}
}
*/
