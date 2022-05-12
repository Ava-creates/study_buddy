window.onload = async function() {
  await fetch(`https://studybuddy-server.herokuapp.com/userdata`).then(async function (response) {
    // The API call was successful!
  
    if (response.status === 403) {
      alert("Sorry, this application is only available to @nyu.edu emails.")
      location.href = '/';
    } else if (response.status === 401) {
      alert("You are not logged in!");
      location.href = '/';
    } else if (response.status === 200) {
      let json = await response.json();
      const name = json.displayName;
      const firstName = name.split(' ')[0];

      document.getElementById('username').innerHTML = firstName;

    }
  }).catch(function (err) {
    console.warn('Something went wrong.', err);
  });
}

const attemptToMatch = (retries, callback) => {
  if (retries <= 0) {
    callback("timeout");
    return;
  }

  fetch('https://studybuddy-server.herokuapp.com/match', {
    credentials: 'include',
  }).then(async function (response) {
    // The API call was successful!
    if (response.status === 401) {
      alert("You are not logged in. Please log in before attempting to match!");
      location.href = "/"
    }

    let json = await response.json();
    if (json.message === "success") {
      callback(json);
      return;
    } else if (json.message === "waiting" || json.message === "Matching started!") {
      setTimeout(() => attemptToMatch(retries - 1, callback), 1000);
    } 
  }).catch(function (err) {
    console.warn('Something went wrong.', err);
  });
}



// Card destinations
document.getElementById("to_do").onclick = function () {
  location.href = "to_do_update.html";
}

document.getElementById("help").onclick = function () {
  location.href = "help.html";
}

document.getElementById("match").onclick = function () {
  // displaying the preference pop up
  document.getElementById("pop-up").style.visibility = "visible";
}


// const closeMatchPopupButton = document.getElementsByClass()
// closeMatchPopupButton.addEventListener('closeMatchPopup', () => {
//   document.getElementById("pop-up").style.visibility = "hidden";
// });

// displaying major / class pop up in the second step of matching based on the input in the first step
document.getElementById("match_b").onclick = function () {
  var ele = document.getElementsByName('preference');
  var j = 0;
  for (let i = 0; i < ele.length; i++) {

    if (ele[i].checked) {
      j = 1;
      var c = ele[i].id;

      if (c === "major") {
        document.getElementById("enter_major").style.visibility = "visible";
        document.getElementById("pop-up").style.visibility = "hidden";
      }

      if (c === "class") {

        document.getElementById("enter_class").style.visibility = "visible";
        document.getElementById("pop-up").style.visibility = "hidden";
      }
    }
  }
  // alert in case of no radio button selected before clicking Match
  if (j === 0) {
    alert("please pick your preference");
  }
}

let startedMatch = false;

// Matching students based on their preference
document.getElementById("submit_major").onclick = async function () {
  // location.href = "match.html";
  document.getElementById("ring").style.visibility = "visible";
  document.getElementById("enter_major").style.visibility = "hidden";
  // location.href = "match.html";

  if (startedMatch === false) {
    attemptToMatch(30, (response) => {
      console.log(response);
      if (response === "timeout") {
        startedMatch = false;
      }

      if (response.room) {
        const roomID = response.room;
        localStorage.setItem("roomID", JSON.stringify(roomID))
        
        // redirect to the room
        location.href = "room.html"
        startedMatch = false;
      }
    });
    startedMatch = true;
  }
}


