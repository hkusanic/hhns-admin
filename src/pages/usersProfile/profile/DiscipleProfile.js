/* eslint-disable react/no-unused-state */
import React, { Component } from 'react'
import { Form, Input, Button, DatePicker } from 'antd'
import moment from 'moment'
import { withRouter } from 'react-router-dom'

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
  }

  static getDerivedStateFromProps() {
    const data = getDataFromStorage()
    return {
      user: data,
    }
  }

  handleDateChange = (date, dateString, name) => {
    if (name === 'firstDate') {
      this.setState({
        firstDate: dateString,
      })
    }

    if (name === 'secondDate') {
      this.setState({
        secondDate: dateString,
      })
    }
  }

  render() {
    const { user } = this.state

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Disciple Name">
                <Input value={user.discipleName} placeholder="Disciple Name" />
              </FormItem>
            </div>
            <div className="col-lg-2" />

            <div className="col-lg-4">
              <FormItem label="Temple Name">
                <Input
                  value={user.disciple_profile && user.disciple_profile.temple}
                  placeholder="Temple Name"
                />
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="First Initiation Date">
                <DatePicker
                  value={
                    user.disciple_profile &&
                    moment(new Date(user.disciple_profile.first_initiation_date))
                  }
                  onChange={(date, dateString) =>
                    this.handleDateChange(date, dateString, 'firstDate')
                  }
                />
              </FormItem>
            </div>

            <div className="col-lg-2" />

            <div className="col-lg-4">
              <FormItem label="Second Initiation Date">
                <DatePicker
                  value={
                    user.disciple_profile &&
                    moment(new Date(user.disciple_profile.second_initiation_date))
                  }
                  onChange={(date, dateString) =>
                    this.handleDateChange(date, dateString, 'secondDate')
                  }
                />
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Spiritual Name">
                <Input
                  value={user.disciple_profile && user.disciple_profile.spiritual_name}
                  placeholder="Spiritual Name"
                />
              </FormItem>
            </div>
            <div className="col-lg-2" />

            <div className="col-lg-4">
              <FormItem label="Marital Status">
                <Input
                  value={user.disciple_profile && user.disciple_profile.marital_status}
                  placeholder="Marital Status"
                />
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
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
