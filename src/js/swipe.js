var spotify_UserID = null;
var spotify_PlaylistID = null;
var spotify_song_url = null;
var spotify_song_id = null;
var audio_obj = new Audio();
var audio_current_Time = 0;
var recommendation = 0;

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

function initLogout(){
    document.getElementById("swipe-popup-logout").addEventListener("click", logout);
}

function initAudioPlayback(){
    document.getElementById("swipe-music-play-option").addEventListener("click", audioPlayer);
    document.getElementById("swipe-music-play-option").addEventListener("mouseover", setAudioWidget);
}

function initLikeDislike(){
    document.getElementById("swipe-cart-dislike").addEventListener("click",dislikedSong);
    document.getElementById("swipe-cart-like").addEventListener("click",likedSong);
}

function initDelete(){
    document.getElementById("swipe-popup-delete").addEventListener("click", function(){
        deleteAccount();
    });
}

async function initSpotifyConnection(){
    //setup to get the first song
    checkConnected().then(
        function(){
            checkAccessToken().finally(
                function(){
                    getSpotifyUserID().then(
                        function(){
                            checkPlaylist().then(
                                function(){
                                    getValidSong();
                                },
                                function(){
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

function displaySong(data) {
    let image = document.getElementById("swipe-cart-image-container");
    let title = document.getElementById("swipe-cart-title");
    let artists = document.getElementById("swipe-cart-artist");

    title.innerText = data.name;
    let artiststext = "";
    for(let i = 0; i < data.artists.length; i++){
        artiststext += data.artists[i].name;
        if(i != data.artists.length-1){
            artiststext += ", ";
        }
    }
    artists.innerText = artiststext;

    image.style.backgroundImage = "url("+data.cover+")";
    image.style.backgroundSize = "100% auto, cover";

    spotify_song_url = data.preview_url;
    spotify_song_id = data.id;
    audio_obj.src = spotify_song_url;
}

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

function dislikedSong(){
    audio_obj.pause();
    addDislike(spotify_song_id).then(function(){},function(){displayInSnackbar("internal Tinify error");});
    getValidSong();
}

function likedSong(){
    audio_obj.pause();
    addLike(spotify_song_id).then(function(){},function(){displayInSnackbar("internal Tinify error");});
    addSongToPlaylist(spotify_song_id, spotify_PlaylistID).then(function(){},function(){displayInSnackbar("Spotify error");});
    getValidSong();
}

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

async function checkAccessToken(){
    if(localStorage.accesstoken && localStorage.expireDate){
        if(localStorage.expireDate < Date.now()-5000){
            await requestAccessToken().then(function(){},function(){displayInSnackbar("internal Tinify error");});
        }
    } else {
        await requestAccessToken().then(function(){},function(){displayInSnackbar("internal Tinify error");});
    }
}

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

function displayInSnackbar(text){
    let snackbar = document.getElementById("snackbar");
    snackbar.innerText = text;
    snackbar.classList.add("showSnackbar");

    setTimeout(function(){ snackbar.className = snackbar.classList.remove("showSnackbar"); }, 3000);
}