import types from './action'

const initialState = {
  loading: false,
  videos: [],
  totalVideos: 0,
  isVideoCreated: false,
  isDeleted: false,
  isUpdated: false,
  editVideo: '',
  error: '',
  suggestions: [],
}

export default function videoReducer(state = initialState, action) {
  switch (action.type) {
    case types.CREATE_VIDEO:
      return state
    case types.SET_STATE:
      return Object.assign({}, state, {
        suggestions: action.payload,
      })
    case types.GET_SUGGESTIONS:
      return Object.assign({}, state, {
        suggestions: action.payload.suggestions,
      })

    default:
      return state
  }
}
