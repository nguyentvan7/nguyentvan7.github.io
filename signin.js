(function() {
    const loginBtn = document.getElementById('loginButton');
    const signupBtn = document.getElementById('signupButton');
    var emailBox = document.getElementById('emailInput');  
    var passBox = document.getElementById('passInput');
    var badLogin = document.getElementById('badLogin');
    badLogin.style.display = 'none';

    loginBtn.addEventListener('click', e => {
        var email = document.getElementById('emailInput').value;
        var password = document.getElementById('passInput').value;

        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function() {
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
                // Handle Errors here.
                console.log(error.message);
                badLogin.style.display = 'block';
                // ... 
              });
        })
    })

    emailBox.addEventListener('keyup', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            loginBtn.click();
        }
    })

    passBox.addEventListener('keyup', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            loginBtn.click();
        }
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
