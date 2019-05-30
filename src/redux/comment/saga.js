import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import { getCommentsList } from 'services/comment'
import actions from './action'

export function* getCommentsListSaga() {
  // console.log('payload===>',payload)
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

export default function* rootSaga() {
  yield all([takeEvery(actions.GET_COMMENTS, getCommentsListSaga)])
}
