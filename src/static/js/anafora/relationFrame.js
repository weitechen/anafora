function RelationFrame(relationFrame) {
	this.rootDiv = relationFrame;
	this.tbody = relationFrame.find("tbody");

	this.selectedRelationRow = undefined;

	this.isShown = false;
	this.relationMap = {};
}

RelationFrame.prototype.unHighlight = function() {
	if(this.selectedRelationRow != undefined) {

		//$(this.tbody.children("tr").eq(this.selectedRelationIdx)[0]).removeClass("selectedRelation");
		this.selectedRelationRow.removeClass("selectedRelation");
		this.selectedRelationRow = undefined;
	}
}

RelationFrame.prototype.displayRelations = function(relationList) {
	var _self = this;
	var tableCnt = 1;
	relationList.sort(Relation.sort);
	$.each(relationList, function(idx, relationElement) {
			
		var rowElement = _self.generateRelationRow(relationElement);
		_self.tbody.append(rowElement);
		_self.relationMap[relationElement.id] = rowElement;

	});
}

RelationFrame.prototype.updateCurrentRelationValue = function() {
	var _self = this;
	var trList = this.tbody.children("tr");

	if(this.selectedRelationRow != undefined) {
		var rowIdx = trList.index(this.selectedRelationRow);
		var updatedRelation = jQuery.data($(this.selectedRelationRow)[0], "relData").rel
		var newRow = _self.generateRelationRow(updatedRelation);
		newRow.addClass("selectedRelation");
		
		this.tbody.children("tr").eq(rowIdx).replaceWith(newRow);
		this.relationMap[updatedRelation.id] = newRow;

		this.selectedRelationRow = newRow;

		while(rowIdx > 1 &&  Relation.sort(jQuery.data($(trList.eq(rowIdx-1))[0], "relData").rel, updatedRelation ) >0) {
			rowIdx--;
			(trList.eq(rowIdx)).insertAfter(newRow);
		}

		while(rowIdx < trList.length-1 && Relation.sort(jQuery.data($(trList.eq(rowIdx+1))[0], "relData").rel, updatedRelation ) <0) {
			rowIdx++;
			(trList.eq(rowIdx)).insertBefore(newRow);
		}
	}
}

RelationFrame.prototype.searchRowFromRelation = function(relation) {
	var trList = this.tbody.children("tr");
	var rRow = undefined;
	trList.each(function(idx, trRow) {
		if(idx > 0) {
			var relData;
			if((relData = jQuery.data($(trRow)[0], "relData")) != undefined) { 
				if(relData.rel === relation) {
					rRow = $(trRow);
					return ;
				}
			}
		}
	});
	return rRow;
}

RelationFrame.prototype.relationClick = function(clickedRow) {
	//var trList = this.tbody.find("tr");

	// un highlight current row
	this.unHighlight();
	this.selectedRelationRow = clickedRow;
	//var trElement = trList.eq(idx);
	clickedRow.addClass("selectedRelation");
	//trElement.addClass("selectedRelation");

		
	//this.rootDiv.scrollTop(clickedRow.offset().top);
	if( clickedRow.position().top < 0 || clickedRow.position().top < this.rootDiv.scrollTop() || clickedRow.position().top > (this.rootDiv.scrollTop() + this.rootDiv.height()))
		clickedRow.get(0).scrollIntoView();
	//	this.rootDiv.scrollTop(this.rootDiv.scrollTop() + clickedRow.position().top);
}

RelationFrame.prototype.generateRelationRow = function(relation) {
	var row = undefined;
	var _self = this;

	if(relation instanceof Relation) {
		row = $('<tr><td>' +  relation.genElementHead() + '</td><td>' + relation.genElementProperty() + '</td></tr>');
		jQuery.data(row[0], "relData", {rel:relation});

		if(_setting.isAdjudication) {
			if((relation instanceof AdjudicationRelation && relation.decideIdx !== undefined) || (!(relation instanceof AdjudicationRelation) && relation.getAdditionalData("adjudication")=="gold" ))
				row.addClass("adjDone");
			else
				row.addClass("adjConflict");
		}


		row.bind("click", function(evt){propertyFrameList[0].isAssignRelation=false; restore();  _self.relationClick($(this) ); selectAObj(jQuery.data($(evt.currentTarget)[0], "relData").rel);if(_setting.isLogging){eventLogging.addNewEvent(new EventLog(EventType.REL_ROW_CLICK, jQuery.data($(evt.currentTarget)[0], "relData").rel.id));}});
		
	}
	return row;
}

RelationFrame.prototype.removeRelationRow = function() {
	//var _self = this;
	//var trList = this.tbody.children("tr");
	
	//jQuery.removeData(trList.eq(idx)[0], "relData");
	var removeRow = this.selectedRelationRow;
	if(removeRow != undefined) {
		jQuery.removeData($(removeRow)[0], "relData");
		removeRow.hide();
	}
	//$(trList.eq(idx)[0]).hide();
}

RelationFrame.prototype.updateRelationFrameDisplay = function() {
	var checkedType = currentAProject.schema.checkedType;
	var trList = this.tbody.children("tr");
	$.each(trList, function(idx, row) {
		if(idx >0) {
			if(jQuery.data(row, "relData") != undefined && checkedType.indexOf(jQuery.data(row, "relData").rel.type) >=0)
				$(row).show();
			else
				$(row).hide();
		}
	});
}

RelationFrame.prototype.insertRelationRow = function(relation) {
	var _self = this;
	var row = this.generateRelationRow(relation);
	//row.bind("click", function(evt){ _self.relationClick($(this)[0]); selectAObj(jQuery.data($(this)[0], "relData").rel);});
	this.selectedRelationRow = row;

	var trList = this.tbody.children("tr");
	var idx;
	for(idx=1; idx<trList.length; idx++) {
		if(jQuery.data(trList.eq(idx)[0], "relData") != undefined) {
			var tRelation = jQuery.data(trList.eq(idx)[0], "relData").rel;
			if(Relation.sort(relation, tRelation) <= 0)
				break;
		}
	}

	if(idx < trList.length)
		row.insertBefore(trList.eq(idx));
	else
		this.tbody.append(row);
	/*
	if(trList.length > idx)
		this.tbody.children("tr").eq(this.selectedRelationIdx).replaceWith(row);
	else {
		while(this.tbody.children("tr").length < idx) {
			var tRow = $("<tr></tr>");
			tRow.hide();
			this.tbody.append(tRow);
		}

		this.tbody.append(row);
	}
	*/
}

RelationFrame.prototype.show = function() {
	this.isShown = true;
	this.rootDiv.css("display", "block");
}

RelationFrame.prototype.hide = function() {
	this.isShown = false;
	this.rootDiv.css("display", "none");
}

RelationFrame.prototype.getHeight = function() {
	return this.rootDiv.outerHeight();
}
