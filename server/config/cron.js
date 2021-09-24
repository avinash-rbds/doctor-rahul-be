const cron = require("cron").CronJob;
const { odmYoutubeToken, odmYoutubeChannel } = require("../config/constants");
const { google } = require("googleapis");
const firebase = require("firebase-admin");
const youtube = google.youtube("v3");
const logger = require("../config/logger");

let playlists = [];
let playlistsObj = {};

/*
    Seconds: 0-59
    Minutes: 0-59
    Hours: 0-23
    Day of Month: 1-31
    Months: 0-11 (Jan-Dec)
    Day of Week: 0-6 (Sun-Sat)

    https://stackoverflow.com/questions/41597538/node-cron-run-job-every-3-hours

    # # #/1 # # # would try to run every second of every minute past every 1st hour
    0 0 #/1 # # # evaluates to 'At 0 seconds, 0 minutes every 1st hour'
*/

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
            });

            // NEW
            const playlist = {
                id: item.id,
                title: item.snippet.title,
                channelId: item.snippet.channelId,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                thumbnail: {
                    high: item.snippet?.thumbnails?.high?.url || "",
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
                id: item.id,
                title: item.snippet.title,
                thumbnail: {
                    high: item.snippet?.thumbnails?.high?.url || "",
                    maxres: item.snippet?.thumbnails?.maxres?.url || "",
                },
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

        if (result.data.nextPageToken) {
            await getPlaylistItems(playlistId, result.data.nextPageToken);
        } else {
            // console.log("-", playlistItems.length);
        }
    } catch (err) {
        console.log(err);
    }
};

exports.youtubePlaylistsJob = new cron("0 0 */1 * * *", async () => {
    try {
        // get array of playlists
        const result = await getPlaylists();

        result.forEach(async (playlist) => {
            try {
                await getPlaylistItems(playlist.id);
            } catch (err) {
                console.log(err);
            }
        });

        // FB reference
        const ref = firebase.database().ref("/web/youtube/playlists");

        if (result?.error) {
            const data = {
                success: false,
                error: result?.error,
                description:
                    "Holds playlists of all videos in ODM India channel",
                data: null,
            };

            ref.set(data)
                .then(() =>
                    console.log(
                        "NO DATA FROM YOUTUBE ::: ERROR DATA SAVED TO FIREBASE"
                    )
                )
                .catch((err) =>
                    console.log(
                        "NO DATA FROM YOUTUBE ::: DATA NOT SAVED TO FIREBASE ::: ",
                        err
                    )
                );
        } else {
            setTimeout(() => {
                const data = {
                    success: true,
                    error: false,
                    description:
                        "Holds playlists of all videos in ODM India channel",
                    data: playlistsObj,
                };
                const date = new Date();

                ref.set(data)
                    .then(() => {
                        console.log(
                            "DATA FETCHED FROM YOUTUBE ::: DATA SAVED TO FIREBASE"
                        );

                        logger.info(
                            `${date.toLocaleDateString()} - ${date.toLocaleTimeString()} ::: DATA FETCHED FROM YOUTUBE ::: DATA SAVED TO FIREBASE`
                        );
                    })
                    .catch((err) => {
                        console.log(
                            "DATA FETCHED FROM YOUTUBE ::: DATA NOT SAVED TO FIREBASE ::: ",
                            err
                        );

                        logger.error(
                            `${date.toLocaleDateString()} - ${date.toLocaleTimeString()} ::: DATA FETCHED FROM YOUTUBE ::: DATA NOT SAVED TO FIREBASE ::: ${err}`
                        );
                    });
            }, 1000);
        }

        // reset
        playlists = [];
    } catch (error) {
        console.log("ERROR in YouTube-Playlists : ", error);
    }
});
