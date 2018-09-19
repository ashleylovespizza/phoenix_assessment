const express = require('express');
const path = require('path');


// create the express app
var app = express();
const cookieParser = require('cookie-parser');
const Airtable = require('airtable');



//// Airtable stuff  ////
var airtable_config = {
apiKey: 'keypea3CJfSCwG8tn'
}
Airtable.configure(airtable_config);
const airtable_base = Airtable.base('appaxRpnZsU05O1t1')


var valid_codes = new Array();
var our_id = null;

airtable_base('Users').select({
	maxRecords: 100,
	view: "Main View"
}).firstPage(function(err, records) {

	records.forEach(function(record) {
			console.log(record);
		var code = record.get('URL code');
	  	var name = record.get('Name');
	  	var id = record.id;

	  	valid_codes.push({'code': code, 'name': name, 'id': id })
	})
	console.log(valid_codes)
})

//// cookies
app.use(cookieParser());




// app.get('*', function(req, res) {
//   res.sendFile(path.resolve(__dirname, 'www/index.html'));
// });


//// every URL
app.get('/:urlCode', function(req, res) {
	 console.log("/:urlCode")
	 console.log(req.params);
	 console.log(valid_codes);

	var codematch = null;

	console.log("nwh_user: "+req.cookies['nwh_user'])

	if (String(req.cookies['nwh_user']) != "undefined") {
		// cookie is set!  we've been here before...

		// first check if :urlCode is a new url.
		for (var i in valid_codes ) {
			if (valid_codes[i]['code'] == req.params.urlCode) {
				//clear all old cookies 
				res.clearCookie('nwh_user');
				res.clearCookie('nwh_userid');

				// put in da new cookie
				our_id = i;
				console.log("HELL YEAH setting a cookie. " + valid_codes[i]['name']);
				codematch = valid_codes[i]['name'];

				// set cookie
				res.cookie('nwh_user' , codematch);

				// go to /WELCOME yo
				res.redirect('/');

			}
		}


		// if urlcode is not in our list, and you have a cookie set, proceed as normal!
		for (i in valid_codes) { 
			if (valid_codes[i]['id'] == req.cookies['nwh_userid']) { our_id = i; break;}
		}

		codematch = req.cookies['nwh_user'];
		console.log("welcome back kotter");
		console.log(req.params)


		if (req.cookies['nwh_pem_welcome'] != 'true') {
				res.sendFile(path.join(__dirname + '/www/welcome.html'));
		} else {
			switch(req.params.urlCode) {
				
			    case "welcome":
					res.sendFile(path.join(__dirname + '/www/welcome.html'));
			        break;
			    case "team":
			        res.sendFile(path.join(__dirname + '/www/team.html'));
			        break;
			    case "journey":
			        res.sendFile(path.join(__dirname + '/www/journey.html'));
			        break;
			    case "checklist":
			        res.sendFile(path.join(__dirname + '/www/checklist.html'));
			        break;
			    default:
			        res.redirect('/');
			}
		}
		

	} else {
		console.log("no cookie. yet.")
		// no cookie yet, first time visiting...

		for (var i in valid_codes ) {
			// console.log(i)
		 	console.log(valid_codes[i])

			if (valid_codes[i]['code'] == req.params.urlCode) {
				our_id = i;
				console.log("HELL YEAH setting a cookie. " + valid_codes[i]['name']);
				codematch = valid_codes[i]['name'];

				// set cookie
				res.cookie('nwh_user' , codematch);

				// go to /WELCOME yo
				res.redirect('/welcome');

			}
		}

		console.log("codematch... "+codematch)
		if (codematch == null) {
			// no code matched and no cookie set, you shouldn't be here
			console.log("errr, go away")
			res.sendFile(path.join(__dirname + '/www/sorry.html'));	
		}
	}
			
})

app.get('/', function(req, res) {
	console.log('going to /')
	console.log(req.params)

	if (String(req.cookies['nwh_user']) != "undefined") {
		if (String(req.cookies['nwh_pem_welcome']) != "true") {

				res.redirect('/welcome');
			res.sendFile(path.join(__dirname + '/dist/welcome.html'));
		} else {

			res.sendFile(path.join(__dirname + '/dist/index.html'));
		}
	} else {

		res.sendFile(path.join(__dirname + '/dist/sorry.html'));
	}
})






app.use(express.static('www'))

// kick off the app
var port = process.env.PORT || 5000;
app.listen(port);

console.log(`Node Env: ${process.env.NODE_ENV}`);
console.log(`server started on port: ${port}`);
