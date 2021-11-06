//all the vars that are necessary to run this webapp
var spotify_UserID = null;
var spotify_PlaylistID = null;
var spotify_song_url = null;
var spotify_song_id = null;
var audio_obj = new Audio();
var audio_current_Time = 0;
var recommendation = 0;

//init all elements of the view if the side is fully loaded
//also search for the first song to display
window.onload = function () {
    initPopups();
    initLogout();
    initDelete();
    initAudioPlayback();
    initLikeDislike();
    initSuggestion().finally(
        function(){
            initSpotifyConnection();
        }
    );
};

//init the logout button
function initLogout(){
    document.getElementById("swipe-popup-logout").addEventListener("click", logout);
}

//init the playbackbuttons that are elements above the album cover
function initAudioPlayback(){
    document.getElementById("swipe-music-play-option").addEventListener("click", audioPlayer);
    document.getElementById("swipe-music-play-option").addEventListener("mouseover", setAudioWidget);
}

//init the dislike button
function initLikeDislike(){
    document.getElementById("swipe-cart-dislike").addEventListener("click",dislikedSong);
    document.getElementById("swipe-cart-like").addEventListener("click",likedSong);
}

//init the delete user-account button
function initDelete(){
    document.getElementById("swipe-popup-delete").addEventListener("click", deleteAccount);
}

//this stack of functions calls is necessary to get all the spotify user details to use the webapp
//all are depend to the step bevore. thats why all functions are promises
async function initSpotifyConnection(){
    //check if user connected to spotify id
    checkConnected().then(
        function(){
            //check if the user has an access token
            checkAccessToken().finally(
                function(){
                    //get the user spotify id
                    getSpotifyUserID().then(
                        function(){
                            //checks if there is a playlist for tinify
                            checkPlaylist().then(
                                function(){
                                    //if there is a playlist display a song in the cart
                                    getValidSong();
                                },
                                function(){
                                    //if ther is no playlist just create a new playlist and then search for a song
                                    createPlaylist().then(
                                        function(){
                                            getValidSong();
                                        },
                                        function(){
                                            displayInSnackbar("Spotify Playlist can't be created");
                                        }
                                    );
                                }
                            );
                        },
                        function(){
                            displayInSnackbar("Spotify error");
                        }
                    );
                }
            )
        },
        function(){
            displayInSnackbar("internal Tinify error");
        }
    );
}

//function to display a song in the song-cart
function displaySong(data) {
    let image = document.getElementById("swipe-cart-image-container");
    let title = document.getElementById("swipe-cart-title");
    let artists = document.getElementById("swipe-cart-artist");

    //add all artists to the artits div
    title.innerText = data.name;
    let artiststext = "";
    for(let i = 0; i < data.artists.length; i++){
        artiststext += data.artists[i].name;
        if(i != data.artists.length-1){
            artiststext += ", ";
        }
    }
    artists.innerText = artiststext;

    //add album cover as a backgroundimage so it isn't that easy to get the image :)
    image.style.backgroundImage = "url("+data.cover+")";
    image.style.backgroundSize = "100% auto, cover";

    spotify_song_url = data.preview_url;
    spotify_song_id = data.id;
    audio_obj.src = spotify_song_url;
}

//used to create a random searchstring with wildcards to get a random song
function getRandomSearch() {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    
    const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));
    let randomSearch = '';
  
    switch (Math.round(Math.random())) {
      case 0:
        randomSearch = randomCharacter + '%';
        break;
      case 1:
        randomSearch = '%' + randomCharacter + '%';
        break;
    }
  
    return encodeURI(randomSearch);
}

//adds the buttons to the audio playback element corresponding to the audio playback status if the users hovers over the album cover
function setAudioWidget(){
    let widget = document.getElementById("swipe-music-play-option");
    widget.classList.remove("play_song","pause_song","replay_song");
    if(audio_obj.paused && !audio_obj.ended){
        widget.classList.add("play_song");
    } else if(audio_obj.ended){
        widget.classList.add("replay_song");
    } else {
        widget.classList.add("pause_song");
    }
}

//the function that is called if the disliked button is pressed
//just add it to the dislike table and search for a new song and pause the song
function dislikedSong(){
    audio_obj.pause();
    addDislike(spotify_song_id).then(function(){},function(){displayInSnackbar("internal Tinify error");});
    getValidSong();
}

//the function that is called if the like button is pressed
//just add it to the like table and search for anew song and pause the song and add it to the spotify playlist
function likedSong(){
    audio_obj.pause();
    addLike(spotify_song_id).then(function(){},function(){displayInSnackbar("internal Tinify error");});
    addSongToPlaylist(spotify_song_id, spotify_PlaylistID).then(function(){},function(){displayInSnackbar("Spotify error");});
    getValidSong();
}

//sets the audioplayer buttons if the user clicked a button
function audioPlayer(){
    let widget = document.getElementById("swipe-music-play-option");
    widget.classList.remove("play_song","pause_song","replay_song");
    
    if(audio_obj.paused){
        audio_obj.play();
        widget.classList.add("pause_song");
    } else {
        widget.classList.add("play_song");
        audio_obj.pause();
    }
}

//checks for the accesstoken in the localstorage if the token is valid
//if not request a new one
async function checkAccessToken(){
    if(localStorage.accesstoken && localStorage.expireDate){
        if(localStorage.expireDate < Date.now()-5000){
            await requestAccessToken().then(function(){},function(){displayInSnackbar("internal Tinify error");});
        }
    } else {
        await requestAccessToken().then(function(){},function(){displayInSnackbar("internal Tinify error");});
    }
}

//function to delete an account
//but the user has to press the button twice, with a message that will be displayed at the first click
const deleteAccount = (function(){
    let count = 0;
    return function(){
        count++;
        if(count == 1){
            document.getElementById("swipe-popup-delete-warning").style.display = "block";
        } else {
            deleteRequest().then(
                function(){
                    logout();
                },
                function(){
                    displayInSnackbar("internal Tinify error");
                }
            );
        }
    };
})();

//init the suggestions button in the settings popup and load the suggestions from the tinify-api and display the buttons according to the informations
async function initSuggestion(){
    document.getElementById("swipe-popup-all-songs").addEventListener("change",function(){updateRecommendation("all");});
    document.getElementById("swipe-popup-recommended-songs").addEventListener("change",function(){updateRecommendation("recommended");});
    await loadRecommendation().then(function(){},function(){displayInSnackbar("internal Tinify error");});
    if(recommendation == 1){
        document.getElementById("swipe-popup-recommended-songs").checked = true;
    } else {
        document.getElementById("swipe-popup-all-songs").checked = true;
    }
}

//a functions that displays a text for 3s in the bottom part of the display
function displayInSnackbar(text){
    let snackbar = document.getElementById("snackbar");
    snackbar.innerText = text;
    snackbar.classList.add("showSnackbar");

    setTimeout(function(){ snackbar.className = snackbar.classList.remove("showSnackbar"); }, 3000);
}