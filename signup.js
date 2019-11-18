(function() {
    const signupBtn = document.getElementById('signupButton');
    const loginBtn = document.getElementById('loginButton');
    var emailBox = document.getElementById('emailInput');
    var passBox = document.getElementById('passInput');
    var pass2Box = document.getElementById('passReinput');

    signupBtn.addEventListener('click', e => {
        var email = document.getElementById('emailInput').value;
        var password = document.getElementById('passInput').value;
        var password2 = document.getElementById('passReinput').value;

        if (email.length < 1 || password.length < 1 || password2.length < 1) {
            window.alert('Required items are missing');
        } else if (password == password2) {
            alert("Your new account has been created!");
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function() {
                firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
                // Handle Errors here.
                    console.log(error.message);
                // ...
                });
            })
        } else {
            window.alert("Passwords do not match");
        }
    })

    emailBox.addEventListener('keyup', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            signupBtn.click();
        }
    })

    passBox.addEventListener('keyup', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            signupBtn.click();
        }
    })

    pass2Box.addEventListener('keyup', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            signupBtn.click();
        }
    })

    loginBtn.addEventListener('click', e => {
        window.location.href = "signin.html";
    })    

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            window.location.href = "index.html";
            console.log(firebaseUser);
        } else {
            console.log('Not a valid user');
        }
    })
}());