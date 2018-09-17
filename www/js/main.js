var main = (function(){
	var that = {};
	var Airtable = require('airtable');
// create Airtable base
			var airbase = new Airtable({apiKey: 'keypea3CJfSCwG8tn'}).base('appaxRpnZsU05O1t1');



	var anim_speed = 500;

	// app ready
	var onDeviceReady = function(){

		


		console.log("onDeviceReady()");

		// we know at this point if we're on iPad or not
		if( typeof StatusBar !== 'undefined' ){
			StatusBar.hide();
			FastClick.attach(document.body);
		}

		$(function(){
			
			// callback for clicking Start on welcome screen
			$("#welcome-button").click(function(){
				$("#welcome").fadeTo(anim_speed,0, function(){
					$("#welcome").hide();
				});
				$("#questions").fadeTo(anim_speed,1);
			});

			// add callbacks for next/prev
			$("#nav-next").click(function(){
				controller.next();
			});

			$("#nav-prev").click(function(){
				controller.prev();
			});

			controller.init();
		});
	}

	// if we have StatusBar package, we know we're on an ipad
	if( typeof StatusBar !== 'undefined' ) {
		console.log("adding deviceready event listener for mobile device");
		document.addEventListener("deviceready", onDeviceReady, false);
	} 
	// otherwise, load manually (e.g. in browser mode)
	else {
		onDeviceReady();
	}

	var fileErrorHandler = function(e) {
	  var msg = '';

	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };

	  console.log('Error: ' + msg);
	}

	// remove CSV from iPad (for use while testing)
	var deleteCSV = function(){
		function onInitFs(fs){
			fs.getFile('results.csv', {create: false}, function(fileEntry) {
				fileEntry.remove(function(){
					alert("results.csv has been deleted")
				}, fileErrorHandler);
			}, fileErrorHandler);
		}

		// nothing to do delete if we dont have access to the FS
		if( typeof cordova == "undefined" ){
			console.log("skipping delete CSV request; not running cordova");
			return;
		}

		if( confirm("WARNING: are you sure you want to DELETE the results CSV file?") ){
			window.resolveLocalFileSystemURL(cordova.file.documentsDirectory, onInitFs, fileErrorHandler);
		}
	}
	
	// write answers to CSV
	// answers is a flat list of letter choices; rec is 0-indexed solution that was auto-selected
	var recordAnswers = function(answers, rec){
		console.log("recording answers");
		console.log(answers);

		function onInitFs(fs) {
			fs.getFile('results.csv', {create: true}, function(fileEntry) {
				// Create a FileWriter object for our FileEntry (log.txt).
				fileEntry.createWriter(function(fileWriter) {

					fileWriter.seek(fileWriter.length); // Start write position at EOF.

					var to_write = '';

					// if new file, write CSV header
					if( fileWriter.length == 0 ){
						var header = '';
						for(var i=0; i<answers.length; i++){
							header += 'Question ' + (i+1) + ',';
						}

						header += 'Result\n';

						to_write += header;
					}

					// Create a new Blob with results and write it to results.csv
					to_write += answers.join(',') + ',' + (rec+1) + '\n';

					var blob = new Blob([to_write], {type: 'text/plain'});
					fileWriter.write(blob);

					console.log("results written to results.csv");

				}, fileErrorHandler);
			}, fileErrorHandler);
		}

		// nothing to do write to if we dont have access to the FS
		if( typeof cordova == "undefined" ){
			return;
		}

		window.resolveLocalFileSystemURL(cordova.file.documentsDirectory, onInitFs, fileErrorHandler);
	}

	// tally answers and figure out the most appropriate product
	var computeAnswer = function(content,answers){

		// TODO - submit all final answers to airtable


		var total = 0;
		for(var i=0; i<answers.length; i++){
			var answer = answers[i];
			var airtableanswer;

			if (typeof answer == 'number' || typeof answer == 'string') {
				// slider data
				if (parseInt(answer) < 34) {
					total += 1;
				} else if (parseInt(answer) > 66) {
					total += 3;
				} else {
					total += 2;
				}

				airtableanswer = answer.toString();
			} else {
				// multiselect

				// SCORING... todo :P
				// just use the highest one
				if (answer[2] != false ) {
					total += 3;
				} else if(answer[1] != false) {
					total += 2;
				} else { 
					total +=1;
				}

				airtableanswer = [];
				// and how the fuck are we storing the answers?
				for (var j=0; j<answer.length; j++) {
					if ( answer[j] ) {
						// look up actual answer text
						airtableanswer.push(content.questions[i].answers[j]);
					}
				}
				airtableanswer = airtableanswer.toString();
			}
			
			console.log("load up in airtable "+airtableanswer)
			// put it in airtable
			// TODO_ name :P
			airbase('Users_SubmittedData').create({
			  "Name": "Unnamed",
			  "QuestionNumber": i,
			  "Answer": airtableanswer
			}, function(err, record) {
			    if (err) { console.error(err); return; }
			    console.log(record.getId());
			});

		}

		// var sid = totals.indexOf( _.max(totals) );

		// 9 questions, total of 27 possible points
		// under 9, low risk
		// over 18, high risk
		// in between, medium risk
		// sid = array index of solutions objects in solutions json
		if(total < 9) {
			sid = 0;
		}
		if (total >= 9 && total <= 18 ) {
			sid = 1;
		}
		if (total > 18) {
			sid = 2
		}



		// set header bar link active and show solution
		$(".solutions-header-title:eq("+sid+")").addClass("solution-selected solution-answer")
		$(".solution:eq("+sid+") .solution-recommended").show();
		$(".solution:eq("+sid+")").fadeIn(500);
		$("#questions").fadeOut();
		$("#solutions").fadeTo(500,1);
		return sid;
	}

	// 
	// public interface
	//
	that.recordAnswers = recordAnswers;
	that.computeAnswer = computeAnswer;
	that.onDeviceReady = onDeviceReady;
	that.deleteCSV = deleteCSV;

	return that;
})();