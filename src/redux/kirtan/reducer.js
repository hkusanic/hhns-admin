import types from './action'

const initialState = {
  loading: false,
  kirtans: [],
  totalKirtans: 0,
  isKirtanCreated: false,
  isDeleted: false,
  isUpdated: false,
  editKirtan: '',
  error: '',
}

export default function kirtanReducer(state = initialState, action) {
  switch (action.type) {
    case types.CREATE_BLOG:
    case types.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
