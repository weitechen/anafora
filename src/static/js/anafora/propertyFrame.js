function PropertyFrame(propertyFrame, setting,  comparedIdx ) {
	this.rootDiv = propertyFrame;
	this.typeColorBlock = this.rootDiv.find(".typeColorBlock");
	this.typeName = this.rootDiv.find(".typeName");
	this.objID = this.rootDiv.find(".objID");
	this.spanText = this.rootDiv.find(".spanText");
	this.deleteBtn = this.rootDiv.find(".objDeleteBtn");
	this.markGoldBtn = this.rootDiv.find(".goldBtn");
	this.cancelGoldBtn = this.rootDiv.find(".cancelGoldBtn");
	this.cancelNotGoldBtn = this.rootDiv.find(".cancelNotGoldBtn");
	this.spanTable = this.rootDiv.find(".spanTable");
	this.propertyTable = this.rootDiv.find('.propertyTable');

	this.btnBlock = this.rootDiv.children("div").eq(0);
	this.idBlock = this.rootDiv.children("div").eq(1);
	this.spanTextBlock = this.rootDiv.children("div").eq(2);
	this.propertyBlock = this.rootDiv.children("div").eq(3);

	this.comparedIdx = comparedIdx;
	this.isAssignRelation = false;
	this.currentSelectedPropertyIdx = undefined;

	this.setting = setting;
	this.editable = (this.setting.annotator == this.setting.remoteUser);

	this.displayAObj = undefined;
	
	if ( this.editable ) {
		this.deleteBtn.bind("click", {_self: this},  this.deleteBtnClick);
		this.markGoldBtn.bind("click", {_self: this}, this.markGoldBtnClick);
		this.cancelGoldBtn.bind("click", {_self: this}, this.cancelGold);
		this.cancelNotGoldBtn.bind("click", {_self: this}, this.cancelGold);
	}
	else {
		this.deleteBtn.prop('disabled', 'true');
		this.markGoldBtn.prop('disabled', 'true');
		this.cancelGoldBtn.prop('disabled', 'true');
		this.cancelNotGoldBtn.prop('disabled', 'true');
	}
}

PropertyFrame.updateSpanValue = function(e) {
	var _self = e.data._self;
	var _entity = e.data._entity;
	var aObj = _self.displayAObj;
	var target = $(e.target);
	var newValue = parseInt(e.target.value);
	var spanListIdx = _self.spanTable.children("tbody").children("tr").index(target.parent().parent());
	var spanIdx = _self.spanTable.children("tbody").children("tr").eq(spanListIdx).children("td").index(target.parent());
	var oldSpan = aObj.span[spanListIdx];
	var updateSpan;
	var isAdd = true;

	if(spanIdx == 1) {
		if(newValue < oldSpan.start) {
			updateSpan = new SpanType(newValue, oldSpan.start);
		}
		else {
			updateSpan = new SpanType(oldSpan.start, newValue);
			isAdd = false;
		}
		//currentAProject.selectedAObj.span[spanListIdx].start = newValue;
		_self.displayAObj.span[spanListIdx].start = newValue;
	}
	else {
		if(newValue > oldSpan.end) {
			updateSpan = new SpanType(oldSpan.end, newValue);
		}
		else {
			updateSpan = new SpanType(newValue, oldSpan.end);
			isAdd = false;
		}
		_self.displayAObj.span[spanListIdx].end = newValue;
	}
	
	var annotFrame = currentAProject.getAnnotateFrame(_self.displayAObj);
	if(isAdd) {
		annotFrame.addSpan(updateSpan, _self.displayAObj);
		//currentAProject.annotateFrame.addSpan(updateSpan, currentAProject.selectedAObj);
	}
	else {
		annotFrame.removeSpan(updateSpan, _self.displayAObj);
		//currentAProject.annotateFrame.removeSpan(updateSpan, currentAProject.selectedAObj);
	}

	_self.displayBtns(_self.displayAObj);
	_self.displayPropertyText(_self.displayAObj);
	updatePropertyFrameSpan();
	_self.spanTable.children("tbody").children("tr").eq(spanListIdx).children("td").eq(3).text(getTextFromSpan(_entity.span[spanListIdx], _entity.getTaskName()));
	currentAProject.selectAObj(currentAProject.selectedAObj);
	currentAProject.moveOutPreannotation(_self.displayAObj);
	temporalSave();


}

PropertyFrame.prototype.hide = function() {
	this.rootDiv.hide();
}

PropertyFrame.prototype.show = function() {
	this.rootDiv.show();
}

PropertyFrame.prototype.isShow = function() {
	return this.rootDiv.is(":Visible");
}

PropertyFrame.prototype.restore = function() {
	// this.propertyTable.children("tbody").find("td").removeClass("propertyClicked");
	this.isAssignRelation = false;
	if(this.currentSelectedPropertyIdx != undefined) {
		var tdElement = $(this.propertyTable.children("tbody").children("tr").eq(this.currentSelectedPropertyIdx).children("td").eq(1));

		tdElement.removeClass("propertyClicked");
		if(currentAProject.selectedAObj.type.propertyTypeList[this.currentSelectedPropertyIdx].input == InputType.TEXT) {
			tdElement.children("input").trigger("focusout");
		}
	}
	this.currentSelectedPropertyIdx = undefined;

	/*
	if(currentAProject.selectedAObj != null)
		currentAProject.selectAObj(currentAProject.selectedAObj);
	*/
}

PropertyFrame.prototype.removeAObjFromProperty = function(pIdx, pListIdx) {
		var propType = this.displayAObj.type.propertyTypeList[pIdx];
		//var prop = currentAProject.selectedAObj.propertyList[pIdx];
		var prop = this.displayAObj.propertyList[pIdx];
		var removeAObj = prop[pListIdx];
		var annotFrame = currentAProject.getAnnotateFrame(removeAObj);

		prop.splice(pListIdx, 1);
		if(prop.length == 0)
			prop = undefined;

		
		if(removeAObj instanceof Entity) {
			annotFrame.removeEntityPosit(removeAObj, this.displayAObj);
			if(this.displayAObj !== currentAProject.selectedAObj)
				annotFrame.removeEntityPosit(removeAObj, currentAProject.selectedAObj);
		}
		else {
			annotFrame.removeRelationPosit(removeAObj, this.displayAObj);
			if(this.displayAObj !== currentAProject.selectedAObj)
				annotFrame.removeRelationPosit(removeAObj, currentAProject.selectedAObj);
		}
			//currentAProject.annotateFrame.removeRelationPosit(removeAObj, currentAProject.selectedAObj);


		annotFrame.updateOverlap(removeAObj);

		var replaceRow = this.generatePropertyTableRow(propType, pIdx, prop);
				
		this.propertyTable.children("tbody").find("tr").eq(pIdx).replaceWith(replaceRow);

		//currentAProject.selectedAObj.propertyList[this.currentSelectedPropertyIdx] = prop;
		this.displayAObj.propertyList[this.currentSelectedPropertyIdx] = prop;

		if((currentAProject.selectedAObj instanceof AdjudicationEntity || currentAProject.selectedAObj instanceof AdjudicationRelation) && IAdjudicationAnaforaObj.prototype.updateProperty.call(currentAProject.selectedAObj, pIdx))
			updatePropertyFrameProperty(pIdx);
		
		if(currentAProject.selectedAObj instanceof Relation)
		//if(this.displayAObj instanceof Relation)
			relationFrame.updateCurrentRelationValue();

		currentAProject.moveOutPreannotation();
		temporalSave();
}

PropertyFrame.prototype.modifyCurrentProperty = function(value) {
	if(this.currentSelectedPropertyIdx != undefined) {
		
		var propType = this.displayAObj.type.propertyTypeList[this.currentSelectedPropertyIdx];
		//var prop = this.displayAObj.propertyList[this.currentSelectedPropertyIdx];

		if(this.isAssignRelation && value instanceof IAnaforaObj && propType.input == InputType.LIST && propType.instanceOfList.indexOf(value.type) != -1) {

			currentAProject.updateProperty(this.displayAObj, this.currentSelectedPropertyIdx, value);

			var rowElement = this.generatePropertyTableRow(propType, this.currentSelectedPropertyIdx,this.displayAObj.propertyList[this.currentSelectedPropertyIdx]);
			rowElement.children("td").eq(1).addClass("propertyClicked");
			this.propertyTable.children("tbody").children("tr").eq(this.currentSelectedPropertyIdx).replaceWith(rowElement);

			//this.displayAObj.propertyList[this.currentSelectedPropertyIdx] = prop;

			if((currentAProject.selectedAObj instanceof AdjudicationEntity || currentAProject.selectedAObj instanceof AdjudicationRelation) && IAdjudicationAnaforaObj.prototype.updateProperty.call(currentAProject.selectedAObj, this.currentSelectedPropertyIdx))
				updatePropertyFrameProperty(this.currentSelectedPropertyIdx);

			currentAProject.moveOutPreannotation();
			temporalSave();
		}

		if(currentAProject.selectedAObj instanceof Relation)
			relationFrame.updateCurrentRelationValue();
	}
}

PropertyFrame.generateRemoveBtn = function() {
	return '<span class="removeBtn">x</span>';
}
PropertyFrame.prototype.deleteBtnClick = function(evt) {
	if(currentAProject.selectedAObj != null) {
		
		var _self = evt.data._self;
		var removeAObjType = currentAProject.selectedAObj.type;
		var annotFrame = currentAProject.getAnnotateFrame(currentAProject.selectedAObj);

		if(currentAProject.selectedAObj instanceof AdjudicationEntity) {
			currentAProject.removeAObj(currentAProject.selectedAObj.compareAObj[_self.comparedIdx], _self.comparedIdx);
			//currentAProject.removeAObj(currentAProject.selectedAObj);
			//currentAProject.annotateFrame.removeAObj(currentAProject.selectedAObj);
			currentAProject.selectedAObj = currentAProject.selectedAObj.compareAObj[_self.comparedIdx == 0 ? 1 : 0];
		}
		else if(currentAProject.selectedAObj instanceof AdjudicationRelation) {
			currentAProject.removeAObj(currentAProject.selectedAObj.compareAObj[_self.comparedIdx], _self.comparedIdx);
			//currentAProject.removeAObj(currentAProject.selectedAObj);
			//currentAProject.annotateFrame.removeAObj(currentAProject.selectedAObj);


			currentAProject.selectedAObj = currentAProject.selectedAObj.compareAObj[_self.comparedIdx == 0 ? 1 : 0];

			relationFrame.removeRelationRow();
			relationFrame.insertRelationRow(currentAProject.selectedAObj);
			relationFrame.relationClick(relationFrame.searchRowFromRelation(currentAProject.selectedAObj));
		}
		else {
			if(currentAProject.selectedAObj instanceof Relation)
				relationFrame.removeRelationRow();

			currentAProject.removeAObj(currentAProject.selectedAObj);
			if(annotFrame == undefined)
				annotFrame = currentAProject.getAnnotateFrameByTaskName($("#taskName").children("a").text())
			annotFrame.removeAObj(currentAProject.selectedAObj);
			currentAProject.selectedAObj = null;
		}
			
		// update schema tree count
		var tree = $.jstree._reference(schemaDiv);
		tree.refresh(currentAProject.schema.typeDict[removeAObjType.type]);

		temporalSave();
		selectAObj(currentAProject.selectedAObj);
		this.isAssignRelation = false;
	}

	if(_setting.isLogging) {
		eventLogging.addNewEvent(new EventLog(EventType.DELETE_BTN_CLICK, "DELETE - " + _self.comparedIdx.toString()));
	}
}

PropertyFrame.prototype.markGoldBtnClick = function(evt) {
	var _self = evt.data._self;
	if(currentAProject.selectedAObj != null && _self.setting.isAdjudication) {
		var aObj = currentAProject.selectedAObj;
		if(aObj instanceof AdjudicationEntity || aObj instanceof AdjudicationRelation){
			currentAProject.markGold(aObj.compareAObj[_self.comparedIdx]);
			for(var idx=0;idx<propertyFrameList.length;idx++) {
				propertyFrameList[idx].displayBtns(aObj.compareAObj[idx]);
			}
		}
		else {
			currentAProject.markGold(aObj);
			_self.displayBtns(aObj);
		}
		/*
		if(aObj instanceof AdjudicationEntity) {
			aObj.setGold(_self.comparedIdx);
			for(var idx=0;idx<propertyFrameList.length;idx++) {
				propertyFrameList[idx].displayBtns(aObj.compareAObj[idx]);
			}
		}
		else {
			aObj.setAdditionalData("adjudication", "gold");
			_self.displayBtns(aObj);
		}
		currentAProject.completeAdjudication++;
		currentAProject.updateProgressBar();
		*/

		currentAProject.selectAObj(aObj);
		currentAProject.updateProgressBar();
		temporalSave();

		if(relationFrame != undefined && aObj instanceof Relation)
			relationFrame.updateCurrentRelationValue();
	}

	if(_setting.isLogging) {
		eventLogging.addNewEvent(new EventLog(EventType.ADJ_BTN_CLICK, "MARK AS GOLD - " + _self.comparedIdx.toString()));
	}
}

PropertyFrame.prototype.cancelGold = function(evt) {
	var _self = evt.data._self;
	if(currentAProject.selectedAObj != null && _self.setting.isAdjudication) {
		var aObj = currentAProject.selectedAObj;
		if(aObj instanceof AdjudicationEntity || aObj instanceof AdjudicationRelation) {
			currentAProject.cancelGold(aObj.compareAObj[_self.comparedIdx]);
			for(var idx=0;idx<propertyFrameList.length;idx++) {
				propertyFrameList[idx].displayBtns(aObj.compareAObj[idx]);
			}
		}
		else {
			// aObj.setAdditionalData("adjudication", undefined);
			currentAProject.cancelGold(aObj);
			_self.displayBtns(aObj);
		}

		currentAProject.updateProgressBar();
		currentAProject.selectAObj(aObj);
		temporalSave();
		if(relationFrame != undefined && aObj instanceof Relation)
			relationFrame.updateCurrentRelationValue();
	}

	if(_setting.isLogging) {
		eventLogging.addNewEvent(new EventLog(EventType.ADJ_BTN_CLICK, "CANCEL GOLD - " + _self.comparedIdx.toString()));
	}
}

PropertyFrame.prototype.cancelNotGoldBtnClick = function(evt) {
	;
}

PropertyFrame.delSpanBtnClick = function(evt) {
	var entity = evt.data._entity;
	var _self = evt.data._self;

	var spanIdx = _self.spanTable.children("tbody").find('.delSpanBtn').index($(this));
	var posIdx, eIdx;
	var removeSpan;
	var affectedOverlap;
	var overlap;
	var annotFrame = currentAProject.getAnnotateFrame(entity);

	if(entity.span.length == 1)
		alert("Can't delete the only span");
	else {
		removeSpan = entity.span[spanIdx];
		entity.removeSpan(spanIdx);
		annotFrame.removeSpan(removeSpan, entity);

		_self.displayPropertyText(entity);
		_self.displaySpanTable(entity);
		currentAProject.selectAObj(entity);
		currentAProject.moveOutPreannotation(entity);
		temporalSave();
	}
}

PropertyFrame.prototype.updateSpanList = function(spanStartPos, spanEndPos, aObj) {
	var affectedOverlapRange = currentAProject.findOverlapRange(spanStartPos, spanEndPos);
	var annotFrame = currentAProject.getAnnotateFrame(aObj);
	var spanList = annotFrame.frameDiv.children("span");
	if(affectedOverlapRange[1] == null)
		affectedOverlapRange[1] = currentAProject.overlap.length;

	var overlapList = {};
	var removeOverlapCnt = 0;
	var startAffectedRange = -1;

	for(var idx = affectedOverlapRange[1]-1; idx>=affectedOverlapRange[0]; idx--) {
		var overlap = currentAProject.overlap[idx];
		var eIdx = overlap.aObjList.indexOf(aObj);
		overlap.aObjList.splice(eIdx, 1);

		if(overlap.aObjList.length == 0) {
			// remove overlap
			currentAProject.overlap.splice(idx, 1);
			spanList.eq(idx).get(0).outerHTML = spanList.eq(idx).text();
			removeOverlapCnt++;
		}
		else {
			startAffectedRange = idx;
		}

		aObj.removeMarkElement(overlap);
	}

	if(startAffectedRange != -1) {
		for(var idx = startAffectedRange; idx<affectedOverlapRange[1]-removeOverlapCnt;idx++)
			overlapList[idx] = currentAProject.overlap[idx];
		
		annoeFrame.updateOverlapList(overlapList, currentAProject.schema.checkedType);
	}
}

PropertyFrame.addSpanBtnClick = function(evt) {
	var _self = evt.data._self;
	var _entity = evt.data._entity;
	var annotFrame = currentAProject.getAnnotateFrame(_entity);
	var newSpan = annotFrame.getSelectRangeSpan();

	if(newSpan.start != newSpan.end) {
		_entity.addSpan(newSpan);
		annotFrame.addSpan(newSpan, _entity);

		_self.displayPropertyText(_entity);
		_self.displaySpanTable(_entity);
		currentAProject.selectAObj(_entity);

		currentAProject.moveOutPreannotation(_entity);
		temporalSave();
	}
	else {
		alert('Select new span text first');
	}
}

PropertyFrame.prototype.displayBtns = function(entity) {
	this.btnBlock.show();
	this.deleteBtn.show();
	if(this.setting.isAdjudication) {
		this.markGoldBtn.hide();
		this.cancelGoldBtn.hide();
		this.cancelNotGoldBtn.hide();

		var adjudication = entity.getAdditionalData("adjudication");
		if(adjudication === "gold")
			this.cancelGoldBtn.show();
		else if(adjudication === "not gold")
			this.cancelNotGoldBtn.show();
		else
			this.markGoldBtn.show();
	}
}
PropertyFrame.prototype.displayEntity = function(entity) {
	this.displayBtns(entity);
	this.displayPropertyAType(entity);
	this.displayPropertyText(entity);
	this.displaySpanTable(entity);
	this.displayPropertyTable(entity);

	this.displayAObj = entity;
}

PropertyFrame.prototype.displayRelation = function(relation) {
	this.displayBtns(relation);
	this.displayPropertyAType(relation);
	
	this.spanTextBlock.hide();
	this.displayPropertyTable(relation);

	this.displayAObj = relation;
}


PropertyFrame.prototype.displayPropertyAType = function(entity) {
	this.typeColorBlock.css("background-color", "#" + entity.type.color);
	this.typeColorBlock.css("color", '#' + invertColor(entity.type.color));
	this.typeColorBlock.text(entity.isCrossObj() ? 'C' : '');
	this.typeName.text(entity.type.type);
	this.objID.text(entity.id);
}

PropertyFrame.prototype.displayPropertyText = function(entity) {
	this.spanText.show();
	this.spanText.text(getTextFromEntity(entity));
}

PropertyFrame.prototype.hidePropertyText = function() {
	this.spanText.hide();

}

PropertyFrame.prototype.displaySpanTable = function(entity) {
	var spanTableStr = "";
	var editableStr = ( this.editable ? "" : "disabled ");
	var taskName = entity.getTaskName();
	var annotFrame = currentAProject.getAnnotateFrameByTaskName(taskName);

	$.each(entity.span, function(idx) {
		// generate span table
		spanTableStr += '<tr><td class="delBtnCol"><input type="button" value="-" class="delSpanBtn" ' + editableStr + '/></td><td class="spinCol"><input type="number" value="' + this.start.toString() + '" min="0" max="' + (this.end - 1).toString() + '" size="4" ' + editableStr + '/></td><td class="spinCol"><input type="number" value="' + this.end.toString() + '" min="' + (this.start + 1).toString() + '" max="' + annotFrame.rawText.length + '" size="4" ' + editableStr + '/></td><td>' + annotFrame.rawText.substring(this.start, this.end) + "</td></tr>";
	});

	spanTableStr += '<tr><td colspan=4><input type="button" value="+" class="addSpanBtn" class="addSpanBtn" ' + editableStr + '/></tr></table>';
	this.spanTable.children("tbody").children("tr").remove();
	this.spanTable.children("tbody").html(spanTableStr);
	this.highlightDiffSpan(currentAProject.selectedAObj.spanDiff);

	//this.spanTable.children("tbody").find(".spinColumn").bind("click", {_entity:entity, _self: this}, PropertyFrame.adjudicationSpin);

	$(".delSpanBtn").bind("click", {_entity: entity, _self: this}, PropertyFrame.delSpanBtnClick);
	$(".addSpanBtn").bind("click", {_entity: entity, _self: this}, PropertyFrame.addSpanBtnClick);
	this.spanTable.children("tbody").find("input").bind("change", {_self: this, _entity: entity}, PropertyFrame.updateSpanValue);
	this.spanTable.children("tbody").find("input").bind("keydown", {_entity:entity, _self:this}, function(e) { var currentVal = parseInt(e.target.value); var minVal = parseInt( e.target.getAttribute('min')); var maxVal = parseInt( e.target.getAttribute('max')); if (e.keyCode == 38 && currentVal < maxVal ) {e.preventDefault();e.target.value = currentVal+1; $(e.target).trigger('change');} else if(e.keyCode == 40 && currentVal > minVal) {e.preventDefault();e.target.value = currentVal-1; $(e.target).trigger('change');} });
	this.spanTextBlock.show();
}

PropertyFrame.prototype.hideSpanTable = function() {
	this.spanTable.hide();
}

PropertyFrame.prototype.displayPropertyTable = function(entity) {
	// generate property table
	
	var _self = this;
	var propertyTable = this.generatePropertyTable(entity, this.comparedIdx, currentAProject.selectedAObj.diffProp);
	// this.propertyTable.children("tbody").children("tr").remove();
	this.propertyTable.children("tbody").remove();
	this.propertyTable.append(propertyTable);


}

PropertyFrame.prototype.generatePropertyTable = function(aObj, comparedIdx, diffProp) {

	var tTable = $("<tbody></tbody>");
	var tValue;
	var pType, value; 
	var _self = this;

	$.each(aObj.type.propertyTypeList, function(idx) {
		pType = aObj.type.propertyTypeList[idx];
		value = aObj.propertyList[idx];
		var trElement = _self.generatePropertyTableRow(pType, idx, value, (diffProp!=undefined && diffProp.indexOf(idx)>=0), comparedIdx);

		tTable.append(trElement);
	});

	return tTable;
}

PropertyFrame.prototype.generatePropertyTableRow = function(pType, pIdx, pValue, isDiffProp, comparedIdx) {

	var tValue = '<tr';
	var _self = this;
	if(isDiffProp != undefined && isDiffProp)
		tValue += ' class="trDiff"';
	tValue += '><td>' + pType.type + '</td><td data-pIdx="' + pIdx.toString() + '" ';
	if(comparedIdx != undefined)
		tValue += 'data-comparedIdx="' + comparedIdx.toString() + '" ';

	switch(pType.input) {
		case InputType.LIST:
			tValue += 'class="propertyAObj">';
			if(pValue != undefined)
				//tValue += '&nbsp;';
			//else 
			{
				$.each(pValue, function(listIdx, listElement) {
						
					tValue += '<div class="propertySubAObj">' + PropertyFrame.generateRemoveBtn() + listElement.genElementStr() + "</div>";
					//tValue += listElement.genElementStr() + " <br />";
				});
				//tValue = tValue.substr(0, tValue.length - 7);
			}
			tValue += '</td>';
			break;
		case InputType.MULTICHOICE:
			tValue += 'class="propertyNormal propertyValue">';
			if(pValue != undefined)
				//tValue += '&nbsp;'
			//else 
			{
				var tValueList = "";
				$.each(pValue, function(idx) {
					if(idx >0)
						tValueList += '<br>';
					tValueList += this.toString();
				});
				
				tValue += tValueList;
			}
			tValue += '</td>';
			break;
		case InputType.TEXT:
			tValue += 'class="propertyText propertyValue">';
			if(pValue != undefined)
				//tValue += '&nbsp;';
			//else 
				tValue += pValue;
	
			tValue += "</td>";
			break;
		case InputType.CHOICE:
		default:
			tValue += 'class="propertyNormal propertyValue">';
			if(pValue != undefined)
				//tValue += '&nbsp;';
			//else 
				tValue += pValue;
	
			tValue += "</td>";
			break;
	}
	tValue += "</tr>";
	var tRow = $(tValue);

	if(this.editable) {
		// property click
		tRow.find(".propertyValue").bind("click", function(evt) {
			if(_self.isAssignRelation) {
				schemaDiv.jstree("restore");
				schemaCheckedChange();
				_self.isAssignRelation = false;
				$(evt.currentTarget).parent().parent().find(".propertyClicked").removeClass("propertyClicked");
				_self.currentSelectedPropertyIdx = undefined;
			}
			//_self.restore();
			$(evt.currentTarget).addClass("propertyClicked");
			if(_setting.isLogging) {
				eventLogging.addNewEvent(new EventLog(EventType.VAL_CLICK, "PROPERTY CLICK - " + pIdx.toString()));
			}
		});

		// property text click
		tRow.find(".propertyText").bind("click", function(evt) {
			if(_self.isAssignRelation) {
				schemaDiv.jstree("restore");
				schemaCheckedChange();
				_self.isAssignRelation = false;
				$(evt.currentTarget).parent().parent().find(".propertyClicked").removeClass("propertyClicked");
				_self.currentSelectedPropertyIdx = undefined;
			}
			//_self.restore();
			var propertyValueTd = $(evt.currentTarget)
			propertyValueTd.addClass("propertyClicked");

			var currentValue = propertyValueTd.text();
			propertyValueTd.text("");
			var inputElement = $('<input type="text" />');
			if(currentValue != "")
				inputElement.val(currentValue);
			propertyValueTd.append(inputElement);
			inputElement.focus();
			_self.currentSelectedPropertyIdx = pIdx;

			inputElement.bind("focusout", function(evt) {
				var tdElement = $(this).parent();

				var newPropertyRow =_self.generatePropertyTableRow(pType, pIdx, currentAProject.selectedAObj.propertyList[pIdx]); 
				$(this).parent().parent().replaceWith(newPropertyRow);
			});

			inputElement.bind("change", function(evt) {
				var tdElement = $(this).parent();
				var updatedValue = $(this).val();
				currentAProject.selectedAObj.propertyList[pIdx] = updatedValue;
				temporalSave();
			});

			inputElement.bind("keydown", function(evt) {

				evt.stopPropagation();
				if(evt.which == 27) {
					// esc
					restore();
				}
				else if(evt.which == 13) {
					// enter
					inputElement.trigger("change");
					restore();

				}
			});

			if(_setting.isLogging) {
				eventLogging.addNewEvent(new EventLog(EventType.VAL_CLICK, "TEXT - " + pIdx.toString()));
			}
		});

		// property AObj click
		tRow.find(".propertyAObj").bind("click", function(evt) {
			
			var needSchemaTempSave = true;
			if(_self.isAssignRelation) {
				$(evt.currentTarget).parent().parent().find(".propertyClicked").removeClass("propertyClicked");
				needSchemaTempSave = false;
			}

			_self.isAssignRelation = true;
			_self.currentSelectedPropertyIdx = pIdx;

			currentAProject.drawAObj(currentAProject.selectedAObj);

			var checkedTypeList = currentAProject.selectedAObj.type.propertyTypeList[pIdx].instanceOfList;
			schemaDiv.jstree("selectAObjList", checkedTypeList, needSchemaTempSave);
			//_self.restore();
// _self.propertyTable.children("tbody").find(".propertyValue").index(this);

			// change schema
			$(evt.currentTarget).addClass("propertyClicked");

			if(_setting.isLogging) {
				eventLogging.addNewEvent(new EventLog(EventType.LIST_CLICK, pIdx.toString()));
			}
		});

		// remove aObj click
		tRow.find(".removeBtn").bind("click", function(evt) {
			evt.stopPropagation();
			var pListIdx = $(this).parent().index();

			_self.removeAObjFromProperty(pIdx, pListIdx);

			if( !_self.isAssignRelation)
				currentAProject.selectAObj(currentAProject.selectedAObj);
		});
	}


	tRow.find(".propertySubAObj").bind({
		mouseenter: function(evt) {
			var aProjectDiv = aProjectWrapper.children("div");
			previousPosition = aProjectDiv.scrollTop();

			var pListIdx = $(this).index();
			var hoverAObj; 
			if(currentAProject.selectedAObj instanceof AdjudicationEntity || currentAProject.selectedAObj instanceof AdjudicationRelation) {
				hoverAObj = currentAProject.selectedAObj.compareAObj[_self.comparedIdx].propertyList[pIdx][pListIdx];

				var compairList = hoverAObj.getAdditionalData("comparePair");
				if(compairList != undefined && compairList.length >=2 && (compairList[compairList.length-1] instanceof AdjudicationEntity || compairList[compairList.length-1] instanceof AdjudicationRelation)) {
					hoverAObj = compairList[compairList.length-1];
				}
			}
			else
				hoverAObj = currentAProject.selectedAObj.propertyList[pIdx][pListIdx]
			currentAProject.temporaryHighlight(hoverAObj);
		},
		mouseleave: function(evt) {

			if( _self.isAssignRelation ) {
				currentAProject.drawAObj(currentAProject.selectedAObj)
			}
			else {
				currentAProject.selectAObj(currentAProject.selectedAObj);
			}
			if(previousPosition != undefined) {
				var aProjectDiv = aProjectWrapper.children("div");
				aProjectDiv.scrollTop(previousPosition);
				previousPosition = undefined;

			}
		}
	});

	return tRow;
}

PropertyFrame.prototype.highlightDiffProp = function(pTypeIdx, diff) {
	if(diff)
		this.propertyTable.children("tbody").children("tr").eq(pTypeIdx).addClass("trDiff");
	else
		this.propertyTable.children("tbody").children("tr").eq(pTypeIdx).removeClass("trDiff");
		
}

PropertyFrame.prototype.highlightDiffSpan = function(diff) {
	if(diff)
		this.spanTable.addClass("tableDiff");
	else
		this.spanTable.removeClass("tableDiff");
		
}

/*
PropertyFrame.generatePropertyTableSelection = function(evt) {
	$(this).unbind();
	var _self = evt.data._self;
	var _aObj = evt.data._aObj;

	var pIdx = _self.propertyTable.find(".propertyValue").index(this);
	var pType = _aObj.type.propertyTypeList[pIdx];
	var value = _aObj.propertyList[pIdx];

	var tStr = "";

	switch(pType.input) {
		case InputType.CHOICE:
			tStr +='<select>';
			$.each(pType.allowedValueList, function() {
				if((value == undefined) || (value != this) ) {
					tStr += "<option>" + this + "</option>";
				}
				else
					tStr += '<option selected="selected">' + this + "</option>";
			});
			tStr +="</select>";
			break;
		case InputType.MULTICHOICE:
			tStr += "&nbsp;";
			break;
		case InputType.LIST:
			tStr += "&nbsp;";
			break;
		case InputType.STR:
			tStr += "&nbsp;";
			break;
		default:
			tStr += "&nbsp;";
			break;
	}

	this.innerHTML = tStr;
	$(this).bind("click", {_self: _self, _aObj: _aObj, _pIdx: pIdx}, PropertyFrame.propertyTableSelectDone);

	$("select").focus();
}
*/
/*
PropertyFrame.propertyTableSelectDone = function(evt) {
	$(this).unbind();
	var newValue = $(this).find("option:selected").text();
	var _aObj = evt.data._aObj;
	var pIdx = evt.data._pIdx;
	_aObj.propertyList[pIdx] = newValue;
	temporalSave();

	
	this.innerHTML = newValue;
	//$(this).bind("click", {_self:evt.data._self, _aObj:evt.data._aObj}, PropertyFrame.generatePropertyTableSelection );
}
*/
PropertyFrame.propertySelectMenu = $.contextMenu({
		selector: '.propertyNormal',
		appendTo: '#propertyContextMenu',
		trigger: 'left',
		build: function($trigger, e) {
			var returnPropertyItem = { "v": {name:"val", type:"html" }};
			var propertyValueTd = e.target;
			var propertyValueTr = $(propertyValueTd).parent();
			var propertyValueTbody = $(propertyValueTr).parent();
			var propertyIdx = parseInt($(e.target).attr("data-pIdx"));
			
			var currentValue = propertyValueTd.innerHTML;
			var propertyType = currentAProject.selectedAObj.type.propertyTypeList[propertyIdx];
			var _this = this;

			switch(propertyType.input) {

			case InputType.CHOICE:
				$.each(propertyType.allowedValueList, function(idx) {
	
					if(this.toString() != "") {
					returnPropertyItem["radio_" + idx.toString()] = 
						{name:this.toString(),
						type:"radio",
						radio:"pValue",
						value:idx,
						events:{ click: function(e) { $(".context-menu-list").contextMenu("hide"); } } };
	
					if(this==currentValue) 
						returnPropertyItem["radio_" + idx.toString()]["selected"] = true;
					}
				});
				break;
			case InputType.MULTICHOICE:
				currentValue = currentValue.split('<br>');
				$.each(propertyType.allowedValueList, function(idx) {
	
					if(this.toString() != "") {
					returnPropertyItem[idx.toString()] = 
						{name:this.toString(),
						type:"checkbox"
						};
	
					if(currentValue.indexOf(this.toString()) > -1)
						returnPropertyItem[idx.toString()]["selected"] = true;
					}
				});
				break;
			case InputType.LIST:
				break;
			default:
				break;
			}

			return { items: returnPropertyItem}
		},
		events: {
			hide: function(opt) {
				$.contextMenu.getInputValues(opt, this.data());
				var data = this.data();
				var $trigger = data.contextMenu.$trigger;
				var pTypeIdx = parseInt($trigger.attr("data-pIdx"));
				var comparedIdx = parseInt($trigger.attr("data-comparedIdx"));
				var pType = currentAProject.selectedAObj.type.propertyTypeList[pTypeIdx];
				var valueIdx, origValue, newValue="";
				var needUpdate = false;

				switch (pType.input) {
					case InputType.CHOICE:
						valueIdx = data.pValue;
						newValue = pType.allowedValueList[valueIdx];
						origValue = $(this).text();
						
						break;
					case InputType.MULTICHOICE:
						var first = true;
						for(var key in data) {
							if(!isNaN(Number(key))) {
								if (data[key]) {
									if(!first) {
										newValue+= "<br>";
									}
									else
										first = false;

									newValue += pType.allowedValueList[key];
								}
							}
						}
						break;
					default:
						break;
				}
				if(origValue != newValue) {
					$(this).html(newValue);
					var updatedValue;
					if(pType.input == InputType.MULTICHOICE)
						updatedValue = newValue.split("<br>");
					else
						updatedValue = newValue;

					if(currentAProject.selectedAObj instanceof AdjudicationEntity || currentAProject.selectedAObj instanceof AdjudicationRelation) {
						currentAProject.selectedAObj.compareAObj[comparedIdx].propertyList[pTypeIdx] = updatedValue;
						if(IAdjudicationAnaforaObj.prototype.updateProperty.call(currentAProject.selectedAObj, pTypeIdx))
							updatePropertyFrameProperty(pTypeIdx);
					}
					else
						currentAProject.selectedAObj.propertyList[pTypeIdx] = updatedValue;

					if(currentAProject.selectedAObj instanceof Relation)
						relationFrame.updateCurrentRelationValue();
					currentAProject.moveOutPreannotation();
					temporalSave();
				}

				// restore
				$($trigger).removeClass("propertyClicked");
			}
		}
	});
