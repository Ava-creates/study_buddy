// Establishing API call to google for logging in users
document.getElementById("loginButton").onclick = async function () {
  location.href = "match.html";

  location.href = "google";
  fetch('https://studybuddy-server.herokuapp.com/google').then(async function (response) {
    // The API call was successful!
    let json = await response.json();
    console.log(json);
  }).catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
  });
}
