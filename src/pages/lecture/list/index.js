/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Table, DatePicker, Select, Switch, Checkbox } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import renderHTML from 'react-render-html'
import { Link } from 'react-router-dom'

const { Option } = Select

@connect(({ lecture }) => ({ lecture }))
class ProductsList extends React.Component {
  state = {
    language: true,
    transcribe: false,
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'lecture/GET_LECTURES',
      page: 1,
    })
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props
    if (nextProps.lecture.isDeleted) {
      dispatch({
        type: 'lecture/GET_LECTURES',
        page: 1,
      })
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
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

  handlePageChnage = page => {
    const { dispatch } = this.props

    dispatch({
      type: 'lecture/GET_LECTURES',
      page,
    })
  }

  deleteLecture = uuid => {
    const { dispatch } = this.props
    dispatch({
      type: 'lecture/DELETE_LECTURE',
      uuid,
    })
  }

  onChangeDate = date => {
    const { dispatch } = this.props
    dispatch({
      type: 'lecture/GET_LECTURES',
      page: 1,
      date: date ? date.format('YYYY-MM-DD') : null,
    })
  }

  onChangeDateSort = order => {
    const { dispatch } = this.props
    dispatch({
      type: 'lecture/GET_LECTURES',
      page: 1,
      createdDateSort: order,
    })
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  hanldeRedirect = record => {
    const { history } = this.props
    history.push({
      pathname: '/lecture/create',
      state: record.uuid,
    })
  }

  handleTranscribe = event => {
    setTimeout(() => {
      this.setState({
        transcribe: event.target.checked,
      })
    }, 0)

    const { dispatch } = this.props
    dispatch({
      type: 'lecture/GET_LECTURES',
      page: 1,
      transcribe_required: event.target.checked,
    })
  }

  render() {
    const { language, transcribe } = this.state
    const { lecture } = this.props
    const { lectures, totalLectures } = lecture
    const data = lectures
    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'en.title' : 'ru.title',
        key: language ? 'en.title' : 'ru.title',
        render: title => (title ? renderHTML(this.showing100Characters(title)) : ''),
      },
      // {
      //   title: 'Event',
      //   dataIndex: language ? 'en.event' : 'ru.event',
      //   key: language ? 'en.event' : 'ru.event',
      // },
      // {
      //   title: 'Author',
      //   dataIndex: 'author',
      //   key: 'author',
      // },
      {
        title: 'Date',
        dataIndex: 'created_date',
        key: 'created_date',
        render: date => <span>{`${new Date(date).toDateString()}`}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link to={{ pathname: '/lecture/create', state: { id: record.uuid, language } }}>
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
            <i
              className="fa fa-trash mr-2 closeIcon"
              onClick={() => {
                this.deleteLecture(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    return (
      <div>
        <Helmet title="Lecture List" />
        <div className="card">
          <div className="card-header">
            <div className="utils__title">
              <strong>Lecture List</strong>
              <Switch
                defaultChecked
                checkedChildren={language ? 'en' : 'ru'}
                unCheckedChildren={language ? 'en' : 'ru'}
                onChange={this.handleLanguage}
                className="toggle"
                style={{ width: '100px', float: 'right', margin: '0px 10px 10px 0px' }}
              />
            </div>
            <DatePicker style={{ paddingTop: '10px' }} onChange={this.onChangeDate} />
            <Select
              id="product-edit-colors"
              showSearch
              style={{ width: '20%', paddingTop: '10px' }}
              onChange={this.onChangeDateSort}
              placeholder="Select Order"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="asc">Ascending</Option>
              <Option value="desc">Descending</Option>
            </Select>
            &nbsp;&nbsp;&nbsp;
            <Checkbox checked={transcribe} onChange={this.handleTranscribe}>
              &nbsp; Transcribe ?
            </Checkbox>
          </div>
          <div className="card-body">
            <Table
              rowKey={record => record.uuid}
              // eslint-disable-next-line no-unused-expressions
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
              dataSource={data}
              pagination={{
                pageSize: 20,
                onChange: this.handlePageChnage,
                total: totalLectures,
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default ProductsList
