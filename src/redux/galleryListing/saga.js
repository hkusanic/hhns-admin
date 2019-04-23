import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import { getMainGallery, createMainGallery, removeMainGallery } from 'services/galleryList'
import actions from './action'

export function* getMainGallerySage() {
  try {
    const result = yield call(getMainGallery)
    console.log('result ====>>>>>', result)
    const { data } = result
    const { gallery } = data
    if (result.status === 200) {
      yield put({
        type: 'galleryListing/SET_STATE',
        payload: {
          mainGallery: gallery,
          totalmainGallery: gallery.length,
          isCreated: false,
          isDeleted: false,
          loading: false,
        },
      })
    }
  } catch (err) {
    notification.error({
      message: 'Error',
      description: 'Some Error Occured',
    })
  }
}

export function* createMainGallerySaga(payload) {
  try {
    const { body } = payload
    const result = yield call(createMainGallery, body)
    console.log('result ====>>>>>', result)
    if (result.status === 200) {
      yield put({
        type: 'galleryListing/SET_STATE',
        payload: {
          isCreated: true,
          isDeleted: false,
          loading: true,
        },
      })
      notification.success({
        message: 'Success',
        description: ' Main Gallery has been created successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Creating Main Gallery',
    })
  }
}

export function* removeMainGallerySaga(payload) {
  try {
    const { uuid } = payload
    const result = yield call(removeMainGallery, uuid)
    console.log('result ====>>>>>', result)
    if (result.status === 200) {
      yield put({
        type: 'galleryListing/SET_STATE',
        payload: {
          isCreated: false,
          isDeleted: true,
          loading: true,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Main Gallery is deleted Successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Deleting Main Gallery',
    })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.GET_MAIN_GALLERY_LIST, getMainGallerySage),
    takeEvery(actions.CREATE_MAIN_GALLERY, createMainGallerySaga),
    takeEvery(actions.REMOVE_MAIN_GALLERY, removeMainGallerySaga),
  ])
}
