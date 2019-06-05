import React, { Component } from 'react'
import { Table } from 'antd'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import renderHTML from 'react-render-html'

// const columns = [
//   {
//     title: 'Rounds',
//     dataIndex: 'rounds',
//     render: text => (text ? renderHTML(text) : ''),
//   },
//   {
//     title: 'Reading',
//     dataIndex: 'reading',
//     render: text => (text ? renderHTML(text) : ''),
//   },
//   {
//     title: 'Time Rising',
//     dataIndex: 'time_rising',
//     render: text => (text ? renderHTML(text) : ''),
//   },
//   {
//     title: 'Action',
//     key: 'action',
//     render: record => (
//       <span>
//         <Link
//           to={{
//             pathname: '/sadhana/add',
//             state: { uuid: record.itemIndex },
//           }}
//         >
//           <i className="fa fa-edit mr-2 editIcon" />
//         </Link>
//       </span>
//     ),
//   },
// ]

// const dummyData = [
//   {
//     rounds: '20',
//     reading: '10',
//     time_rising: '10:00',
//   },
//   {
//     rounds: '30',
//     reading: '15',
//     time_rising: '12:00',
//   },
//   {
//     rounds: '50',
//     reading: '30',
//     time_rising: '20:00',
//   },
// ]

const getDataFromStorage = () => {
  const userDetails = JSON.parse(sessionStorage.getItem('userDetails'))

  return userDetails
}

@connect(({ sadhana }) => ({ sadhana }))
class SadhanaSheets extends Component {
  state = {
    user: getDataFromStorage(),
    sadhanas: [],
  }

  componentDidMount() {
    const { user } = this.state
    const { dispatch } = this.props

    if (Object.keys(user).length > 0) {
      dispatch({
        type: 'sadhana/GET_SADHANAS',
        page: 1,
        userId: user.user_id,
      })
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.sadhana.sadhanas !== prevState.sadhanas) {
      return {
        sadhanas: nextProps.sadhana.sadhanas,
      }
    }

    return null
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

  render() {
    const { sadhanas } = this.state

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
      // {
      //   title: 'Action',
      //   key: 'action',
      //   render: record => (
      //     <span>
      //       <Link
      //         to={{
      //           pathname: '/sadhana/add',
      //           state: { uuid: record.itemIndex },
      //         }}
      //       >
      //         <i className="fa fa-edit mr-2 editIcon" />
      //       </Link>
      //     </span>
      //   ),
      // },
    ]

    return (
      <Table
        rowKey={record => record.uuid}
        rowClassName={record =>
          record.translation_required === true ? 'NotTranslated' : 'translated'
        }
        className="utils__scrollTable"
        scroll={{ x: '100%' }}
        columns={columns}
        dataSource={sadhanas}
        // pagination={paginationConfig}
      />
    )
  }
}

export default withRouter(SadhanaSheets)
