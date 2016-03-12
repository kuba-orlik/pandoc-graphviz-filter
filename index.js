#!/usr/bin/node

var sha1 = require("sha1");
var fs = require("fs");
require('shelljs/global');

if (!which('dot')) {
  echo("Sorry, this script requires the program 'dot' (from 'graphviz' package)");
  exit(1);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var json_data = "";

process.stdin.on('data', function(chunk) {
	json_data += chunk
});

process.stdin.on('end', function() {
    process_data(JSON.parse(json_data))
});

function process_data(data){
	var elements = data[1];
	for(var i in elements){
		var element = elements[i];
		var type = element.t;
		var classes = new Set(element.c && element.c[0] && element.c[0][1]);
		var content;
		if(type=="CodeBlock" && (classes.has("graphviz") || classes.has("dot"))){
			content = element.c && element.c[1];
			var hash = sha1(content);
			var directory_name = "graphviz-images"
			mkdir(directory_name);
			var temp_filename = "./" + directory_name + "/" + hash + ".graphviz-filter.temp";
			var image_filename = "./" + directory_name + "/" + hash + ".png";
			fs.writeFileSync(temp_filename, content);
			exec("dot -Tpng -Gdpi=200 " + temp_filename + " -o " + image_filename);
			rm(temp_filename);
			elements[i] = {"t":"Para","c":[{"t":"Image","c":[["",[],[]],[{"t":"Str","c":""}],[image_filename,"fig:"]]}]};
		}
	}
	console.log(JSON.stringify(data));
}
