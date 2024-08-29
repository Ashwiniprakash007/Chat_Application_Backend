const mongoose = require('mongoose');

const offlineMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    seen: { type: Boolean, default: false } 
});

module.exports = mongoose.model('OfflineMessage', offlineMessageSchema);
