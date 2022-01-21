function grab(): void {
    console.log("Clicked");
    try {
        // Implemented as per https://stackoverflow.com/a/27872244/316244
        // The code could do with a bit of refactoring.
        let apiKey = "AIzaSyCtmZ0sMh7merj4n88LOucBes0tOsKJFtc";
        let playlistId = "UU3tNpTOHsTnkmbwztCs30sA";

        // getting playlist data. The max is 50 videos per page, so looping (in all pages mode) until we have all video
        let pageToken;
        let outputData = { table: [] };
        do {
            let url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistId + "&key=" + apiKey;
            if (pageToken && pageToken != '') {
                url += '&pageToken=' + pageToken;
            }
            let playlistData = httpGet(url);

            let json = JSON.parse(playlistData);
            if (json.nextPageToken && json.nextPageToken != '') {
                pageToken = json.nextPageToken;
            } else {
                pageToken = "";
            }
            json.items.forEach(element => {
                try {
                    outputData.table.push({videoId: element.snippet.resourceId.videoId})
                } catch (err) {
                    console.log(err);
                }
            });
        }
        while (pageToken != "");

    } catch (err) {
        console.log(err);
    }
}

function httpGet(theUrl): string {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}