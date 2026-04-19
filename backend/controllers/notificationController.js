import Notification from "../models/Notification.js";

// Get all notifications for the logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send bulk notification (Admin / Teacher only)
export const sendBulkNotification = async (req, res) => {
  try {
    const { title, message, type, recipients, link } = req.body;

    const notifs = recipients.map((rId) => ({
      recipient: rId,
      sender: req.user._id,
      title,
      message,
      type: type || "info",
      link: link || "",
    }));

    await Notification.insertMany(notifs);

    res.status(201).json({ success: true, message: `Sent ${notifs.length} notifications.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
