(function() {
    const loginBtn = document.getElementById('loginButton');
    const signupBtn = document.getElementById('signupButton');
    
    loginBtn.addEventListener('click', e => {
        var email = document.getElementById('emailInput').value;
        var password = document.getElementById('passInput').value;

        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function() {
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
                // Handle Errors here.
                console.log(error.message);
                // ...
              });
        })
    })
    
    signupBtn.addEventListener('click', e => {
        window.location.href = "signup.html";
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