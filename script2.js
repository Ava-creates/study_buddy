document.getElementById("match").onclick = async function () {
    // location.href = "match.html";
    
    

    fetch('https://studybuddy-server.herokuapp.com/match').then(async function (response) {
      // The API call was successful!
      let json = await response.json();
      console.log(json);
    }).catch(function (err) {
      // There was an error
      console.warn('Something went wrong.', err);
    });


}

document.getElementById("to_do").onclick = function () {
    location.href = "to_do.html";
}

document.getElementById("help").onclick = function () {
    location.href = "help.html";
}


