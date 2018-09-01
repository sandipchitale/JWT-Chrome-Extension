(function () {
    var tabIdFrameIdToTokens = {};
    chrome.webRequest.onBeforeSendHeaders.addListener(function (request) {
        if (request.requestHeaders) {
            let authoizationHeader = request.requestHeaders.find(function (header) {
                return (header.name === 'Authorization') && header.value.startsWith('Bearer ');
            });
            if (authoizationHeader) {
                let requestInfo = [];
                requestInfo.push(request);
                tabIdFrameIdToTokens[request.tabId] = requestInfo;
            } else {
                // check if initiator changed
                let lastRequestArray = tabIdFrameIdToTokens[request.tabId];
                if (lastRequestArray && lastRequestArray.length && lastRequestArray.length > 0) {
                    let lastRequest = lastRequestArray[0];
                    if (lastRequest.initiator !== request.initiator) {
                        delete tabIdFrameIdToTokens[request.tabId];
                    }
                }

            }
        }
    },
    {
        urls: [
            "http://*:*/*",
            "https://*:*/*"
        ]
    },
    ["requestHeaders"]);

    chrome.runtime.onMessage.addListener(function(message, sender, responseCallback) {
        if (message.requestsForTabId) {
            responseCallback(tabIdFrameIdToTokens[message.requestsForTabId]);
        }
    });
})();