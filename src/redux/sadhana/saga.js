import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import { getSadhanaList, getSadhanaByUuid } from 'services/sadhana'
import actions from './action'

export function* getSadhanaListSaga(payload) {
  // console.log('payload===>',payload)
  try {
    const { page } = payload
    const { date } = payload
    const { createdDateSort } = payload
    const { email } = payload
    const result = yield call(getSadhanaList, page, date, createdDateSort, email)

    const { data } = result
    const { sadhana } = data

    if (result.status === 200) {
      yield put({
        type: 'sadhana/SET_STATE',
        payload: {
          sadhanas: sadhana.results,
          totalSadhanas: sadhana.total,
          editSadhana: '',
          isSadhanaCreated: false,
          isDeleted: false,
          isUpdated: false,
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

export function* getSadhanaByUuidSaga(body) {
  try {
    const result = yield call(getSadhanaByUuid, body)
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'sadhana/SET_STATE',
        payload: {
          editSadhana: data.sadhana,
          isSadhanaCreated: false,
          isDeleted: false,
          isUpdated: false,
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
  yield all([
    takeEvery(actions.GET_SADHANAS, getSadhanaListSaga),
    takeEvery(actions.GET_SADHANA_BY_ID, getSadhanaByUuidSaga),
  ])
}
