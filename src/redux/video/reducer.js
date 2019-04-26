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
    { //console.log(action.payload)
      return Object.assign({}, state, {
        suggestions: action.payload,
      })}
    case types.GET_SUGGESTIONS:
      return Object.assign({}, state, {
        suggestions: action.payload.suggestions,
      })
    case types.GET_VIDEO:
      return Object.assign({}, state, action.payload)
    case types.SET_STATE_:
      return { ...state, ...action.payload }
    case types.SET_STATE_:
      return { ...state, ...action.payload }

    default:
      return state
  }
}
