#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#import "RNFBMessagingModule.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"AwesomeProject";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // // Example of starting the Headless JS task
  // [[RCTBackgroundTask sharedInstance] startBackgroundTaskWithName:@"HeadlessTask" userInfo:nil];
  // // Add background fetch for remote notifications
  // [[UIApplication sharedApplication] setMinimumBackgroundFetchInterval:UIApplicationBackgroundFetchIntervalMinimum];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// // Required for the `react-native-sound` library
// - (void)applicationWillResignActive:(UIApplication *)application
// {
//   [[AVAudioSession sharedInstance] setActive:NO error:nil];
// }

// // Required to register for push notifications
// - (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
// {
//   [RNFBMessagingModule didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
// }

@end
