import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import { getCommentsList, updateComment } from 'services/comment'
import actions from './action'

export function* getCommentsListSaga() {
  try {
    const result = yield call(getCommentsList)
    const { data } = result
    const { comment } = data

    if (result.status === 200) {
      yield put({
        type: actions.SET_STATE,
        payload: {
          comments: comment.results,
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

export function* updateCommentSaga(payload) {
  const { approved, uuid } = payload

  const body = {
    approved,
  }

  try {
    const result = yield call(updateComment, uuid, body)
    const result2 = yield call(getCommentsList)
    const { data } = result2
    const { comment } = data
    if (result.status === 200) {
      yield put({
        type: 'comment/SET_STATE',
        payload: {
          comments: comment.results,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Comment is updated successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Updating comment',
    })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.GET_COMMENTS, getCommentsListSaga),
    takeEvery(actions.UPDATE_COMMENT, updateCommentSaga),
  ])
}
