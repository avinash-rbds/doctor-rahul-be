module.exports = {
    env: process.env.ENV,
    port: process.env.PORT,
    projectId: process.env.PROJECT_ID,
    odmYoutubeToken: process.env.ODM_YOUTUBE_TOKEN,
    odmYoutubeChannel: process.env.ODM_YOUTUBE_CHANNEL,
    ODM_GMAIL: process.env.ODM_GMAIL,
    ODM_GMAIL_CLIENT_ID: process.env.ODM_GMAIL_CLIENT_ID,
    ODM_GMAIL_CLIENT_SECRET: process.env.ODM_GMAIL_CLIENT_SECRET,
    ODM_GMAIL_REFRESH_TOKEN: process.env.ODM_GMAIL_REFRESH_TOKEN,
    logs: process.env.ENV === "production" ? "combined" : "dev",
};
