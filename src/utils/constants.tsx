export const BACKEND_URL = "https://square-immune-hound.ngrok-free.app";
// export const BACKEND_URL = "https://27d8-125-99-173-186.ngrok-free.app";

export const AlertMessages = { no_internet: { title: "No Internet! ❌", message: "Sorry, we need an Internet connection for App to run correctly." }, location_access_error: { title: "Location Permission issue", message: "Location permission need to allow for proper location access" }, notification_access_error: { title: "Notification permission issue", message: "Allow notification permission for get incoming message" }, location_access_bg_error: { title: "Location Permission Issue", message: "Location permission need to allow all the time for tracking location in background" } };

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

export const errorMessage = { mobile_no: "Mobile number should be in 10 digits!", commonError: "Failed to process! Try again later.", otp: "Invalid OTP entered.", pin: "Invalid PIN entered.", pinConfirm: "PIN not matched.", email: "Enter a valid email address!", name: "Enter a valid name!", location: "Enter a valid location!" }

export const mobileRegex = /^[1-9]{1}[0-9]{9}$/;

export const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export const nameRegex = /^\s*[ A-Za-z0-9.]+\.?\s*$/;