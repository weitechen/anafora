var entityList = [];
var entityDict = {};
var errorTypeCnt = {};
function IAnaforaObj(id, type) {
	this.id = id;
	this.type = type;
}

function Entity(id, type, span, comment, correct, errorType) {
	IAnaforaObj.call(this, id, type);
	this.span = span;
	this.comment = comment;
	this.correctness = correct;
	this.errorType = errorType;
}

Entity.prototype = new IAnaforaObj();
Entity.prototype.constructor = Entity;

function onLoad() {
	var taskName = $('#taskname').html();
	if(taskName) {
		//load Anafora Annotation Obj
		$.ajaxSetup ({ cache: true});
		$.ajax({ dataType:"xml", url: _setting.root_url + "/showFalsePositive/getPreAnnotation/"+taskName, cache: true, success: loadPreAnnotationComplete});
	}

	/*
	$('body').on('click.eventClick', '.event', eventClick);
	$('body').on('click.eventWrongClick', '.eventWrong', eventWrongClick);
	$('#downloadXML').bind('click', downloadBtnClick);
	*/
}

function eventClick() {
	$(this).removeClass('event').addClass('eventWrong');
}

function eventWrongClick() {
	$(this).removeClass('eventWrong').addClass('event');
}

function downloadBtnClick() {
	xmlStr = exportXMLStr()	
	document.location.href=('data:application/octet-stream,' + encodeURI(xmlStr));
}

function loadPreAnnotationComplete(data) {
	// load entity
	var xmlData = $(data);
	var entity = null;
	var correctCnt = 0;
	$(xmlData.find( "entity" ).get().reverse()).each( function() {
		entity = parseEntityFromDOM($(this));
		entityList.push(entity);
		entityDict[entity.id] = entity;

		if(entity.correctness)
			correctCnt++;
		else {
			var eTypeName = entity.errorType;
			if(eTypeName == "")
				eTypeName = "UNMARK";
			if(!( entity.errorType in errorTypeCnt ))
				errorTypeCnt[eTypeName] = 0;

			errorTypeCnt[eTypeName]++;
		}
	});

	// fill-in raw data
	var rawNode = $('#markRawText');
	var rawText = $(rawNode).text();
	for(idx in entityList) {
		entity = entityList[idx];
		var spanStart = parseInt(entity.span[0]);
		var spanEnd = parseInt(entity.span[1]);
		var eventClass = entity.correctness ? "event" : "eventWrong";
		var titleStr = entity.correctness ? "" : ' title="' + (entity.errorType == "" ? "UNMARK" : entity.errorType) + '"';

		rawText = rawText.substring(0, spanStart) + '<span class="' + eventClass + '"' + titleStr + '>' + rawText.substring(spanStart, spanEnd) + '</span>' + rawText.substring(spanEnd);
	}

	console.log(rawText);
	rawNode.html(rawText);

	// fill-in precision
	$("#precision").children("span").html(correctCnt.toString() + " / " + entityList.length.toString() + " = " + (correctCnt/entityList.length).toFixed(4).toString());

	// file-in error type
	var totalErrorCnt = entityList.length - correctCnt;
	var errorTypeStr = ""
	$.each(errorTypeCnt, function(key, element) {
		errorTypeStr += "<li><b>" + key + "</b>: " + element.toString() + " / " + totalErrorCnt.toString() + " = " + (element/totalErrorCnt).toFixed(4).toString() + "</li>";
	});

	$("#errorType").children("ul").html( errorTypeStr );
}

function parseEntityFromDOM(entityDOMStr) {
	var id = $(entityDOMStr).find("id").text();
	var type = $(entityDOMStr).find("type").text();
	var span = $(entityDOMStr).find("span").text().split(',');
	var correctness = $(entityDOMStr).find("correct").text() === "true";
	var errorType = undefined;
	if(!correctness)
		errorType = $(entityDOMStr).find("errortype").text();

	return new Entity(id, type, span,"", correctness, errorType);
}
