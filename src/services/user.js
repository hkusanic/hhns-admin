// import firebase from 'firebase/app'
/* eslint-disable */
import { notification } from 'antd'
import axios from 'axios'
import serverAddress from './config'
// import 'firebase/auth'
// import 'firebase/database'
// import 'firebase/storage'

// const firebaseConfig = {
//   apiKey: 'AIzaSyAE5G0RI2LwzwTBizhJbnRKIKbiXQIA1dY',
//   authDomain: 'cleanui-72a42.firebaseapp.com',
//   databaseURL: 'https://cleanui-72a42.firebaseio.com',
//   projectId: 'cleanui-72a42',
//   storageBucket: 'cleanui-72a42.appspot.com',
//   messagingSenderId: '583382839121',
// }

// const firebaseApp = firebase.initializeApp(firebaseConfig)
// const firebaseAuth = firebase.auth
// export default firebaseApp

// export async function login(email, password) {
//   return firebaseAuth()
//     .signInWithEmailAndPassword(email, password)
//     .then(() => true)
//     .catch(error => {
//       notification.warning({
//         message: error.code,
//         description: error.message,
//       })
//     })
// }

export function currentAccount() {
  let userLoaded = localStorage.getItem('user')
  console.log('user=====>', userLoaded)
  if (userLoaded) {
    return true
  }
  return false
}

export async function logout() {
  let url = serverAddress + '/api/signout/'
  return axios
    .post(url)
    .then(data => {
      if (data && data.data && data.data.signedout) {
        localStorage.removeItem('user')
        return true
      } else {
        notification.warning({
          message: 'Failed to signout',
          description: 'User',
        })
        return false
      }
    })
    .catch(error => {
      notification.warning({
        message: error.code,
        description: error.message,
      })
    })
}

export async function login(email, password) {
  let url = serverAddress + '/api/signin/'
  console.log('email----->', email)
  return axios
    .post(url, { username: email, password: password })
    .then(data => {
      console.log('------>', data)
      if (data && data.data && data.data.success) {
        localStorage.setItem('user', JSON.stringify(data.data.loginUser))
        return true
      } else {
        notification.warning({
          message: 'User not found',
          description: 'No User',
        })
        return false
      }
    })
    .catch(error => {
      notification.warning({
        message: error.code,
        description: error.message,
      })
    })
}
