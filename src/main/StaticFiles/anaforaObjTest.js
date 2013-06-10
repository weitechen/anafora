module( "anafora obj module", {
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

test( "span Test", function() {
  var span1 = new SpanType(1,7);
  var span2 = new SpanType(3,9);
  var span3 = new SpanType(4,6);
  var span4 = new SpanType(1,5);
  var span5 = new SpanType(1,7);

  equal( SpanType.sort(span1, span2), -1, "span1 vs. span2" );
  equal( SpanType.sort(span2, span1), 1, "span2 vs. span1" );

  equal( SpanType.sort(span1, span3), -1, "span1 vs. span3" );
  equal( SpanType.sort(span3, span1), 1, "span3 vs. span1" );

  equal( SpanType.sort(span1, span4), 1, "span1 vs. span4" );
  equal( SpanType.sort(span4, span1), -1, "span4 vs. span1" );

  equal( SpanType.sort(span1, span5), 0, "span1 vs. span5" );
  equal( SpanType.sort(span5, span1), 0, "span5 vs. span1" );

  var tList = [span3, span2, span5, span1, span4];
  deepEqual( tList.sort(SpanType.sort), [span4, span1, span5, span2, span3] );
});

test( "anaforaObj Test", function() {
  var rel1 = new Relation("1@r", this.schema.typeDict["Identical"]);
  var rel2 = new Relation("2@r", this.schema.typeDict["Identical"]);
  equal( rel1.getFirstProperty(), undefined, "rel1 get first property, except undefined");
  equal( rel1.getFirstListProperty(), undefined, "rel1 get first list type property, except undefined");
  equal( rel2.getFirstProperty(), undefined, "rel2 get first property, except undefined");
  equal( rel2.getFirstListProperty(), undefined, "rel2 get first list type property, except undefined");
  equal( Relation.sort(rel1, rel2), 0 , "empty rel" );

  var entity1 = new Entity("1@e", this.schema.typeDict["EVENT"], [new SpanType(3,10)]);
  var entity2 = new Entity("2@e", this.schema.typeDict["EVENT"], [new SpanType(1,5)]);

  equal( Entity.sort(entity1, entity2), 1, "entity1 vs. entity2")
  equal( Entity.sort(entity2, entity1), -1, "entity1 vs. entity2")

  rel2.propertyList[0] = [entity1];
  ok( rel2.getFirstProperty()[0] == entity1, "rel2 get first property, except entity1");
  ok( rel2.getFirstListProperty()== entity1, "rel2 get first list type property, except entity1");
  equal( Relation.sort(rel1, rel2), -1 , "empty rel vs. non-empty rel" );
  equal( Relation.sort(rel2, rel1), 1 , "empty rel vs. non-empty rel" );

  rel1.propertyList[0] = [entity2];
  ok( rel1.getFirstProperty()[0] == entity2, "rel1 get first property, except entity2");
  ok( rel1.getFirstListProperty() == entity2, "rel1 get first list type property, except entity2");
  equal( Relation.sort(rel1, rel2), -1 , "non-empty rel vs. non-empty rel" );
  equal( Relation.sort(rel2, rel1), 1 , "non-empty rel vs. non-empty rel" );

});

test( "anaforaObj linkingAObj test", function() {
  var entity1 = new Entity("1@e", this.schema.typeDict["EVENT"], [new SpanType(3,10)]);
  var entity2 = new Entity("2@e", this.schema.typeDict["EVENT"], [new SpanType(1,5)]);
  var entity3 = new Entity("3@e", this.schema.typeDict["EVENT"], [new SpanType(8,12)]);
  var rel1 = new Relation("1@r", this.schema.typeDict["Identical"]);
  var rel2 = new Relation("2@r", this.schema.typeDict["Identical"]);
  
  rel1.propertyList[0] = [entity1];
  entity1.addLinkingAObj(rel1)
  rel1.propertyList[1] = [entity2];
  entity2.addLinkingAObj(rel1)

  rel2.propertyList[0] = [entity2];
  entity2.addLinkingAObj(rel2)
  rel2.propertyList[1] = [entity1, entity3];
  entity1.addLinkingAObj(rel2);
  entity3.addLinkingAObj(rel2);
  
  ok(entity1.linkingAObjList.length, 2);  
  equal(entity1.linkingAObjList[0], rel1);
  equal(entity1.linkingAObjList[1], rel2);

  ok(entity2.linkingAObjList.length, 2);  
  equal(entity2.linkingAObjList[0], rel1);
  equal(entity2.linkingAObjList[1], rel2);

  ok(entity3.linkingAObjList.length, 1);  
  equal(entity3.linkingAObjList[0], rel2);

  // destroy entity2
  entity2.destroy();
  equal(rel1.propertyList[1], undefined);
  console.log(rel2);
  equal(rel2.propertyList[0], undefined);
  ok(entity2.linkingAObjList.length, 0);
});
