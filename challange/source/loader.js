;(function(document, window, undefined) {
function parseQueryString() {
    if (location.query) { return; }
    
    var parts = location.search.replace(/^[?]/, "").split("&"),
        i     = 0,
        l     = parts.length,
        GET   = {};

    for (; i < l; i++) {
        if (!parts[i]) { continue; }
        part = parts[i].split("=");
        GET[unescape(part[0])] = unescape(part[1]);
    }

    return GET;
}
jigsaw.GET = parseQueryString();
}(document, window));
