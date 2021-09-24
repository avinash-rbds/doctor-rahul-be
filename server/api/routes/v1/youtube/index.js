const {
    odmYoutubeToken,
    odmYoutubeChannel,
} = require("../../../../config/constants");
const { google } = require("googleapis");
const youtube = google.youtube("v3");

let formattedPlaylists = [];
const getPlaylistData = async (pageToken = null) => {
    try {
        const playlists = await youtube.playlists.list({
            key: odmYoutubeToken,
            part: "id, snippet",
            channelId: odmYoutubeChannel,
            pageToken,
            maxResults: 50,
        });

        const {
            data: { nextPageToken, items },
        } = playlists;

        const list = items.map(({ id, snippet }) => {
            return {
                id,
                channelId: snippet.channelId,
                title: snippet.title,
                channelTitle: snippet.channelTitle,
                publishedAt: snippet.publishedAt,
                thumbnail: {
                    default: snippet?.thumbnails?.default?.url || "",
                    medium: snippet?.thumbnails?.medium?.url || "",
                    high: snippet?.thumbnails?.high?.url || "",
                    standard: snippet?.thumbnails?.standard?.url || "",
                    maxres: snippet?.thumbnails?.maxres?.url || "",
                },
                videos: [],
            };
        });
        formattedPlaylists = [...formattedPlaylists, ...list];

        if (nextPageToken) {
            await getPlaylistData(nextPageToken);
        }
    } catch (err) {
        console.log(err);
        return {
            error: true,
            message: err?.errors[0].message,
        };
    }
};

exports.fetchPlaylists = async (req, res) => {
    const result = await getPlaylistData();

    if (result?.error) {
        res.send({ data: null, success: false, error: result.message });
    } else {
        res.send({ data: formattedPlaylists, success: true, error: null });
    }

    // reset
    formattedPlaylists = [];
};
