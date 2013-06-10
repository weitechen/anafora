<center><img src="https://raw.github.com/weitechen/anafora/master/documentation/anaforalogo.png" width=400px></center>

[About Anafora](https://github.com/weitechen/anafora#about-anafora) - [How Annotation Works](https://github.com/weitechen/anafora#how-anaforas-web-based-annotation-works) - [Requirements](https://github.com/weitechen/anafora#requirements)  - [Documentation](https://github.com/weitechen/anafora#documentation) - [FAQ](https://github.com/weitechen/anafora#frequently-asked-questions-faq) - [Get Anafora](https://github.com/weitechen/anafora#get-anafora)

### About Anafora

Anafora (pronounced "a-nuh-FOUR-uh", /ænəˈfɔɹə/) is a new annotation tool written at the University of Colorado by Wei-te Chen and Will Styler.  Anafora is designed to be a lightweight, flexible annotation solution which is easy to deploy for large and small projects.  Previous tools (Protege/Knowtator, eHost) have been written primarily with local annotation in mind, running as native, local applications and reading complex file or folder structures.  This limits cross-platform deployment and requires the annotated data to be stored locally on machines, complicating data-use agreements and increasing data fragmentation.  Alternatively, these programs can be run remotely via X-windows, but this increases latency and leaves annotation vulnerable to any connectivity interruptions.

Anafora was designed as a web-based tool to avoid this issue, allowing multiple anntators to access data remotely from a single instance running on a remote server.  Designed for webkit-based browsers, annotators can work from nearly any modern OS, and no installation, local storage, or SSH logins are required.  All data is regularly autosaved, and annotations (not source text) can be saved to local storage for restoration in the event of a connectivity interruption.

In addition, avoiding the complex formats, schemas, and filetypes associated with current solutions, Anafora was built to provide simple, organized representations of the data required for annotation. Annotation schemas and stored annotation data are both saved as human-readable XML, and these are stored alongside plaintext annotated files in a simple, database-free, static filesystem.  This allows easy automated assignment of new sets, pre-made data organization, and ease of administration and oversight unmatched by other tools.

Most importantly, though, Anafora has been designed to offer an efficient and learnable means to annotate and adjudicate using even complex schemas, pipelines and workflows. Designed with complex schemas in mind (featuring spanned and spanless annotations, relations, annotation and pointer properties), Anafora has been built to handle any annotation type, and to be equally at home with multiple steps, passes, or annotation types.  

Anafora provides annotation projects, simple or complex, with an easy-to-use single, lightweight and open-source solution to all spanned and spanless annotation needs.

### How Anafora's web-based annotation works

Anafora is a secure, web-based tool.  Once properly installed on a remote server, it can be accessed from anywhere with a web browser, and no part of the document being annotated is saved to the local machine.  

When you open Anafora and select your document, the relevant text is opened in a browser along with the schema and a pane for properties, for you to annotate.

As you annotate, your annotations (only the numerical spans, annotation IDs, and associated properties) are cached in memory and saved to the server automatically every 2 minutes.  In the event that your connection is interrupted, reloading the page will reload your annotations from that cache and save them to the server, meaning that although a consistent internet connection is desirable, an occasional interruption shouldn't result in data loss.

When you finish a session, you'll want to use the "save" command and exit the browser.  By doing that, you'll know that your work is safe.

#### Screenshots

<img src="https://raw.github.com/weitechen/anafora/master/documentation/screenshots/screenshot1.png" width=200px>
<img src="https://raw.github.com/weitechen/anafora/master/documentation/screenshots/screenshot2.png" width=200px>

### Requirements 

#### Server Requirements

To install Anafora on your machine as a central repository for an annotation project, you'll need:

* Linux- or Unix-based server
* Apache
* Django
(more details pending)

#### User-level requirements

In order to run Anafora as an end user/annotator, you'll need:

* A consistent internet connection (although 100% consistency isn't necessary)
* A modern browser supporting HTML5, Javascript and CSS (Google Chrome is our recommended choice and is the browser we're primarily testing with, but Safari, Chromium, Firefox and other Webkit-based browsers have been shown to work well as well.  *Anafora is not compatible with any version of Internet Explorer*)
* An account (which is a member of the requisite groups) set up on the server hosting Anafora 
* For adjudication and access to other annotators' data, you must be a member of the "anaforaadmin" group on the server on which Anafora is installed.

### Documentation

#### The Anafora User Manual

The [Anafora User/Administrator Manual (PDF)](https://github.com/weitechen/anafora/blob/master/documentation/AnaforaManual.pdf?raw=true) contains instructions for Annotators, Administrators, and Installation.  

#### Frequently Asked Questions (FAQ)

Please see our [Anafora FAQ](https://github.com/weitechen/anafora/wiki/FAQ) for a complete listing of questions.

#### Sample Annotations, Schema, and Project file

To help you get a feel for how Anafora data and schemas look, we've created a few sample documents in Anafora, available here under [sample data](https://github.com/weitechen/anafora/tree/master/sample%20data).

#### Version History and Changelog

For information about iterations of Anafora, view our [version history and changelog](https://github.com/weitechen/anafora/blob/master/versionhistory.md), 


### Get Anafora

#### Download Anafora

Anafora is Free and Open Source, released under the Apache License.  Our source code is available in the [src folder on github](https://github.com/weitechen/anafora/tree/master/src).  We welcome new commits and bugfixes through pull requests.

