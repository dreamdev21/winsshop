

(function() {

    angular.module('starter').factory('DataService', ['$q', DataService]);
	//localStorage.debug = 'nothing please';
    function DataService($q) {
    	var _db; 
        var _collection;
		var _remote;
		var _dbname;
		var _arguments;
        return {
            initDB: initDB,

            getAllDocuments: getAllDocuments,
            getFirstDoc:getFirstDoc,
            getLastDoc:getLastDoc,
            addDocument: addDocument,
            updateDocument: updateDocument,
            deleteDocument: deleteDocument,
            getDocumentById: getDocumentById,
            getAllDocumentsByKey:getAllDocumentsByKey
          };
		//		getAllDocumentsByKey:getAllDocumentsByKey
		
        function initDB(remote,dbname,srv) {
        	_remote = remote;
            // Creates the database or opens if it already exists
            if(_remote){
            	_dbname='https://'+srv+dbname;
            	//console.log(_dbname);
            	//console.log('initDB:', remote,dbname,srv);
            	
            	_db= new PouchDB(_dbname, {
            	    skipSetup: true
            	});
            	/*
            	_db= new PouchDB('http://ets.dewaard.de/couch/Documents', {
            	    skipSetup: true
            	});
            	 */
            	
            } else {
            	_db = new PouchDB(dbname);//, {adapter: 'websql'});
            }
            
            
        };
		
		function getDocumentById(unid){
			return $q.when(_db.get(unid))
			    .then(function(doc) {
			    	if(doc) {
			    		return doc;
			    	} else {
			    		return '';
			    	}
			    
			 })
		    return $q.when(_db.get(unid));
		}
        function addDocument(curDoc) {
            return $q.when(_db.post(curDoc));
        };

        function updateDocument(curDoc) {
            return $q.when(_db.put(curDoc));
        };

        function deleteDocument(curDoc) {
            return $q.when(_db.remove(curDoc));
        };
		function getAllDocumentsByKey(designname,forcereload,descendig,start,end, limitto,key) {
			_arguments = arguments;
			//console.log(JSON.parse(JSON.stringify(_arguments)));
		  if(forcereload) {};
			 if (!_collection || forcereload) {
			 	// recreate the querystr
			 		var querystr={};
			 		if(!descendig){querystr.descending=false} else {querystr.descending=true};
			 		if(key){querystr.key=key};
			 		if(limitto){querystr.limit=limitto};
			 		if(start){
			 			if(angular.isArray(start)) {
			 				querystr.reduce=true;
			 				//querystr.group=true;
			 				querystr.group_level=start.length;
			 			} else {
			 				
			 			}
			 			
			 			querystr.startkey=start;
			 		};
			 		
			 		if(end){
			 				if(angular.isArray(end)) {
			 					//querystr.reduce=true;
			 				//	querystr.group=true;
			 					//querystr.group_level=end.length;
			 				} else {
			 					
			 				}
			 				
			 				querystr.endkey=end;
			 			} else {
			 			querystr.include_docs=true;
			 			};
			 		
			 		//if(end){querystr.end_key=end};
			 		
			 		console.log('designname:',designname,'query:',querystr);
			 		
			 		
			 		
			 		
			      return $q.when(_db.query(designname, querystr))
                      .then(function(docs) {
				//db.query('mss/materiallistByAtwrt', {include_docs : true})
                        // Each row has a .doc object and we just want to send an 
                        // array of curDoc objects back to the calling controller,
                        // so let's map the array to contain just the .doc objects.
                        _collection= docs.rows.map(function(row) {
                            // Dates are not automatically converted from a string.
                           // row.doc.Date = new Date(row.doc.Date);
                           if(row.value.x) {
                           	row.value.Date = new Date(row.x).toLocaleString();
                           }
                           //new Date(doc.logdatetime).toLocaleString();
                            return row.value;
                        });

                        // Listen for changes on the database.
                        // trouble if remote db with CORS ?? no!
                        	
                      //		_db.changes({ live: true, since: 'now', include_docs: true})
                      //  .on('change', onDatabaseChange);
					//console.log(_collection);			
                  	return _collection;
			      });
            } else {
                // Return cached data as a promise
                return $q.when(_collection);
            }
			
		}
		
		function getFirstDoc(designname) {
			//console.log(designname);
			var querystr={reduce:false,limit:1,descending:false,include_docs:true};
			//console.log(querystr);
			return $q.when(_db.query(designname, querystr))
              .then(function(docs) {
				 return docs.rows[0].doc;
               
			}) //lkpview + "?" + "reduce=false&limit=1" + "&include_docs=true&descending=false"
			console.log('???')
		}
		
		function getLastDoc(designname) {
			var querystr={reduce:false,limit:1,descending:true};
				return $q.when(_db.query(designname, querystr))
				  .then(function(docs) {
					 return docs.rows[0].value;
				   
				
			})
			console.log('???')
		}
		function getDocumentByKey(designname,key) {
		
		
		}
        function getAllDocuments(forcereload) {

            if (!_collection || forcereload) {
                return $q.when(_db.allDocs({ include_docs: true}))
                          .then(function(docs) {

                            // Each row has a .doc object and we just want to send an 
                            // array of curDoc objects back to the calling controller,
                            // so let's map the array to contain just the .doc objects.
                            _collection= docs.rows.map(function(row) {
                                // Dates are not automatically converted from a string.
                                row.doc.Date = new Date(row.doc.Date);
                                return row.doc;
                            });

                            // Listen for changes on the database.
                            // trouble if remote db with CORS ??
                            	
                          //		_db.changes({ live: true, since: 'now', include_docs: true})
                          //   .on('change', onDatabaseChange);
							// not at allDocs()		
                           return _collection.filter(inNotInternal);
                         });
            } else {
                // Return cached data as a promise
                return $q.when(_collection);
            }
        };

        function onDatabaseChange(change) {
        	console.log('changeHandler:',change, _collection.length)
            var index = findIndex(_collection, change.id);
            var curDoc = _collection[index];

            if (change.deleted) {
                if (curDoc) {
                    _collection.splice(index, 1); // delete
                }
            } else {
                if (curDoc && curDoc._id === change.id) {
                    _collection[index] = change.doc; // update
                } else {
                    _collection.splice(index, 0, change.doc) // insert
                }
            }
        }
        
        function findIndex(array, id) {
          var low = 0, high = array.length, mid;
          console.log('findIndex',id);
          while (low < high) {
            mid = (low + high) >>> 1;
            array[mid]._id < id ? low = mid + 1 : high = mid
          }
          return low;
        }
        
        function inNotInternal(value) {
          return value._id.slice(0, 1) != '_';
        }
       
       
        
      //  function stringStartsWith (string, prefix) {
      //      return string.slice(0, prefix.length) == prefix;
      //  }
    }
})();
