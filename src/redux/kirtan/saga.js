/* eslint-disable */
import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import {
  getKirtanList,
  createKirtan,
  deleteKirtanByUuid,
  updateKirtan,
  getLectureByUuid,
} from 'services/kirtan'
import actions from './action'

export function* createKirtanSaga({ payload }) {
  // console.log('kirtan payload ==== ', payload)

  const userDetails = JSON.parse(localStorage.getItem('user'))

  const today = new Date()
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
  const dateTime = `${date} ${time}`
  let obj = {}
  obj.fullName = `${userDetails.firstName} ${userDetails.last}`
  obj.email = userDetails.email
  obj.dateTime = dateTime
  let audit = []
  audit.push(JSON.stringify(obj))
  payload.audit = audit

  try {
    const result = yield call(createKirtan, payload)
    // console.log('kirtan result === ', result)
    if (result.status === 200) {
      notification.success({
        message: 'Success',
        description: 'Kirtan is created successfully',
      })
      yield put({
        type: 'kirtan/SET_STATE',
        payload: {
          isKirtanCreated: true,
          isDeleted: false,
          isUpdated: false,
          kirtans: [],
          kirtanAudit: result.data.Kirtan.audit,
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

export function* getKirtanListSaga(payload) {
  try {
    const { page } = payload
    const result = yield call(getKirtanList, page)
    const { data } = result
    const { kirtan } = data
    console.log('result =====>>>', result)
    if (result.status === 200) {
      yield put({
        type: 'kirtan/SET_STATE',
        payload: {
          kirtans: kirtan.results,
          totalKirtans: kirtan.total,
          isKirtanCreated: false,
          isDeleted: false,
          isUpdated: false,
          editKirtan: '',
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

export function* getKirtanByUuidSaga(body) {
  try {
    const result = yield call(getLectureByUuid, body)
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'kirtan/SET_STATE',
        payload: {
          editKirtan: data.kirtan,
          isKirtanCreated: false,
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

export function* deleteKirtanByUuidSaga(payload) {
  try {
    const { uuid } = payload
    const result = yield call(deleteKirtanByUuid, uuid)
    if (result.status === 200) {
      yield put({
        type: 'kirtan/SET_STATE',
        payload: {
          isKirtanCreated: false,
          isDeleted: true,
          isUpdated: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Kirtan is Deleted successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Deleting Kirtan',
    })
  }
}

export function* updateKirtanSaga(payload) {
  const { body, uuid } = payload.payload

  const userDetails = JSON.parse(localStorage.getItem('user'))
  const today = new Date()
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
  const dateTime = `${date} ${time}`
  let obj = {}
  obj.fullName = `${userDetails.firstName} ${userDetails.last}`
  obj.email = userDetails.email
  obj.dateTime = dateTime
  let auditData = JSON.parse('[' + body.audit + ']')
  let auditArray = []
  auditData.forEach(e => {
    auditArray.push(JSON.stringify(e))
  })
  auditArray.push(JSON.stringify(obj))
  body.audit = auditArray

  try {
    const result = yield call(updateKirtan, uuid, body)
    if (result.status === 200) {
      yield put({
        type: 'kirtan/SET_STATE',
        payload: {
          editKirtan: result.data.Kirtan,
          isKirtanCreated: false,
          isDeleted: false,
          isUpdated: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Kirtan is updated successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Updating Kirtan',
    })
  }
}

export function* resetStoreSaga() {
  try {
    yield put({
      type: 'kirtan/SET_STATE',
      payload: {
        editKirtan: '',
      },
    })
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured',
    })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.CREATE_KIRTAN, createKirtanSaga),
    takeEvery(actions.GET_KIRTAN, getKirtanListSaga),
    takeEvery(actions.GET_KIRTAN_BY_ID, getKirtanByUuidSaga),
    takeEvery(actions.DELETE_KIRTAN_BY_ID, deleteKirtanByUuidSaga),
    takeEvery(actions.UPDATE_KIRTAN, updateKirtanSaga),
    takeEvery(actions.RESET_STORE, resetStoreSaga),
  ])
}
