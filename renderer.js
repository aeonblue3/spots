// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {remote, ipcRenderer} = require("electron")
  , SpotifyHelper = require("spotify-helper");

let spotify = new SpotifyHelper();
let artist, album, track;
/**
 * Change the image in the dom to the album image
 * 
 * @param  {Object} data
 * 
 * @return void
 */
function displayAlbumImage(data) {
  document.getElementById("album_art").src = data.body.images[data.body.images.length - 1].url;
}
/**
 * Get the album info from spotify
 * 
 * @param  {String} id
 * 
 * @return void
 */
function getAlbumImage (id) {
  var url = "https://api.spotify.com/v1/albums/";

  spotify._request('GET', url + id).then(displayAlbumImage);
}

/**
 * Puts the artist name next to the tray icon.
 * 
 * @param  {Object} data  Data object returned from the getStatus method.
 * 
 * @return void
 */
function setSongInfo (data) {
  if (data.track.track_resource.name !== track) {
    getAlbumImage(data.track.album_resource.uri.split(':')[2]);
  }
  artist = data.track.artist_resource.name;
  album = data.track.album_resource.name;
  track = data.track.track_resource.name;
  
  document.getElementById("artist_name").innerText = artist;
  document.getElementById("album_name").innerText = album;
  document.getElementById("track_name").innerText = track;

  ipcRenderer.send("send-artist", artist);
}

/**
 * Temporary method to test the getStatus method.
 */
function getCurrentSong() {
  return spotify.init().then(function() {
    return spotify.getStatus(1).then(setSongInfo);
  })
  .catch(function (err) {
    console.error("Spotify may not be running: " + err); // Catch any errors thrown from the methods.
  });
}

getCurrentSong();
setInterval(function() {
  getCurrentSong();
}, 5000);