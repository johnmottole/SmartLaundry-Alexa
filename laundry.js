"use strict";

//initalize firebase
var firebase = require("firebase");
var config = {
 	apiKey: "XXXXX",
  	authDomain: "XXXXX",
  	databaseURL: "XXXXX",
  	storageBucket: "XXXXX",
  	messagingSenderId: "XXXXX"
};
firebase.initializeApp(config);

//Creates Speechlet Response
function buildSpeechletResponse (outputText, shouldEndSession) {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  };

}

//Creates Response
function generateResponse (speechletResponse) {

  return {
    version: "1.0",
    sessionAttributes: {},
    response: speechletResponse
  };

}

//Called to speak to user
function speak(response, context,callback) {
	context.succeed(generateResponse(buildSpeechletResponse(response, true)));
}


exports.handler = (event, context) => {
try{
  //If an intent
	if (event.request.type == "IntentRequest") {
      //If checking on laundry status
      if (event.request.intent.name == "LaundryStatus")
      {

          //Get facebook token
          let fbToken = event.session.user.accessToken;
          //See if token is available
          if (fbToken)
          {
              //Create firebase token from facebook token and log into firebase
              var credential = firebase.auth.FacebookAuthProvider.credential(fbToken);
              console.log(credential);
              firebase.auth().signInWithCredential(credential).catch(function(error) {
                  // Handle Errors here.
                  var errorCode = error.code;
                  var errorMessage = error.message;
                  
                }).then(function(result) {
                    //Get firebase user ID and loook up their information in database
                    var user = firebase.auth().currentUser.uid;
                    firebase.database().ref('/users/' + user).once('value').then(function(snapshot) {
                        let dataRecieved = snapshot.val();
                        //Check if user is monitoring their laundry
                        if (dataRecieved.inSession == false)
                        {
                            speak("You currently are not monitoring laundry. Download the iOS app to monitor your laundry.",context);
                        }else{
                            //If user is monitoring laundry check if laundry is done and say current status
                            if (dataRecieved.done == false)
                            {
                                speak("Your laundry is still going",context);
                            }else {
                                speak("Your laundry is done",context);
                            }
                        }
                        
                    });
                    
                });
                
          } else 
          {
            speak("Don't have log in",context);
          }
      } 
    }
	}catch(error){context.fail(`Exception: ${error}`)}
};