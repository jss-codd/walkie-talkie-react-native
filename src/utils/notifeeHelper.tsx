import notifee from '@notifee/react-native';

async function onDisplayNotification(title: string, body: string) {

    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
        id: 'sound',
        name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
        title,
        body,
        android: {
            channelId,
            // pressAction is needed if you want the notification to open the app when pressed
            pressAction: {
                id: 'default',
            },
            sound: "default"
        },
        ios: {
            sound: 'default',
        },
    });
}

export { onDisplayNotification };