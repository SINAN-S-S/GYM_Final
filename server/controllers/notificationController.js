import Notification from "../models/Notification.js";

// GET USER NOTIFICATIONS (User specific + Gym Broadcasts)
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ user: req.user._id }, { user: null }],
    })
      .sort({ createdAt: -1 })
      .limit(40);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      unreadCount,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// MARK NOTIFICATION AS READ
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// MARK ALL NOTIFICATIONS AS READ
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ user: req.user._id }, { user: null }] },
      { isRead: true }
    );
    res.json({ msg: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: SEND ANNOUNCEMENT OR MEMBER NOTIFICATION
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, linkUrl } = req.body;

    if (!title || !message) {
      return res.status(400).json({ msg: "Title and message are required" });
    }

    const notification = await Notification.create({
      user: userId || null, // null = all members
      title,
      message,
      type: type || "announcement",
      linkUrl: linkUrl || "",
      isRead: false,
    });

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: DELETE NOTIFICATION
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ msg: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
