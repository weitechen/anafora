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
		$.ajax({type: "GET", url:"/markFalsePositive/getHeadword/"+taskName, success:loadHeadwordComplete, async: false});
	}

	$('body').on('click.eventClick', '.event', eventClick);
	$('body').on('click.eventWrongClick', '.eventWrong', eventWrongClick);
	$('#downloadXML').bind('click', downloadBtnClick);

	// load context menu
	$('#markRawText').children('span').contextMenu({
        menu: "myMenu"},
    	undefined,
        function(action, el, pos) {
		if($(el).hasClass("eventWrong"))
			$(el).attr("er", parseInt(action));
            }
    );
	$('#markRawText').children('span').hover(
		function(e) {
			if($(this).hasClass('eventWrong')) {
				$("#tip").show().css("top", e.pageY+2).css("left", e.pageX+5);
				if($(this).attr("er") != undefined)
					$("#tip").text($("#myMenu").find("a").get($(this).attr("er")).innerHTML);
				else
					$("#tip").text(" ");
			}
		},
		function() {
			$("#tip").hide();
		});
}

function eventClick() {
	$(this).disableContextMenu();
	$(this).removeClass('event').addClass('eventWrong');
}

function eventWrongClick() {
	$(this).enableContextMenu();
	$(this).removeClass('eventWrong').addClass('event');
	$(this).removeAttr("er");
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

	$('#markRawText').find( "span" ).each( function() {
		var id = $(this).attr("id");
		var entity = entityDict[id];
		xmlStr += '\n'+
'<entity>\n' +
'  <id>' + id + '</id>\n' +
'  <type>' + entity.type + '</type>\n' +
'  <span>' + entity.span[0] + ',' + entity.span[1] + '</span>\n' +
'  <correct>' + $(this).hasClass('event') + '</correct>\n';

		if (!$(this).hasClass('event')) {
			if($(this).attr("er")) {
				xmlStr += '  <errortype>' + $("#myMenu").find("a").get($(this).attr("er")).innerHTML + '</errortype>\n';
			}
			else {
				xmlStr += '  <errortype />\n';
			}
		}
		xmlStr += '</entity>\n';
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
	var rawNode = $('#markRawText');
	//var rawText = $(rawNode).html();
	var rawText = $(rawNode).text();
	console.log(rawText);
	for(var idx=entityList.length-1;idx>=0;idx--) {
		entity = entityList[idx];
		var spanStart = parseInt(entity.span[0]);
		var spanEnd = parseInt(entity.span[1]);

		rawText = rawText.substring(0, spanStart) + '<span class="event" id="' + entity.id +'">' + rawText.substring(spanStart, spanEnd) + '</span>' + rawText.substring(spanEnd);
	}

	$(rawNode).html(rawText);
}

function parseEntityFromDOM(entityDOMStr) {
	var id = $(entityDOMStr).find("id").text();
	var type = $(entityDOMStr).find("type").text();
	var span = $(entityDOMStr).find("span").text().split(',');

	return new Entity(id, type, span, "");
}
