function IType(type, color, hotkey, parentType) {
	this.type = type;
	this.color = color;
	this.hotkey = hotkey;
	this.parentType = parentType;
	this.propertyList = [];
	this.childTypeList = [];
}

IType.prototype.addChildType = function(childType) {
	this.childTypeList.push(childType);
}

IType.prototype.addPrototype = function(newProperty) {
	this.propertyList.push(newProperty);
}

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

function Property() {

}

function Schema() {
	this.rootEntityTypeList = [];
	this.rootRelationTypeList = [];
	this.defaultAttribute = {};
}

Schema.prototype.parseSchemaXML = function(xmlDOM) {
	// parse default attribute
	var defaultAttributeNode = $(xmlDOM).find( "defaultattribute" );
}

Schema.prototype.parseAttribute = function(defaultAttributeNode) {
	var defaultAttribute = this.defaultAttribute;
	$(defaultAttributeNode).each( function() {
		defaultAttribute[this.tagName] = $(this).text();
	});
}
