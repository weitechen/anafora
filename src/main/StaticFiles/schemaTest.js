module( "schema module", {
  setup: function() {
        this.schema = new Schema();

        var xmlSchemaText0 = $.ajax({
                type: "GET",
                url: "https://verbs.colorado.edu/~wech5560/anafora/annotate/schema/EVENTCoref/0/",
                cache: false,
                async: false}).responseText;

	var schemaJSON0 = $.parseJSON(xmlSchemaText0);
	var schemaXMLStr0 = schemaJSON0.schemaXML;
        var xmlSchemaDom0 = $.parseXML( schemaXMLStr0 );
        this.schema.parseSchemaXML(xmlSchemaDom0);

        var xmlSchemaText1 = $.ajax({
                type: "GET",
                url: "https://verbs.colorado.edu/~wech5560/anafora/annotate/schema/EVENTCoref/1/",
                cache: false,
                async: false}).responseText;

	var schemaJSON1 = $.parseJSON(xmlSchemaText1);
	var schemaXMLStr1 = schemaJSON1.schemaXML;
        var xmlSchemaDom1 = $.parseXML( schemaXMLStr1 );
        this.schema.parseSchemaXML(xmlSchemaDom1);

	// PropBank Schema
        var xmlSchemaText2 = $.ajax({
                type: "GET",
                url: "https://verbs.colorado.edu/~wech5560/anafora/annotate/schema/PropBank/0/",
                cache: false,
                async: false}).responseText;

	var schemaJSON2 = $.parseJSON(xmlSchemaText2);
	var schemaXMLStr2 = schemaJSON2.schemaXML;
        var xmlSchemaDom2 = $.parseXML( schemaXMLStr2 );
        this.schema.parseSchemaXML(xmlSchemaDom2);
  }
});

test('Test Schema Type', function() {

	strictEqual(Object.keys(this.schema.defaultAttribute).length, 1, "test default attribute number");
	strictEqual(this.schema.defaultAttribute["required"], false , "test default attribute");
	strictEqual(this.schema.rootEntityTypeList.length, 3, "test root entity type list number");
	strictEqual(this.schema.rootRelationTypeList.length, 3, "test root relation type list number");
	strictEqual(Object.keys(this.schema.typeDict).length, 23, "test dict dict number");

	var tempEntities = this.schema.rootEntityTypeList[0];
	strictEqual(tempEntities.type, "TemporalEntities", "root entity type");
	strictEqual(tempEntities.color, "015367", "root entity color");
	strictEqual(tempEntities.hotkey, undefined, "root entity hotkey");
	strictEqual(tempEntities.parentType, undefined, 'root entity parent');
	deepEqual(tempEntities.propertyTypeList, [], 'root entity property list');
	strictEqual(tempEntities.childTypeList.length, 4 , 'root entity child entity number');

	var eventEntity = tempEntities.childTypeList[0];
	strictEqual(eventEntity.type, "EVENT", "EVENT entity type");
	strictEqual(eventEntity.color, "00ccff", "EVENT entity color");
	strictEqual(eventEntity.hotkey, "e", "EVENT entity hotkey");
	ok(eventEntity.parentType == tempEntities, 'EVENT entity parent');
	ok(eventEntity instanceof EntityType, 'EVENT entity is Entity instance');
	ok(!(eventEntity instanceof RelationType), 'EVENT entity is not Relation instance');
	deepEqual(eventEntity.childTypeList, [] , 'EVENT entity child entity number');
	strictEqual(eventEntity.propertyTypeList.length, 7, 'EVENT entity property list');
	strictEqual(eventEntity.propertyTypeList[0].type, "DocTimeRel", 'EVENT entity property 0-type');
	strictEqual(eventEntity.propertyTypeList[0].input, InputType.CHOICE, 'EVENT entity property 0-input');
	strictEqual(eventEntity.propertyTypeList[0].maxlink, undefined, 'EVENT entity property 0-maxlink');
	deepEqual(eventEntity.propertyTypeList[0].instanceOfList, undefined, 'EVENT entity property 0-instanceOfList');
	deepEqual(eventEntity.propertyTypeList[0].allowedValueList, ["","BEFORE","OVERLAP","AFTER","BEFORE/OVERLAP"], 'EVENT entity property 0-allowedValueList');
	deepEqual(eventEntity.propertyTypeList[0].required, true, 'EVENT entity property 0-allowedValueList');
	ok(eventEntity.propertyTypeList[0] instanceof PropertyType, 'EVENT entity property 0-type assert');
	strictEqual(eventEntity.propertyTypeList[1].type, "Type", 'EVENT entity property 1-type');
	strictEqual(eventEntity.propertyTypeList[1].input, InputType.CHOICE, 'EVENT entity property 1-input');
	strictEqual(eventEntity.propertyTypeList[1].maxlink, undefined, 'EVENT entity property 1-maxlink');
	deepEqual(eventEntity.propertyTypeList[1].instanceOfList, undefined, 'EVENT entity property 1-instanceOfList');
	deepEqual(eventEntity.propertyTypeList[1].allowedValueList, ["N/A","ASPECTUAL","EVIDENTIAL"], 'EVENT entity property 1-allowedValueList');
	deepEqual(eventEntity.propertyTypeList[1].required, true, 'EVENT entity property 1-allowedValueList');
	strictEqual(eventEntity.propertyTypeList[2].type, "Degree", 'EVENT entity property 2-type');
	strictEqual(eventEntity.propertyTypeList[2].input, InputType.CHOICE, 'EVENT entity property 2-input');
	strictEqual(eventEntity.propertyTypeList[2].maxlink, undefined, 'EVENT entity property 2-maxlink');
	deepEqual(eventEntity.propertyTypeList[2].instanceOfList, undefined, 'EVENT entity property 2-instanceOfList');
	deepEqual(eventEntity.propertyTypeList[2].allowedValueList, ["N/A","MOST","LITTLE"], 'EVENT entity property 2-allowedValueList');
	deepEqual(eventEntity.propertyTypeList[2].required, true, 'EVENT entity property 2-allowedValueList');
	strictEqual(eventEntity.propertyTypeList[3].type, "Polarity", 'EVENT entity property 3-type');
	strictEqual(eventEntity.propertyTypeList[3].input, InputType.CHOICE, 'EVENT entity property 3-input');
	strictEqual(eventEntity.propertyTypeList[3].maxlink, undefined, 'EVENT entity property 3-maxlink');
	deepEqual(eventEntity.propertyTypeList[3].instanceOfList, undefined, 'EVENT entity property 3-instanceOfList');
	deepEqual(eventEntity.propertyTypeList[3].allowedValueList, ["POS","NEG"], 'EVENT entity property 3-allowedValueList');
	deepEqual(eventEntity.propertyTypeList[3].required, true, 'EVENT entity property 3-allowedValueList');
	strictEqual(eventEntity.propertyTypeList[4].type, "ContextualModality", 'EVENT entity property 4-type');
	strictEqual(eventEntity.propertyTypeList[4].input, InputType.CHOICE, 'EVENT entity property 4-input');
	strictEqual(eventEntity.propertyTypeList[4].maxlink, undefined, 'EVENT entity property 4-maxlink');
	deepEqual(eventEntity.propertyTypeList[4].instanceOfList, undefined, 'EVENT entity property 4-instanceOfList');
	deepEqual(eventEntity.propertyTypeList[4].allowedValueList, ["ACTUAL","HYPOTHETICAL","HEDGED","GENERIC"], 'EVENT entity property 4-allowedValueList');
	deepEqual(eventEntity.propertyTypeList[4].required, true, 'EVENT entity property 4-allowedValueList');
	strictEqual(eventEntity.propertyTypeList[5].type, "ContextualAspect", 'EVENT entity property 5-type');
	strictEqual(eventEntity.propertyTypeList[5].input, InputType.CHOICE, 'EVENT entity property 5-input');
	strictEqual(eventEntity.propertyTypeList[5].maxlink, undefined, 'EVENT entity property 5-maxlink');
	deepEqual(eventEntity.propertyTypeList[5].instanceOfList, undefined, 'EVENT entity property 5-instanceOfList');
	deepEqual(eventEntity.propertyTypeList[5].allowedValueList, ["N/A","NOVEL","INTERMITTENT"], 'EVENT entity property 5-allowedValueList');
	deepEqual(eventEntity.propertyTypeList[5].required, true, 'EVENT entity property 5-allowedValueList');
	strictEqual(eventEntity.propertyTypeList[6].type, "Permanence", 'EVENT entity property 6-type');
	strictEqual(eventEntity.propertyTypeList[6].input, InputType.CHOICE, 'EVENT entity property 6-input');
	strictEqual(eventEntity.propertyTypeList[6].maxlink, undefined, 'EVENT entity property 6-maxlink');
	deepEqual(eventEntity.propertyTypeList[6].instanceOfList, undefined, 'EVENT entity property 6-instanceOfList');
	deepEqual(eventEntity.propertyTypeList[6].allowedValueList, ["UNDETERMINED","FINITE","PERMANENT"], 'EVENT entity property 6-allowedValueList');
	deepEqual(eventEntity.propertyTypeList[6].required, true, 'EVENT entity property 6-allowedValueList');

	var tempRelations = this.schema.rootRelationTypeList[0];
	strictEqual(tempRelations.type, "TemporalRelations", "root relation type");
	strictEqual(tempRelations.color, "0000ff", "root relation color");
	strictEqual(tempRelations.hotkey, undefined, "root relation hotkey");
	strictEqual(tempRelations.parentType, undefined, 'root relation parent');
	deepEqual(tempRelations.propertyTypeList, [], 'root relation property list');
	strictEqual(tempRelations.childTypeList.length, 2 , 'root relation child relation number');

	var tlinkRelation = tempRelations.childTypeList[0];
	strictEqual(tlinkRelation.type, "TLINK", "TLINK relation type");
	strictEqual(tlinkRelation.color, "0000ff", "TLINK relation color");
	strictEqual(tlinkRelation.hotkey, "l", "TLINK relation hotkey");
	ok(tlinkRelation.parentType == tempRelations, 'TLINK relation parent');
	ok(!(tlinkRelation instanceof EntityType), 'TLINK relation is not Entity instance');
	ok(tlinkRelation instanceof RelationType, 'TLINK relation is Relation instance');
	deepEqual(tlinkRelation.childTypeList, [] , 'TLINK relation child relation number');
	strictEqual(tlinkRelation.propertyTypeList.length, 3, 'TLINK relation property list');

	strictEqual(tlinkRelation.propertyTypeList[0].type, "Source", 'TLINK relation property 0-type');
	strictEqual(tlinkRelation.propertyTypeList[0].input, InputType.LIST, 'TLINK relation property 0-input');
	strictEqual(tlinkRelation.propertyTypeList[0].maxlink, 1, 'TLINK relation property 0-maxlink');
	strictEqual(tlinkRelation.propertyTypeList[0].instanceOfList.length, 2, 'TLINK relation property 2-instanceOfList length');
	ok(tlinkRelation.propertyTypeList[0].instanceOfList[0] == this.schema.typeDict["EVENT"] , 'TLINK relation property 0-instanceOfList');
	ok(tlinkRelation.propertyTypeList[0].instanceOfList[1] == this.schema.typeDict["TIMEX3"] , 'TLINK relation property 0-instanceOfList');
	deepEqual(tlinkRelation.propertyTypeList[0].allowedValueList, undefined, 'TLINK relation property 0-allowedValueList');
	deepEqual(tlinkRelation.propertyTypeList[0].required, true, 'TLINK  property 0-allowedValueList');
	strictEqual(tlinkRelation.propertyTypeList[1].type, "Type", 'TLINK relation property 1-type');
	strictEqual(tlinkRelation.propertyTypeList[1].input, InputType.CHOICE, 'TLINK relation property 1-input');
	strictEqual(tlinkRelation.propertyTypeList[1].maxlink, undefined, 'TLINK relation property 1-maxlink');
	deepEqual(tlinkRelation.propertyTypeList[1].instanceOfList, undefined, 'TLINK relation property 1-instanceOfList');
	deepEqual(tlinkRelation.propertyTypeList[1].allowedValueList, ["BEFORE","AFTER","OVERLAP","CONTAINS","BEGINS-ON","ENDS-ON"], 'TLINK relation property 1-allowedValueList');
	deepEqual(tlinkRelation.propertyTypeList[1].required, true, 'TLINK  property 1-allowedValueList');

	strictEqual(tlinkRelation.propertyTypeList[2].type, "Target", 'TLINK relation property 2-type');
	strictEqual(tlinkRelation.propertyTypeList[2].input, InputType.LIST, 'TLINK relation property 2-input');
	strictEqual(tlinkRelation.propertyTypeList[2].maxlink, 1, 'TLINK relation property 2-maxlink');
	strictEqual(tlinkRelation.propertyTypeList[2].instanceOfList.length, 2, 'TLINK relation property 2-instanceOfList length');
	ok(tlinkRelation.propertyTypeList[2].instanceOfList[0] == this.schema.typeDict["EVENT"] , 'TLINK relation property 2-instanceOfList');
	ok(tlinkRelation.propertyTypeList[2].instanceOfList[1] == this.schema.typeDict["TIMEX3"] , 'TLINK relation property 2-instanceOfList');
	deepEqual(tlinkRelation.propertyTypeList[2].allowedValueList, undefined, 'TLINK relation property 2-allowedValueList');
	deepEqual(tlinkRelation.propertyTypeList[2].required, true, 'TLINK  property 2-allowedValueList');

	var evtCorefEntities = this.schema.rootEntityTypeList[1];
	strictEqual(evtCorefEntities.type, "Coreference", "root entity type");
	strictEqual(evtCorefEntities.color, "d2d2d2", "root entity color");
	strictEqual(evtCorefEntities.hotkey, undefined, "root entity hotkey");
	strictEqual(evtCorefEntities.parentType, undefined, 'root entity parent');
	deepEqual(evtCorefEntities.propertyTypeList, [], 'root entity property list');
	strictEqual(evtCorefEntities.childTypeList.length, 1 , 'root entity child entity number');

	var markableEntity = evtCorefEntities.childTypeList[0];
	strictEqual(markableEntity.type, "Markable", "Markable entity type");
	strictEqual(markableEntity.color, "d2d2d2", "Markable entity color");
	strictEqual(markableEntity.hotkey, "m", "Markable entity hotkey");
	ok(markableEntity.parentType == evtCorefEntities, 'Markable entity parent');
	ok(markableEntity instanceof EntityType, 'Markable Entity is Entity instance');
	ok(!(markableEntity instanceof RelationType), 'Markable Entity is not Relation instance');
	deepEqual(markableEntity.childTypeList, [] , 'Markable entity child entity number');
	strictEqual(markableEntity.propertyTypeList.length, 0, 'Markable entity property list');

	var evtCorefRelations = this.schema.rootRelationTypeList[1];
	strictEqual(evtCorefRelations.type, "CorefChains", "root relation type");
	strictEqual(evtCorefRelations.color, "ffff00", "root relation color");
	strictEqual(evtCorefRelations.hotkey, undefined, "root relation hotkey");
	strictEqual(evtCorefRelations.parentType, undefined, 'root relation parent');
	deepEqual(evtCorefRelations.propertyTypeList, [], 'root relation property list');
	strictEqual(evtCorefRelations.childTypeList.length, 8 , 'root relation child relation number');

	var wholePartRelation  = evtCorefRelations.childTypeList[1];
	strictEqual(wholePartRelation.type, "Whole/Part", "WHOLE_PART relation type");
	strictEqual(wholePartRelation.color, "87CEEB", "WHOLE_PART relation color");
	strictEqual(wholePartRelation.hotkey, "w", "WHOLE_PART relation hotkey");
	ok(wholePartRelation.parentType == evtCorefRelations, 'WHOLE_PART relation parent');
	ok(!(wholePartRelation instanceof EntityType), 'WHOLE_PART relation is not Entity instance');
	ok(wholePartRelation instanceof RelationType, 'WHOLE_PART relation is Relation instance');
	deepEqual(wholePartRelation.childTypeList, [] , 'WHOLE_PART relation child relation number');
	strictEqual(wholePartRelation.propertyTypeList.length, 2, 'WHOLE_PART relation property list');

	strictEqual(wholePartRelation.propertyTypeList[0].type, "Whole", 'WHOLE_PART relation property 0-type');
	strictEqual(wholePartRelation.propertyTypeList[0].input, InputType.LIST, 'WHOLE_PART relation property 0-input');
	strictEqual(wholePartRelation.propertyTypeList[0].maxlink, 1, 'WHOLE_PART relation property 0-maxlink');
	strictEqual(wholePartRelation.propertyTypeList[0].instanceOfList.length, 2, 'WHOLE_PART relation property 2-instanceOfList length');
	ok(wholePartRelation.propertyTypeList[0].instanceOfList[0] == this.schema.typeDict["Markable"] , 'WHOLE_PART relation property 0-instanceOfList');
	ok(wholePartRelation.propertyTypeList[0].instanceOfList[1] == this.schema.typeDict["EVENT"] , 'WHOLE_PART relation property 0-instanceOfList');
	deepEqual(wholePartRelation.propertyTypeList[0].allowedValueList, undefined, 'WHOLE_PART relation property 0-allowedValueList');
	deepEqual(wholePartRelation.propertyTypeList[0].required, true, 'WHOLE_PART  property 0-allowedValueList');

	strictEqual(wholePartRelation.propertyTypeList[1].type, "Part", 'WHOLE_PART relation property 1-type');
	strictEqual(wholePartRelation.propertyTypeList[1].input, InputType.LIST, 'WHOLE_PART relation property 1-input');
	strictEqual(wholePartRelation.propertyTypeList[1].maxlink, 1000, 'WHOLE_PART relation property 1-maxlink');
	strictEqual(wholePartRelation.propertyTypeList[1].instanceOfList.length, 2, 'WHOLE_PART relation property 2-instanceOfList length');
	ok(wholePartRelation.propertyTypeList[1].instanceOfList[0] == this.schema.typeDict["Markable"] , 'WHOLE_PART relation property 1-instanceOfList');
	ok(wholePartRelation.propertyTypeList[1].instanceOfList[1] == this.schema.typeDict["EVENT"] , 'WHOLE_PART relation property 1-instanceOfList');
	deepEqual(wholePartRelation.propertyTypeList[1].allowedValueList, undefined, 'WHOLE_PART relation property 1-allowedValueList');
	deepEqual(wholePartRelation.propertyTypeList[1].required, true, 'WHOLE_PART  property 1-allowedValueList');


	var propbankEntities = this.schema.rootEntityTypeList[2];
	strictEqual(propbankEntities.type, "SemanticRoles", "root entity type");
	strictEqual(propbankEntities.color, "015367", "root entity color");
	strictEqual(propbankEntities.hotkey, undefined, "root entity hotkey");
	strictEqual(propbankEntities.parentType, undefined, 'root entity parent');
	deepEqual(propbankEntities.propertyTypeList, [], 'root entity property list');
	strictEqual(propbankEntities.childTypeList.length, 1 , 'root entity child entity number');

	var participantEntity = propbankEntities.childTypeList[0];
	strictEqual(participantEntity.type, "Participant", "Participant entity type");
	strictEqual(participantEntity.color, "00ccff", "Participant entity color");
	strictEqual(participantEntity.hotkey, "p", "Participant entity hotkey");
	ok(participantEntity.parentType == propbankEntities, 'Participant entity parent');
	ok(participantEntity instanceof EntityType, 'Participant entity is Entity instance');
	ok(!(participantEntity instanceof RelationType), 'Participant entity is not Relation instance');
	deepEqual(participantEntity.childTypeList, [] , 'Participant entity child entity number');
	strictEqual(participantEntity.propertyTypeList.length, 0, 'Participant entity property list');

	var semanticInstanceRelations = this.schema.rootRelationTypeList[2];
	strictEqual(semanticInstanceRelations.type, "SemanticInstance", "root relation type");
	strictEqual(semanticInstanceRelations.color, "0000ff", "root relation color");
	strictEqual(semanticInstanceRelations.hotkey, undefined, "root relation hotkey");
	strictEqual(semanticInstanceRelations.parentType, undefined, 'root relation parent');
	deepEqual(semanticInstanceRelations.propertyTypeList, [], 'root relation property list');
	strictEqual(semanticInstanceRelations.childTypeList.length, 1 , 'root relation child relation number');

	var structureRelation  = semanticInstanceRelations.childTypeList[0];
	strictEqual(structureRelation.type, "Structure", "Structure relation type");
	strictEqual(structureRelation.color, "0000ff", "Structure relation color");
	strictEqual(structureRelation.hotkey, "s", "Structure relation hotkey");
	ok(structureRelation.parentType == semanticInstanceRelations, 'Structure relation parent');
	ok(!(structureRelation instanceof EntityType), 'Structure relation is not Entity instance');
	ok(structureRelation instanceof RelationType, 'Structure relation is Relation instance');
	deepEqual(structureRelation.childTypeList, [] , 'Structure relation child relation number');
	strictEqual(structureRelation.propertyTypeList.length, 29, 'Structure relation property list');

	strictEqual(structureRelation.propertyTypeList[1].type, "ROLESET-ID", 'Structure relation property 1-type');
	strictEqual(structureRelation.propertyTypeList[1].input, InputType.TEXT, 'Structure relation property 1-input');
	strictEqual(structureRelation.propertyTypeList[1].maxlink, undefined, 'Structure relation property 1-maxlink');
	strictEqual(structureRelation.propertyTypeList[1].instanceOfList, undefined,'Structure relation property 2-instanceOfList length');
	deepEqual(structureRelation.propertyTypeList[1].required, true, 'Structure relation property 1-allowedValueList');
});
