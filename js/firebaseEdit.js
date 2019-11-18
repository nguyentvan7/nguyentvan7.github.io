// Initialize Firebase
var config = {
    apiKey: 'AIzaSyDBQ7zePAJ_R5NjAw21NTe2D2XJ5mchyyU',
    authDomain: 'artifacts-8362e.firebaseapp.com',
    databaseURL: 'https://artifacts-8362e.firebaseio.com',
    projectId: 'artifacts-8362e',
    storageBucket: 'artifacts-8362e.appspot.com',
};
firebase.initializeApp(config);


//auth stuff
firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        var username = firebaseUser.email;
        var userUid = firebaseUser.uid;

        var dbPromises = [];

        var select = document.getElementById('gallerySelect');

        userUid = firebase.auth().currentUser.uid
        var query = firebase.database().ref('/galleries').orderByChild('user').equalTo(userUid);
        dbPromises.push(query.once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var option = document.createElement('option');
                option.value = childSnapshot.child('/id').val();
                option.innerHTML = childSnapshot.child('/name').val();
                select.appendChild(option);
            });
        }));
        Promise.all(dbPromises).then(function() {
            select.options[0].innerHTML = messages[0];
            select.disabled = false;
            buttons[0].disabled = true;
            //buttons[1].disabled = false;
        });
        document.getElementById('currentEmail').innerHTML = username;
      // User is signed in.
    } else {
        window.location.href = "signin.html";
      // No user is signed in.
    }
  });

var logoutBtn = document.getElementById('logoutButton')

logoutBtn.addEventListener('click', e => {
    firebase.auth().signOut().then(function() {

    }).catch(function(error) {
      // An error happened.
    });
})

var auth = firebase.auth()
//end of auth stuff

// Get a reference to the database service
var database = firebase.database();

// Used with index variable.
var refs1 = ['galleries/gallery-', 'rooms/room-', 'exhibits/exhibit-', 'items/item-'];
var refs2 = ['/roomIds', '/exhibitIds', '/itemIds'];
var selects = [document.getElementById('gallerySelect'), document.getElementById('roomSelect'),
                document.getElementById('exhibitSelect'), document.getElementById('itemSelect')];
var buttons = [document.getElementById('renameGalleryButton'), document.getElementById('createGalleryButton'),
                document.getElementById('renameRoomButton'), document.getElementById('createRoomButton'),
                document.getElementById('renameExhibitButton'), document.getElementById('createExhibitButton'),
                document.getElementById('renameItemButton'), document.getElementById('createItemButton')];
var messages = ['Choose gallery name', 'Choose room name', 'Choose exhibit name', 'Choose item name'];
var messages2 = ['Choose gallery name first', 'Choose room name first', 'Choose exhibit name first'];
var titles = ['gallery', 'room', 'exhibit', 'item', 'user'];

document.onload = onload();

// Populate gallerySelect when page is loaded.
// Replace later with auth.
function onload() {
	// var dbPromises = [];

 //        var select = document.getElementById('gallerySelect');

 //        var query = firebase.database().ref('/galleries');
 //        dbPromises.push(query.once('value').then(function(snapshot) {
 //            snapshot.forEach(function(childSnapshot) {
 //                var option = document.createElement('option');
 //                option.value = childSnapshot.child('/id').val();
 //                option.innerHTML = childSnapshot.child('/name').val();
 //                select.appendChild(option);
 //            });
 //        }));
 //        Promise.all(dbPromises).then(function() {
 //            select.options[0].innerHTML = messages[0];
 //            select.disabled = false;
 //            buttons[0].disabled = true;
 //            //buttons[1].disabled = false;
 //        });
}

// Dynamically populates the selects[index] forms based on the selected id.
// index = 0 -> from gallerySelect, populate roomSelect
// index = 1 -> from roomSelect, populate exhibitSelect
// index = 2 -> from exhibitSelect, populate itemSelect
// index = 3 -> from itemSelect, used for disabling/enabling buttons
function setSelect(index, id) {
    // Clearing any options already in select, and any nested select.
    // Do not clear the helper text.
    var i;
    var j;
    for (i = index + 1; i < selects.length; i++) {
        for (j = selects[i].options.length - 1 ; j >= 1 ; j--) {
            selects[i].remove(j);
        }
        selects[i].disabled = true;
        buttons[2 * i].disabled = true;
        //buttons[2 * i + 1].disabled = true;
    }

    for (i = index; i < selects.length; i++) {
        if(selects[i].value == messages[i]) {
            for (j = i; j < selects.length - 1; j++) {
                selects[j + 1].disabled = true;
                buttons[2 * (j + 1)].disabled = true;
                buttons[2 * (j + 1) + 1].disabled = true;
            }
        }
    }

    var dbPromises = [];
    // Only populate the following select if the current one changed is not the item select.
    if (index < 3) {
        selects[index + 1].options[0].innerHTML = 'Loading names...';
        var query = firebase.database().ref(refs1[index] + id + refs2[index]);

        // Pull all nested Ids marked as true.
        dbPromises.push(query.once('value').then(function(snapshot) {
            // For each nested Id marked as true, add to select.
            if (snapshot !== null) {
                snapshot.forEach(function(childSnapshot) {
                    var query = firebase.database().ref(refs1[index + 1] + childSnapshot.key);
                    dbPromises.push(query.once('value').then(function(snapshot2) {
                        var option = document.createElement('option');
                        option.value = snapshot2.child('/id').val();
                        option.innerHTML = snapshot2.child('/name').val();
                        selects[index + 1].appendChild(option);
                    }));
                });
            }
        }));
        // Update default messages.
        Promise.all(dbPromises).then(function() {
            if (selects[index].value != 0) {
                selects[index + 1].disabled = false;
                buttons[2*index].disabled = false;
                //buttons[2*(index + 1) + 1].disabled = false;
                selects[index + 1].options[0].innerHTML = messages[index + 1];
            }
            else {
                selects[index + 1].disabled = true;
                buttons[2*index].disabled = true;
                buttons[2*(index + 1)].disabled = true;
                buttons[2*(index + 1) + 1].disabled = true;
                selects[index + 1].options[0].innerHTML = messages2[index];
            }
        });
    }
    // Disable/enable buttons for itemSelect.
    else {
        if (selects[index].value != 0) {
            buttons[2*index].disabled = false;
            document.getElementById('uploadButton').disabled = false;
        }
        else {
            buttons[2*index].disabled = true;
            document.getElementById('uploadButton').disabled = true;
        }
    }
}

// Pops add modal based on what button was pressed.
function displayAddModal(index) {
    document.getElementById('addModalLabel').innerText = 'Create new ' + titles[index];
    document.getElementById('addLabel').innerHTML = titles[index].charAt(0).toUpperCase() + titles[index].slice(1) + ' name';
    document.getElementById('addName').setAttribute('index', index);
    $('#addModal').modal();
}

// Pops rename modal based on what button was pressed.
function displayRenameModal(index) {
    document.getElementById('renameModalLabel').innerText = 'Rename ' + titles[index] 
        + ' \'' + selects[index].options[selects[index].selectedIndex].text + '\'';
    document.getElementById('renameLabel').innerHTML = 'New ' + titles[index] + ' name';
    document.getElementById('renameName').setAttribute('index', index);
    $('#renameModal').modal();
}

// Creates new entry in the specified select.
function create() {
    var index = parseInt(document.getElementById('addName').getAttribute('index'));

    // Set id to -1 to indicate id still needs to be pulled from database.
    var option = document.createElement('option');
    option.value = -1;
    option.text = document.getElementById('addName').value;
    selects[index].appendChild(option);
    selects[index].selectedIndex = selects[index].options.length - 1;
    selects[index].disabled = false;
    setSelect(index, -1);
    document.getElementById('addName').value = '';
    $('#addModal').modal('hide');
}

// Renames selected entry in specified select.
function rename() {
    var index = document.getElementById('renameName').getAttribute('index');
    var option = selects[index].options[selects[index].selectedIndex];
    var name = document.getElementById('renameName').value
    option.text = name;
    document.getElementById('renameName').value = '';

    // Update database with new name.
    var updates = {};
    updates[refs1[index] + option.value + '/name'] = name;
    firebase.database().ref().update(updates);

    // Display alert to signify rename was succesful.
    /*var ale = document.getElementById('uploadMes');
    ale.className = 'alert alert-secondary mt-3';
    ale.innerHTML = "Rename complete!";
    setTimeout(function(){ ale.className = 'alert alert-secondary collapse mt-3'; }, 10000);
    */
    
    $('#renameModal').modal('hide');
}

// Upload the selected file and update the realtime database with new link.
function upload() {
    var file = document.getElementById('fileButton').files[0];
    var gallery = selects[0].value;
    var room = selects[1].value;
    var exhibit = selects[2].value;
    var item = selects[3].value;

    var bar = document.getElementById('uploadBar');
    var ale = document.getElementById('uploadMes');
    bar.className = 'progress-bar progress-bar-striped progress-bar-animated';

    var fileTypeString;


    var fullPath = document.getElementById('fileButton').value;
    if (fullPath)
    {
    	var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
    	var filename = fullPath.substring(startIndex);
    	if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0)
    	{
    		filename = filename.substring(1);
    	}
    	
    	var extType = filename.split('.').pop();
    	extType = extType.toLowerCase();
    	
    }

    if(extType == "txt" || extType == "png" || extType == "jpg" || extType == "jpeg" || extType == "avi" || extType == "flv" || 
    	extType == "mwv" || extType == "mov" || extType == "mp4")
    {
    	if (extType == "txt")
    	{
    		fileTypeString = "text";
    	}
    	if (extType == "png" || extType == "jpg" || extType == "jpeg")
    	{
    		fileTypeString = "image";
    	}
    	if (extType == "avi" || extType == "flv" || extType == "mwv" || extType == "mov" || extType == "mp4")
    	{
    		fileTypeString = "video";
    	}
    	alert(fileTypeString);
    }
    else
    {
        ale.className = 'alert alert-danger fade show mt-3';
        ale.innerHTML = 'Please ensure all fields are valid';
    	return;
    }

    // Check that all fields are valid.
    if (file == null || gallery == messages[0] || gallery == messages2[0] || room == messages[1]
        || room == messages2[1] || exhibit == messages[2] || exhibit == messages2[2]
        || item == messages[3]) {
            ale.className = 'alert alert-danger fade show mt-3';
            ale.innerHTML = 'Please only submit text files, videos, or images';
            return;
    }   
    ale.className = 'alert alert-success collapse mt-3';

    var x = 0.01;
    var y = 0.01;
    var z = 0.01;
    var scale = 1.0;

    // Ensure async calls finish.
    var dbPromises = [];

    var updates = {};
    if (item == -1) {
        var query = firebase.database().ref('ids/item');
        dbPromises.push(query.once('value').then(function(snapshot) {
            item = snapshot.val();
            selects[3].options[selects[3].selectedIndex].value = item;
            updates['ids/item'] = item + 1;
            console.log('t01');
        }));
    }
    else {
        var query = firebase.database().ref('items/' + item);
        dbPromises.push(query.once('value').then(function(snapshot) {
            x = snapshot.child('/x').val();
            y = snapshot.child('/y').val();
            z = snapshot.child('/z').val();
            scale = snapshot.child('/scale').val();
            console.log('t00');
        }));
    }

    if (exhibit == -1) {
        var query = firebase.database().ref('ids/exhibit');
        dbPromises.push(query.once('value').then(function(snapshot) {
            exhibit = snapshot.val();
            selects[2].options[selects[2].selectedIndex].value = exhibit;
            updates['ids/exhibit'] = exhibit + 1;
            console.log('t1');
        }));
    }
    else {
        dbPromises.push(Promise.resolve());
    }

    if (room == -1) {
        var query = firebase.database().ref('ids/room');
        dbPromises.push(query.once('value').then(function(snapshot) {
            room = snapshot.val();
            selects[1].options[selects[1].selectedIndex].value = room;
            updates['ids/room'] = room + 1;
            console.log('t2');
        }));
    }
    else {
        dbPromises.push(Promise.resolve());
    }
    
    if (gallery == -1) {
        var query = firebase.database().ref('ids/gallery');
        dbPromises.push(query.once('value').then(function(snapshot) {
            gallery = snapshot.val();
            selects[0].options[selects[0].selectedIndex].value = gallery;
            updates['ids/gallery'] = gallery + 1;
        }));
    }
    else {
        dbPromises.push(Promise.resolve());
    }
    // Pull id if value of selected is -1
    Promise.all(dbPromises).then(function() {
        // Update database relations.
        var userUid = firebase.auth().currentUser.uid;

        updates['items/item-' + item + '/name'] = selects[3].options[selects[3].selectedIndex].text;
        updates['items/item-' + item + '/id'] = String.valueof(item);
        // Causing issues currently.
        //updates['items/item-' + item + '/user'] = userUid;
        //updates['items/item-' + item + '/type'] = fileTypeString;
        updates['items/item-' + item + '/x'] = String.valueof(x);
        updates['items/item-' + item + '/y'] = String.valueof(y);
        updates['items/item-' + item + '/z'] = String.valueof(z);
        updates['items/item-' + item + '/scale'] = String.valueof(scale);
        updates['exhibits/exhibit-' + exhibit + '/name'] = selects[2].options[selects[2].selectedIndex].text;
        updates['exhibits/exhibit-' + exhibit + '/itemIds/' + item] = true;
        updates['exhibits/exhibit-' + exhibit + '/id'] = String.valueof(exhibit);
        updates['exhibits/exhibit-' + exhibit + '/user'] = userUid;
        updates['rooms/room-' + room + '/name'] = selects[1].options[selects[1].selectedIndex].text;
        updates['rooms/room-' + room + '/exhibitIds/' + exhibit] = true;
        updates['rooms/room-' + room + '/id'] = String.valueof(room);
        updates['rooms/room-' + room + '/user'] = userUid;
        updates['galleries/gallery-' + gallery + '/name'] = selects[0].options[selects[0].selectedIndex].text;
        updates['galleries/gallery-' + gallery + '/roomIds/' + room] = true;
        updates['galleries/gallery-' + gallery + '/id'] = String.valueof(gallery);
        updates['galleries/gallery-' + gallery + '/user'] = userUid;
        firebase.database().ref().update(updates);

        var ref = '/gallery-' + gallery + '/room-' + room + '/exhibit-' + exhibit + '/item-' + item;
        // Store file in storage.
        var task = firebase.storage().ref(ref).put(file);
        task.on('state_changed',
        
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            bar.style = 'width:' + percentage + '%';
            bar.setAttribute('aria-valuenow', percentage);
        },
        function error(err) {

        },
        function complete() {
            // Display alert.
            bar.className = 'progress-bar progress-bar-striped bg-success';
            ale.className = 'alert alert-success fade show mt-3';
            ale.innerHTML = 'Upload complete!';
            var url;
            // Update realtime database.
            task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                console.log('File available at', downloadURL);
                url = downloadURL;
                updateDatabase(gallery, room, exhibit, item, url);
            });
            setSelect(0, 0);
            document.getElementById('uploadForm').reset();
            document.getElementById('uploadButton').disabled = true;        
        });
    });
}

// Update realtime database at all levels.
function updateDatabase(gallery, room, exhibit, item, url) {
    // Update realtime database with new url.
    var updates = {};
    updates['/galleries/gallery-' + gallery + '/roomIds/' + room] = true;
    updates['/rooms/room-' + room + '/exhibitIds/' + exhibit] = true;
    updates['/exhibits/exhibit-' + exhibit + '/itemIds/' + item] = true;
    updates['/items/item-' + item + '/url'] = url;
    firebase.database().ref().update(updates);
}

// Begins process of printing all urls belonging to a specified gallery.
function download(id) {
    console.log('G' + id);
    var query = firebase.database().ref('/galleries/gallery-' + id + '/roomIds');
    query.once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
        console.log('R' + childSnapshot.key);
        getExhibits(childSnapshot.key);
        });
    });
}

function getExhibits(id) {
    var query = firebase.database().ref('/rooms/room-' + id + '/exhibitIds');
    query.orderByValue().equalTo(true);
    query.once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
        console.log('E' + childSnapshot.key);
        getItems(childSnapshot.key);
        });
    });
}

function getItems(id) {
    var query = firebase.database().ref('/exhibits/exhibit-' + id + '/itemIds');
    query.orderByValue().equalTo(true);
    query.once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
        console.log('I' + childSnapshot.key);
        getUrl(childSnapshot.key);
        });
    });
}

function getUrl(id) {
    var query = firebase.database().ref('/items/item-' + id + '/url');
    query.once('value').then(function(snapshot) {
        console.log('U' + snapshot.val());
    });
}
