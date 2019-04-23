import { all } from 'redux-saga/effects'
import user from './user/sagas'
import menu from './menu/sagas'
import settings from './settings/sagas'
import blog from './blog/saga'
import lecture from './lecture/saga'
import gallery from './gallery/saga'
import quote from './quote/saga'
import galleryList from './galleryListing/saga'
import kirtan from './kirtan/saga'

export default function* rootSaga() {
  yield all([
    user(),
    menu(),
    settings(),
    blog(),
    lecture(),
    gallery(),
    quote(),
    galleryList(),
    kirtan(),
  ])
}
