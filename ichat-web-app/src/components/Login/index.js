import React from 'react'
import {Row, Col, Typography, Button} from 'antd'

import firebase, {auth} from '../../firebase/config'

const {Title} = Typography

const fbProvider = new firebase.auth.FacebookAuthProvider()

export default function Login() {
  const handleLogin = () => {
    auth.signInWithPopup(fbProvider)

  }


  return (
    <div>
      <Row justify={'center'} style={{height: 800}}>
        <Col span={8}>
          <Title style = {{textAlign:'center'}} level = {3}> IChat </Title>
          <Button style={{width: '100%', marginBottom: 5}} onClick={handleLogin}> Đăng nhập </Button>
          <Button style={{width: '100%'}}> Đăng kí </Button>
        </Col>
      </Row>
    </div>
  )
}
