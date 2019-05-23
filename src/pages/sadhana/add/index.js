/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable for-direction */
/* eslint-disable react/destructuring-assignment */
import React from 'react'
import { Form, Input, Switch, Icon } from 'antd'

import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import BackNavigation from '../../../common/BackNavigation/index'
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
      editSadhanaAll: [],
      editSadhanaAllNext: [],
      editSadhanaAllBackup: [],
      currentDate: '',
      currentEmail: '',
      oldClickCounter: 0,
      nextSadhanaDate: '',
      nextSadhanaEmail: '',
    }
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const { state } = location

    if (state !== undefined) {
      const { uuid } = state

      if (uuid !== undefined) {
        const body = {
          uuid,
        }

        dispatch({
          type: 'sadhana/GET_SADHANA_BY_ID',
          payload: body,
        })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sadhana.editSadhana !== this.state.editSadhana) {
      this.setState({
        editSadhana: nextProps.sadhana.editSadhana,
        nextSadhanaDate: nextProps.sadhana.editSadhana.date,
        nextSadhanaEmail: nextProps.sadhana.editSadhana.email,
      })
    }

    if (nextProps.sadhana.sadhanas.length === 1) {
      this.setState({
        editSadhana: nextProps.sadhana.sadhanas[0],
        nextSadhanaDate: nextProps.sadhana.sadhanas[0].date,
        nextSadhanaEmail: nextProps.sadhana.sadhanas[0].email,
      })
    }

    if (nextProps.sadhana.sadhanas.length > 1) {
      this.setState({
        editSadhanaAll: nextProps.sadhana.sadhanas,
        editSadhanaAllNext: nextProps.sadhana.sadhanas,
        editSadhanaAllBackup: nextProps.sadhana.sadhanas,
      })
    }
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
            date: this.state.currentDate,
            email: nextSadhanaEmail,
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
            date: this.state.currentDate,
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
            date: this.state.currentDate,
            email: nextSadhanaEmail,
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
            date: this.state.currentDate,
            email: this.state.currentEmail,
          })
        },
      )
    }
  }

  oldSadhanas = () => {
    const { editSadhana, editSadhanaAll, oldClickCounter } = this.state

    if (this.state.editSadhanaAllNext.length === 1) {
      this.setState({
        editSadhanaAllNext: this.state.editSadhanaAllBackup,
      })
    }

    let temp = {}
    let clickCounter = oldClickCounter
    const tempEditSadhanaAll = editSadhanaAll.filter((item, index) => {
      if (editSadhana.email === item.email) {
        return null
      }
      return item
    })

    for (let i = 0; i <= tempEditSadhanaAll.length; i += 1) {
      temp = { ...tempEditSadhanaAll[0] }

      if (clickCounter >= tempEditSadhanaAll.length) {
        clickCounter = 0
      } else {
        clickCounter += i
      }

      this.setState({
        editSadhana: temp,
        oldClickCounter: clickCounter,
        editSadhanaAll: [...tempEditSadhanaAll],
      })
    }
  }

  newSadhanas = () => {
    const { editSadhana, editSadhanaAllNext } = this.state

    if (this.state.editSadhanaAll.length === 1) {
      this.setState({
        editSadhanaAll: this.state.editSadhanaAllBackup,
      })
    }

    let temp = {}
    let clickCounter = editSadhanaAllNext.length

    const tempEditSadhanaAll = editSadhanaAllNext.filter((item, index) => {
      if (editSadhana.email === item.email) {
        return null
      }
      return item
    })

    clickCounter -= 1
    this.setState({
      oldClickCounterNext: clickCounter,
    })

    for (let i = editSadhanaAllNext.length; i >= 0; i -= 1) {
      temp = { ...tempEditSadhanaAll[i] }
      this.setState({
        editSadhana: temp,
        editSadhanaAllNext: [...tempEditSadhanaAll],
      })
    }
  }

  render() {
    const {
      language,
      editSadhana,
      editSadhanaAll,
      editSadhanaAllNext,
      oldClickCounter,
      currentDate,
    } = this.state

    let fullName = ''
    let customStyleLeft = {}
    let customStyleRight = {}
    let oldRight = {}
    let oldLeft = {}
    if (Object.keys(editSadhana).length > 0) {
      fullName = `${editSadhana.firstName} ${editSadhana.lastName}`
    }

    const nowDate = new Date()
    nowDate.setHours(0, 0, 0, 0)
    const tempCurrentDate = new Date(currentDate)
    tempCurrentDate.setHours(0, 0, 0, 0)

    const checkDate = +nowDate === +tempCurrentDate

    if (checkDate) {
      customStyleLeft = { pointerEvents: 'none', opacity: '0.4' }
    }

    if (Object.keys(editSadhana).length === 0 && !checkDate) {
      customStyleRight = { pointerEvents: 'none', opacity: '0.4' }
    }

    if (editSadhanaAll.length === oldClickCounter) {
      oldRight = { pointerEvents: 'none', opacity: '0.4' }
    }

    if (editSadhanaAllNext.length === 1) {
      oldLeft = { pointerEvents: 'none', opacity: '0.4' }
    }

    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <BackNavigation link="/sadhana/list" title="Sadhana List" />
            </div>
            <div className="col-lg-3">
              <Switch
                defaultChecked
                checkedChildren={language ? 'en' : 'ru'}
                unCheckedChildren={language ? 'en' : 'ru'}
                onChange={this.handleLanguage}
                className="toggle"
                style={{ width: '100px', marginLeft: '10px' }}
              />
            </div>
            <div
              // className="leftArrowDiv col-lg-1 justify-content-center align-self-center
              // justify-content-center align-self-center"
              className="leftArrowDiv col-lg-1"
              style={oldLeft}
            >
              <Icon className="leftArrow" type="left" onClick={this.newSadhanas} />
            </div>

            <div className="rightArrowDiv col-lg-1" style={oldRight}>
              <Icon className="rightArrow" type="right" onClick={this.oldSadhanas} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Helmet title="Sadhana Sheet" />
          <section className="card">
            <div className="card-body">
              <div className={styles.addPost}>
                <Form className="mt-2">
                  <div className="customContainer">
                    <div className="leftArrowDiv" style={customStyleLeft}>
                      <Icon className="leftArrow" type="left" onClick={this.nextSadhana} />
                    </div>
                    <div className="">
                      <span className="font-weight-bold">{editSadhana.date}</span>
                    </div>
                    <div className="rightArrowDiv" style={customStyleRight}>
                      <Icon className="rightArrow" type="right" onClick={this.previousSadhana} />
                    </div>
                  </div>

                  <div className="form-group">
                    <FormItem label={language ? 'Name' : 'Name'}>
                      <Input disabled value={fullName} placeholder="Name" name="name" />
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label={language ? 'Email' : 'Email'}>
                      <Input disabled value={editSadhana.email} placeholder="Email" name="email" />
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label={language ? 'Date' : 'Date'}>
                      <Input disabled value={editSadhana.date} placeholder="Date" name="date" />
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label={language ? 'Time Rising' : 'Time Rising'}>
                      <Input
                        disabled
                        value={editSadhana.time_rising}
                        placeholder="Time Rising"
                        name="time_rising"
                      />
                    </FormItem>
                  </div>
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
                  <div className="form-group">
                    <FormItem label={language ? 'Reading' : 'Reading'}>
                      <Input
                        disabled
                        value={editSadhana.reading}
                        placeholder="Reading"
                        name="reading"
                      />
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label={language ? 'Association' : 'Association'}>
                      <Input
                        disabled
                        value={editSadhana.association}
                        placeholder="Association"
                        name="association"
                      />
                    </FormItem>
                  </div>
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
                  <div className="form-group">
                    <FormItem label={language ? 'Additional Comments' : 'Additional Comments'}>
                      <TextArea
                        rows={4}
                        disabled
                        value={editSadhana.additional_comments}
                        placeholder="Additional Comments"
                        name="additional_comments"
                      />
                    </FormItem>
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
