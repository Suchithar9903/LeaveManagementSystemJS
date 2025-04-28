const Notification = require("./models/Notification.js");

const sendNotification = async(userId, message) => {
    try{
        const notificaton = new Notification({user: userId, message});
        await notificaton.save();
    }catch (error) {
        console.error("Error sending notification:", error);
    }
};

module.exports = {sendNotification};