var setImgUrlForMarkerArray = function setImgUrlForMarkerArray(targetArray) {

  var setImgUrlForMarkerObject = function setImgUrlForMarkerObject(markerObject) {
    var searchUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=99d500c01ca196be308ffc1a118f7712&lat=' + markerObject.lat + '&lon=' + markerObject.lng + '&radius=0.1&per_page=1&format=json';
    $.ajax({
      url: searchUrl,
      dataType: 'jsonp',
      jsonp: 'jsoncallback',
      success: function(returnData) {
        var photoInfo = returnData.photos.photo;
        markerObject.flickerImgUrl = 'https://farm' + photoInfo[0].farm + '.static.flickr.com/' + photoInfo[0].server + '/' + photoInfo[0].id + '_' + photoInfo[0].secret + '.jpg';
      },
      error: function() {
        markerObject.flickerImgUrl = 'img/flickerError.jpg';
      }
    });
  }

  for (var i = 0, len = targetArray.length; i < len; i++) {
    setImgUrlForMarkerObject(targetArray[i]);
  }
}

setImgUrlForMarkerArray(markersArray);
