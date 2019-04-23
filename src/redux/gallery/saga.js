import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import {
  getStaticGallery,
  createGallery,
  removeGallery,
  getSubGalleryByGallery,
  getGalleryByUuid,
  updateGallery,
} from 'services/gallery'
import actions from './action'

export function* getStaticGallerySage() {
  try {
    const result = yield call(getStaticGallery)
    console.log('result ====>>>>>', result)
    const { data } = result
    const { gallery } = data
    if (result.status === 200) {
      yield put({
        type: 'gallery/SET_STATE',
        payload: {
          mainGallery: gallery,
          totalmainGallery: gallery.length,
          isGalleryCreated: false,
          isDeleted: false,
          isUpdated: false,
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

export function* getSubGalleryByGallerySaga(payload) {
  try {
    const { body } = payload
    const result = yield call(getSubGalleryByGallery, body)
    console.log('result ====>>>>>', result)
    const { data } = result
    const { gallery } = data
    if (result.status === 200) {
      yield put({
        type: 'gallery/SET_STATE',
        payload: {
          subGallery: gallery,
          totalSubGallery: gallery.length,
          isGalleryCreated: false,
          isDeleted: false,
          isUpdated: false,
          loading: true,
        },
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While getting gallery',
    })
  }
}

export function* createGallerySaga(payload) {
  try {
    const { body } = payload
    const result = yield call(createGallery, body)
    console.log('result ====>>>>>', result)
    if (result.status === 200) {
      yield put({
        type: 'gallery/SET_STATE',
        payload: {
          isGalleryCreated: true,
          isDeleted: false,
          isUpdated: false,
          loading: true,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Gallery has been created successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Creating Gallery',
    })
  }
}

export function* removeGallerySaga(payload) {
  try {
    const { uuid } = payload
    const result = yield call(removeGallery, uuid)
    console.log('result ====>>>>>', result)
    if (result.status === 200) {
      yield put({
        type: 'gallery/SET_STATE',
        payload: {
          isGalleryCreated: false,
          isDeleted: true,
          isUpdated: false,
          loading: true,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Gallery is deleted Successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Deleting Gallery',
    })
  }
}

export function* getGalleyByUuidSaga(body) {
  try {
    const result = yield call(getGalleryByUuid, body)
    const { data } = result
    const { gallery } = data
    if (result.status === 200) {
      yield put({
        type: 'gallery/SET_STATE',
        payload: {
          editGallery: gallery,
          isGalleryCreated: false,
          isDeleted: false,
          isUpdated: false,
          loading: false,
        },
      })
    }
  } catch (err) {
    notification.warning({
      message: 'shailu',
      description: 'Some Error Occured',
    })
  }
}

export function* updateGallerySaga(payload) {
  try {
    const { body, uuid } = payload.payload
    console.log('payload ====>>>>', body, uuid)
    const result = yield call(updateGallery, uuid, body)
    if (result.status === 200) {
      yield put({
        type: 'gallery/SET_STATE',
        payload: {
          editGallery: '',
          isGalleryCreated: false,
          isDeleted: false,
          isUpdated: false,
          loading: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Gallery is updated successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Updating Gallery',
    })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.GET_GALLERY_LIST, getStaticGallerySage),
    takeEvery(actions.CREATE_GALLERY, createGallerySaga),
    takeEvery(actions.REMOVE_GALLERY, removeGallerySaga),
    takeEvery(actions.GET_SUB_GALLERY, getSubGalleryByGallerySaga),
    takeEvery(actions.GET_GALLERY_BY_ID, getGalleyByUuidSaga),
    takeEvery(actions.UPDATE_GALLERY, updateGallerySaga),
  ])
}
