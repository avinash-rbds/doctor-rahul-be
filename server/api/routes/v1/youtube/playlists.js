const {
    odmYoutubeToken,
    odmYoutubeChannel,
} = require("../../../../config/constants");
const { google } = require("googleapis");
const youtube = google.youtube("v3");

let playlists = [];
let playlistsObj = {};

const getPlaylists = async (pageToken = null) => {
    const params = {
        key: odmYoutubeToken,
        part: "id, snippet",
        channelId: odmYoutubeChannel,
        pageToken,
        maxResults: 50,
    };

    try {
        const result = await youtube.playlists.list(params);
        result.data.items.forEach((item) => {
            // create array of playlists
            playlists.push({
                id: item.id,
                // title: item.snippet.title,
                // channelId: item.snippet.channelId,
                // channelTitle: item.snippet.channelTitle,
                // publishedAt: item.snippet.publishedAt,
                // thumbnail: {
                //     default: item.snippet?.thumbnails?.default?.url || "",
                //     medium: item.snippet?.thumbnails?.medium?.url || "",
                //     high: item.snippet?.thumbnails?.high?.url || "",
                //     standard: item.snippet?.thumbnails?.standard?.url || "",
                //     maxres: item.snippet?.thumbnails?.maxres?.url || "",
                // },
            });

            // NEW
            const playlist = {
                id: item.id,
                title: item.snippet.title,
                channelId: item.snippet.channelId,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                thumbnail: {
                    // default: item.snippet?.thumbnails?.default?.url || "",
                    // medium: item.snippet?.thumbnails?.medium?.url || "",
                    high: item.snippet?.thumbnails?.high?.url || "",
                    // standard: item.snippet?.thumbnails?.standard?.url || "",
                    maxres: item.snippet?.thumbnails?.maxres?.url || "",
                },
                playlistItems: {
                    playlistId: item.id,
                    length: 0,
                    data: [],
                },
            };
            playlistsObj[item?.id] = playlist;
        });

        if (result.data.nextPageToken) {
            await getPlaylists(result.data.nextPageToken);
        } else {
            // console.log(playlists.length);
        }
    } catch (err) {
        console.error(err);
    }
    return playlists;
};

const getPlaylistItems = async (playlistId, pageToken = null) => {
    const params = {
        key: odmYoutubeToken,
        channelId: odmYoutubeChannel,
        part: "id, snippet",
        playlistId,
        pageToken,
        maxResults: 50,
    };

    try {
        const result = await youtube.playlistItems.list(params);
        let items = [];

        result.data.items.forEach((item) => {
            items.push({
                // playlistId,
                id: item.id,
                title: item.snippet.title,
                // channelTitle: item.snippet.channelTitle,
                // description: item.snippet.description,
                // publishedAt: item.snippet.publishedAt,
                thumbnail: {
                    // default: item.snippet?.thumbnails?.default?.url || "",
                    // medium: item.snippet?.thumbnails?.medium?.url || "",
                    high: item.snippet?.thumbnails?.high?.url || "",
                    // standard: item.snippet?.thumbnails?.standard?.url || "",
                    maxres: item.snippet?.thumbnails?.maxres?.url || "",
                },
                // videoId: item.snippet.resourceId.videoId,
                url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            });
        });

        // NEW
        playlistsObj[playlistId].playlistItems.length += parseInt(
            result?.data?.items?.length
        );

        playlistsObj[playlistId].playlistItems.data = [
            ...playlistsObj[playlistId].playlistItems.data,
            ...items,
        ];

        // console.log("#", typeof parseInt(result.data.items.length));

        if (result.data.nextPageToken) {
            await getPlaylistItems(playlistId, result.data.nextPageToken);
        } else {
            // console.log("-", playlistItems.length);
        }
    } catch (err) {
        console.log(err);
    }
};

exports.fetchPlaylists = async (req, res) => {
    // get array of playlists
    const result = await getPlaylists();

    result.forEach(async (playlist) => {
        try {
            await getPlaylistItems(playlist.id);
        } catch (err) {
            console.log(err);
        }
    });

    if (result?.error) {
        // res.send({ data: null, success: false, error: result.message });
    } else {
        setTimeout(() => {
            // res.send({
            //     data: playlistsObj,
            //     success: true,
            //     error: null,
            // });
            console.log("#");
        }, 1000);
    }

    // reset
    playlists = [];

    return {
        success: result?.error ? false : true,
        error: result?.error ? result.message : false,
        description: "Holds playlists of all videos in ODM India channel",
        data: result?.error ? null : playlistsObj,
    };
};
