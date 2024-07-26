export const BACKEND_URL = "https://current-fish-manually.ngrok-free.app";

export const apiEndpoints = { pinLogin: "/api/users/pin-login", recordUpload: "/api/users/upload", deviceToken: "/api/users/device-token", saveLocation: "/api/users/save-location", audioPlayStatus: "/api/users/audio-play-status", notificationStatus: "/api/users/notification-status", fetchNearDevices: "/api/users/fetch-near-devices", mobileVerification: "/api/users/mobile-verification", otpVerification: "/api/users/otp-verification", pinSet: "/api/users/pin-set", profileDetails: "/api/users/profile-details", profileUpload: "/api/users/profile-upload", reportUser: "/api/users/report-user", channelList: "/api/users/channel-list", emailSubmit: "/api/users/email-submit", locationSubmit: "/api/users/location-submit", nameSubmit: "/api/users/name-submit", iconTapAction: "/api/users/icon-tap-action", cameraList: "/api/users/camera-list", actionIconList: "/api/users/action-icon-list" };

export const AlertMessages = { no_internet: { title: "No Internet! ❌", message: "Sorry, we need an Internet connection for App to run correctly." }, location_access_error: { title: "Location Permission issue", message: "Location permission need to allow for proper location access" }, notification_access_error: { title: "Notification permission issue", message: "Allow notification permission for get incoming message" }, location_access_bg_error: { title: "Location Permission Issue", message: "Location permission need to allow all the time for tracking location in background" }, report_user_success: { title: "User is reported", message: "" }, report_user_failed: { title: "Faild to reported", message: "" }, resend_otp: { title: "OTP sent successfully.", message: "Please check your message box." }, location_turn_on: { title: "Turn on Device Location for your Phone", message: "Please turn on location from setting panel, We will use location services to acquire your exact location." }, cameraTapAction: { title: "Camera location sent to the all route users", message: "" }, otherMapIconTapAction: { title: "Signal sent to the all route users", message: "" } };

export const COLORS = {
    PRIMARY: '#6017EB',
    SECONDARY: '#F2C245',
    BACKGROUND: '#FFFFFF',
    TEXT: '#7B7B7B',
    WHITE: '#FFFFFF',
    RED: '#FF0000',
    PLACEHOLDER_COLOR: '#666666',
    BLACK: '#000000',
};

export const errorMessage = { mobile_no: "Invalid mobile number!", commonError: "Failed to process! Try again later.", otp: "Invalid OTP entered.", pin: "Invalid PIN entered.", pinConfirm: "PIN not matched.", email: "Enter a valid email address!", name: "Enter a valid name!", location: "Enter a valid location!", routeSelect: "Please choose one of the route options before taking action!" }

export const mobileRegex = /^[1-9]{1}[0-9]{9}$/;

export const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export const nameRegex = /^\s*[ A-Za-z0-9.]+\.?\s*$/;

export const mapActionIcons = [{ icon: `policeman` }, { icon: `traffic` }]