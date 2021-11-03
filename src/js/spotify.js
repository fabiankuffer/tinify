function getSpotifyUserID(){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    let response = JSON.parse(xhttp.responseText); 
                    spotify_UserID = response.id;
                    resolve();
                } else {
                    reject();
                }
            }
        };
        xhttp.open("get", "https://api.spotify.com/v1/me", true);
        xhttp.setRequestHeader("Accept","application/json");
        xhttp.setRequestHeader("Content-Type","application/json");
        xhttp.setRequestHeader("Authorization","Bearer "+localStorage.getItem("accesstoken"));
        xhttp.send();
    });
}

function checkPlaylist(){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    let response = JSON.parse(xhttp.responseText); 
                    for(let i = 0; i < response.items.length; i++){
                        if(response.items[i].name == "Tinify"){
                            spotify_PlaylistID = response.items[i].id;
                            break;
                        }
                    }
                    if(spotify_PlaylistID != null){
                        resolve();
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            }
        };
        xhttp.open("get", "https://api.spotify.com/v1/me/playlists", true);
        xhttp.setRequestHeader("Accept","application/json");
        xhttp.setRequestHeader("Content-Type","application/json");
        xhttp.setRequestHeader("Authorization","Bearer "+localStorage.getItem("accesstoken"));
        xhttp.send();
    });
}

function createPlaylist(){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    let response = JSON.parse(xhttp.responseText); 
                    spotify_PlaylistID = response.id;
                    resolve();
                } else {
                    reject();
                }
            }
        };
        xhttp.open("post", "https://api.spotify.com/v1/users/"+spotify_UserID+"/playlists", true);
        xhttp.setRequestHeader("Accept","application/json");
        xhttp.setRequestHeader("Content-Type","application/json");
        xhttp.setRequestHeader("Authorization","Bearer "+localStorage.getItem("accesstoken"));
        xhttp.send(JSON.stringify({ "name": "Tinify", "description": "Autogenerated Playlist from Tinify", "public": false}));
    });
}

function loadSong(){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    let response = JSON.parse(xhttp.responseText); 
                    resolve({"id":response.tracks.items[0].id,"name":response.tracks.items[0].name,"preview_url":response.tracks.items[0].preview_url, "artists": response.tracks.items[0].artists, "cover":response.tracks.items[0].album.images[0].url});
                } else {
                    reject();
                }
            }
        };
        const randomOffset = Math.floor(Math.random() * 1000);
        xhttp.open("get", "https://api.spotify.com/v1/search?type=track&limit=1&offset="+randomOffset+"&q="+getRandomSearch(), true);
        xhttp.setRequestHeader("Accept","application/json");
        xhttp.setRequestHeader("Content-Type","application/json");
        xhttp.setRequestHeader("Authorization","Bearer "+localStorage.getItem("accesstoken"));
        xhttp.send();
    });
}

function addSongToPlaylist(song_id, playlist_id){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    resolve();
                } else {
                    reject();
                }
            }
        };
        xhttp.open("post", "https://api.spotify.com/v1/playlists/"+playlist_id+"/tracks", true);
        xhttp.setRequestHeader("Accept","application/json");
        xhttp.setRequestHeader("Content-Type","application/json");
        xhttp.setRequestHeader("Authorization","Bearer "+localStorage.getItem("accesstoken"));
        xhttp.send(JSON.stringify({"uris": ["spotify:track:"+song_id]}));
    });
}

async function getValidSong() {
    await checkAccessToken().then(
        async function(){
            await loadSong().then(
                function(data){
                    if(data.preview_url == null){
                        getValidSong();
                    } else {
                        checkReviewed(data.id).then(
                            function(){
                                displaySong(data);
                            },
                            function(){
                                getValidSong();
                            }
                        );
                    }
                },
                function(data){
                    getValidSong();
                }
            );
        }
    );
}