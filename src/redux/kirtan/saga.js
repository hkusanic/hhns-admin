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
  try {
    const result = yield call(createKirtan, payload)
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
          totalKirtans: kirtan.length,
          isKirtanCreated: true,
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

export function* getKirtanByUuidSaga(body) {
  try {
    const result = yield call(getLectureByUuid, body)
    const { data } = result
    console.log('result =====>>>', result)
    if (result.status === 200) {
      yield put({
        type: 'kirtan/SET_STATE',
        payload: {
          editBlog: data.kirtan,
          isKirtanCreated: true,
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
  try {
    const { body, uuid } = payload.payload
    const result = yield call(updateKirtan, uuid, body)
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

export default function* rootSaga() {
  yield all([
    takeEvery(actions.CREATE_KIRTAN, createKirtanSaga),
    takeEvery(actions.GET_KIRTAN, getKirtanListSaga),
    takeEvery(actions.GET_KIRTAN_BY_ID, getKirtanByUuidSaga),
    takeEvery(actions.DELETE_KIRTAN_BY_ID, deleteKirtanByUuidSaga),
    takeEvery(actions.UPDATE_KIRTAN, updateKirtanSaga),
  ])
}
