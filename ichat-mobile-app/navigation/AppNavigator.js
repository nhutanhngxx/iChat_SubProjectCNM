import { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { UserContext } from "../context/UserContext";

import MyTabs from "./MyTabNavigator";
import LauncherScreen from "../screens/LauncherScreen";
import LoginScreen from "../screens/LoginScreen";

import RegisterScreen from "../components/register/RegisterScreen";
import EnterOTPScreen from "../components/register/EnterOTPScreen";
import PasswordRegisterScreen from "../components/register/PasswordRegisterScreen";
import InfoRegisterScreen from "../components/register/InfoRegisterScreen";

import SearchScreen from "../components/search/SearchScreen";
import Chatting from "../components/messages/Chatting";
import QRScanner from "../components/camera/QRScannerScreen";
import ProfileInformation from "../components/profile/ProfileInformation";
import ViewImagePost from "../components/view/ViewImagePost";
import Option from "../components/messages/Options";
import ChangeInformation from "../components/profile/ChangeInformation";
import AddFriend from "../components/contact/AddFriend";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(UserContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={MyTabs} />
          <Stack.Screen
            name="ProfileInformation"
            component={ProfileInformation}
          />
          <Stack.Screen name="Chatting" component={Chatting} />
          <Stack.Screen name="QRScanner" component={QRScanner} />
          <Stack.Screen name="ViewImagePost" component={ViewImagePost} />
          <Stack.Screen name="Option" component={Option} />
          <Stack.Screen name="AddFriend" component={AddFriend} />
          <Stack.Screen
            name="ChangeInformation"
            component={ChangeInformation}
          />
          <Stack.Screen
            name="SearchScreen"
            component={SearchScreen}
            options={{ animation: "fade" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Launcher" component={LauncherScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="EnterOTP" component={EnterOTPScreen} />
          <Stack.Screen
            name="PasswordRegisterScreen"
            component={PasswordRegisterScreen}
          />
          <Stack.Screen
            name="InfoRegisterScreen"
            component={InfoRegisterScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
