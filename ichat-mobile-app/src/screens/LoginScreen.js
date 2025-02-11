import React from 'react'
import { Text, View, Button } from 'react-native'

const LoginScreen = ({navigation, setUser}) => {

  const handleLogin = () => {
    // Giả lập đăng nhập thành công
    setUser(true);
    navigation.navigate("TabNavigator")
  }

  return (
    <View>
      <Text>LoginScreen</Text>
      <Button title="Login" onPress={() => handleLogin()}></Button>
      <Button title="Back" onPress={() => navigation.goBack()}></Button>
    </View>
  )
}

export default LoginScreen
