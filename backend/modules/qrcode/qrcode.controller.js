const User = require("../users/user.model");
const qrCodeService = require("../../services/qrCodeService");
const userActivityModel = require("../users/userActivity.model");
exports.downloadQRCode = async (req, res) => {
  try {
    const { shareId } = req.params;
    const user = await User.findOne({ shareId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const qrCode = await qrCodeService.generateAndSaveQRCode(
      user,
      req.headers.referer,
      {
        size: 400,
        logoSize: 100,
      }
    );

    user.analytics.qrcodeDownloads++;
    await user.save();

    userActivityModel.trackActivity({
      userId: user._id,
      activityType: "qrcodeDownloads",
      visitorInfo: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });
    return res.status(200).json({ success: true, message: "QR code generated successfully" ,url: qrCode.qrCode.dataUrl});
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
