import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markNotificationAsRead } from "../redux/notificationSlice.js";
import "../styles/notification.css";

const Notifications = ({onMarkAsRead}) => {
    const dispatch = useDispatch();
    const { list, loading, error } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const handleMarkAsRead = (id) => {
        dispatch(markNotificationAsRead(id));
        if(onMarkAsRead){
            onMarkAsRead();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="notifications-container">
            <h3 className="notifications-header">Notifications</h3>
            {loading && <p className="loading-text">Loading...</p>}
            {error && <p className="error-text">{error}</p>}
            <ul className="notifications-list">
                {list.map((notif) => (
                    <li
                        key={notif._id}
                        className={`notification-item ${notif.isRead ? "read" : "unread"}`}
                    >
                        <span className="notification-message">{notif.message}</span>
                        <span className="notification-date">
                            {formatDate(notif.createdAt)}
                        </span>
                        {!notif.isRead && (
                            <button
                                className="mark-as-read-button"
                                onClick={() => handleMarkAsRead(notif._id)}
                            >
                                Mark as Read
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;