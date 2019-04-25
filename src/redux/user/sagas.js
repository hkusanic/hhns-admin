import { all, takeEvery, put, call } from 'redux-saga/effects'
import { notification } from 'antd'
import { login, currentAccount, logout } from 'services/user'
import actions from './actions'

export function* LOGIN({ payload }) {
  const { email, password } = payload
  yield put({
    type: 'user/SET_STATE',
    payload: {
      loading: true,
    },
  })
  const success = yield call(login, email, password)
  if (success) {
    notification.success({
      message: 'Logged In',
      description: 'You have successfully logged in to Clean UI React Admin Template!',
    })
    yield put({
      type: 'user/LOAD_CURRENT_ACCOUNT',
    })
  }
}

export function* LOAD_CURRENT_ACCOUNT() {
  yield put({
    type: 'user/SET_STATE',
    payload: {
      loading: true,
    },
  })
  const response = yield call(currentAccount)
  console.log('RESPONSE ======>', response)
  if (response) {
    yield put({
      type: 'user/SET_STATE',
      payload: {
        role: 'admin',
        authorized: true,
      },
    })
  } else {
    yield put({
      type: 'user/SET_STATE',
      payload: {
        authorized: false,
        loading: false,
      },
    })
  }
}

export function* LOGOUT() {
  yield call(logout)
  yield put({
    type: 'user/SET_STATE',
    payload: {
      authorized: false,
      loading: false,
    },
  })
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.LOGIN, LOGIN),
    takeEvery(actions.LOAD_CURRENT_ACCOUNT, LOAD_CURRENT_ACCOUNT),
    takeEvery(actions.LOGOUT, LOGOUT),
    LOAD_CURRENT_ACCOUNT(), // run once on app load to check user auth
  ])
}
