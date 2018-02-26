#Anafora Test Application
This is a priviate Django App to test the [Anafora App](https://github.com/weitechen/anafora)

### How to test JavaScript with Grunt
Grunt(https://github.com/gruntjs/grunt) is a JavaScript task runner which supports the command line unit testing suite. Grunt is based on node.js.

To run the Grunt testing task in Anafora, here are the steps
1
1. Start the Django local HTTP service with the following command:
```shell
python manage.py runserver --settings anafora.tests.testSettings
```
...The above command uses the [test settings file](../anafora/tests/testSettings.py) to run the Django test server.
2. Move to the Java Script root directory  (under src/static/js)
3. Install the dependency node package ([npm](https://www.npmjs.com/) requires ) in local with the following command:
```shell
npm install
```
...Then npm will install all the required packages based on the [package.json](../static/js/package.json).
4. Run the Grunt with QUnit
```shell
node_modules/grunt-cli/bin/grunt qunit
```
