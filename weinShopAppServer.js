'use strict';

var express = require('express');//,http=require('http');

var http = require('http');
//var app = express();
//var server = require('http').createServer(app);
//var io = require('socket.io')(server);
var PouchDB = require('pouchdb');
var db = new PouchDB('http://admin:AkzENv6s@localhost:5984/weinshop',{ajax: {timeout: 180000}});
var app = express();
var server = require('http').createServer(app);
//var server=http.createServer(app);
var path = require('path');
var process = require("process");
var io = require('socket.io')(server);
var port = process.env.PORT || 3004;
var fs = require('fs');
var paypal_api = require('paypal-rest-sdk');
server.listen(3004, function() {
	console.log('online-weinshop-AppServer listening at port %d', port);
});
var id;
var uuid = require('uuid');
var nodemailer = require('nodemailer');
var csvConverter=require("csvtojson").Converter;


var filemon = require('filemonitor');


/*app.get('/', function(req, res) {
    res.sendFile('shop.html');
});
*/
app.use(express.static(__dirname));

//app.use(express.static(__dirname, {index: 'shop.html'}));
//var customer = "EVT";
var baseDir = "/var/www/online-keller.herrenmuehle-wein.de/import";
var moveTo = "/var/www/online-keller.herrenmuehle-wein.de/import/eingelesen"




var onFileEvent = function (ev) {
  console.log("File " + ev.filename + " triggered event " + ev.eventId + " on " + ev.timestamp.toString());
 }

var onFileMove = function (ev) {
  console.log("File " + ev.filename + " was modified  on " + ev.timestamp.toString());
  deleteAllDocs();
  processFile(ev.filename);
  /*
  processFile(fromPath);
  if (file) moveFile(fromPath, file);
  */
}

var options = {
  recursive: true,
  target: "/var/www/online-keller.herrenmuehle-wein.de/import/",
  listeners: {
   // all_events: onFileEvent,
    modify: onFileMove
  }
}
//console.log('watch:',options);
filemon.watch(options);
createVouchers();
var grep = function(items, callback) {
		//console.log('grep',items);
		var filtered = [],
			len = items.length,
			i = 0;
		for (i; i < len; i++) {
			var item = items[i];
			var cond = callback(item);
			if (cond) {
				filtered.push(item);
			}
		}

		return filtered;
	};







function deleteAllDocs(){
	console.log('deleteDocs');
	db.query('public/byType',{include_docs:true}).then(function(result){

		console.log('result-length',result.length);

		var _collection= result.rows.map(function(row) {
		//if(row.doc.einspeisung){
		    // Dates are not automatically converted from a string.
		   // row.doc.Date = new Date(row.doc.Date);
		// delete row.doc.einspeisung;
		 // }
		row.doc._deleted=true;
		   //console.log('row.doc 0',row);
		   //new Date(doc.logdatetime).toLocaleString();
		    return row.doc;
		});

		console.log('_collection 0',_collection[0]);

		db.bulkDocs(_collection, function(err, response) {
		  if (err) { return console.log('db.bulkdoc.err',err); }
		  // handle result
		  console.log('result',response);
		});

	})

}
function deleteinvalidvouchers(){
	console.log('deleteDocs');
	db.query('public/invalidVouchers',{include_docs:true}).then(function(result){

		console.log('result-length',result.length);

		var _collection= result.rows.map(function(row) {
		//if(row.doc.einspeisung){
		    // Dates are not automatically converted from a string.
		   // row.doc.Date = new Date(row.doc.Date);
		// delete row.doc.einspeisung;
		 // }
		row.doc._deleted=true;
		   //console.log('row.doc 0',row);
		   //new Date(doc.logdatetime).toLocaleString();
		    return row.doc;
		});

		console.log('_collection 0',_collection[0]);

		db.bulkDocs(_collection, function(err, response) {
		  if (err) { return console.log('db.bulkdoc.err',err); }
		  // handle result
		  console.log('result',response);
		});

	})

}

//console.log(io)

function makePayPalPayment() {




var config_opts = {
    'host': 'api.sandbox.paypal.com',
    'port': '',
    'client_id': 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM',
    'client_secret': 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM'
};


var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http:\/\/localhost\/test\/rest\/rest-api-sdk-php\/sample\/payments\/ExecutePayment.php?success=true",
        "cancel_url": "http:\/\/localhost\/test\/rest\/rest-api-sdk-php\/sample\/payments\/ExecutePayment.php?success=false"
    },
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "1.00"
        },
        "description": "This is the payment description."
    }]
};


paypal_api.payment.create(create_payment_json, config_opts, function (err, res) {
    if (err) {
        throw err;
    }

    if (res) {
        console.log("Create Payment Response");
        console.log(res);
    }
});

}
function processFile(fromPath) {
	var doclist=[];
	var converter = new csvConverter({
		delimiter: ","
	});
	var options = {
		delimiter: ','
	}
//	console.log('processFile', fromPath);

	var goodItems=[];
	var a;
	var b;
	var c;
	var d,e,f,g,h,i,j,k,l;

	//console.log('filename',filename);
	var stream = fs.createReadStream(fromPath).pipe(converter);
	stream.on("end_parsed", function(jsonObj) {
	//	console.log('end_parsed', jsonObj.length); //here is your result json object
		stream.unpipe();

	})

	function currencyFormat (num) {
		num=parseFloat( num )
	    num = num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
	    return Number(num)
	}

	function currencyFormatDE (num) {

	num=parseFloat( num )
	    return num
	       .toFixed(2) // always two decimal digits
	       .replace(".", ",") // replace decimal point character with ,
	       .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")// + " €" // use . as a separator
	}
	//record_parsed will be emitted each time a row has been parsed.
	stream.on("record_parsed", function(resultRow, rawRow, rowIndex) {

		if(rowIndex==0) {
		var colnames=resultRow;
			a=Object.keys(colnames)[0];
			b=Object.keys(colnames)[1];
			c=Object.keys(colnames)[2];
			d=Object.keys(colnames)[3];
			e=Object.keys(colnames)[4];
			f=Object.keys(colnames)[5];
			g=Object.keys(colnames)[6];
			h=Object.keys(colnames)[7];
			i=Object.keys(colnames)[8];
			j=Object.keys(colnames)[9];
			k=Object.keys(colnames)[10];
			l=Object.keys(colnames)[11];
		} else{
			//console.log(rowIndex,resultRow);

			var doc={};
			doc._id=uuid.v4();
			doc[a]=resultRow[a];
			if(resultRow[b] === 0) {
					doc[b]=' ';
			} else {
					doc[b]=resultRow[b];
			}

			doc[c]=resultRow[c];
			var price=resultRow[d];
			console.log('price',price,typeof(price),'year',doc[b])
			doc[d]=currencyFormat(price);
			doc[e]=resultRow[e];
			doc[f]=resultRow[f];
			doc[h]=resultRow[h];
			doc[i]=resultRow[i];
			doc[j]=resultRow[j];
			doc[k]=resultRow[k];
			doc[l]={};
			doc[l].value=resultRow[l];
			doc.created=new Date();
			doc.type='product';
			//console.log(doc);
			db.put(doc).then(function (res) {

				//console.log('result',res)
				}).catch(function(err) {
				console.log(' put err:',err)

			})
		}
	});
 return true;
}

function replaceAll(str, find, repl) {
	if(isNumeric(str)){
		var isnum=true;
		str=str.toString();
	}
	//console.log(str,find,repl);
	if(isnum) {
		str=str.toString();
		return Number(str.replace(new RegExp(find, 'g'), repl));
	} else {
		return Number(str.replace(new RegExp(find, 'g'), repl));
	}
}


function isNumeric(n){
  return (typeof n == "number" && !isNaN(n));
}
//if (etsuser) console.log('etsuser:',etsuser);
//console.log(uuid.v4());
//schedule('getData()',60000);
var nsp = io.of('/vino.app');
nsp.on('connection', function(socket) {
	var payload;
	console.log('nsp: vino.app: connection made')
	var ispublic = true;
	//console.log(socket)
	socket.on('admin', function(data) {
		console.log(socket);
		console.log('admin', data);

	})
	socket.on('getusername',function (data) {
		console.log('getusername-data',data);

		db.query('public/customers',{key:data,include_docs:true,descending:true}).then(function(result){
			if(result.rows.length===1) {
				var doc=result.rows[0].doc;
				socket.emit('gotuser',[doc.firstname,doc.lastname,doc.allowaddressusage]);
				console.log('gotusername-doc',doc);
			} else {
				socket.emit('gotuser',['','',false])
			}
		})

		//socket.emit('gotuser',['Pitt','de Waard',true])

	})

	socket.on('getuseraddress',function (data) {
		console.log('gotuseraddress-data',data);

		//console.log('getusername-data',data);

		db.query('public/customers',{key:data,include_docs:true,descending:true}).then(function(result){
			if(result.rows.length===1) {
				var doc=result.rows[0].doc;
				socket.emit('gotuseraddress',[doc.street,doc.zipcode,doc.city,doc.delivery]);
				console.log('gotuseraddress-doc',doc);
			} else {
				socket.emit('gotuser',['','',false])
			}
		})
		//socket.emit('gotuseraddress',['Schwatzwaldstr. 43',79238,'Ehrenstetten','dhl'])

	})
	socket.on('submitorder',function (data) {
		//console.log('submitorder',data);
		var userdata=data[0];
		var order={};
		order.type="order";

		console.log('user:',userdata);
		var obj=data[1];
		order.customer=userdata;
		//console.log('obj:',obj);
		var orders=[];
		obj.forEach(function(entry, index) {
			//var entry = JSON.parse(json);
			//console.log(json,entry);

			var curorder={};
			curorder.Bezeichnung=entry.Bezeichnung;
			curorder.Jahrgang=entry.Jahrgang;
			curorder.preis=entry.preis;
			curorder.menge=entry.menge.value;
			curorder.owner=entry.owner;
			orders.push(curorder);
			console.log(entry.Bezeichnung,entry.Jahrgang,entry.preis,entry.menge.value,entry.owner)
		})
		order._id = uuid.v4();
		order.orders=orders;
		order.orderdate=new Date();
		order.status='neu';
		db.put(order).then(function(result) {
			console.log('saveorder', result);
			var link="Bestellung:\n"+'https://online-keller.herrenmuehle-wein.de/orders.html?'+order._id+'\n\n';
			//link +="Bestellung:\n\n\n"+order;
			putMail(order,userdata.useremail,userdata.firstname+ ' ' +userdata.lastname,link)
		}).
			catch (function(err) {
				console.log('saveorder-error', err);
		})
		socket.emit('ordersubmited',true);

	})
	socket.on('contactmail',function(data){
		console.log('contactmail',data);
		//console.log('contactmail',data.name);
		putMail(data.message,data.email,data.name,'');
		socket.emit('gotcontactmail','vielen Dank, Ihre Email wurde versendet...')
	})
	socket.on('locationservice', function(data) {
		//	console.log('locationservice:', JSON.stringify(data[2]));
		var locdoc = {};
		locdoc.Owner = data[0];
		locdoc.dspOwner = replaceAll(locdoc.Owner, ' ', '+'); // locdoc.Owner.replace(/' '/g, '+'); // replace(/abc/g, '');
		locdoc.timestamp = data[1];
		locdoc.lat = data[2].lat;
		locdoc.lon = data[2].lon;
		locdoc.acc = data[2].acc;
		locdoc._id = uuid.v4();
		//	console.log(locdoc);
		geocoder.reverse({
			lat: locdoc.lat,
			lon: locdoc.lon
		}).then(function(res) {
			//console.log(res[0].formattedAddress, res[0].zipcode,res[0]);
			var y = (res[0].zipcode == undefined ? "" : res[0].zipcode);
			locdoc.zipcode = y;
			y = (res[0].streetNumber == undefined ? "" : res[0].streetNumber);
			locdoc.streetNumber = y; //res[0].streetNumber;
			y = (res[0].streetName == "Unnamed Road" ? "" : res[0].streetName);
			locdoc.streetName = y; //res[0].streetName;
			locdoc.city = res[0].city;
			locdoc.country = res[0].country;
			locdoc.countryCode = res[0].countryCode;
			locationdb.put(locdoc).then(function(result) {

			}).
			catch (function(err) {
				console.log('locationservice-error', err)
			})
		}).
		catch (function(err) {
			console.log(err);
		});

	})
	socket.on('message', function(data) {
		//console.log('message',data)
		var mesg = data[2];
		if (mesg === 'logon') {
			db.get('onlineusers').then(function(doc) {
				var rev;

				rev = doc._rev;
				console.log('logon', doc._id, rev);
				doc.userlist.push(data[0]);
				return db.put(doc);
			}).then(function(response) {
				db.get('onlineusers').then(function(doc) {
					//	console.log('then',doc._id);
					//doc._deleted = true;
					//return db.put(doc);
				}).then(function(result) {
					// handle result
				}).
				catch (function(err) {
					if (err.status == 409) {

					} else {

						console.log('onlineusersupdate 1', err)
					};
				});
			}).
			catch (function(err) {
				var tmpdoc = {};
				tmpdoc._id = 'onlineusers';
				tmpdoc.userlist = [];
				tmpdoc.userlist.push(data[0]);
				tmpdoc._rev = rev;
				db.put(tmpdoc);
				console.log('onlineusersupdate 2', err);
			});

		} else if (mesg === 'logoff') {
			//remove me from list...
			db.get('onlineusers').then(function(doc) {
				console.log('logoff', doc._id);
				var tmpuser = doc.userlist;
				var users = grep(tmpuser, function(user) {
					//	console.log('user:',user)
					if (user != data[0]) return true;
				});
				//  console.log('users:',users);
				doc.userlist = users;
				return db.put(doc);
			}).then(function(response) {


			}).
			catch (function(err) {


			})
		} else {

			var to = data[1];
			var from = data[0];
			if (data[3]) {
				var isAdmin = data[3]
			} else(isAdmin = false)
			//console.log(from,mesg,to);
			//console.log('recieved message from',
			//		from, 'mesg', JSON.stringify(mesg),'to',to);
			if (to === 'alle User') {
				ispublic = true
			} else {
				ispublic = false
			}
			//broadcast
			//	console.log('broadcasting message');
			console.log('payload is', mesg);
			var curtime = new Date();
			var locdoc = {};
			locdoc.Owner = from;
			locdoc.timestamp = curtime;
			locdoc.source = from;
			locdoc.payload = mesg;
			locdoc.isAdmin = isAdmin;
			locdoc.public = ispublic;
			locdoc._id = uuid.v4();
			chatdb.put(locdoc).then(function(result) {

			}).
			catch (function(err) {
				console.log('chatlogger-error', err)
			})


			io.sockets.emit('broadcast', {
				to: to,
				payload: mesg,
				source: from,
				public: ispublic,
				isAdmin: isAdmin,
				timestamp: curtime
			});
			console.log('broadcast complete');



		}

	});

	socket.on('voucherCheck', function(data) {
		console.log('message', data);
		db.query('public/vouchers',{key:Number(data[1]),include_docs:true,descending:true}).then(function(result){
			if(result.rows.length===1) {
				var doc=result.rows[0].doc;
				doc.usedby=data[0];
				db.put(doc).then(function (res) {

					  	//console.log('result',res)
					  	}).catch(function(err) {
					  	console.log(' put err:',err)

					  })
				socket.emit('answer', true);
				console.log('check-result',result.rows[0].doc);
			} else {
				console.log('check-result','code not found');
				socket.emit('answer', false);
				createVouchers()
				//to bad :-
			}
		})
		//socket.emit('answer', true);
		//$scope.user.voucherchecked=true;


	});
	socket.on('test', function(data) {
		socket.emit('answer', 'ok');
	})

	socket.on('getStock', function(data) {
		console.log('getStock request:',data);

	})

	socket.on('getUserData', function(data) {
		console.log('getUserData request:',data);

	})

});

function createVouchers() {
	var lastdoc=getLastDoc('public/vouchers');
	deleteinvalidvouchers();
	console.log('lastdoc',lastdoc)
	console.log('createVouchers');


}
function getLastDoc(designname) {
	var querystr={reduce:false,limit:1,descending:true};
	//db.query('public/vouchers',{include_docs:true}).then(function(result){
		db.query(designname, querystr)
		  .then(function(docs) {
		  	console.log('getLastDoc',docs)
			 var low = docs.rows[0].value.code;
			 db.query('public/vouchers',{include_docs:true}).then(function(result){
			 	var _collection=[];
			 	if(result.rows.length < 16 ) {
			 	console.log('num vouchers:',result.rows.length);

			 	console.log('highest:',low);
			 	for (var i = 1; i < 16; i++) {
			 	  // console.log('i',i);
			 	   var doc={};
			 	   doc._id=uuid.v4();
			 	   doc.valid=28;
			 	   doc.created=new Date();
			 	   doc.type='voucher';
			 	   doc.code=low + i;
			 		console.log(doc);
				 	db.put(doc).then(function (res) {

				 	  	//console.log('result',res)
				 	  	}).catch(function(err) {
				 	  	console.log(' put err:',err)

				 	  })

				 	}

			 	}

			 })



	})

}

function putMail(order,name,from,link) {
	var mailbody ='-----------------------\n\n';
	mailbody +='Name:\t\t\t' + order.customer.firstname + " " + order.customer.lastname+'\n\n';
	mailbody +='Straße:\t\t\t' + order.customer.streetaddress+'\n\n';
	mailbody +='Ort:\t\t\t' + order.customer.zipcode + " " + order.customer.city+'\n\n';

	mailbody +='Lieferung:\t\t' + order.customer.delivery+'\n\n';
	mailbody +='Zahlung:\t\t\t' + order.customer.payment+'\n\n';
	if(order.customer.payment=="bar"){

	} else if(order.customer.payment=="paypal") {
		mailbody +='Paypal:\t\t' + 'order.ppinfo'+'\n\n';

	} else if(order.customer.payment=="nachname") {
		mailbody +='Paypal:\t\t' + 'order.dhl-info'+'\n\n';

	}
	mailbody +='\n\n';

	order.orders.forEach(function(entry, index) {
		mailbody +='--------------\n\n';
		mailbody +='Was:\t\t\t' + entry.Bezeichnung+'\n\n';
		mailbody +='Jahr:\t\t\t' + entry.Jahrgang+'\n\n';
		mailbody +='Anzahl:\t\t' + entry.menge+'\n\n';
		mailbody +='Preis:\t\t' + entry.preis+'\n\n';
		mailbody +='Wer:\t\t\t' + entry.owner+'\n\n';
	})
	mailbody +='\n\n';
	mailbody +='Status:\t\t\t' + order.status+'\n\n\n\n';
	mailbody +='-----------------------\n\n';


	var smtpOptions = {
	    host: 'mail.dewaard.de',
	    port: 25,
	    secure: false, /*, // use SSL
	    auth: {
	        user: 'user@gmail.com',
	        pass: 'pass'
	    }
	    */
	    logger:true,
	    debug:true
	 }   	// Create a SMTP transporter object
	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	        user: 'pietervanderdijk@gmail.com',
	        pass: 'ereamepdw'
	    },
	    logger: false, // log to console
	    debug: false // include SMTP traffic in the logs
	}, {
	    // default message fields

	    // sender info
	    from: from,
	    //headers: {
	     //   'X-eEnergie-filename': fromPath // just an example header, no need to use this
	    //}
	});
	//var transporter = nodemailer.createTransport(smtpOptions,{from:from})
	if(link=='') {
		var subj='herrenmühle-contact email';
		var txt= 'Name:'+name+'\n'+from +'\n\n'+'Text:'+'\n\n'+mailbody;

	} else {
		var subj='herrenmühle-wein bestellung von ' + from;
		var txt='\n\n' + link +'\n\n'+mailbody;
	}

	var mailData = {

	    to: 'pdw@syccess.de',
	    subject: subj,
	    text:txt /*,
	    html: '<input type="text" value="'+mailbody+'"/>'
	    */
	};
	console.log('Sending Mail');
	transporter.sendMail(mailData, function (error, info) {
	    if (error) {
	        console.log('Error occurred');
	        console.log(error.message);
	        return;
	    }
	    console.log('Message sent successfully!');
	    console.log('Server responded with "%s"', info.response);
	});



}
function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function strLeft(str, char){
	var n=str.indexOf(char)
	if (n <= 0)
	    return "";
	else if (n > String(str).length)
	    return str;
	else
	    return String(str).substring(0,n);
}
function strRightBack(stringValue,seperator)    {
    var pos=stringValue.lastIndexOf(seperator);
    var result=stringValue.substring(pos+1,stringValue.length)
    return result;
}
function moveFile(fromPath, file) {
	var toPath = path.join(moveTo, file);

	if (file == 'done') return;
	fs.stat(fromPath, function(error, stat) {
		if (error) {
			console.error("Error stating file.", error);
			return;
		}

		if (stat.isFile()) {
			console.log("'%s' is a file.", fromPath);


		}
		else if (stat.isDirectory()) {
			console.log("'%s' is a directory.", fromPath);
		}
		console.log('move from: ', fromPath, ' to ', toPath);
		fs.rename(fromPath, toPath, function(error) {
			if (error) {
				console.error("File moving error.", error);
			} else {
				console.log("Moved file '%s' to '%s'.", fromPath, toPath);
			}
		});

	});
}


var now = new Date();
var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0, 0) - now;
if (millisTill10 < 0) {
     millisTill10 += 86400000; // it's after 10am, try 10am tomorrow.
}
setTimeout(function(){
	console.log("It's 3am!");
	//getDirs(baseDir);
}, millisTill10);
