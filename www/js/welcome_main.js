var main = (function(){
	var that = {};
	var Airtable = require('airtable');
// create Airtable base
	var airbase = new Airtable({apiKey: 'keypea3CJfSCwG8tn'}).base('appaxRpnZsU05O1t1');
	var anim_speed = 500;

	function hasTouch() {
	    return 'ontouchstart' in document.documentElement
	           || navigator.maxTouchPoints > 0
	           || navigator.msMaxTouchPoints > 0;
	}


	// app ready
	var onDeviceReady = function(){

		


		console.log("onDeviceReady()");

		// we know at this point if we're on iPad or not
		if( typeof StatusBar !== 'undefined' ){
			StatusBar.hide();
			FastClick.attach(document.body);
		}

		$(function(){


			if (hasTouch()) { // remove all :hover stylesheets
			    try { // prevent exception on browsers not supporting DOM styleSheets properly
			        for (var si in document.styleSheets) {
			            var styleSheet = document.styleSheets[si];
			            if (!styleSheet.rules) continue;

			            for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
			                if (!styleSheet.rules[ri].selectorText) continue;

			                if (styleSheet.rules[ri].selectorText.match(':hover')) {
			                    styleSheet.deleteRule(ri);
			                }
			            }
			        }
			    } catch (ex) {}
			}


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
		// put final textarea thing in
		console.log(answers);
		answers[content.questions.length-1] = $("#note").val();

		// submit all final answers to airtable

		var name = Cookies.get("nwh_user");
		var total = 0;


		for(var i=0; i<answers.length; i++){
			console.log("i: ",i);
			var answer = answers[i];
			console.log(answers[i]);
			var airtableanswer;

			if (typeof answer == 'number' || typeof answer == 'string') {
				// slider data
				if (parseInt(answer) < 34 && parseInt(answer) > 10) {
					total += 1;
				} else if (parseInt(answer) > 66) {
					total += 3;
				} else {
					total += 2;
				}

				airtableanswer = answer.toString();

			} else {
				// multiselect

				// SCORING... 
				// add up all options selected cumulatively
				// none of the above should not be added to answer array in first place
				

				airtableanswer = [];
				// and how the fuck are we storing the answers?
				for (var j=0; j<answer.length; j++) {
					//if(!answer[j]) { answer[j] = 'false'}
					if ( answer[j] ) {
					//	debugger;
						if (typeof content.questions[i] == 'object') {
							console.log("heyyyy")
							console.log(content.questions[i])
							// look up actual answer text
							airtableanswer.push(content.questions[i].answers[j]);

							if (content.questions[i].answers[j] != "None of the above") {
								total++;
							}
						}
					}
				}
				//console.log(airtableanswer)
				airtableanswer = airtableanswer.toString();;
			}

			
			console.log("load up in airtable "+airtableanswer)
			// put it in airtable
		
    		var airbase_i = parseInt(i)+1;
			airbase('Users_SubmittedData').create({
			  "Name": name,
			  "QuestionNumber": airbase_i,
			  "Answer": airtableanswer
			}, function(err, record) {
			    if (err) { console.error(err); return; }
			    console.log(record.getId());
			});

		}
//temp
		airbase('Users_SubmittedTotals').create({
		  "Name": name,
		  "Total": total
		}, function(err, record) {
		    if (err) { console.error(err); return; }
		    console.log(record.getId());


                Cookies.set("nwh_pem_welcome", "true");
		});

		/************ 
		************* taking out for now, because instead we just want to route to BVS

		// 9 questions, total of 27 possible points
		// under 9, low risk
		// over 18, high risk
		// in between, medium risk
		// sid = array index of solutions objects in solutions json

		if(total < 14) {
			sid = 0;
		}
		if (total >= 14 && total <= 24 ) {
			sid = 1;
		}
		if (total > 24) {
			sid = 2
		}

		console.log("you had a total of "+total+" and your solution is # "+sid)

		// set header bar link active and show solution
		$(".solution:eq("+sid+") .solution-recommended").show();
		$(".solution:eq("+sid+")").fadeIn(500);
		$("#questions").fadeOut();
		$("#solutions").fadeTo(500,1);
		return sid;


		****************/
		// set header bar link active and show solution
		$(".solution .solution-recommended").show();
		$(".solution").fadeIn(500);
		$("#questions").fadeOut();
		$("#solutions").fadeTo(500,1);
		
		//temp
		setTimeout(function(){
			// redirect to BVS URL
			window.location.href = "https://survey.nwhpeaceofmind.org/";
		}, 3900);
	}

	// 
	// public interface
	//
	//that.recordAnswers = recordAnswers;
	that.computeAnswer = computeAnswer;
	that.onDeviceReady = onDeviceReady;
	that.deleteCSV = deleteCSV;

	return that;
})();