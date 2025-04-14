import { registerRootComponent } from "expo";

import App from "./App";

import { LogBox } from "react-native";
LogBox.ignoreLogs(["Support for defaultProps will be removed"]);

registerRootComponent(App);
