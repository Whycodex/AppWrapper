import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Notifications from 'expo-notifications';

const App = () => {
  const [message, setMessage] = useState("");
  const [askPermission, setAskPermission] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');

  async function configureNotification() {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;

    if (finalStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permissions Required', 'Cannot proceed without appropriate permissions');
      return;
    }

    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    console.log(pushTokenData.data);
    setExpoPushToken(pushTokenData.data);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT
      })
    }
  }

  useEffect(() => {
    if (askPermission) {
      configureNotification();
    }
  }, [askPermission]);

  function onMessage(data) {
    // console.log(data);
    setMessage(data.nativeEvent.data);
    if (message == 'login') {
      setAskPermission(true);
    }
  }

  function sendDataToWebView() {
    webviewRef.postMessage(expoPushToken);
  }

  const webviewRef = useRef();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "yellow" }}>
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => sendDataToWebView()}
          style={{
            padding: 20,
            width: 300,
            marginTop: 100,
            backgroundColor: 'black',
            alignItems: 'center',
          }}>
          <Text style={{ fontSize: 20, color: 'white' }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
      <WebView
        ref={webviewRef}
        scalesPageToFit={false}
        mixedContentMode="compatibility"
        style={{ backgroundColor: "red" }}
        onMessage={onMessage}
        source={{ uri: "https://charming-muffin-2d3b8e.netlify.app/" }}
      />
      <Text>Text Recieved from Webview: {message}</Text>
      <Text>Token: {expoPushToken}</Text>
    </SafeAreaView>
  );
};

export default App;