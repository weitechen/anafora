module( "anafora adjudication obj module", {
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
  }
});

test( "test IAdjudicationAnaforaObj", function() {
	var entity1 = new Entity("1@e@task@annot1", this.schema.typeDict["EVENT"], [new SpanType(94, 98)], ["BEFORE", "N/A", "N/A", "POS", "ACTUAL", "N/A", "FINITE"]);
	var entity2 = new Entity("2@e@task@annot1", this.schema.typeDict["EVENT"], [new SpanType(94, 98)], ["BEFORE", "N/A", "N/A", "POS", "ACTUAL", "N/A", "UNDETERMINED"]);

	ok( IAdjudicationAnaforaObj.compareProperty(entity1.type.propertyTypeList[0], entity1.propertyList[0], entity2.propertyList[0]), "check property compare with CHOICE" );
	ok( !IAdjudicationAnaforaObj.compareProperty(entity1.type.propertyTypeList[6], entity1.propertyList[6], entity2.propertyList[6]), "check property compare with CHOICE" );
	deepEqual( IAdjudicationAnaforaObj.compareAObjPropertyList(entity1, entity2), [6], "check property list compare"); ;
	deepEqual( IAdjudicationAnaforaObj.compareAObjPropertyList(entity1, entity1), [], "check property list compare"); ;
	ok( IAdjudicationAnaforaObj.compareProperty(this.schema.typeDict["Identical"].propertyTypeList[1], [entity1, entity2], [entity1, entity2]), "check property compare with LIST - Identical List");
	ok( !IAdjudicationAnaforaObj.compareProperty(this.schema.typeDict["Identical"].propertyTypeList[0], [entity1], [entity2]), "check property compare with LIST - Different element");
	ok( !IAdjudicationAnaforaObj.compareProperty(this.schema.typeDict["Identical"].propertyTypeList[1], [entity1, entity2], [entity1, entity2, entity1]), "check property compare with LIST - different list length");

	// setting entity compare func
	var relation1 = new Relation("1@r@stylerw", this.schema.typeDict["Identical"], [[entity1], [entity1, entity2]]);
	var relation2 = new Relation("2@r@crooksk", this.schema.typeDict["Identical"], [[entity2], [entity1, entity2]]);

	var adjRelation = new AdjudicationRelation("3@r@adj", relation1.type, relation1, relation2, [0]);
	deepEqual( adjRelation.diffProp, [0] );

});

