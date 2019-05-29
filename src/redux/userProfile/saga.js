import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import { getUsersList } from 'services/userProfile'
import actions from './action'

export function* getUsersListSaga() {
  // console.log('payload===>',payload)
  try {
    const result = yield call(getUsersList)

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

export default function* rootSaga() {
  yield all([takeEvery(actions.GET_USERS, getUsersListSaga)])
}
