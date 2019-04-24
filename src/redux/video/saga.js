import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import { createVideo, getSuggestions } from 'services/video'
import actions from './action'
import { getLectureByUuid } from '../../services/kirtan'

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

export default function* rootSaga() {
  yield all([
    takeEvery(actions.CREATE_VIDEO, createVideoSaga),
    takeEvery(actions.GET_SUGGESTIONS, getSuggestionSaga),
  ])
}
