import { registerRootComponent } from "expo";

import App from "./App";

// Thêm trong file index.js hoặc App.js để tránh warning log của firebase/auth
// Warning: Support for defaultProps will be removed from function components.
import { LogBox } from "react-native";
LogBox.ignoreLogs(["Support for defaultProps will be removed"]);

registerRootComponent(App);
