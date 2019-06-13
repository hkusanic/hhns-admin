import React from 'react'
import { Table, DatePicker, Icon } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import renderHTML from 'react-render-html'
import { Link } from 'react-router-dom'
import './index.css'

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

@connect(({ sadhana }) => ({ sadhana }))
class SadhanaList extends React.Component {
  state = {
    language: true,
    currentDate: formatDate(new Date()),
    sadhanas: [],
    currentPage: 1,
    perPage: 20,
  }

  componentDidMount() {
    const { currentDate } = this.state
    const { dispatch, location } = this.props
    const { state } = location

    let browsingDate
    if (state !== undefined) {
      // eslint-disable-next-line prefer-destructuring
      browsingDate = state.browsingDate
    }

    if (browsingDate) {
      this.setState(
        {
          currentDate: browsingDate,
          currentPage: state.paginationCurrentPage,
        },
        () => {
          dispatch({
            type: 'sadhana/GET_SADHANAS',
            page: 1,
            // eslint-disable-next-line react/destructuring-assignment
            date: this.state.currentDate,
          })
        },
      )
    } else {
      dispatch({
        type: 'sadhana/GET_SADHANAS',
        page: 1,
        date: currentDate,
      })
    }

    dispatch({
      type: 'kirtan/RESET_STORE',
    })

    dispatch({
      type: 'video/RESET_STORE',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { sadhana } = nextProps

    // eslint-disable-next-line react/destructuring-assignment
    const sadhanasList = [...this.state.sadhanas]

    const { sadhanas } = sadhana

    if (sadhanas.length > 0) {
      if (sadhanas !== sadhanasList) {
        const tempSadhanas = []
        let tempObject = {}
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < sadhanas.length; i++) {
          tempObject = { ...sadhanas[i], itemIndex: i }
          tempSadhanas.push(tempObject)
        }

        this.setState(
          {
            sadhanas: tempSadhanas,
          },
          () => {
            sessionStorage.setItem('sadhanaArray', JSON.stringify(tempSadhanas))
          },
        )
      }
    } else {
      this.setState({
        sadhanas: [],
      })
    }
  }

  showing100Characters = sentence => {
    let result = sentence
    let resultArray = result.split(' ')
    if (resultArray.length > 10) {
      resultArray = resultArray.slice(0, 10)
      result = `${resultArray.join(' ')}...`
    }
    return result
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  // handlePageChange = page => {
  //   const { dispatch } = this.props
  //   const { currentDate } = this.state

  //   dispatch({
  //     type: 'sadhana/GET_SADHANAS',
  //     page,
  //     date: currentDate,
  //   })
  // }

  handlePageChange = page => {
    this.setState({
      currentPage: page,
    })
  }

  oldSadhanas = () => {
    const { currentDate } = this.state
    const { dispatch } = this.props

    const previousDate = getPreviousDate(new Date(currentDate))

    this.setState(
      {
        currentDate: previousDate,
      },
      () => {
        dispatch({
          type: 'sadhana/GET_SADHANAS',
          page: 1,
          // eslint-disable-next-line react/destructuring-assignment
          date: this.state.currentDate,
        })
      },
    )
  }

  newSadhanas = () => {
    const { currentDate } = this.state
    const { dispatch } = this.props

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
        })
      },
    )
  }

  onChangeDate = date => {
    const { dispatch } = this.props

    this.setState(
      {
        currentDate: date.format('YYYY-MM-DD'),
      },
      () => {
        dispatch({
          type: 'sadhana/GET_SADHANAS',
          page: 1,
          // eslint-disable-next-line react/destructuring-assignment
          date: this.state.currentDate,
        })
      },
    )
  }

  hanldeRedirect = record => {
    const { history } = this.props
    const { language } = this.state
    history.push({
      pathname: '/sadhana/add',
      state: { uuid: record.itemIndex, language },
    })
  }

  render() {
    const { language, currentDate, sadhanas, perPage, currentPage } = this.state
    // const { totalSadhanas } = this.props

    const nowDate = formatDate(new Date())

    const checkDate = nowDate === currentDate

    let customStyleLeft = {}
    // eslint-disable-next-line prefer-const
    let customStyleRight = {}
    if (checkDate) {
      customStyleLeft = { pointerEvents: 'none', opacity: '0.4' }
    }

    // if (sadhanas.length === 0 && !checkDate) {
    //   customStyleRight = { pointerEvents: 'none', opacity: '0.4' }
    // }

    const columns = [
      {
        title: 'First Name',
        dataIndex: 'user.name.first',
        render: text => (text ? renderHTML(this.showing100Characters(text)) : ''),
      },
      {
        title: 'Last Name',
        dataIndex: 'user.name.last',
        render: text => (text ? renderHTML(this.showing100Characters(text)) : ''),
      },
      {
        title: 'Rounds',
        dataIndex: 'rounds',
        render: text => (text ? renderHTML(this.showing100Characters(text)) : ''),
      },
      {
        title: 'Reading',
        dataIndex: 'reading',
        render: text => (text ? renderHTML(this.showing100Characters(text)) : ''),
      },
      {
        title: 'Time Rising',
        dataIndex: 'time_rising',
        render: text => (text ? renderHTML(this.showing100Characters(text)) : ''),
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link
              to={{
                pathname: '/sadhana/add',
                state: { uuid: record.itemIndex, language, currentPage },
              }}
            >
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
          </span>
        ),
      },
    ]

    const paginationConfig = {
      current: currentPage,
      pageSize: perPage,
      total: sadhanas.length,
      onChange: this.handlePageChange,
    }

    const indexOfLastData = currentPage * perPage
    const indexOfFirstData = indexOfLastData - perPage
    const currentDataArray = sadhanas.slice(indexOfFirstData, indexOfLastData)

    return (
      <div>
        <Helmet title="Lecture List" />
        <div className="card">
          <div className="container card-header mb-3">
            <div className="row utils__title">
              <div className="col-lg-8">
                <strong>Sadhana List</strong>
                {/* <Switch
                  defaultChecked
                  checkedChildren={language ? 'en' : 'ru'}
                  unCheckedChildren={language ? 'en' : 'ru'}
                  onChange={this.handleLanguage}
                  className="toggle"
                  style={{ width: '100px', marginLeft: '10px' }}
                /> */}
              </div>
            </div>
            <div className="row">
              <div className="datePickerDiv col-lg-4">
                <DatePicker
                  allowClear={false}
                  style={{ paddingTop: '10px' }}
                  onChange={this.onChangeDate}
                />
              </div>

              <div
                className="leftArrowDiv col-lg-1 justify-content-center align-self-center"
                style={customStyleLeft}
              >
                <Icon className="leftArrow" type="left" onClick={this.newSadhanas} />
              </div>
              <div className="col-lg-2 justify-content-center align-self-center">
                <span>{currentDate}</span>
              </div>
              <div
                className="rightArrowDiv col-lg-1 justify-content-center align-self-center"
                style={customStyleRight}
              >
                <Icon className="rightArrow" type="right" onClick={this.oldSadhanas} />
              </div>
            </div>
          </div>
          <div className="container card-body">
            <Table
              rowKey={record => record.uuid}
              rowClassName={record =>
                record.translation_required === true ? 'NotTranslated' : 'translated'
              }
              onRow={record => {
                return {
                  onDoubleClick: () => {
                    this.hanldeRedirect(record)
                  },
                }
              }}
              className="utils__scrollTable"
              scroll={{ x: '100%' }}
              columns={columns}
              dataSource={currentDataArray}
              pagination={paginationConfig}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default SadhanaList
