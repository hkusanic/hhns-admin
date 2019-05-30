import types from './action'

const initialState = {
  loading: false,
  sadhanas: [],
  totalSadhanas: '',
  topics: [],
  events: [],
  locations: [],
  error: '',
  isUpdated: false,
  isSadhanaCreated: false,
  isDeleted: false,
  editSadhana: {},
}

export default function sadhanaReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
