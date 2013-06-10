if(schema == undefined){
        var schema = new Schema();

        var xmlSchemaText0 = $.ajax({
                type: "GET",
                url: "https://verbs.colorado.edu/~wech5560/anafora/annotate/schema/EVENTCoref.Annotation/0",
                cache: false,
                async: false}).responseText;

	var schemaJSON0 = $.parseJSON(xmlSchemaText0);
	var schemaXMLStr0 = schemaJSON0.schemaXML;
        var xmlSchemaDom0 = $.parseXML( schemaXMLStr0 );
        schema.parseSchemaXML(xmlSchemaDom0);

        var xmlSchemaText1 = $.ajax({
                type: "GET",
                url: "https://verbs.colorado.edu/~wech5560/anafora/annotate/schema/EVENTCoref.Annotation/1",
                cache: false,
                async: false}).responseText;

	var schemaJSON1 = $.parseJSON(xmlSchemaText1);
	var schemaXMLStr1 = schemaJSON1.schemaXML;
        var xmlSchemaDom1 = $.parseXML( schemaXMLStr1 );
        schema.parseSchemaXML(xmlSchemaDom1);
}


test( "anaforaObj Test", function() {
  var rel1 = new Relation("1@r", schema.typeDict["Identical"]);
  var rel2 = new Relation("2@r", schema.typeDict["Identical"]);
  equal( Relation.sort(rel1, rel2), 0 , "empty rel" );
  var entity1 = new Entity("1@e", schema.typeDict["EVENT"], [new SpanType(3,10)]);
  var entity2 = new Entity("2@e", schema.typeDict["EVENT"], [new SpanType(1,5)]);
  rel2.propertyList[0] = entity1;
  equal( Relation.sort(rel1, rel2), -1 , "empty rel vs. non-empty rel" );

  rel1.propertyList[0] = entity2;
  equal( Relation.sort(rel1, rel2), 1 , "non-empty rel vs. non-empty rel" );

});
