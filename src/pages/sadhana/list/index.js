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
  }

  componentDidMount() {
    const { dispatch } = this.props
    const { currentDate } = this.state
    dispatch({
      type: 'sadhana/GET_SADHANAS',
      page: 1,
      date: currentDate,
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

  handlePageChange = page => {
    const { dispatch } = this.props
    const { currentDate } = this.state

    dispatch({
      type: 'sadhana/GET_SADHANAS',
      page,
      date: currentDate,
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

    this.setState({
      currentDate: date.format('YYYY-MM-DD'),
    })

    dispatch({
      type: 'sadhana/GET_SADHANAS',
      page: 1,
      date: date ? date.format('YYYY-MM-DD') : null,
    })
  }

  render() {
    const { language, currentDate, sadhanas } = this.state
    const { totalSadhanas } = this.props

    const nowDate = formatDate(new Date())

    const checkDate = nowDate === currentDate

    let customStyleLeft = {}
    // eslint-disable-next-line prefer-const
    let customStyleRight = {}
    if (checkDate) {
      customStyleLeft = { pointerEvents: 'none', opacity: '0.4' }
    }

    console.log('sadhanas===>', sadhanas)

    // if (sadhanas.length === 0 && !checkDate) {
    //   customStyleRight = { pointerEvents: 'none', opacity: '0.4' }
    // }

    const columns = [
      {
        title: 'First Name',
        dataIndex: 'firstName',
        render: text => (text ? renderHTML(this.showing100Characters(text)) : ''),
      },
      {
        title: 'Last Name',
        dataIndex: 'lastName',
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
            <Link to={{ pathname: '/sadhana/add', state: { uuid: record.itemIndex, language } }}>
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
          </span>
        ),
      },
    ]

    return (
      <div>
        <Helmet title="Lecture List" />
        <div className="card">
          <div className="container card-header">
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
                <DatePicker style={{ paddingTop: '10px' }} onChange={this.onChangeDate} />
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
          <div className="card-body">
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
              dataSource={sadhanas}
              pagination={{
                pageSize: 20,
                onChange: this.handlePageChange,
                total: totalSadhanas,
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default SadhanaList
