import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import { getUsersList, getUserByUuid } from 'services/userProfile'
import actions from './action'

export function* getUsersListSaga(payload) {
  try {
    const result = yield call(getUsersList, payload)

    const { data } = result
    const { users } = data

    if (result.status === 200) {
      yield put({
        type: actions.SET_STATE,
        payload: {
          users,
        },
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured',
    })
  }
}

export function* getUserByUuidSaga(body) {
  try {
    const result = yield call(getUserByUuid, body)

    const { data } = result
    if (result.status === 200) {
      yield put({
        type: actions.SET_STATE,
        payload: {
          userDetails: data.userDetails,
        },
      })
    }
  } catch (err) {
    notification.error({
      message: 'Error',
      description: 'Error Occured while getting Lecture',
    })
  }
}

export default function* rootSaga() {
  yield all([takeEvery(actions.GET_USERS, getUsersListSaga)])
  yield all([takeEvery(actions.GET_USER_BY_ID, getUserByUuidSaga)])
}
