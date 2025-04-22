import { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { UserContext } from "../config/context/UserContext";

import MyTabs from "./MyTabNavigator";
import LauncherScreen from "../screens/LauncherScreen";
import LoginScreen from "../screens/LoginScreen";

import PhoneRegisterScreen from "../components/register/PhoneRegisterScreen";
import EnterOTPScreen from "../components/register/EnterOTPScreen";
import PasswordRegisterScreen from "../components/register/PasswordRegisterScreen";
import InfoRegisterScreen from "../components/register/InfoRegisterScreen";

import SearchScreen from "../components/search/SearchScreen";
import Chatting from "../components/messages/Chatting";
import ForwardMessage from "../components/messages/ForwardMessageScreen";
import MediaStorage from "../components/messages/MediaStorage";
import QRScanner from "../components/camera/QRScannerScreen";
import ProfileInformation from "../components/profile/ProfileInformation";
import ViewImagePost from "../components/view/ViewImagePost";
import ViewImageChat from "../components/view/ViewImageChat";
import Option from "../components/messages/Options";
import ChangeInformation from "../components/profile/ChangeInformation";
import AddFriend from "../components/contact/AddFriend";
import FriendRequest from "../components/contact/FriendRequest";
import AccountSecurity from "../components/profile/AccountSecurity";
import ChangePhoneNumber from "../components/profile/ChangePhoneNumber";
import ViewProfile from "../components/profile/ViewProfile";
import ForgotPasswordScreen from "../components/profile/ForgotPassword";
import ChangePasswordScreen from "../components/profile/ChangePassword";
import ManageUserBlock from "../components/profile/ManageUserBlock";
import ModalCreateGroup from "../components/contact/ModalCreateGroup";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(UserContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen
            name="Home"
            component={MyTabs}
            options={{ animation: "none" }}
          />
          <Stack.Screen
            name="ProfileInformation"
            component={ProfileInformation}
            options={{ animation: "none" }}
          />
          <Stack.Screen
            name="Chatting"
            component={Chatting}
            options={{ animation: "none" }}
          />
          <Stack.Screen
            name="ForwardMessage"
            component={ForwardMessage}
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="MediaStorage" component={MediaStorage} />
          <Stack.Screen name="ViewProfile" component={ViewProfile} />
          <Stack.Screen name="QRScanner" component={QRScanner} />
          <Stack.Screen name="ViewImagePost" component={ViewImagePost} />
          <Stack.Screen name="ViewImageChat" component={ViewImageChat} />
          <Stack.Screen name="Option" component={Option} />
          <Stack.Screen
            name="AddFriend"
            component={AddFriend}
            options={{ animation: "none" }}
          />
          <Stack.Screen name="FriendRequest" component={FriendRequest} />
          <Stack.Screen name="CreateGroup" component={ModalCreateGroup} />
          <Stack.Screen
            name="ChangeInformation"
            component={ChangeInformation}
            options={{ animation: "none" }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ animation: "none" }}
          />
          <Stack.Screen
            name="SearchScreen"
            component={SearchScreen}
            options={{ animation: "fade" }}
          />
          <Stack.Screen
            name="AccountSecurity"
            component={AccountSecurity}
            options={{ animation: "none" }}
          />
          <Stack.Screen
            name="BlockList"
            component={ManageUserBlock}
            options={{ animation: "none" }}
          />
          <Stack.Screen
            name="ChangePhoneNumber"
            component={ChangePhoneNumber}
            options={{ animation: "none" }}
          />
          <Stack.Screen
            name="ManageUserBlock"
            component={ManageUserBlock}
            options={{ animation: "none" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Launcher"
            component={LauncherScreen}
            options={{ animation: "none" }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={PhoneRegisterScreen} />
          <Stack.Screen name="EnterOTP" component={EnterOTPScreen} />
          <Stack.Screen
            name="PasswordRegister"
            component={PasswordRegisterScreen}
          />
          <Stack.Screen name="InfoRegister" component={InfoRegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
