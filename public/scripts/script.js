var header,
    mapEl,
    content,
    sidebar,
    map,
    preLoadingScreen,
    wordCount,
    messageTextarea,
    geocoder,
    locationEl,
    pos,
    connection,
    postsEl,
    readmeBtn;

window.onload = function () {
    initElements();
    initEventHandler();

    document.body.style.opacity = 1;
    adjustSize();
    if (mapEl) initMap();
    initStreaming();
};

function initElements() {
    header = document.querySelector('header');
    mapEl = document.querySelector('#map');
    content = document.querySelector('#content');
    sidebar = document.querySelector('#posts-sidebar');
    preLoadingScreen = document.querySelector('#pre-loading');
    wordCount = document.querySelector('#word-count');
    messageTextarea = document.querySelector('#message-textarea');
    locationEl = document.querySelector('#location');
    postsEl = document.querySelector('#posts');
    readmeBtn = document.querySelector('#readme-btn');
}

function initEventHandler() {
    if (messageTextarea) {
        messageTextarea.addEventListener('input', function () {
            wordCount.textContent = messageTextarea.value.split(/ +/).filter(function (word) {
                return word
            }).length;
        });

        messageTextarea.addEventListener('keydown', function (event) {
            if (event.key == 'Enter') {
                event.preventDefault();
                createPost();
            }
        });
    }

    readmeBtn.addEventListener('click', function (event) {
        window.location.href = '/README.md';
    });
}

function initStreaming() {
    connection = new WebSocket('ws://localhost:8080');
    connection.onopen = function () {
        connection.send('Ping');
    };

    connection.onerror = function (error) {
        console.log(error);
    };

    connection.onmessage = function (e) {
        displayNewPost(JSON.parse(e.data));
    }
}

function displayNewPost(post) {
    let postEl = document.createElement('li');
    postEl.innerHTML =
        '<div class="info">' +
        '<div class="avatar ' + post.user.avatar.theme + '">' +
        '<i class="devicon-' + post.user.avatar.icon + '-plain"></i>' +
        '</div>' +
        '<div class="id-time">' +
        '<div class="id">' + post.user.key + '</div>' +
        '<div class="time">' + post.time + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="message">' + post.message + '</div>';

    postsEl.insertBefore(postEl, postsEl.firstChild);
    addClass(postEl, 'shining');

}

function createPost() {
    let formData = {};
    formData['post[latitude]'] = pos.lat;
    formData['post[longitude]'] = pos.lng;
    formData['post[message]'] = messageTextarea.value;
    let body = Object.keys(formData).map(function (key) {
        return key + '=' + formData[key];
    }).join('&');
    ajax('post', 'POST', body, 'application/json')
        .then(function () {
            messageTextarea.value = '';
        });
}

window.onresize = function () {
    adjustSize();
};

function adjustSize() {
    if(mapEl) {
        mapEl.style.height = (document.documentElement.clientHeight - header.clientHeight) + "px";
        mapEl.style.width = (content.clientWidth - sidebar.clientWidth) + "px";
    }
    if(sidebar)
        sidebar.style.height = mapEl.style.height;
    if(preLoadingScreen) preLoadingScreen.style.height = document.documentElement.clientHeight + "px";
}

function initMap() {
    var styledMapType = getMapStyle();

    map = new google.maps.Map(mapEl, {
        scrollwheel: true,
        mapTypeControl: false,
        streetViewControl: false,
        zoom: 6,
        mapTypeControlOptions: {
            mapTypeIds: ['styled_map']
        }
    });

    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');

    // Reverse geo encoding
    geocoder = new google.maps.Geocoder;

    // Get location
    if ("geolocation" in navigator)
        navigator.geolocation.watchPosition(updateLocation);
}

function updateLocation(position) {
    pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    map.setCenter(pos);
    geocoder.geocode({'location': pos}, function (results, status) {
        if (status === 'OK') {
            let number = results[0]['address_components'][0]['short_name'];
            let street = results[0]['address_components'][1]['short_name'];
            locationEl.textContent = number + ', ' + street;
        }

    });
    addClass(preLoadingScreen, 'loaded');
}

/**
 * Return ajax promise
 * @param {string} url - The request url
 * @param {string} method - The request method
 * @param {string} data - The request data
 * @param {string} format - The response format
 *
 * @return ajax promise
 */
function ajax(url, method, data, format) {
    return new Promise(function (succeed, fail) {
        var req = new XMLHttpRequest();
        req.open(method, url, true);
        req.addEventListener('load', function () {
            if (req.status < 400) succeed(req.responseText);
            else fail(req.responseText);
        });
        req.addEventListener("error", function () {
            fail(new Error("Network error"));
        });
        req.setRequestHeader('Accept', format);
        req.send(data);
    });
}

/**
 * Add a class to a DOM object
 * @param {HTMLElement} dom - The DOM object
 * @param {string} className - The class name to add
 */
function addClass(dom, className) {
    if (dom.className.indexOf(className) == -1)
        dom.className += dom.className.length > 0 ? ' ' + className : className;
}

/**
 * Remove a class from a DOM object
 * @param {HTMLElement} dom - The DOM object
 * @param {string} className - The class name to remove
 */
function removeClass(dom, className) {
    dom.className = dom.className.replace(new RegExp('\\s?' + className, 'g'), '')
}

function transition(obj) {
    var target = obj['target'];
    var property = obj['property'];
    var startVal = obj['from'];
    var endVal = obj['to'];
    var duration = obj['duration'];
    var curr = startVal;


    var step = (endVal - startVal) / duration * 10;
    var timer = window.setInterval(function () {
        curr += step;
        target[property] = curr;
        if (step > 0 && curr >= endVal) window.clearInterval(timer);
        else if (step < 0 && curr <= endVal) window.clearInterval(timer);
    }, 10);
}

function getMapStyle() {
    return new google.maps.StyledMapType(
        [
            {
                "featureType": "administrative",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#6395A0"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#f2f2f2"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#F5F5F2"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#BBE4CF"
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 45
                    },
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#F9C9AB"
                    },
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text",
                "stylers": [
                    {
                        "color": "#4e4e4e"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#f4f4f4"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#787878"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#eaf6f8"
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#C8ECED"
                    }
                ]
            }
        ]
    );
}