import { notification } from 'antd'
import { all, takeEvery,  put, call } from 'redux-saga/effects'
import { createVideo, getSuggestions, getVideoList, deleteVideoByUuid, getVideoByUuid, updateVideo } from 'services/video'
import actions from './action'


export function* createVideoSaga({ payload }) {
  try {
    const result = yield call(createVideo, payload)
    if (result.status === 200) {
      notification.success({
        message: 'Success',
        description: 'Video is created successfully',
      })
      yield put({
        type: 'video/SET_STATE',
        payload: {
          isVideoCreated: true,
          isDeleted: false,
          isUpdated: false,
          videos: [],
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
export function* deleteVideoByUuidSaga(payload) {
  try {
    const { uuid } = payload
    const result = yield call(deleteVideoByUuid, uuid)
    if (result.status === 200) {
      yield put({
        type: 'video/SET_STATE_',
        payload: {
          editVideo: '',
          isDeleted: true,
          isVideoCreated: false,
          isUpdated: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Video is Deleted successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Deleting video',
    })
  }
}
export function* getVideoListSaga(payload) {
  try {
    const { page } = payload
    const { date } = payload
    const { createdDateSort } = payload
    const result = yield call(getVideoList, page, date, createdDateSort)
    const { data } = result
    const { video } = data

    if (result.status === 200) {
      yield put({
        type: 'video/GET_VIDEO',
        payload: {
          videos: video.results,
          totalVideos: video.total,
          editVideo: '',
          isVideoCreated: false,
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

export function* getSuggestionSaga(payload) {
  try {
    const result = yield call(getSuggestions, payload)
    if (result.status === 200) {
      if (payload.payload.type === 'kirtan') {
        yield put({
          type: 'video/GET_SUGGESTIONS',
          payload: {
            suggestions: result.data.kirtan.results,
          },
        })
      } else if (payload.payload.type === 'lecture') {
        console.log(result.data.lecture.results)
        yield put({
          type: 'video/GET_SUGGESTIONS',
          payload: {
            suggestions: result.data.lecture.results,
          },
        })
      }
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured',
    })
  }
}
export function* getVideoByUuidSaga(body) {
  try {
    const result = yield call(getVideoByUuid, body)
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'video/SET_STATE_',
        payload: {
          editVideo: data.video,
          isVideoCreated: false,
          isDeleted: false,
          isUpdated: false,
        },
      })
    }
  } catch (err) {
    notification.error({
      message: 'Error',
      description: 'Error Occured while getting Video',
    })
  }
}
export function* updateVideoSaga(payload) {
  try {
    const { body, uuid } = payload.payload
    const result = yield call(updateVideo, uuid, body)
    if (result.status === 200) {
      yield put({
        type: 'video/SET_STATE_',
        payload: {
          editVideo: '',
          isUpdated: true,
          isVideoCreated: false,
          isDeleted: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Video is updated successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Updating video',
    })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.CREATE_VIDEO, createVideoSaga),
    takeEvery(actions.GET_SUGGESTION, getSuggestionSaga),
    takeEvery(actions.GET_VIDEOS, getVideoListSaga),
    takeEvery(actions.DELETE_VIDEOS, deleteVideoByUuidSaga),
    takeEvery(actions.GET_VIDEO_BY_ID, getVideoByUuidSaga),
    takeEvery(actions.UPDATE_VIDEO, updateVideoSaga),
  ])
}
