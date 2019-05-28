/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
import React from 'react'
import { Form, Input, Icon, TimePicker } from 'antd'
import { Link } from 'react-router-dom'

import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import moment from 'moment'
// import BackNavigation from '../../../common/BackNavigation/index'
import styles from './style.module.scss'
import './index.css'

const FormItem = Form.Item

const { TextArea } = Input

function formatDate(date) {
  const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0]

  return dateString
}

function getPreviousDate(date) {
  const previous = new Date()
  previous.setDate(date.getDate() - 1)
  const previousDate = formatDate(previous)
  return previousDate
}

function getNextDate(date) {
  const next = new Date()
  next.setDate(date.getDate() + 1)
  const nextDate = formatDate(next)
  return nextDate
}

@Form.create()
@connect(({ sadhana, router }) => ({ sadhana, router }))
class AddSadhana extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      language: true,
      editSadhana: {},
      currentDate: '',
      currentEmail: '',
      nextSadhanaDate: '',
      nextSadhanaEmail: '',
      currentIndex: 0,
      currentPage: 0,
    }
  }

  componentDidMount() {
    const { router } = this.props
    const { location } = router
    const { state } = location

    if (state !== undefined) {
      const { uuid, currentPage } = state

      if (uuid !== undefined) {
        this.setState(
          {
            currentIndex: uuid,
            currentPage,
          },
          () => {
            const tempObject = this.getSadhanaDetails(uuid)
            this.setState({
              editSadhana: tempObject,
            })
          },
        )
      }
    }
  }

  getSadhanaDetails = index => {
    const tempArray = JSON.parse(sessionStorage.getItem('sadhanaArray'))
    let tempObject = {}
    // eslint-disable-next-line no-plusplus
    if (tempArray.length > 0) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i <= tempArray.length; i++) {
        if (index === tempArray[i].itemIndex) {
          tempObject = { ...tempArray[i] }
          break
        }
      }
    }

    return tempObject
  }

  handleLanguage = () => {
    const { language } = this.state

    this.setState({ language: !language })
  }

  nextSadhana = () => {
    const { nextSadhanaDate, nextSadhanaEmail, currentDate } = this.state
    const { dispatch } = this.props

    if (nextSadhanaDate) {
      const nextDate = getNextDate(new Date(nextSadhanaDate))

      this.setState(
        {
          currentDate: nextDate,
          currentEmail: nextSadhanaEmail,
        },
        () => {
          dispatch({
            type: 'sadhana/GET_SADHANAS',
            page: 1,
            // eslint-disable-next-line react/destructuring-assignment
            date: this.state.currentDate,
            // eslint-disable-next-line react/destructuring-assignment
            email: this.state.nextSadhanaEmail,
          })
        },
      )
    } else {
      const nextDate = getNextDate(new Date(currentDate))

      this.setState(
        {
          currentDate: nextDate,
        },
        () => {
          dispatch({
            type: 'sadhana/GET_SADHANAS',
            page: 1,
            // eslint-disable-next-line react/destructuring-assignment
            date: this.state.currentDate,
            // eslint-disable-next-line react/destructuring-assignment
            email: this.state.currentEmail,
          })
        },
      )
    }
  }

  previousSadhana = () => {
    const { nextSadhanaDate, nextSadhanaEmail, currentDate } = this.state
    const { dispatch } = this.props

    if (nextSadhanaDate) {
      const nextDate = getPreviousDate(new Date(nextSadhanaDate))

      this.setState(
        {
          currentDate: nextDate,
          currentEmail: nextSadhanaEmail,
        },
        () => {
          dispatch({
            type: 'sadhana/GET_SADHANAS',
            page: 1,
            // eslint-disable-next-line react/destructuring-assignment
            date: this.state.currentDate,
            // eslint-disable-next-line react/destructuring-assignment
            email: this.state.nextSadhanaEmail,
          })
        },
      )
    } else {
      const nextDate = getPreviousDate(new Date(currentDate))

      this.setState(
        {
          currentDate: nextDate,
        },
        () => {
          dispatch({
            type: 'sadhana/GET_SADHANAS',
            page: 1,
            // eslint-disable-next-line react/destructuring-assignment
            date: this.state.currentDate,
            // eslint-disable-next-line react/destructuring-assignment
            email: this.state.currentEmail,
          })
        },
      )
    }
  }

  oldSadhanas = () => {
    const { currentIndex } = this.state

    this.setState(
      {
        currentIndex: currentIndex - 1,
      },
      () => {
        const tempObject = this.getSadhanaDetails(this.state.currentIndex)
        this.setState({
          editSadhana: tempObject,
        })
      },
    )
  }

  newSadhanas = () => {
    const { currentIndex } = this.state

    this.setState(
      {
        currentIndex: currentIndex + 1,
      },
      () => {
        const tempObject = this.getSadhanaDetails(this.state.currentIndex)

        this.setState({
          editSadhana: tempObject,
        })
      },
    )

    // this.setState
  }

  render() {
    const { language, editSadhana, currentDate, currentIndex, currentPage } = this.state

    const { form } = this.props

    let fullName = ''
    // let customStyleLeft = {}
    // let customStyleRight = {}
    let oldRight = {}
    let oldLeft = {}

    if (
      editSadhana === null ||
      editSadhana === undefined ||
      Object.keys(editSadhana).length === 0
    ) {
      return <div>Data not found</div>
    }

    if (Object.keys(editSadhana).length > 0) {
      fullName = `${editSadhana.user.name.first} ${editSadhana.user.name.last}`
    }

    const nowDate = new Date()
    nowDate.setHours(0, 0, 0, 0)
    const tempCurrentDate = new Date(currentDate)
    tempCurrentDate.setHours(0, 0, 0, 0)

    const tempArray = JSON.parse(sessionStorage.getItem('sadhanaArray'))

    if (currentIndex === 0) {
      oldLeft = { pointerEvents: 'none', opacity: '0.4' }
    }

    if (tempArray.length > 0) {
      if (currentIndex === tempArray.length - 1 || Object.keys(editSadhana).length === 0) {
        oldRight = { pointerEvents: 'none', opacity: '0.4' }
      }
    }

    return (
      <React.Fragment>
        <div className="container headerDiv">
          {/* <BackNavigation link="/sadhana/list" title="Sadhana List" /> */}

          <Link
            to={{
              pathname: '/sadhana/list',
              state: {
                browsingDate: editSadhana.date,
                paginationCurrentPage: currentPage,
              },
            }}
          >
            <span>
              <Icon type="arrow-left" style={{ fontSize: '15px' }} />
              <span style={{ fontSize: '15px', fontWeight: '400', paddingLeft: '10px' }}>
                Sadhana List
              </span>
            </span>
          </Link>

          {/* <div className="col-lg-3">
              <Switch
                defaultChecked
                checkedChildren={language ? 'en' : 'ru'}
                unCheckedChildren={language ? 'en' : 'ru'}
                onChange={this.handleLanguage}
                className="toggle"
                style={{ width: '100px', marginLeft: '10px' }}
              />
            </div> */}
          <div className="col-lg-3 pl-5">
            <span>{editSadhana.date}</span>
          </div>
          <div className="leftArrowDiv" style={oldLeft}>
            <Icon className="leftArrow" type="left" onClick={this.oldSadhanas} />
          </div>
          <span className="textDiv">{fullName}</span>
          <div className="rightArrowDiv" style={oldRight}>
            <Icon className="rightArrow" type="right" onClick={this.newSadhanas} />
          </div>
        </div>

        <div className="mt-4">
          <Helmet title="Sadhana Sheet" />
          <section className="card">
            <div className="card-body">
              <div className={styles.addPost}>
                <Form className="mt-2">
                  {/* <div className="customContainer">
                    <div className="leftArrowDiv" style={customStyleLeft}>
                      <Icon className="leftArrow" type="left" onClick={this.nextSadhana} />
                    </div>
                    <div className="">
                      <span className="font-weight-bold">{editSadhana.date}</span>
                    </div>
                    <div className="rightArrowDiv" style={customStyleRight}>
                      <Icon className="rightArrow" type="right" onClick={this.previousSadhana} />
                    </div>
                  </div> */}

                  <div className="container">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="form-group">
                          {editSadhana.user && editSadhana.user.discipleName ? (
                            <FormItem label={language ? 'Disciple Name' : 'Disciple Name'}>
                              <Input
                                disabled
                                value={editSadhana.user.discipleName}
                                placeholder="Disciple Name"
                                name="discipleName"
                              />
                            </FormItem>
                          ) : (
                            <FormItem label={language ? 'Name' : 'Name'}>
                              <Input
                                disabled
                                value={
                                  editSadhana.user &&
                                  `${editSadhana.user.name.first} ${editSadhana.user.name.last}`
                                }
                                placeholder="Name"
                                name="name"
                              />
                            </FormItem>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group">
                          <FormItem label={language ? 'User Email' : 'User Email'}>
                            <Input
                              disabled
                              value={editSadhana.user && editSadhana.user.email}
                              placeholder="User Email"
                              name="email"
                            />
                          </FormItem>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="form-group">
                          <Form.Item label={language ? 'Time Rising' : 'Time Rising'}>
                            {form.getFieldDecorator('time_rising', {
                              initialValue: moment(editSadhana.time_rising, 'h:mm a'),
                            })(
                              <TimePicker
                                disabled
                                use12Hours
                                format="h:mm a"
                                onChange={this.onChange}
                              />,
                            )}
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group">
                          <FormItem label={language ? 'Rounds' : 'Rounds'}>
                            <Input
                              disabled
                              value={editSadhana.rounds}
                              placeholder="Rounds"
                              name="rounds"
                            />
                          </FormItem>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="form-group">
                          <FormItem label={language ? 'Reading' : 'Reading'}>
                            <TextArea
                              rows={4}
                              disabled
                              value={editSadhana.reading}
                              placeholder="Reading"
                              name="reading"
                            />
                          </FormItem>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group">
                          <FormItem label={language ? 'Association' : 'Association'}>
                            <TextArea
                              rows={4}
                              disabled
                              value={editSadhana.association}
                              placeholder="Association"
                              name="association"
                            />
                          </FormItem>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-group">
                          <FormItem label={language ? 'Comments' : 'Comments'}>
                            <TextArea
                              rows={4}
                              disabled
                              value={editSadhana.comments}
                              placeholder="Comments"
                              name="comments"
                            />
                          </FormItem>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-group">
                          <FormItem label={language ? 'Lectures' : 'Lectures'}>
                            <TextArea
                              rows={4}
                              disabled
                              value={editSadhana.lectures}
                              placeholder="Lectures"
                              name="lectures"
                            />
                          </FormItem>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-group">
                          <FormItem
                            label={language ? 'Additional Comments' : 'Additional Comments'}
                          >
                            <TextArea
                              rows={4}
                              disabled
                              value={editSadhana.additional_comments}
                              placeholder="Additional Comments"
                              name="additional_comments"
                            />
                          </FormItem>
                        </div>
                      </div>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </section>
        </div>
      </React.Fragment>
    )
  }
}

export default AddSadhana
