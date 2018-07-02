#!/usr/bin/env node
"use strict";
var node_xj = require("xls-to-json");
var moment = require("moment");
moment.locale("de");
var mustache=require('mustache');
var fs=require('fs');
var view;
var templ;
var modtime;


  node_xj({
    input: "import/preisliste.xls",  // input xls
    output: "output.json", // output json
    sheet: "herrenmuehle",  // specific sheetname
  }, function(err, result) {
    if(err) {
     // console.error(err);
    } else {
     // console.log('result',result);

      fs.readFile('/var/www/herrenmuehle/index.mu.html','utf8', function read(err, data) {
          if (err) {
              throw err;
          }
          templ = data;


          processFile();
      });

    }
  });

function processFile() {

        fs.readFile('/var/www/herrenmuehle/output.json','utf8', function read(err, data) {
            if (err) {
                throw err;
            }

        //data.modified=modtime;
        view = JSON.parse(data);
      fs.stat('import/preisliste.xls', function(err, stats) {
      		var modtime= stats["mtime"];
      		//console.log("modtime",modtime);
      		var now = moment(modtime).format("DD. MMMM YYYY");
      		view.modtime=now;
      		console.log('now',view);
      		mustache.parse(templ);
      		var rendered = mustache.render(templ, view).replace(/\nline/g, "<br/>");
      		fs.writeFile("/var/www/herrenmuehle/index.html", rendered, function(err) {
      		    if(err) {
      		        console.log(err);
      		    } else {
      		        console.log("The file was saved!");
      		         process.exit(1);

      		    }
      		});
      		        //console.log(rendered);
      		        });
      })




}
