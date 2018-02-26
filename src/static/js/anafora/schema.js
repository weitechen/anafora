var InputType = { LIST:{v:0, name:"list"},
		CHOICE:{v:1, name:"choice"},
		MULTICHOICE:{v:2, name:"multichoice"},
		TEXT:{v:3, name:"text"} };

function IType(type, color, hotkey, parentType) {
	if(type != undefined) {
		this.type = type;
		this.color = color;
		this.hotkey = hotkey;
		this.parentType = parentType;
		this.propertyTypeList = [];
		this.childTypeList = [];
		this.cssClass = {"background-color": "#" + this.color};
		this.id = "ID_" + this.type.replace("/", "_SLASH_");
		this.attr = { "id": this.id, "class": "jstree-checked" };
		this.children = this.childTypeList;
	}
	//this.attr = {"background-color":"blue"};
}

IType.prototype.addChildType = function(childType) {
	this.childTypeList.push(childType);
}

IType.prototype.addPropertyType = function(newPropertyType) {
	this.propertyTypeList.push(newPropertyType);
}

IType.prototype.getTypeCount = function() {
	if (currentAProject != undefined) {
		return currentAProject.typeCount[this.type];
	}
	else {
		return undefined;
	}
}

IType.prototype.data = function(_self) {
	return _self.type;
}

/*
IType.prototype.id = function(_self) {
	return 'ID_' + _self.type;
}
*/

//=====================================================

function EntityType(type, color, hotkey, parentType) {
	IType.call(this, type, color, hotkey, parentType);
}

EntityType.prototype = new IType();
EntityType.prototype.constructor = EntityType;

function RelationType(type, color, hotkey, parentType) {
	IType.call(this, type, color, hotkey, parentType);
}
RelationType.prototype = new IType();
RelationType.prototype.constructor = EntityType;

function PropertyType(type, input, maxlink, instanceOfList, allowedValueList, required ) {
	this.type = type;
	this.input = input;
	this.maxlink = maxlink;
	this.instanceOfList = instanceOfList;
	this.allowedValueList = allowedValueList;
	this.required = required;
}

PropertyType.genFromDOM = function(propertyDOM, requiredDefault) {
	var type = $(propertyDOM).attr("type");
	var input = $(propertyDOM).attr("input");
	for(inputT in InputType) {
		if(InputType[inputT].name == input) {
			input = InputType[inputT];
			break;
		}
	}
			
	var maxlink = $(propertyDOM).attr("maxlink");
	if (maxlink != undefined) 
		maxlink = parseInt(maxlink);
	var instanceOfList = $(propertyDOM).attr("instanceOf");
	if (instanceOfList != undefined)
		instanceOfList = instanceOfList.split(',');
	var allowedValueList = undefined;
	if ($(propertyDOM).text() != "")
		allowedValueList = $.map($(propertyDOM).text().split(","), function(value) { return value.trim(); } );
	var required = $(propertyDOM).attr("required");
	if (required == undefined)
		required = requiredDefault;
	else
		required = required.toLowerCase() == "true" ? true : false;
	return new PropertyType(type, input, maxlink, instanceOfList, allowedValueList, required );
}

/*
Schema
======  */
function Schema() {
	this.rootEntityTypeList = [];
	this.rootRelationTypeList = [];
	this.typeDict = {};
	this.defaultAttribute = {};
	this.hotkeyDict = {};

	this.linkingType = [];
	this.checkedType = []; // current checked type
	this.prevCheckedType = []; // prev checked type
}

Schema.prototype.getTypeByTypeName = function(typeName) {
	return this.typeDict[typeName];
}


Schema.prototype.parseSchemaXML = function(xmlDOM) {
	// parse default attribute
	var defaultAttributeNode = $(xmlDOM).find( "defaultattribute" );
	this.parseAttribute(defaultAttributeNode);

	// parse annotations
	var definition = $(xmlDOM).find( "definition" );
	var _self = this;
	var tTypeDict = {};

	// // parse entity
	//$(definition).children("entities").each( function() { Schema.parseEntity(this, _self.rootEntityTypeList, _self.typeDict, _self.defaultAttribute["required"], _self.hotkeyDict); });
	$(definition).children("entities").each( function() { Schema.parseEntity(this, _self.rootEntityTypeList, tTypeDict, _self.defaultAttribute["required"], _self.hotkeyDict); });

	// // parse relation
	var rootRelationTypeList = this.rootRelationTypeList;
	//$(definition).children("relations").each( function() { Schema.parseRelation(this, _self.rootRelationTypeList, _self.typeDict, _self.defaultAttribute["required"], _self.hotkeyDict); });
	$(definition).children("relations").each( function() { Schema.parseRelation(this, _self.rootRelationTypeList, tTypeDict, _self.defaultAttribute["required"], _self.hotkeyDict); });

	$.each(tTypeDict, function(typeName, aType) {
		_self.typeDict[typeName] = aType;
	});

	// linking the list type
	$.each(tTypeDict, function(typeName, aType) {
		var hasList = false;
		$.each( aType.propertyTypeList, function(pIdx) {
			if(this.input == InputType.LIST) {
				var property = this;
				$.each(this.instanceOfList, function(idx, linkedTypeName) {
					property.instanceOfList[idx] = _self.getTypeByTypeName(linkedTypeName.trim());
				});

				if(!hasList) {
					hasList = true;
					_self.linkingType.push(aType);
				}
			}
		});
		// add all type into checkedType
		_self.checkedType.push(aType);
	});
}
	
Schema.parseEntity = function(entitiesNode, rootEntityTypeList, typeDict, defaultRequired, hotkeyDict, parentType) {
	//var rootEntityTypeList = this.rootEntityTypeList;

	var typeName = $(entitiesNode).attr("type");
	var color = $(entitiesNode).attr("color");
	var hotkey = $(entitiesNode).attr("hotkey");

	var tEntity = new EntityType(typeName, color, hotkey, parentType);
	typeDict[typeName] = tEntity;
	if(hotkey != undefined)
		hotkeyDict[hotkey] = tEntity;

	if (entitiesNode.nodeName == "entities") {
		$(entitiesNode).children().each( function() { Schema.parseEntity(this, undefined, typeDict, defaultRequired, hotkeyDict, tEntity);});
	}
	else if (entitiesNode.nodeName == "entity") {
		$(entitiesNode).children("properties").children("property").each( function() { tEntity.addPropertyType(PropertyType.genFromDOM(this, defaultRequired)); } );
	}

	if (parentType == undefined && rootEntityTypeList!=undefined)
		rootEntityTypeList.push(tEntity);
	else
		parentType.addChildType(tEntity);
}

Schema.parseRelation = function(relationsNode, rootRelationTypeList, typeDict, defaultRequired, hotkeyDict, parentType) {
	var typeName = $(relationsNode).attr("type");
	var color = $(relationsNode).attr("color");
	var hotkey = $(relationsNode).attr("hotkey");

	var tRelation = new RelationType(typeName, color, hotkey, parentType);
	typeDict[typeName] = tRelation;
	if(hotkey != undefined)
		hotkeyDict[hotkey] = tRelation;

	if (relationsNode.nodeName == "relations") {
		$(relationsNode).children().each( function() { Schema.parseRelation(this, undefined, typeDict, defaultRequired, hotkeyDict, tRelation);});
	}
	else if (relationsNode.nodeName == "relation") {
		$(relationsNode).children("properties").children("property").each( function() { tRelation.addPropertyType(PropertyType.genFromDOM(this, defaultRequired)); } );
	}

	if (parentType == undefined && rootRelationTypeList!=undefined)
		rootRelationTypeList.push(tRelation);
	else
		parentType.addChildType(tRelation);
}

Schema.prototype.parseAttribute = function(defaultAttributeNode) {
	var defaultAttribute = this.defaultAttribute;
	$(defaultAttributeNode).children().each( function() {
		var value = $(this).text();
		if (value.toLowerCase() == "true")
			value = true;
		else if (value.toLowerCase() == "false")
			value = false;
			
		defaultAttribute[this.tagName] = value;
	});
}

Schema.prototype.getDiffCheckedType = function() {
	var diffList = [];
	var _self = this;
	return jQuery.grep(jQuery.merge($(this.prevCheckedType).not(this.checkedType), $(this.checkedType).not(this.prevCheckedType)), function(aType){return aType instanceof IType;});
}

Schema.prototype.updateCheckedType = function(newCheckedType) {
	this.prevCheckedType = this.checkedType;
	this.checkedType = newCheckedType;

}

try {
	module.exports = Schema;
}
catch(err) {
	if(err instanceof ReferenceError)
		;
	else {
		console.log(err);
		throw err;
	}
}
//module.exports.Schema = Schema;
