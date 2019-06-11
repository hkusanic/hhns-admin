import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import { getUsersList, getUserByUuid, updateSadhanaSheetEnable } from 'services/userProfile'
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

export function* updateSadhanaSheetEnableSaga(body) {
  try {
    const result = yield call(updateSadhanaSheetEnable, body)

    const { data } = result
    if (result.status === 200) {
      notification.success({
        message: 'Success',
        description: 'Sadhana Sheet Status updated successfully',
      })
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
      description: 'Error Occured while while updating',
    })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.GET_USERS, getUsersListSaga),
    takeEvery(actions.GET_USER_BY_ID, getUserByUuidSaga),
    takeEvery(actions.SADHANA_SHEET_ENABLE, updateSadhanaSheetEnableSaga),
  ])
}
