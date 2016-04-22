angular.module('app.controllers', ['ionic.utils', 'ngCordova', 'ui.router', 'base64', ])
//login view controller
.controller('logInCtrl', function($scope, $ionicHistory, DownloadAll, $state, $rootScope) {
	$ionicHistory.clearCache();
	$scope.userData = {};
	$rootScope.bool = true;
	$rootScope.clampWarn = false;
	$rootScope.create = false;
	$scope.login = function(){
		var response;
		if(!$scope.userData.username || !$scope.userData.pin){
			alert("Debe entrar un usuario y un numero de pin");
			console.log("No loggin information provided");
		}
		else{
			response = DownloadAll.login($scope.userData.username, $scope.userData.pin);
			//console.log("response: ", response);
			if(response){
			console.log("Logging In Succesfull");
			$state.go('cAAMpusInfraction.cAAMpusInfraction2');
		}else if(!response){
			alert("Usuario o Pin incorrecto");
			console.log("Login Information Incorrect");
		}
		}
		
	}
	

})
   //(1/5) Search for vehicle controller
   .controller('multaNueva14Ctrl', function($state, $scope, $localstorage, $rootScope, $ionicHistory, $ionicPlatform, DownloadAll) {
   	$scope.vehicle = {};
	//searches for vechicle using licence plate number

	$scope.findVehicle = function() {
		var check = $scope.vehicle.plate_number;
		var secondCheck = false;
		if(!check){
			alert("Entre una tablilla!");
		}
		else {
			var plate_number = $scope.vehicle.plate_number;
			console.log('Searching Vehicle with licence plate number: ', plate_number);
			$scope.holdVehicles = $localstorage.getObject('vehicles');
		//searching vehicles:
		for(var i =0; i< $scope.holdVehicles.vehicles.length; i++)
		{
			if($scope.holdVehicles.vehicles[i].licensePlateID == plate_number)
			{
				//console.log("Vehicle Found");
				$rootScope.position = i;
				secondCheck =true;				
			}
		}
		if(!secondCheck){
			console.log("No vehicle found with licence plate: ", plate_number);
			var r = confirm("Tablilla no fue encontrado. Desea registrar el vehiculo?");
			if(r == true){
				$rootScope.position = -1;
				$rootScope.licencePlate = plate_number;
				$state.go('registerVehicle');
				
			}
		}
		if(secondCheck){
			$ionicHistory.clearCache();
			$state.go('multaNueva25');
		}		
	}
};
	

})

   //(1.1/5) Regsiter a new vehicle view controller
 .controller('newVehicleCtrl', function($scope, $state, $rootScope, DownloadAll, $localstorage, $filter) {
 	$scope.date = new Date();
 	$scope.user = DownloadAll.currentUser();
 	console.log("user: ", $scope.user._id);
 	$scope.vehicle = {
 		licensePlateID: $rootScope.licencePlate,
 		make: "",
 		model: "",
 		color: "",
 		creatorID: $scope.user._id,
 		createTime: $scope.date
 	};

 	$scope.edmundsAPI = $localstorage.getObject('edmundsAPI').edmundAPI;
 	
 	$scope.makes = [];
 	$scope.api = [];
 	$scope.models = [];
 	for(var i =0; i < $scope.edmundsAPI.length ; i++){ 		
 		$scope.makes.push($scope.edmundsAPI[i].name);
 		$scope.api.push($scope.edmundsAPI[i]);
  	}
  	
  	//$scope.models = $filter('filter')($scope.api, {name: "Toyota"}, true)[0].models;
  	 //console.log($scope.models);

 	$scope.colors = [
		{name: 'Amarillo'},
		{name: 'Anaranjado'},
		{name: 'Azul'},
		{name: 'Blanco'},
		{name: 'Gris'},
		{name: 'Negro'},
		{name: 'Rojo'},
		{name: 'Verde'},
		{name: 'Violeta'}
	];
	var e = "";
	var m = "";
	var mo = "";
	var selectedColor = "";
	var selectedMake  = "";
	var selectedModel = "";
	//shows list of colors
	 $scope.showSelectValue = function(mySelect) {
	 	console.log("Selected Color: ", mySelect);	
	 	selectedColor = mySelect; 	
	 	e = true;
	 };
	 $scope.refreshModels = function(make) {
	 	selectedMake = make;
	 	m = true;
	 };
	 $scope.selectModel = function(model){
	 	selectedModel = model;
	 	mo = true;
	 };

	 //check input fields are filled. Take user to next step
 	$scope.nextView = function(){
 		if(!mo || !m || !e ){
 			alert("Debe llenar todos los campos");
 		}
 		else{
 			$scope.vehicle.color = selectedColor
 			$scope.vehicle.make = selectedMake
 			$scope.vehicle.model = selectedModel
 			$rootScope.createdVehicle = $scope.vehicle;
 			console.log("New Vehicle is Being Registered: ", $rootScope.createdVehicle);
 			$rootScope.create = true;
 			$state.go('multaNueva35');
 		}
 	}

	
 	$scope.refreshModels = function(make){		
		//$scope.vehicle.model = undefined;
		console.log(String(make));
		var make = make;
		make = make.replace(/^\s+|\s+$/g,'');		
		$scope.models = $filter('filter')($scope.api, {name: make}, true)[0].models;
		
	};




 })
   //(2/5) view vehicle information view
   .controller('multaNueva25Ctrl', function($scope, $rootScope, $localstorage, $ionicPlatform, $rootScope, $ionicModal, $ionicPopup) {
	
	$scope.IncorrectInfoButton = $rootScope.bool;
	$scope.reportedMessage = !$rootScope.bool; 
	$scope.holdVehicles = $localstorage.getObject('vehicles');
	$scope.vehicle = $scope.holdVehicles.vehicles[$rootScope.position];
	console.log("Displaying vehicle information (2/5): ", $scope.vehicle);
	
	$scope.comment = {};
	if($scope.vehicle.infractionCount >= 3 && $scope.vehicle.isRegistered == 0 ){
		$ionicPopup.alert({title: 'Langosta',
   							template: 'Vehiculo No esta registrado y contiene 3 o mas multas. Puede proceder con una langosta si desea'});
		$rootScope.clampWarn = true;
		$scope.clampWarning = $rootScope.clampWarn;
		
	}
	$ionicModal.fromTemplateUrl('templates/informacionIncorrecta.html', {
	scope: $scope
		}).then(function(incorrect_vehicle_info) {
			$scope.incorrect_vehicle_info = incorrect_vehicle_info;
	});
	//show incorrectInfo Popup
	$scope.incorrectInfo = function(){
		$scope.incorrect_vehicle_info.show();		 
	};
	//close incorrectInfo Popup
	$scope.closeCancel = function(){
		$scope.incorrect_vehicle_info.hide();
	};
	//confirm comment inserted for editing
	$scope.confirmReport = function(){
		
		if(!$scope.comment.informacionIncorecto){
			alert("debe entrar un comentario");
		}
		else{
			  $rootScope.incorrectInformationComment = $scope.comment.informacionIncorecto;
			  $rootScope.bool = false;
			  $scope.IncorrectInfoButton = $rootScope.bool;
			  $scope.reportedMessage = !$rootScope.bool; 
			  $scope.incorrect_vehicle_info.hide();
			} 
	};
		

	})
//   (3/5) choose infractions view controller
.controller('multaNueva35Ctrl', function($scope, $rootScope, $state, $localstorage, $ionicPlatform) {	
	$rootScope.infractions = [];
	$scope.clampWarning = $rootScope.clampWarn;
	$scope.hold = $localstorage.getObject('typeInfractions');
	$scope.assets = $scope.hold.violations;
	//console.log("assest: ", $scope.hold.infractions);	
	$scope.isChecked = false;
	$scope.selected = [];
	$scope.id_selected=[];
	$scope.fee=[];

    //function to select type of violations
    $scope.checkedOrNot = function (asset, isChecked, index) {
    	if (isChecked) {        	
    		$scope.selected.push(asset);
    		$scope.id_selected.push(asset._id);
    		$scope.fee.push(asset.fee);
    		console.log("selected Infraction ID: ", $scope.fee.max());
    	} else {
    		var _index = $scope.selected.indexOf(asset);
    		$scope.selected.splice(_index, 1);
    		$scope.id_selected.splice(_index, 1);;
    		$scope.fee.splice(_index, 1);;
            console.log("selected after remove: ", $scope.fee.max());
        } 
        $rootScope.infractions = $scope.selected;
        $rootScope.id_violations = $scope.id_selected;
        $rootScope.fee = $scope.fee.max();
   		console.log("Options inide rootScope: ", $rootScope.infractions);
   	};
    //Function to go to next view
    $scope.nextView = function()
    {		
    	if($rootScope.infractions.length == 0){
    		alert("Debe escoger una infraccion!");
    	}
    	else
    	{
    		$state.go('multaNueva45');
    	}
    };

	Array.prototype.max = function() {
  	return Math.max.apply(null, this);
	};
   
})
// (4/5) take picture and choose zones view controller
.controller('multaNueva45Ctrl', function($ionicHistory, $base64, $state, $scope, $cordovaCamera, $cordovaFile, $ionicSlideBoxDelegate, $rootScope, $localstorage, $ionicPlatform) {
	
	$rootScope.selectedZone;
	$scope.clampWarning = $rootScope.clampWarn;
	$scope.holdzones = $localstorage.getObject('zones');
	var e = "";
	 // console.log("Loading all possible zones: ", $scope.holdzones.zones);	 
	 $scope.zones = $scope.holdzones.zones;	 
	 
	 $scope.showSelectValue = function(mySelect) {
	 	console.log("Selected Zone: ", mySelect);
	 	//console.log("Selected ZoneID: ", id);
	 	$rootScope.selectedZone = mySelect;
	 	//console.log("Saved selected Zone: ", $rootScope.selectedZone);
	 	e = "true";
	 }

	$scope.update = function() {
    console.log($scope.item._id);

  		}


	 $rootScope.images = [];
	 $rootScope.image = [];	
	 // var options = {
	 // 	quality : 50,
	 // 	destinationType: Camera.DestinationType.DATA_URL,      
	 // 	encodingType: Camera.EncodingType.JPEG,
	 // 	targetWidth: 120,
	 // 	targetHeight: 120,
	 // 	correctOrientation: true,
	 // 	saveToPhotoAlbum: true
	 // };
    //gives access to system camera. Allows up to three pictures to be taken
    $scope.takePicture = function(){
    	  document.addEventListener("deviceready", function () {

    var options = {
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 900,
      targetHeight: 1000,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
	  correctOrientation:true
    }; 

    	if($rootScope.images.length <= 2){   
    		$cordovaCamera.getPicture(options).then(function(data){				
				
				//console.log(data);
				var i = $base64.decode(data);
				//console.log(i);
				
				$rootScope.images.push(data);
				$ionicSlideBoxDelegate.update();
				console.log("image array: ", $rootScope.images);
			}, function(error){
				//console.log('Camera error: ' + angular.toJson(error));
			});
    	}

    	else{
    		alert("Solo se puede un maximo de tres fotos!");
    	}

    });
}



    $scope.comment = {};
    $scope.nextView = function()
    {		
    	if(e.length == 0){
    		alert("Debe escoger una Zona!");
    	}
    	else
    	{
    		$ionicHistory.clearCache();
    		$rootScope.main_comment = $scope.comment.main;
    		$state.go('multaNueva55');
    	}
    };

   


})
//(5/5) View Infraction Summary
.controller('multaNueva55Ctrl', function($state, $scope, $ionicHistory, $localstorage, $rootScope, $ionicSlideBoxDelegate, DownloadAll, $ionicPlatform) {
	$scope.selectedZone = $rootScope.selectedZone;
	$scope.holdVehicles = $localstorage.getObject('vehicles');
	$scope.vehicle = {};
	$scope.clampWarning = $rootScope.clampWarn;
	//console.log("position: ", $rootScope.position);
	if($rootScope.position == -1){
		$scope.vehicle = $rootScope.createdVehicle;
		console.log("created vehcile: ", $scope.vehicle)
	}
	else{
		$scope.vehicle = $scope.holdVehicles.vehicles[$rootScope.position];
	}	
	$scope.date = new Date();	
	$scope.infrac = $rootScope.infractions;
	$scope.id_violations = $rootScope.id_violations;
	$scope.images = $rootScope.images;
	$scope.image = $rootScope.image;
	$ionicSlideBoxDelegate.update();
	$scope.mainComment = $rootScope.main_comment;
	$scope.officer = DownloadAll.currentUser();
	var incorrectVehicleInfo =  $rootScope.incorrectInformationComment;
	//console.log("officer name: ", $scope.officer);
	var ZoneID = $scope.selectedZone.substring(0,2);
	var n = $scope.officer.firstName.substring(0,3);
	var date = new Date();
	var month = ""+date.getMonth();	
	var dates = ""+date.getDate();
	var min =""+date.getMinutes();
	var hour = ""+date.getHours();
	var sec =""+date.getSeconds(); 
	$scope._id = n.concat(month,dates, hour,min,sec);
	//create infraction Object
	var highestViolation = "";
	console.log($scope.infrac.length, $scope.infrac, $rootScope.fee);
	for(var i =0; i<$scope.infrac.length ; i++){
		if($scope.infrac[i].fee == $rootScope.fee){
			highestViolation = $scope.infrac[i]._id;
		}
	}
	console.log("como se crea un vehiculo nuevo?");
	var infraction = {
		infractionNumber: $scope._id,
		officerID: $scope.officer._id,		
		vehicle: $scope.vehicle,
		infractionStatusID: 6,
		zoneID: ZoneID, //verify!!!!!!!!!!!!!!!!!!!!!!
		feeAmount: $rootScope.fee,
		licensePlateID: $scope.vehicle.licensePlateID,
		highestViolation:highestViolation,
		isCancelled: false,
		main_comment: $scope.mainComment, 
		delete_comment: "",
		incorrectInfoComment: incorrectVehicleInfo,		
		creatorID: $scope.officer._id,
		createTime: $scope.date,
		citationDate: $scope.date ,
		uploadTime: $scope.date ,
		zone: $scope.selectedZone,
		violations_name: $scope.infrac,
		violations: $scope.id_violations,
		images: $scope.images,				
		officer: $scope.officer.firstName 		
	};	

// 	var monthNames = [
//   "January", "February", "March",
//   "April", "May", "June", "July",
//   "August", "September", "October",
//   "November", "December"
// ];

// var date = new Date();
// var day = date.getDate();
// var monthIndex = date.getMonth();
// var year = date.getFullYear();
// console.log(day, monthNames[monthIndex], year);
	
	//Submits New Infraction
	$scope.submitInfraction = function(){
		$ionicHistory.nextViewOptions({
			disableAnimate: true,
			disableBack: true,
			historyRoot: true

		});	
		$ionicHistory.clearCache();
		$rootScope.position = "";
		$rootScope.infractions = [];
		$rootScope.bool = true;
		$rootScope.clampWarn = false;
		console.log("create car : ", $rootScope.create);
		if($rootScope.create == true){
			var car = $rootScope.createdVehicle;
			DownloadAll.addUnregisteredVehicle(car);
			car = "";
			$rootScope.createdVehicle = "";
			$rootScope.create = false;
		}
		DownloadAll.addInfraction(infraction);
		console.log("Creating New Infraction: ", infraction);
		$state.go('cAAMpusInfraction.multasDeHoy');	
	};

	
})

   //view todays infractions controller
   .controller('multasDeHoyCtrl', function($scope, $localstorage, $state, $ionicPlatform, $ionicHistory, DownloadAll, $ionicPopup) {
   	$ionicHistory.clearHistory();
   	$ionicHistory.clearCache();
   	$scope.fractions = $localstorage.get('Infractions','loadInfractions');
   //	console.log($scope.fractions);
   	$scope.holdInfractions = $localstorage.getObject('Infractions');
   	$scope.infractions = $scope.holdInfractions.loadInfractions;

   	var vehicles = $localstorage.getObject('UnregisteredVehicle').loadVehicle;
   	$scope.userInfraction = [];
   	var User = DownloadAll.currentUser();
   	var officer = User.firstName;
   	if($scope.infractions == null){
   		$ionicPopup.alert({title: '0 multas',
   							template: 'Usted no a dado multas en el dia de hoy'});
   	}
   	else{
   	for(var i=0; i< $scope.infractions.length;i++){
   		if($scope.infractions[i].officer == officer){
   			$scope.userInfraction.push($scope.infractions[i]);
   		}
   	}
   	if($scope.userInfraction.length == 0){
   		$ionicPopup.alert({title: '0 multas',
   							template: 'Usted no a dado multas en el dia de hoy'});
   	}
   }
   	console.log("Current user total Infractions: ", $scope.userInfraction.length);

   	$ionicPlatform.registerBackButtonAction(function () {
   		if($state.current.name=="cAAMpusInfraction.multasDeHoy"){
   			$ionicHistory.clearCache();
   			$state.go('cAAMpusInfraction.cAAMpusInfraction2');
   		}
   		else {
   			navigator.app.backHistory();
   		}	 
   	}, 100);
   
   	$scope.uploadInfractions = function(){
   		// if(vehicles.length > 0){
	   	// 	for(var i =0; i<vehicles.length; i++){
	   	// 		DownloadAll.UploadVehicles(JSON.stringify(vehicles[i]));
	   	// 	} 
   		// }
   		for(var i =0; i<$scope.infractions.length; i++){
   			console.log($scope.infractions[i]);
   			DownloadAll.UploadInfractions(JSON.stringify($scope.infractions[i]));
   		}   		
   	}
   })

//view infraction information view controller. takes care of cancel button and edit button
.controller('informaciNDeMultaCtrl', function($scope, $ionicModal, $stateParams, $filter ,$localstorage, $ionicHistory, $window, DownloadAll) {
	$ionicHistory.clearHistory();
	$ionicHistory.clearCache();   
	$ionicModal.fromTemplateUrl('templates/cancelInfraction.html', {
		scope: $scope
	}).then(function(cancel_Infraction) {
		$scope.cancel_Infraction = cancel_Infraction;
	});
	$scope.holdInfractions = $localstorage.getObject('Infractions');
	$scope.infractions = $scope.holdInfractions.loadInfractions;
	$scope.infraction = $filter('filter')($scope.infractions, {infractionNumber:$stateParams.InfractionID})[0];
	console.log($scope.infraction);
	$scope.deleteButton = !$scope.infraction.isCancelled;
	$scope.editButton = !$scope.infraction.isCancelled;
	$scope.deleteMessage = $scope.infraction.isCancelled;
	$scope.deleteComment = $scope.infraction.isCancelled;

	var infractions = [];
	$scope.comment = {};
	$scope.cancelInfraction = function(){
		$scope.cancel_Infraction.show();		 
	};
	$scope.closeCancel = function(){
		$scope.cancel_Infraction.hide();
	};
	$scope.editInfraction = function(){		
		$ionicHistory.clearCache();			
	};
	$scope.confirmCancel = function(){
		infractions = $localstorage.getObject('Infractions')
		if(!$scope.comment.main){
			alert("debe entrar un comentario de cancelacion");
		}
		else{
			for(var i=0; i < infractions.loadInfractions.length; i++)
			{             
				if(infractions.loadInfractions[i].id == $scope.infraction.id)
				{
					//console.log("match. Now edit and remove old one" , infractions);
					infractions.loadInfractions.splice(i,1);
					$scope.infraction.isCancelled = true;
					$scope.infraction.infractionStatusID = 2;
					$scope.infraction.delete_comment = $scope.comment.main;
					infractions.loadInfractions.push($scope.infraction);
					DownloadAll.clearInfractions();
					for(var j =0; j< infractions.loadInfractions.length ; j++){
						//console.log(j);
						DownloadAll.addEditedInfraction(infractions.loadInfractions[j]);
					}
				}
			}
	      //console.log("cancel flag pressed. Cancel flag in infraction changed. must disable cancel button");
	      $scope.cancel_Infraction.hide();
	      $scope.deleteButton = false;
	      $scope.editButton = false;
	      $scope.deleteMessage = true;
	      $scope.deleteComment  = true;
	  }
	};

})

//edit infraction view controller
.controller('editInfraction', function($state, $scope, $localstorage, $filter, $stateParams, DownloadAll, $ionicHistory) {
	$scope.holdInfractions = $localstorage.getObject('Infractions');
	$ionicHistory.clearCache();
	$ionicHistory.clearHistory();
	$scope.infractions = $scope.holdInfractions.loadInfractions;
	$scope.infraction = $filter('filter')($scope.infractions, {infractionNumber:$stateParams.InfractionID})[0];

	var infractions = [];
	$ionicHistory.clearCache();
	$ionicHistory.clearHistory();
	$scope.hold = $localstorage.getObject('typeInfractions');
	$scope.assets = $scope.hold.violations;	
	$scope.isChecked = false;
	$scope.selected = [];
	$scope.IDselected = [];

	$scope.hasViolation = function(violation) {
		//console.log(violation._id);
		if ($scope.infraction.violations.indexOf(violation._id) !== -1){
			$scope.selected.push(violation);
			console.log($scope.selected);
			$scope.IDselected.push(violation._id);
		}
		return $scope.infraction.violations.indexOf(violation._id) !== -1;
	};
	$scope.checkedOrNot = function (asset, isChecked, index) {
		if (isChecked) {
			$scope.selected.push(asset);
			$scope.IDselected.push(asset._id);
			console.log("selected: ",  $scope.IDselected);
		} else {
			var _index = $scope.selected.indexOf(asset);
			$scope.selected.splice(_index, 1);
			$scope.IDselected.splice(_index, 1);
			console.log("selected after remove: ", $scope.selected);
		}
	};

	$scope.saveChanges = function(){
		if($scope.selected.length == 0){
			alert("Debe seleccionar alguna infraccion");
		}
		else{
			$ionicHistory.clearCache();
			$ionicHistory.clearHistory();
			infractions = $localstorage.getObject('Infractions')
			for(var i=0; i < infractions.loadInfractions.length; i++)
			{             
				if(infractions.loadInfractions[i].id == $scope.infraction.id)
				{

					infractions.loadInfractions.splice(i,1);
		             	//add new things to infraction
		             	$scope.infraction.violations = $scope.selected;
		             	$scope.infraction.violations_id =  $scope.IDselected;
		             	$scope.infraction.main_comment = $scope.infraction.main_comment;
		             	
		             	infractions.loadInfractions.push($scope.infraction);
		             	// $localstorage.clear('Infractions');
		             	DownloadAll.clearInfractions();
		             	for(var j =0; j< infractions.loadInfractions.length ; j++){
		             		DownloadAll.addEditedInfraction(infractions.loadInfractions[j]);
		             	}

		             }
		         }  		
		         $state.go('cAAMpusInfraction.multasDeHoy', {}, {reload: true});	
		     }
		 };
		})

.controller('multaNueva24Ctrl', function($scope) {

}) 


 //home  main menu view controller
 .controller('cAAMpusInfraction2Ctrl', function($scope, $state, $ionicPlatform, $ionicHistory) {
	//console.log("home");
	$ionicHistory.clearCache();
	$ionicHistory.clearHistory();
	$ionicPlatform.registerBackButtonAction(function () {
		if($state.current.name=="cAAMpusInfraction.cAAMpusInfraction2"){
			$ionicHistory.clearCache();
		 	//console.log("dale back");
		 	navigator.app.exitApp();
		 }
		 else {
		 	navigator.app.backHistory();
		 }	 
		}, 100);
})



 .controller('informaciNDeUsuarioCtrl', function($scope) {

 })

 .controller('editarMultaCtrl', function($scope) {

 })


 