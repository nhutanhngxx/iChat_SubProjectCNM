import { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { UserContext } from "../context/UserContext";

import MyTabs from "./MyTabNavigator";
import LauncherScreen from "../screens/LauncherScreen";
import LoginScreen from "../screens/LoginScreen";

// Đăng ký tạo tài khoản
import PhoneRegisterScreen from "../components/auth/register/PhoneRegisterScreen";
import EnterOTPScreen from "../components/auth/register/EnterOTPScreen";
import PasswordRegisterScreen from "../components/auth/register/PasswordRegisterScreen";
import InfoRegisterScreen from "../components/auth/register/InfoRegisterScreen";

// Quên mật khẩu
import EnterPhoneScreen from "../components/auth/reset-password/EnterPhoneScreen";
import EnterOTPScreenForgot from "../components/auth/reset-password/EnterOTPScreen";
import ResetPasswordScreen from "../components/auth/reset-password/ResetPasswordScreen";

// Các màn hình chính
import SearchScreen from "../components/search/SearchScreen";
import Chatting from "../components/messages/Chatting";
import QRScanner from "../components/camera/QRScannerScreen";
import ProfileInformation from "../components/profile/ProfileInformation";
import ViewImagePost from "../components/view/ViewImagePost";
import ViewImageChat from "../components/view/ViewImageChat";
import Option from "../components/messages/Options";
import ChangeInformation from "../components/profile/ChangeInformation";
import AddFriend from "../components/contact/AddFriend";
import FriendRequest from "../components/contact/FriendRequest";
import AccountSecurity from "../components/profile/AccountSecurity";

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
          <Stack.Screen name="ViewImageChat" component={ViewImageChat} />
          <Stack.Screen name="Option" component={Option} />
          <Stack.Screen name="AddFriend" component={AddFriend} />
          <Stack.Screen name="FriendRequest" component={FriendRequest} />
          <Stack.Screen
            name="ChangeInformation"
            component={ChangeInformation}
          />
          <Stack.Screen
            name="SearchScreen"
            component={SearchScreen}
            options={{ animation: "fade" }}
          />
          <Stack.Screen name="AccountSecurity" component={AccountSecurity} />
        </>
      ) : (
        <>
          <Stack.Screen name="Launcher" component={LauncherScreen} />

          {/* Đăng nhập */}
          <Stack.Screen name="Login" component={LoginScreen} />

          {/* Đăng ký tạo tài khoản */}
          <Stack.Screen name="PhoneRegister" component={PhoneRegisterScreen} />
          <Stack.Screen name="EnterOTP" component={EnterOTPScreen} />
          <Stack.Screen
            name="PasswordRegister"
            component={PasswordRegisterScreen}
          />
          <Stack.Screen name="InfoRegister" component={InfoRegisterScreen} />

          {/* Quên mật khẩu */}
          <Stack.Screen name="EnterPhone" component={EnterPhoneScreen} />
          <Stack.Screen
            name="EnterOTPForgot"
            component={EnterOTPScreenForgot}
          />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
