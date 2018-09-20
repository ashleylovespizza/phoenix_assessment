var controller = (function(){
	var that = {};

	var content = null;
	var question_width = 0;
	var cur_slide = 0;

	var template_questions = null;
	var template_solutions = null;

	var question_title_active = "slate-blue-fg";
	var question_answer_active = "definitely";

	var answers = [];

	// called by main when page is loaded
	var init = function(){
		console.log("initializing app controller");
		template_questions = _.template( $("#template-questions").text() );
		template_solutions = _.template( $("#template-solutions").text() );
		
		// on first load, grab JSON and build the HTML
		$.getJSON("json/survey.json", function(data){
			console.log("***** ***** **** received JSON content (" + data.questions.length + " questions, " + data.solutions.length + " solutions)");
			content = data;
			buildQuestions();
			buildSolutions();


		});
	}

	// reset app to original state
	var reset = function(){
		if( confirm("Reset app to welcome screen?") ){
			console.log("resetting app state");

			answers = [];
			for (i in content.questions) {
				answers[i] = [];
			}
			cur_slide = 0;

			// remove selected answers and go to first question slide
			$(".question-answer").removeClass(question_answer_active);
			$("#questions").css('opacity',0);
			$("#questions-scroller").css('left', 0);
			updateHead();
			updateArrows(content.questions.length-1, 0);

			// reset solutions screen
			$("#solutions").css('opacity',0);
			$(".solution-recommended").hide();
			$(".solutions-header-title").removeClass("solution-selected");
			$(".solutions-header-title").removeClass("solution-answer");

			$("#welcome").show().css('opacity',1);
		}
	}
	
	// create HTML from template to populate questions section
	var buildQuestions = function(){

		console.log("building question 2d array");
		for (i in content.questions) {
			answers[i] = [];
		}


		console.log("building question HTML");
		var _html = template_questions(content);
		$("#questions-container").html(_html);

		// make first question title active
		$(".question-top:nth(0)").addClass( question_title_active );

		// resize a few slideshow elements
		question_width = $("#questions-container").width();
		$(".question").width( question_width );
		$("#questions-scroller").width( question_width*content.questions.length );

		// setup callback for seleting an answer

		/// FOR SLIDER
		/// on mouse move listener to update image
		$('.rangeslider').on("input", function () {

			var left = $(this).parent().prev().prev().children('.left')
			var right = $(this).parent().prev().prev().children('.right')

		    if($(this).val() < 34) {
		    	// make .image.left visible
		    	if (!left.hasClass('visible')) {
					$(this).parent().prev().prev().children('.image').removeClass('visible');
					left.addClass('visible');
		    	}
		    } else if($(this).val() > 66) {
		    	// make .image.right visible
		    	if (!right.hasClass('visible')) {
					$(this).parent().prev().prev().children('.image').removeClass('visible');
					right.addClass('visible');
		    	}
		    } else {
		    	// make .image.center visible
		    	if (right.hasClass('visible') || left.hasClass('visible')) {
					$(this).parent().prev().prev().children('.image').removeClass('visible');
					
					$(this).parent().prev().prev().children('.center').addClass('visible');
		    	}
		    }
		})
		$('.rangeslider').on("change", function() {
			var _q = parseInt($(this).attr('id').split("answer-")[1]);
			var _a = $(this).val();
		
			// TODO - update for SVG switching

			answers[_q] = _a;

			// remove nav-button-disabled from next
			$("#nav-next").removeClass("nav-button-disabled");

			// // if clicked final question, show submit button
			// if( _q == content.questions.length-1 ){
			// 	showSubmit();
			// }
		});

		/// FOR MULTISELECT
		$(".question-answer.multiselect").click(function(){
			var data = $(this).attr('id').split("answer-")[1].split('-');
			var _q = parseInt(data[0]);
			var _a = parseInt(data[1]);

			if ( $(this).hasClass("selected")) {
				// you are deselecting

				$(this).removeClass("selected");
				$(this).removeClass(question_answer_active);

				// if none are now selected make next disabled
				console.log("hi.")
				var anyselected = $(this).siblings().hasClass('selected') || $(this).hasClass("selected");

				console.log(anyselected)
				if(!anyselected) {

					$("#nav-next").addClass("nav-button-disabled");
				} else {
					$("#nav-next").removeClass("nav-button-disabled");
				}


				// not none o the above
				console.log($(this).children('span').html() );
				// if( $(this).children('span').html() != "None of the above") {
				 	answers[_q][_a] = false;
				// }

				// // if clicked final question, show submit button
				// if( _q == content.questions.length-1 ){
				// 	showSubmit();
				// }


			} else {
				console.log("write down in answers: ", _q, _a)
				// you are selecting
				$(this).addClass("selected");
				$(this).addClass(question_answer_active);

				// must be disabled if any are selected
				$("#nav-next").removeClass("nav-button-disabled");

				// not none o the above
				console.log($(this).children('span').html() );
				//if($(this).children('span').html() != "None of the above") {

					answers[_q][_a] = true;
				//}


				// // if clicked final question, show submit button
				// if( _q == content.questions.length-1 ){
				// 	showSubmit();
				// }

			}

			//answers[_q][_a];

			console.log("question " + _q + ", " + answers[_q] + " selected");
			console.log(answers);

		});

	}

	var buildSolutions = function(){
		console.log("building solutions HTML");
		var _html = template_solutions(content);
		$("#solutions").html(_html);
		$(".solutions-header-title").click(function(){
			var clicked = $(this).index();
			$(".solutions-header-title").removeClass("solution-selected");
			$(this).addClass("solution-selected");

			$(".solution:not("+clicked+")").hide();
			$(".solution:eq(" + clicked + ")").show();
		});

		// these are two invisible clickable boxes for utility
		$("#delete-csv").click(function(){
			console.log("clicked delete CSV");
			main.deleteCSV();
		});

		$("#reset-app").click(function(){
			console.log("clicked reset app");
			reset();
		});
	}

	// update header on page transition
	var updateHead = function(){
		$(".question-top").removeClass(question_title_active);
		$(".question-top:nth(" + cur_slide + ")").addClass(question_title_active);
	}

	var updateArrows = function(prev, cur){
		// handle enable/disable class of prev button
		if(cur == 0){
			$("#nav-prev").addClass("nav-button-disabled");
		}
		else {
			$("#nav-prev").removeClass("nav-button-disabled");
		}

		// handle enable/disable class of next button
		if(answers[cur][0] == undefined ||
			answers[cur][0] == false && answers[cur][1] == false && answers[cur][2] == false){
			$("#nav-next").addClass("nav-button-disabled");
		}
		else {
			$("#nav-next").removeClass("nav-button-disabled");
		}

		// if we just came from last slide, make sure its in the right state
		if(prev == content.questions.length-1){
			hideSubmit();
			return;
		}

		// on last slide
		if(cur == content.questions.length-1) {
			if(answers[cur] == undefined){
				$("#nav-next").addClass("nav-button-disabled");

				$("#next-content").fadeOut(250, function(){
					$("#submit-pre").delay(300).fadeIn(250);
				});
			}
			else {
				showSubmit();
			}
		}
	}

	// next question
	var next = function(){
		if( cur_slide == content.questions.length-2 ){
			showSubmit();
		}
		// if on last slide and we've selected answer
		if( cur_slide == content.questions.length-1 ){
			if(answers[cur_slide] !== undefined){
				submitSurvey();
			}
			return;
		}

		if($("#nav-next").hasClass('nav-button-disabled')){	
			return;
		}

		console.log("moving next");
		var prev_slide = cur_slide;
		cur_slide+=1;

		$("#questions-scroller").css('left', -1 * cur_slide * question_width + 'px');
		updateHead();
		updateArrows(prev_slide,cur_slide);
	}

	// prev question
	var prev = function(){
		if( cur_slide == 0 ){
			return;
		}

		if($(this).hasClass('nav-button-disabled')){
			return;
		}

		// if currently on last question, reset submit button
		if(cur_slide == content.questions.length-1){
			hideSubmit();
		}

		var prev_slide = cur_slide;
		cur_slide-=1;

		console.log("moving prev");
		$("#questions-scroller").css('left', -1 * cur_slide * question_width + 'px');
		updateHead();
		updateArrows(prev_slide,cur_slide);
	}

	// transition the next button to a submit button
	var showSubmit = function(){
		$("#submit-pre,#next-content").hide();

		
		console.log("showing submit")
		$("#nav-next").removeClass("nav-button-disabled")
		$("#submit-content").delay(300).fadeIn(250);
	}

	var hideSubmit = function(){
		$("#submit-content,#submit-pre").hide();

		$("#nav-next").css({
			"height": '45px',
			'line-height': '45px'
		});

		$("#next-content").delay(300).fadeIn();
	}

	// submit the survey, selecting the best option
	var submitSurvey = function(){
		console.log("submitting survey");

		console.log('content: ', content);
		console.log('answers: ', answers);

		var rec = main.computeAnswer(content,answers);

	}

	var getContent = function(){ return content; }

	that.next = next;
	that.prev = prev;
	that.init = init;
	that.getContent = getContent;
	that.reset = reset;

	return that;
})();