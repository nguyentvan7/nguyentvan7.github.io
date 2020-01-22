// Initialize Firebase
var config = {
    apiKey: "AIzaSyDBQ7zePAJ_R5NjAw21NTe2D2XJ5mchyyU",
    authDomain: "artifacts-8362e.firebaseapp.com",
    databaseURL: "https://artifacts-8362e.firebaseio.com",
    projectId: "artifacts-8362e",
    storageBucket: "artifacts-8362e.appspot.com"
};
firebase.initializeApp(config);

var logoutBtn = document.getElementById("logoutButton");

logoutBtn.addEventListener("click", e => {
    firebase
	.auth()
	.signOut()
	.then(function() {})
	.catch(function(error) {
	    // An error happened.
	});
});

var auth = firebase.auth();
//end of auth stuff

// Get a reference to the database service
var database = firebase.database();

// Used with index variable.
var refs1 = ["exhibits/exhibit-", "items/item-"];
var refs2 = ["/itemIds"];
var selects = [
    document.getElementById("exhibitSelect"),
    document.getElementById("itemSelect"),
    document.getElementById("languageSelect"),
    document.getElementById("ageSelect")
];
var buttons = [
    document.getElementById("createExhibitButton"),
    document.getElementById("createItemButton"),
    document.getElementById("createLanguageButton"),
    document.getElementById("createAgeButton")
];
var messages = [
    "Choose exhibit name",
    "Choose item name",
    "Choose language name",
    "Choose age group"
];
var messages2 = [
    "Choose exhibit name first",
    "Choose item name first",
    "Choose language name first"
];
var titles = ["exhibit", "item", "language", "age group", "user"];
var addInput = document.getElementById("addName");

var userMuseum = -1;

// Find and setup museum assigned to user.
firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
	var username = firebaseUser.email;
	var userUid = firebaseUser.uid;

	var select = document.getElementById("museumSelect");

	userUid = firebase.auth().currentUser.uid;
	var query = firebase.database().ref("/museums").orderByChild("user").equalTo(userUid);
	query.once("value").then(function(snapshot) {
	    snapshot.forEach(function(childSnapshot) {
		userMuseum = childSnapshot.child("/id").val();
	    });
	}).then(function() {
	    // Set exhibit, language and age select for the museum assigned to the user.
	    var exhibitSelect = selects[0];
	    var languageSelect = selects[2];
	    var ageGroupSelect = selects[3];

	    // Add "All" options.
	    var option = document.createElement("option");
	    // Set value to 1 to signify the language is already in the database.
	    option.value = 1;
	    option.text = "All";
	    languageSelect.appendChild(option);
	    var option = document.createElement("option");
	    option.value = 1;
	    option.text = "All";
	    ageGroupSelect.appendChild(option);
	    
	    var query = firebase.database().ref("museums/museum-" + userMuseum);
	    query.once("value").then(function(snapshot) {
		// Populate exhibits.
		var dbPromises = [];
		var exhibitQuery = snapshot.child("/exhibitIds").ref;
		// Pull all nested ids marked as true.
		exhibitQuery.once("value").then(function(snapshot1) {
		    // For each nested id marked as true, add to select.
		    if (snapshot1.exists()) {
			snapshot1.forEach(function(childSnapshot) {
			    var nestedQuery = firebase.database().ref("exhibits/exhibit-" + childSnapshot.key);
			    nestedQuery.once("value").then(function(snapshot2) {
				var option = document.createElement("option");
				option.value = snapshot2.child("/id").val();
				option.innerHTML = snapshot2.child("/name").val();
				selects[0].appendChild(option);
			    }).then(function() {
				selects[0].options[0].innerHTML = messages[0];
				selects[0].disabled = false;
				buttons[0].disabled = false;
			    });
			});
		    }
		    // No exhibits have been created.
		    else {
			selects[0].options[0].innerHTML = "Please create a new exhibit";
			selects[0].disabled = true;
			buttons[0].disabled = false;
		    }
		});
		
		// Populate languages.
		var languageQuery = snapshot.child("/supportedLanguages");
		languageQuery.forEach(function(childSnapshot) {
		    var option = document.createElement("option");
		    // Set value to 1 to signify the language is already in the database.
		    option.value = 1;
		    // Capitalize first letter.
		    option.text = childSnapshot.key.charAt(0).toUpperCase() + childSnapshot.key.slice(1);
		    languageSelect.appendChild(option);
		});

		// Same as above but for age.
		var ageGroupQuery = snapshot.child("/supportedAgeGroups");
		ageGroupQuery.forEach(function(childSnapshot) {
		    var option = document.createElement("option");
		    option.value = 1;
		    option.text = childSnapshot.key.charAt(0).toUpperCase() + childSnapshot.key.slice(1);
		    ageGroupSelect.appendChild(option);
		});
	    });
	});

	// Set username.
	document.getElementById("currentEmail").innerHTML = username;
	// User is signed in.
    } else {
	window.location.href = "signin.html";
	// No user is signed in.
    }
});

// Dynamically populates the selects[index] forms based on the selected id.
// index = 0 -> from exhibitSelect, populate itemSelect
// index = 1 -> from itemSelect, populate languageSelect
// index = 2 -> from languageSelect, populate ageSelect
// index = 3 -> from ageSelect, used for enabling/disabling upload
function setSelect(index, id) {
    // Clearing any options already in select, and any nested select.
    // Do not clear the helper text.
    var i;
    var j;
    // Remove all options in the selects that are after the most recently changed one.
    // For example, remove the options from exhibit and item selects when
    // the museum select is changed.
    // Should not remove language or ageGroup select unless the museum has changed.
    for (i = index + 1; i < selects.length; i++) {
	// Disable the buttons of the following selects.
	selects[i].disabled = true;
	buttons[i].disabled = true;
    }

    // Check if a select has the default message.
    // If it has a default message selected, disable the following selects,
    // as there are no valid options available.
    for (i = index; i < selects.length; i++) {
	if (selects[i].value == messages[i]) {
	    for (j = i; j < selects.length - 1; j++) {
		selects[j + 1].disabled = true;
		buttons[j + 1].disabled = true;
		buttons[j + 1 + 1].disabled = true;
	    }
	}
    }

    var dbPromises = [];
    // Only populate the following select if the current one changed is not the age select.
    if (index < selects.length - 1) {
	// Display loading message while loading.
	selects[index + 1].options[0].innerHTML = "Loading names...";
	var query = firebase.database().ref(refs1[index] + id + refs2[index]);

	// Pull all nested ids marked as true.
	dbPromises.push(
	    query.once("value").then(function(snapshot) {
		// For each nested id marked as true, add to select.
		if (snapshot !== null) {
		    snapshot.forEach(function(childSnapshot) {
			var query = firebase.database().ref(refs1[index + 1] + childSnapshot.key);
			dbPromises.push(
			    query.once("value").then(function(snapshot2) {
				var option = document.createElement("option");
				option.value = snapshot2.child("/id").val();
				option.innerHTML = snapshot2.child("/name").val();
				selects[index + 1].appendChild(option);
			    })
			);
		    });
		}
	    })
	);
	// Update default messages.
	Promise.all(dbPromises).then(function() {
	    if (selects[index].value != 0) {
		selects[index + 1].disabled = false;
		buttons[index + 1].disabled = false;
		selects[index + 1].options[0].innerHTML = messages[index + 1];
		if (index == 0 && id == -1) {
		    // Change text of item select to tell user to add an item.
		    selects[1].options[0].innerHTML = "Please create a new item";
		    selects[1].disabled = true;
		}
		selects[index + 1].selectedIndex = 0;
		document.getElementById("uploadButton").disabled = true;
	    } else {
		selects[index + 1].disabled = true;
		buttons[index + 1].disabled = true;
		selects[index + 1].options[0].innerHTML = messages2[index];
		selects[index + 1].selectedIndex = 0;
		document.getElementById("uploadButton").disabled = true;
	    }
	});
    }
    // Disable/enable buttons for ageGroupSelect.
    else {
	if (selects[index].value != 0) {
	    document.getElementById("uploadButton").disabled = false;
	} else {
	    document.getElementById("uploadButton").disabled = true;
	}
    }

    // If exhibitSelect is updated, we need to update the markerNum displayed.
    if (index == 0) {
	var markerNum = selects[0].options[selects[0].selectedIndex].value;
	// If markerNum is unspecified aka -1.
	if (markerNum == -1) {
	    document.getElementById("displayMarkerLabel").innerHTML = "The image target for this exhibit is unspecified. Once you upload, the image target will be generated.";
	    document.getElementById("displayMarkerButton").disabled = true;
	    document.getElementById("displayMarkerLabel").setAttribute("markerNum", markerNum);
	}
	// If marker num is specified aka NOT -1.
	else {
	    document.getElementById("displayMarkerLabel").innerHTML = "The image target for this exhibit is number " + markerNum  + ".";
	    document.getElementById("displayMarkerButton").disabled = false;
	    document.getElementById("displayMarkerLabel").setAttribute("markerNum", markerNum);
	}
    }
}

// Pops add modal based on what button was pressed.
function displayAddModal(index) {
    document.getElementById("addModalLabel").innerText =
	"Create new " + titles[index];
    document.getElementById("addLabel").innerHTML =
	titles[index].charAt(0).toUpperCase() + titles[index].slice(1) + " name";
    document.getElementById("addName").setAttribute("index", index);
    $("#addModal").modal();
}

// Pops rename modal based on what button was pressed.
function displayRenameModal(index) {
    document.getElementById("renameModalLabel").innerText =
	"Rename " +
	titles[index] +
	" '" +
	selects[index].options[selects[index].selectedIndex].text +
	"'";
    document.getElementById("renameLabel").innerHTML =
	"New " + titles[index] + " name";
    document.getElementById("renameName").setAttribute("index", index);
    $("#renameModal").modal();
}

// Creates new entry in the specified select.
function create() {
    var index = parseInt(
	document.getElementById("addName").getAttribute("index")
    );

    // Set id to -1 to indicate id still needs to be pulled from database.
    var option = document.createElement("option");
    option.value = -1;
    option.text = document.getElementById("addName").value;
    selects[index].appendChild(option);
    selects[index].selectedIndex = selects[index].options.length - 1;
    selects[index].disabled = false;
    setSelect(index, -1);
    document.getElementById("addName").value = "";
    $("#addModal").modal("hide");
}

// Renames selected entry in specified select.
function rename() {
    var index = document.getElementById("renameName").getAttribute("index");
    var option = selects[index].options[selects[index].selectedIndex];
    var name = document.getElementById("renameName").value;
    option.text = name;
    document.getElementById("renameName").value = "";

    // Update database with new name.
    var updates = {};
    updates[refs1[index] + option.value + "/name"] = name;
    firebase
	.database()
	.ref()
	.update(updates);

    // Display alert to signify rename was succesful.
    var ale = document.getElementById("uploadMes");
    ale.className = "alert alert-secondary mt-3";
    ale.innerHTML = "Rename complete!";
    // Dismiss after 10 seconds.
    setTimeout(function() {
	ale.className = "alert alert-secondary collapse mt-3";
    }, 10000);

    $("#renameModal").modal("hide");
}

// Upload the selected file and update the realtime database with new link.
function upload() {
    var file = document.getElementById("fileButton").files[0];
    var exhibit = selects[0].value;
    var item = selects[1].value;
    var language = selects[2].options[selects[2].selectedIndex].text;
    var ageGroup = selects[3].options[selects[3].selectedIndex].text;
    var markerNum = 0;

    // Progress bar
    var bar = document.getElementById("uploadBar");
    var ale = document.getElementById("uploadMes");
    bar.className = "progress-bar progress-bar-striped progress-bar-animated";

    // Determine the file type of the uploaded item.
    var fileTypeString;
    var fullPath = document.getElementById("fileButton").value;
    if (fullPath) {
	var startIndex =
	    fullPath.indexOf("\\") >= 0
	    ? fullPath.lastIndexOf("\\")
	    : fullPath.lastIndexOf("/");
	var filename = fullPath.substring(startIndex);
	if (filename.indexOf("\\") === 0 || filename.indexOf("/") === 0) {
	    filename = filename.substring(1);
	}

	var extType = filename.split(".").pop();
	extType = extType.toLowerCase();
    }

    if (extType == "png" || extType == "jpg" || extType == "jpeg") {
	fileTypeString = "image";
    }
    else if (extType == "avi" || extType == "flv" || extType == "mwv" ||
	     extType == "mov" || extType == "mp4" ) {
	fileTypeString = "video";
    }
    else if (extType == "mp3") {
	fileTypeString = "audio";
    }
    // Reject uploads with incorrect file type.
    else {
	ale.className = "alert alert-danger fade show mt-3";
	ale.innerHTML = "Please only submit text files, videos, or images";
	return;
    }

    // Check that all fields are valid.
    if ( file == null || exhibit == messages[1] || exhibit == messages2[1] ||
	 item == messages[2] || item == messages2[2] ||
	 language == messages[3] || language == messages2[3] ||
	 ageGroup == messages[4]) {
	ale.className = "alert alert-danger fade show mt-3";
	ale.innerHTML = "Please ensure all fields are valid";
	return;
    }
    
    // Change alert to be a success.
    ale.className = "alert alert-success collapse mt-3";

    // Default values.
    var x = 0.01;
    var y = 0.01;
    var z = 0.01;
    var scale = 1.01;

    // Ensure async calls finish.
    var dbPromises = [];

    var updates = {};
    // If item is a new item created by user, pull new id numbers.
    if (item == -1) {
	var query = firebase.database().ref("ids/itemNum");
	// Push async promise to dbPromises. Will only move on once all dbPromises are resolved.
	dbPromises.push(
	    query.once("value").then(function(snapshot) {
		item = snapshot.val();
		selects[1].options[selects[1].selectedIndex].value = item;
		updates["ids/itemNum"] = item + 1;
		console.log("t01");
	    })
	);
    }
    // Else, use id numbers and values from the previous database entry.
    else {
	var query = firebase.database().ref("items/item-" + item);
	dbPromises.push(
	    query.once("value").then(function(snapshot) {
		x = snapshot.child("x").val();
		y = snapshot.child("y").val();
		z = snapshot.child("z").val();
		scale = snapshot.child("scale").val();
		console.log("t00" + item);
	    })
	);
    }

    var markerQuery = firebase.database().ref("museums/museum-" + userMuseum + "/markerNum");
    dbPromises.push(markerQuery.once("value").then(function(snapshot) {
	markerNum = snapshot.val();
	console.log("HIT1.1");
    }));
    if (exhibit == -1) {
	var query = firebase.database().ref("ids/exhibitNum");
	dbPromises.push(
	    query.once("value").then(function(snapshot) {
		exhibit = snapshot.val();
		selects[0].options[selects[0].selectedIndex].value = exhibit;
		updates["ids/exhibitNum"] = exhibit + 1;
		console.log("t1");
		markerNum = markerNum + 1;
	    })
	);
    }
    else {
	dbPromises.push(Promise.resolve());
    }

    // Wait until all promises are finished before pushing to database.
    Promise.all(dbPromises).then(function() {
	var userUid = firebase.auth().currentUser.uid;

	// Update database relations.
	updates["items/item-" + item + "/name"] =
	    selects[1].options[selects[1].selectedIndex].text;
	updates["items/item-" + item + "/id"] = parseInt(item.toString());
	updates['items/item-' + item + '/user'] = userUid;
	updates['items/item-' + item + '/type'] = fileTypeString;
	updates["items/item-" + item + "/x"] = parseFloat(x.toString());
	updates["items/item-" + item + "/y"] = parseFloat(y.toString());
	updates["items/item-" + item + "/z"] = parseFloat(z.toString());
	updates["items/item-" + item + "/scale"] = parseFloat(scale.toString());
	updates["items/item-" + item + "/language"] = language.toLowerCase();
	updates["items/item-" + item + "/ageGroup"] = ageGroup.toLowerCase();
	updates["exhibits/exhibit-" + exhibit + "/name"] =
	    selects[0].options[selects[0].selectedIndex].text;
	updates["exhibits/exhibit-" + exhibit + "/itemIds/" + item] = true;
	updates["exhibits/exhibit-" + exhibit + "/id"] = parseInt(exhibit);
	updates["exhibits/exhibit-" + exhibit + "/user"] = userUid;
	updates["exhibits/exhibit-" + exhibit + "/markerNum"] = markerNum;
	updates["museums/museum-" + userMuseum + "/exhibitIds/" + exhibit] = true;
	updates["museums/museum-" + userMuseum + "/markerNum"] = markerNum;
	// Don't add the "All" group.
	if(language.toLowerCase() != "all") {
	    updates["museums/museum-" + museum + "/supportedLanguages/" + language.toLowerCase()] = true;
	}
	if(ageGroup.toLowerCase() != "all") {
	    updates["museums/museum-" + museum + "/supportedAgeGroups/" + ageGroup.toLowerCase()] = true;
	}

	// Store file in storage.
	var ref = "/museum-" + userMuseum + "/exhibit-" + exhibit + "/item-" + item;
	var task = firebase.storage().ref(ref).put(file);
	task.on("state_changed",
		function progress(snapshot) {
		    var percentage =
			(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		    bar.style = "width:" + percentage + "%";
		    bar.setAttribute("aria-valuenow", percentage);
		},
		function error(err) {},
		function complete() {
		    // Display alert.
		    bar.className = "progress-bar progress-bar-striped bg-success";
		    ale.className = "alert alert-success fade show mt-3";
		    // TODO need to change this to markerNum, not exhibit.
		    var markerUrl = "https://raw.githubusercontent.com/nguyentvan7/ARtifactsMarkers/master/" + exhibit + ".png"
		    ale.innerHTML = "Upload complete! Image target number " + exhibit + " available <a href=\"" + markerUrl + "\">here</a>";
		    var url;
		    // Update realtime database.
		    task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
			console.log("File available at", downloadURL);
			url = downloadURL;
			updates["/items/item-" + item + "/url"] = url;
			// Push all updates.
			firebase.database().ref().update(updates);
		    });
		    //VAN: TODO: URGENT: NEED TO CHECK BELOW WORKS
		    document.getElementById("uploadForm").reset();
		    setSelect(0, 0);
		    document.getElementById("uploadButton").disabled = true;
		}
	       );
    });
}

// Opens url to marker selected in new tab.
function displayMarker() {
    var markerNum = document.getElementById("displayMarkerLabel").getAttribute("markerNum");
    var markerUrl = "https://raw.githubusercontent.com/nguyentvan7/ARtifactsMarkers/master/" + markerNum + ".png"
    window.open(markerUrl, "_blank");
}

// Add handling for enter key in modal.
(function() {
    addInput.addEventListener('keyup', function(event) {
	if (event.keyCode == 13) {
	    event.preventDefault();
	    create();
	}
    });
}());

//====================================//
//===============LEGACY===============//
//====================================//

// Begins process of printing all urls belonging to a specified museum.
function download(id) {
    console.log("G" + id);
    var query = firebase.database().ref("/museums/museum-" + id + "/roomIds");
    query.once("value").then(function(snapshot) {
	snapshot.forEach(function(childSnapshot) {
	    console.log("R" + childSnapshot.key);
	    getExhibits(childSnapshot.key);
	});
    });
}

function getExhibits(id) {
    var query = firebase.database().ref("/rooms/room-" + id + "/exhibitIds");
    query.orderByValue().equalTo(true);
    query.once("value").then(function(snapshot) {
	snapshot.forEach(function(childSnapshot) {
	    console.log("E" + childSnapshot.key);
	    getItems(childSnapshot.key);
	});
    });
}

function getItems(id) {
    var query = firebase.database().ref("/exhibits/exhibit-" + id + "/itemIds");
    query.orderByValue().equalTo(true);
    query.once("value").then(function(snapshot) {
	snapshot.forEach(function(childSnapshot) {
	    console.log("I" + childSnapshot.key);
	    getUrl(childSnapshot.key);
	});
    });
}

function getUrl(id) {
    var query = firebase.database().ref("/items/item-" + id + "/url");
    query.once("value").then(function(snapshot) {
	console.log("U" + snapshot.val());
    });
}
