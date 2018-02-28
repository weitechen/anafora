# Anafora Source Code README

## Directory Descriptions
* Templates: This folder stores the template files governing the Anafora UI. There's no need to change it
* main: This stores the main Django and JavaScript files which make up the Anafora codebase.

## Description of the files 'main' directory
* annotate: Django files for the Anafora project
* css: CSS files for Anafora
* image: Image files used in Anafora
* js: the JavaScript code which makes up Anafora
* web: Anafora's Django project setup directory. Change the setting.py to customize Anafora to your server.

## Type of annotation object
* Basic Annotation ( e.g. idx@e/r@taskName@annotatorName ) (B)
...For the usage of basic annotation
* Preannotation Annotation (e.g., idx@e/r@taskName@preannotation ) (P)
* Adjudication Annotation (e.g., idx@e/r@taskName@adjudication ) (A)
* Gold Annotation (e.g., idx@e/r@taskName@gold ) (G)

Regular Project
  B -> B, P
  P -> P
  A(X)
  G -> G

  readFromXMLDOM
    
  
Adjudication Project
  B -> B, P, A
  P -> P
  A -> B
  G(X)

