/**
 */

'use strict';

var localdb;
var db;
var userdoc;
var curuser;
//var localdb = new PouchDB('mss', {adapter: 'websql'});

app.factory('websocket', [ '$rootScope', function ($rootScope) {
  'use strict';
  localStorage.debug = 'socket*'
 	var socket = io.connect('https://online-keller.herrenmuehle-wein.de/vino.app');

  return {


  	 emit: function (event, data, callback) {

  	 	if(socket.disconnected) {socket.connect()}
  	 	socket.emit(event, data, function () {
  	 		var args = arguments;
  	 		 $rootScope.$apply(function () {
  	 		 	if (callback) {
  	 		 	   callback.apply(null, args);
  	 		 	}
  	 		 })
  	 	})
  	 },
     on: function (event, callback) {
       socket.on(event, function () {
         var args = arguments;
         $rootScope.$apply(function () {
           callback.apply(null, args);
         });
       });
     },
     off: function (event, callback) {
           socket.removeListener(event, callback);
     },
     down: function () {
           socket.disconnect();
     }
   };
}]);


if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};
/*
angular.module('starter')
.config(function($stateProvider, $urlRouterProvider) {

// Menu definitions here
  $stateProvider

  .state('bestellungen', {
      url: '/bestellungen',

          templateUrl: 'orders.html',
          controller: 'OrderController',
          controllerAs : 'order'
    })


  $urlRouterProvider.otherwise('shop');
});
*/

angular.module('starter').config(['$locationProvider', function($locationProvider){
    //$locationProvider.html5Mode(true);
}]);
angular.module('starter').controller('OrderController', ['$rootScope','$scope', '$interval','DataService' , '$ionicPlatform','websocket','$window',function($rootScope,$scope, $interval,dataService,$ionicPlatform,websocket,$window) {
		$scope.filters = ["formatPrice","formatPrice:3","displayprice", 'currency:"€ "','formatPriceEuro'];
		var orderid=$window.location.search.replace('?','');
		console.log(orderid);

		// Initialize the database.
		$ionicPlatform.ready(function() {
			console.log('orders ready')
			dataService.initDB(true,'weinshop','online-keller.herrenmuehle-wein.de/couch/');

			dataService.getAllDocumentsByKey('public/orders',true,false,undefined,undefined,undefined,undefined).then(function(result) {
					console.log(result);
					$rootScope.allebestellungen = result;
					//remaining=vm.allemessungen.length;

			}).catch(function(err) {
				console.log('dataService',err);
			});

			dataService.getDocumentById(orderid).then(function(result){
				$scope.currOrder=result;
				console.log(result);
				if($scope.currOrder.customer) {

					$('#currOrder').modal('show');
				}

			})
		});

		console.log('orders base');
		$scope.user={};
		$scope.user.lastname="";
		//$scope.user.name="";
		$scope.contact={};
		//$scope.currOrder=[];
		//$scope.myOrder.delivery='';
		/*
		$scope.payment="";
		var currOrder=$scope.currOrder;
		currOrder.total=0;

		currOrder.ship=0;
		currOrder.sum=0;
		currOrder.items=0;
		*/
		$scope.openModal=function (id) {
			console.log('openModal:',id);
			dataService.getDocumentById(id).then(function(result){
				$scope.currOrder=result;
				console.log(result);
				if($scope.currOrder.customer) {

					$('#currOrder').modal('show');
				}

			})

		}
		$scope.getAllOrders=function () {

			dataService.getAllDocumentsByKey('public/orders',true,false,undefined,undefined,undefined,undefined).then(function(result) {
					//console.log(result);
					$rootScope.allebestellungen = result;
					//remaining=vm.allemessungen.length;

			}).catch(function(err) {
				console.log('dataService',err);
			});

		}
		$scope.deleteItem=function (id) {
			var doc=dataService.getDocumentById(id).then(function(doc){
				dataService.deleteDocument(doc).then(function (result) {
					$scope.showActions = false;
					$scope.getAllOrders();
				});
			});
			//


		}
		$scope.getSum=function (id) {
			var result = $.grep($scope.allebestellungen, function(e){ return e._id == id; });
			//console.log(result);
			var sum=0;
			angular.forEach( result, function(currorder, key) {

				angular.forEach( currorder.orders, function(order, okey) {

					sum +=	order.menge;
				})
			})
			return sum;
		}
		$scope.getTotal=function (id) {
			var result = $.grep($scope.allebestellungen, function(e){ return e._id == id; });
			//console.log(result);
			var sum=0;
			angular.forEach( result, function(currorder, key) {

				angular.forEach( currorder.orders, function(order, okey) {
					//console.log(order.menge,order.preis);
					sum +=	order.menge * order.preis
				})
			})
			return sum;
		}

}])
angular.module('starter').controller('MainController', ['$rootScope','$scope', '$interval','DataService' , '$ionicPlatform','websocket',function($rootScope,$scope, $interval,dataService,$ionicPlatform,websocket) {

			// Initialize the database.
		$ionicPlatform.ready(function() {
			dataService.initDB(true,'weinshop','online-keller.herrenmuehle-wein.de/couch/');

			dataService.getAllDocumentsByKey('public/byType',true,false,undefined,undefined,undefined,undefined).then(function(result) {
					console.log(result);
					$rootScope.alleprodukte = result;
					//remaining=vm.allemessungen.length;

			}).catch(function(err) {
				console.log('dataService',err);
			});

		});
		localdb = new PouchDB('local'); //, {adapter: 'websql'}

		localdb.get('userconfig').then(function (doc) {
		    	    console.log('userconfig:',doc);
		    	    curuser=doc.user;
		    	    userdoc=doc;
		    	    if( userdoc.user != "not set") {
		    	    	$scope.user.useremail = userdoc.user;
		    	    	$scope.getUser();
		    	    }
			  }).catch(function (err) {
			    console.log(err);
			   userdoc={};
			   userdoc.user="not set";
			    //userdoc.token={user:curuser};
			   // userdoc.token.token=uuid2.newguid();
			    //userdoc.token.credentials=$scope.mctrl.password;
			    userdoc._id="userconfig";
			    localdb.put(userdoc).then(function (result) {
			    	console.log('userconfig:', result);
			    	curuser=userdoc.user;
			    })

			  });


	$scope.getAllItems=function () {
		dataService.getAllDocumentsByKey('public/byType',true,false,undefined,undefined,undefined,undefined).then(function(result) {
				console.log(result);
				$rootScope.alleprodukte = result;
				//remaining=vm.allemessungen.length;

		}).catch(function(err) {
			console.log('dataService',err);
		});


	}
	$scope.user={};
	$scope.user.lastname="";
	//$scope.user.name="";
	$scope.contact={};
	$scope.myOrder=[];
	//$scope.myOrder.delivery='';
	$scope.payment="bar";
	var myOrder=$scope.myOrder;
	myOrder.total=0;

	myOrder.ship=0;
	myOrder.sum=0;
	myOrder.items=0;

	$scope.options = [
	  { label: '0', value: 0 },
	  { label: '1', value: 1 },
	  { label: '2', value: 2 },
	  { label: '3', value: 3 },
	  { label: '4', value: 4 },
	  { label: '5', value: 5 },
	  { label: '6', value: 6 },
	  { label: '7', value: 7 },
	  { label: '8', value: 8 },
	  { label: '9', value: 9 },
	  { label: '10', value: 10 },
	  { label: '11', value: 11 },
	  { label: '12', value: 12 },
	  { label: '13', value: 13 },
	  { label: '14', value: 14 },
	  { label: '15', value: 15 },
	  { label: '16', value: 16 },
	  { label: '17', value: 17 },
	  { label: '18', value: 18 }
	];
	$scope.filters = ["formatPrice","formatPrice:3","displayprice", 'currency:"€ "','formatPriceEuro'];

	$scope.getUser=function () {
		if($scope.user.useremail !=undefined){
			console.log($scope.user.useremail);
			if($scope.user.lastname.trim() != '') return;
			websocket.emit("getusername",$scope.user.useremail);
			websocket.on('gotuser', function(data){
				if(data !="not found"){
					if(userdoc.user != $scope.user.useremail) {
					userdoc.user=$scope.user.useremail;
						localdb.put(userdoc).then(function (result) {
							console.log('userconfig:', result);
							curuser=userdoc.user;
						})
					}
					$scope.user.firstname=data[0];
					$scope.user.lastname=data[1];
					if(data[2] == true) {
						websocket.emit("getuseraddress",$scope.user.useremail);
						websocket.on('gotuseraddress', function(data){
						    if(data[3] !="abholung"){
								$scope.user.streetaddress=data[0];
								$scope.user.zipcode=data[1];
								$scope.user.city=data[2];
							}
							var choice=data[3];
							$scope.delivery=data[3];
							$('#dhl').removeClass( "active" );
							// $('#dhl').prop('checked',false);
							 $('#liefern').removeClass( "active" );
							 $('#abholung').removeClass( "active" );
							 if(choice=="dhl") {
							 	 $('#dhl').addClass( "active" );
							 } else if(choice=="liefern") {

							 	 $('#liefern').addClass( "active" );
							 } else if(choice=="abholung") {
							 	 $('#abholung').addClass( "active" );
							 }
							/*
							if(qs_trip_type == 0){
							      $('#rdo_pick').prop('checked',true);
							   }else{
							      $('#rdo_pick').prop('checked',true);
							   }

							*/
							//$('[checked="checked"]').parent().addClass("active");
						})
					}
				}
			})
		}
	}
	$scope.checkVoucherCode=function (vcode) {
		console.log('checking:',vcode);
		websocket.emit('voucherCheck', [$scope.user.useremail,vcode]);
		 websocket.on('answer', function(data){
		 	console.log('check-result:',data);
		 	if(data==true) {$scope.user.voucherchecked=true;} else {
		 		$scope.user.voucherchecked=false;
		 		$scope.vouchercode='';
		 	}
		 })

	}
	$scope.resetBasket=function () {

		$scope.myOrder=[];
		myOrder=$scope.myOrder;
		myOrder.total=0;

		myOrder.ship=0;
		myOrder.sum=0;
		myOrder.items=0;
		$scope.getAllItems();

		$scope.confirmed=false;
		$scope.ordersubmited=false;


	}

	$scope.submitContactMessage=function () {
		var fd=$scope.contact;
		websocket.emit('contactmail',fd);
		websocket.on('gotcontactmail', function(data){

		$("#alert").html(data);

		$("#alert").animate({opacity: '1'}, 0);
		$("#alert").animate({opacity: '0'}, 5500);
		$scope.contact={};
		console.log('gotcontactmail:',data);

		})
	}
	$scope.submitOrder=function () {
		if(!$scope.confirmed) return;
		if($scope.ordersubmited==true) {
			$('#orderbasket').modal('hide');
			$("#alert").html("Ihr Auftrag wurde bereits übertragen...");
			$("#alert").animate({opacity: '1'}, 0);
			$("#alert").animate({opacity: '0'}, 5500);
			return;
		};
		var userdata=$scope.user;
		userdata.delivery=$scope.delivery;
		userdata.payment=$scope.payment;
		websocket.emit('submitorder', [userdata,myOrder]);
		websocket.on('ordersubmited',function (data) {
			if(data==true) {
				$scope.ordersubmited=true;
				$('#orderbasket').modal('hide');
				$("#alert").html("Vielen Dank, Ihr Auftrag wird jetzt bearbeitet...");
			} else {
				$("#alert").html("Bitte überprüfen Sie ihren Auftrag!");
			}
		});


		$("#alert").animate({opacity: '1'}, 0);
		$("#alert").animate({opacity: '0'}, 5500);


	}
	$scope.checkShopBag=function (i) {

		console.log($scope.alleprodukte[i].menge.value +" Fl. " +$scope.alleprodukte[i].Bezeichnung +" "+ $scope.alleprodukte[i].Jahrgang +' in die Weinkiste gelegt...');
		var curProd=$scope.alleprodukte[i];
		var id=curProd._id;
		var menge=curProd.menge.value;
		var result = $.grep(myOrder, function(e){ return e._id == id; });
		if (result.length === 0) {
		  // not found add
		  myOrder.push(curProd);
		} else if (result.length === 1) {

				// console.log("prod found,curAmmount=",menge);
				 result[0].menge.value=menge;
					  // access the foo property using result[0].foo

		  //
		} else {
		  // multiple items found
		}
		myOrder.total=0;
		myOrder.sum=0;
		myOrder.ship=0;
		myOrder.items=0;
		/*angular.forEach( myOrder, function(order, key) {
		 myOrder.total += order.menge.value * order.preis;

		})
		*/
		var tmpOrder = $.grep(myOrder, function(e){ return e.menge.value != 0; });
		angular.forEach( myOrder, function(order, key) {
		 myOrder.sum += order.menge.value * order.preis;
		 myOrder.items +=order.menge.value;

		})

		myOrder.ship=1.75 * myOrder.items;
		myOrder.total=myOrder.ship + myOrder.sum;
		tmpOrder.ship=myOrder.ship;
		tmpOrder.total=myOrder.total;
		tmpOrder.sum=myOrder.sum;
		tmpOrder.items=myOrder.items;
		if($scope.alleprodukte[i].menge.value===0) {
			$("#alert").html("Alle Fl. " +$scope.alleprodukte[i].Bezeichnung +" "+ $scope.alleprodukte[i].Jahrgang +' aus der Weinkiste entnommen...');
		} else {
			$("#alert").html($scope.alleprodukte[i].menge.value +" Fl. " +$scope.alleprodukte[i].Bezeichnung +" "+ $scope.alleprodukte[i].Jahrgang +' in die Weinkiste gelegt...');
		}

		$("#alert").animate({opacity: '1'}, 0);
		$("#alert").animate({opacity: '0'}, 3500);
	//	$("#alert").animate({display: none}, 1000);
		//console.log('tmpOrder:',tmpOrder);

	}


	/*$scope.$watchCollection(
	                    "alleprodukte",
	                    function( newValue, oldValue ) {
	                        console.log(newValue,oldValue);
	                    }
	                );



	$scope.$watch(
	                    "alleprodukte",
	                    function( newValue, oldValue ) {
	                      //  addLogItem( $scope.watchEqualityLog );
	                    	 console.log(newValue,oldValue);
	                    },
	                    true // Object equality (not just reference).
	                );
	                */
	$scope.trustUrl = function(url) {
			console.log(url);
		    return $sce.trustAsResourceUrl(url);
		}

	  $scope.dateOptions = {
	    formatYear: 'yy',
	    startingDay: 1,
	    formatDay: 'dd',
	    formatDayHeader: 'EEE',

	    formatMonth:'MMMM',
	    formatYear:''
	 };

	 // $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];

}])

