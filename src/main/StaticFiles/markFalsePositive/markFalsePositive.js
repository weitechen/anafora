var entityList = [];
var entityDict = {};
function IAnaforaObj(id, type) {
	this.id = id;
	this.type = type;
}

function Entity(id, type, span, comment) {
	IAnaforaObj.call(this, id, type);
	this.span = span;
	this.comment = comment;
}

Entity.prototype = new IAnaforaObj();
Entity.prototype.constructor = Entity;

function onLoad() {
	var taskName = $('#taskname').html();
	if(taskName) {
		//load Anafora Obj
		$.ajaxSetup ({ cache: true});
		$.get("/markFalsePositive/getHeadword/"+taskName, null, loadHeadwordComplete);
	}

	$('body').on('click.eventClick', '.event', eventClick);
	$('body').on('click.eventWrongClick', '.eventWrong', eventWrongClick);
	$('#downloadXML').bind('click', downloadBtnClick);
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

function exportXMLStr() {
	var xmlStr = '<?xml version="1.0" encoding="UTF-8"?>\n' +
'<data>\n' +
'<info>\n' +
'  <savetime></savetime>\n' +
'  <annotator fullname="headword automatic generated">headword</annotator>\n' +
'</info>\n\n<annotations>\n';

	$('#rawText').find( "span" ).each( function() {
		var id = $(this).attr("id");
		var entity = entityDict[id];
		xmlStr += '\n'+
'<entity>\n' +
'  <id>' + id + '</id>\n' +
'  <type>' + entity.type + '</type>\n' +
'  <span>' + entity.span[0] + ',' + entity.span[1] + '</span>\n' +
'  <correct>' + $(this).hasClass('event') + '</correct>\n' +
'</entity>\n';
	});

	xmlStr += '\n' + 
'</annotations>\n' +
'</data>';

	return xmlStr;
}

function loadHeadwordComplete(data) {
	// load entity
	var xml = $.parseXML( data );
	var aDoc = $(xml);
	var entity = null;
	$(aDoc).find( "entity" ).each( function() {
		entity = parseEntityFromDOM($(this));
		entityList.push(entity);
		entityDict[entity.id] = entity
	});

	// fill-in raw data
	var rawNode = $('#rawText');
	var rawText = $(rawNode).text();
	var shift = 0;
	for(idx in entityList) {
		entity = entityList[idx];
		var spanStart = parseInt(entity.span[0]);
		var spanEnd = parseInt(entity.span[1]);

		rawText = rawText.substring(0, spanStart+shift) + '<span class="event" id="' + entity.id +'">' + rawText.substring(spanStart+shift, spanEnd+shift) + '</span>' + rawText.substring(spanEnd+shift);
		shift += (33 + entity.id.length);
	}

	$(rawNode).html(rawText);
}

function parseEntityFromDOM(entityDOMStr) {
	var id = $(entityDOMStr).find("id").text();
	var type = $(entityDOMStr).find("type").text();
	var span = $(entityDOMStr).find("span").text().split(',');

	return new Entity(id, type, span, "");
}
