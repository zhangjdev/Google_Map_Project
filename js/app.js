function loadScript() {
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDWS8xcnYoOY45Va9iL3I_3QmbXDnJ7PKI&callback=initMap';
  document.body.appendChild(script);
  $('script:last-child').attr('onerror', 'errorHandling()');
}
window.onload = loadScript;

var errorHandling = function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}


// —————— 控制左侧栏的显示与隐藏 ——————
// —————— hide or display view list on the left of the screen ——————

var isViewListDisplay = true;

var hideViewList = function hideViewList() {
  $('#arrow').attr('src','img/leftToRight.svg');
  $('#arrow').removeClass().addClass('leftSideHide');
  $('#listSection').removeClass().addClass('leftSideHide');
  isViewListDisplay = false;
}

var displayViewList = function displayViewList() {
  $('#arrow').attr('src','img/rightToLeft.svg');
  $('#arrow').removeClass().addClass('leftSideDisplay')
  $('#listSection').removeClass().addClass('leftSideDisplay');
  isViewListDisplay = true;
}

var arrowFunc = function arrowFunc() {
  if (isViewListDisplay === true) {
    hideViewList();
  } else {
    displayViewList();
  }
}

$('#arrow').click(arrowFunc);

// 页面加载完成后隐藏侧边栏
// hide the view list after the page is loaded.
$(document).ready(function() {
  arrowFunc();
});


// —————— 左侧栏列表的显示与筛选 ——————
// —————— display list item and function to filte them ——————

var viewModel = {
  query: ko.observable(''),
};

viewModel.markersArray = ko.dependentObservable(function() {
  var self = this;
  var filter = self.query().toLowerCase();
  return ko.utils.arrayFilter(markersArray, function(markersArray) {
    if (markersArray.title.toLowerCase().indexOf(filter) >= 0) {
      markersArray.showThisMarker = true;
      return markersArray.onTheView(true);
    } else {
      markersArray.showThisMarker = false;
      setAllMap();
      return markersArray.onTheView(false);
    }
  });
}, viewModel);

ko.applyBindings(viewModel);

// 在搜索框输入结束之后重新绘制地图来更新过滤结果
// 如果没有下边这行，删除搜索框内容后，页面并不更新
// reset the map after the result is filted
$("#searchBar").keyup(function() {
	setAllMap();
});


// —————— 地图相关代码 ——————
// —————— codes about Google Map ——————

// 绑定动画函数
// set the markers' bounce function
var toggleBounce = function toggleBounce() {
  this.setAnimation(google.maps.Animation.BOUNCE);

  // 当一个函数并非一个对象的属性时,那么它就是被当做一个函数来调用的。
  // 以此模式调用函数时, this 被绑定到全局对象,这是语言设计上的一个错误。
  // 倘若语言设计正确,那么当内部函数被调用时, this 应该仍然绑定到外部函数的 this 变量。
  // This was a mistake in the design of the language.
  // Had the language been designed correctly, when the inner function is invoked,
  // this would still be bound to the this variable of the outer function.
  // this commont quotes from JavaScript The Good Parts.
  var that = this;

  // 设置 2000 毫秒之后停止标识跳动动画
  setTimeout(function() {
        that.setAnimation(null)
    }, 2000);
}

// 把标识数组中的每一个标识都设置一个 showMarker 方法
// set showMarker function to every object in markersArray
var displayMarkers = function displayMarkers(markers) {
  for (i = 0; i < markers.length; i++) {

    markers[i].showMarker = new google.maps.Marker({
      position: new google.maps.LatLng(markers[i].lat, markers[i].lng),
      map: map,
      title: markers[i].title,
      animation: google.maps.Animation.DROP
    });

    markers[i].contentString = '<img src="' + markers[i].flickerImgUrl + '" alt="Flicker Image of '  + markersArray[i].title + '">';

    var infowindow = new google.maps.InfoWindow({
			content: markersArray[i].contentString
		});

    // 调用绑定动画函数
    // use toggleBounce function
    markers[i].showMarker.addListener('click', toggleBounce);

    // 将被点击的标记置于页面中心，并设置地图放大级别为15
    // When the marker is clicked, center it and zoom 15
    new google.maps.event.addListener(markers[i].showMarker, 'click', (function(thisMarker, i) {
			return function() {
				infowindow.setContent(markers[i].contentString);
        infowindow.open(map, thisMarker);
        map.setZoom(15);
				map.setCenter(thisMarker.getPosition());
			};
		})(markers[i].showMarker, i));

    // 将被点击的列表对应的标记置于页面中心，并设置地图放大级别为15
    // When the item in the list is clicked, center its marker and zoom 15
    var clickList = $('#marker' + i)
    clickList.click((function(thisMarker, i) {
      return function() {
        infowindow.setContent(markers[i].contentString);
				infowindow.open(map, thisMarker);
				map.setZoom(15);
				map.setCenter(thisMarker.getPosition());
      };
    })(markers[i].showMarker, i));
  }
}

// 把需要展示的标识在地图上展示出来
// display all the markers which should be displayed on the map
var setAllMap = function setAllMap() {
  for (var i = 0, len = markersArray.length; i < len; i++) {
    if(markersArray[i].showThisMarker === true) {
    markersArray[i].showMarker.setMap(map);
    } else {
    markersArray[i].showMarker.setMap(null);
    }
  }
}

// 初始化地图，设置地图参数，该函数在html文件中的js调用
// initialize the map, set the map preferences, and this will be call in the html
var map;

var initMap = function initMap() {
  var mapPreferences = {
    center: new google.maps.LatLng(40.714, -74.005),
    zoom: 14,
    mapTypeControl: false // 关闭地图类型选择控件
  }
  map = new google.maps.Map(document.getElementById('map'), mapPreferences);

  displayMarkers(markersArray);
  setAllMap();
}
