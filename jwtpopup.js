(function() {

    let token;
    let decodedHeader;
    let decodedToken;
    let authorizationHeader;
    function showEl(id){
        var el = document.querySelector(id);
        el.style.display = 'inline';
        setTimeout(()=>{
            el.style.display='none';
        },2000);
    }
    function copyToClipboard (text) {
        return navigator.clipboard.writeText(text);
    }

    document.querySelector('#copy_token').onclick = function() {
        copyToClipboard(token).then(()=>{
            showEl('#copied_jwt');
        });
        
    };

    document.querySelector('#copy_decoded_token').onclick = function() {
        copyToClipboard(decodedToken).then(()=>{
        showEl('#copied_payload');
        });
    };

    document.querySelector('#copy_header').onclick = function() {
        copyToClipboard(authorizationHeader.value).then(()=>{
        showEl('#copied_jwt');
        });
    };

    function orderedJsonStringify(o) {
        return JSON.stringify(Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {}), null, 2);
    }

    function parseTokenPart(token, index) {
        return orderedJsonStringify(JSON.parse(window.atob(token.split('.')[index].replace('-', '+').replace('_', '/'))));
    };

    function parseHeader (token) {
        return parseTokenPart(token, 0);
    };
    
    function parsePayload (token) {
        return parseTokenPart(token, 1);
    };

    function showToken(access_token, request) {
        document.querySelector('#token_absent').style.display = 'none';
        document.querySelector('#token_present').style.display = 'block';
        token = access_token;
        decodedHeader = parseHeader(token);
        decodedToken = parsePayload(token);
        document.querySelector('#decoded_header').innerText = decodedHeader;
        document.querySelector('#decoded_token').innerText = decodedToken;
        document.querySelector('#token').innerText = token;
        document.querySelector('#request').innerText = request || '';
    }

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        if (tabs[0]) {
            chrome.runtime.sendMessage(null, {requestsForTabId: tabs[0].id}, null, function(responseArray) {
                if (responseArray && responseArray.length > 0) {
                    let request = responseArray.pop();
                    authorizationHeader = request.requestHeaders.find(function(header) {
                        return (header.name.toLowerCase() === 'authorization') && (header.value.toLowerCase().startsWith('bearer ')) && (header.value.substring(7).split('.').length === 3);
                    });
                    if (authorizationHeader) {
                        showToken(authorizationHeader.value.substring(7), request.method + ' ' + request.url);
                    }
                }    
            });
        }
    });
})();
