/* eslint-disable react/no-unused-state */
import React, { Component } from 'react'
import { Form, Input, Button, DatePicker } from 'antd'
import moment from 'moment'
import { withRouter } from 'react-router-dom'
import './DiscipleProfile.css'

const FormItem = Form.Item

const getDataFromStorage = () => {
  const userDetails = JSON.parse(sessionStorage.getItem('userDetails'))

  return userDetails
}

@Form.create()
class DiscipleProfile extends Component {
  state = {
    firstDate: null,
    secondDate: null,
    user: {},
  }

  static getDerivedStateFromProps() {
    const data = getDataFromStorage()

    if (Object.keys(data).length > 0) {
      return {
        user: data,
        // eslint-disable-next-line no-nested-ternary
        firstDate: data.disciple_profile
          ? data.disciple_profile.first_initiation_date
            ? moment(new Date(data.disciple_profile.first_initiation_date))
            : null
          : null,
        // eslint-disable-next-line no-nested-ternary
        secondDate: data.disciple_profile
          ? data.disciple_profile.second_initiation_date
            ? moment(new Date(data.disciple_profile.second_initiation_date))
            : null
          : null,
      }
    }
    return null
  }

  handleDateChange = (date, dateString, name) => {
    if (name === 'firstDate') {
      this.setState({
        firstDate: moment(new Date(date)),
      })
    }

    if (name === 'secondDate') {
      this.setState({
        secondDate: moment(new Date(date)),
      })
    }
  }

  render() {
    const { user, firstDate, secondDate } = this.state

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <FormItem label="Disciple Name">
                <Input value={user.discipleName} placeholder="Disciple Name" />
              </FormItem>
            </div>
            {/* <div className="col-lg-2" /> */}

            <div className="col-lg-6">
              <FormItem label="Temple Name">
                <Input
                  value={user.disciple_profile && user.disciple_profile.temple}
                  placeholder="Temple Name"
                />
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <FormItem label="First Initiation Date">
                <DatePicker
                  disabled
                  name="firstDate"
                  allowClear={false}
                  value={firstDate}
                  // onChange={(date, dateString) =>
                  //   this.handleDateChange(date, dateString, 'firstDate')
                  // }
                />
              </FormItem>
            </div>

            {/* <div className="col-lg-2" /> */}

            <div className="col-lg-6">
              <FormItem label="Second Initiation Date">
                <DatePicker
                  disabled
                  name="secondDate"
                  allowClear={false}
                  value={secondDate}
                  // onChange={(date, dateString) =>
                  //   this.handleDateChange(date, dateString, 'secondDate')
                  // }
                />
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <FormItem label="Marital Status">
                <Input
                  value={user.disciple_profile && user.disciple_profile.marital_status}
                  placeholder="Marital Status"
                />
              </FormItem>
            </div>

            {/* <div className="col-lg-2" /> */}

            <div className="col-lg-6">
              <FormItem label="Verifier">
                <Input
                  value={user.disciple_profile && user.disciple_profile.verifier}
                  placeholder="Verifier"
                />
              </FormItem>
            </div>
          </div>

          <Button type="primary">Update Details</Button>
        </div>
      </Form>
    )
  }
}

export default withRouter(DiscipleProfile)
