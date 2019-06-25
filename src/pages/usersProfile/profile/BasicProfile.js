/* eslint-disable react/destructuring-assignment */
import React, { Component, Fragment } from 'react'
import { Form, Input, Select, Button, Upload } from 'antd'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import './BasicProfile.css'

const FormItem = Form.Item
const { Option } = Select

const AvatarView = ({ profilePic }) => (
  <Fragment>
    <div className="avatar">
      <img src={profilePic} alt="avatar" className="avatar_img" />
    </div>
    <Upload fileList={[]}>
      <div className="button_view">
        <Button disabled icon="upload">
          Change avatar
        </Button>
      </div>
    </Upload>
  </Fragment>
)

@Form.create()
@connect(({ userProfile }) => ({ userProfile }))
class BasicProfile extends Component {
  state = {
    user: {},
    language: '',
    sadhanaSheetEnable: '',
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.userDetails) {
      if (nextProps.userDetails !== prevState.user) {
        return {
          user: nextProps.userDetails,
          sadhanaSheetEnable:
            nextProps.userDetails.sadhanaSheetEnable !== null &&
            nextProps.userDetails.sadhanaSheetEnable !== undefined
              ? nextProps.userDetails.sadhanaSheetEnable.toString()
              : '',
          language: nextProps.userDetails.language,
        }
      }
    }
    return null
  }

  getProfileUrl = () => {
    const { user } = this.state
    if (user.profile_pic === 'Profile pic not available') {
      return 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
    }
    return user.profile_pic
  }

  handleLanguageChange = language => {
    this.setState({
      language,
    })
  }

  handleSadhanaSheetEnable = value => {
    this.setState(
      {
        sadhanaSheetEnable: value,
      },
      () => {
        this.updateSadhanSheetStatus()
      },
    )
  }

  updateSadhanSheetStatus = () => {
    const { dispatch } = this.props
    const { user } = this.state
    let sadhanaSheetEnable
    if (this.state.sadhanaSheetEnable === false || this.state.sadhanaSheetEnable === 'false') {
      sadhanaSheetEnable = false
    } else {
      sadhanaSheetEnable = true
    }
    if (this.state)
      dispatch({
        type: 'userProfile/SADHANA_SHEET_ENABLE',
        sadhanaSheetEnable,
        user_id: user.user_id,
      })
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props

    const { user, sadhanaSheetEnable } = this.state

    let { language } = this.state

    if (language === 'en') {
      language = 'English'
    }

    if (language === 'ru') {
      language = 'Russian'
    }

    if (!user) {
      return <div>Loading...</div>
    }

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 nameDiv">
              <div className="row">
                <div className="col-lg-6">
                  <FormItem label="First Name">
                    <Input value={user && user.name && `${user.name.first}`} disabled />
                  </FormItem>
                </div>
                <div className="col-lg-6">
                  <FormItem label="Last Name">
                    <Input value={user && user.name && `${user.name.last}`} disabled />
                  </FormItem>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <FormItem label="Email">
                    <Input value={user.email} disabled />
                  </FormItem>
                </div>
                <div className="col-lg-6">
                  <FormItem label="Nickname">
                    {getFieldDecorator('nickName', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your Nickname!',
                        },
                      ],
                    })(<Input disabled />)}
                  </FormItem>
                </div>
              </div>
            </div>

            <div className="col-lg-4 imageDiv">
              <AvatarView profilePic={this.getProfileUrl()} />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Timezone">
                <Select value={user.timeZone} style={{ maxWidth: 220 }} disabled>
                  {/* <Option value="China">China</Option> */}
                </Select>
              </FormItem>
            </div>

            <div className="col-lg-8">
              <FormItem label="Phone Number">
                {/* <PhoneView value={data.mobileNumber} /> */}
                <Input type="number" value={user.mobileNumber} disabled />
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Language">
                <Select
                  id="product-edit-colors"
                  showSearch
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  disabled
                  value={language}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <Option
                    onClick={() => {
                      this.handleLanguageChange('English')
                    }}
                    value="English"
                  >
                    English
                  </Option>
                  <Option
                    onClick={() => {
                      this.handleLanguageChange('Russian')
                    }}
                    value="Russian"
                  >
                    Russian
                  </Option>
                </Select>
              </FormItem>
            </div>
            <div className="col-lg-4">
              <FormItem label="Sadhana Sheets Enable / Disable">
                <Select
                  id="product-edit-colors"
                  showSearch
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  onChange={this.handleSadhanaSheetEnable}
                  value={sadhanaSheetEnable}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <Option value="true">Enable</Option>
                  <Option value="false">Disable</Option>
                </Select>
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <FormItem label="Street Name">
                <Input name="streetName" disabled />
              </FormItem>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <FormItem label="Landmark (Optional)">
                <Input name="landmark" disabled />
              </FormItem>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4">
              <FormItem label="City">
                {getFieldDecorator('city', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your city name!',
                    },
                  ],
                })(<Input disabled />)}
              </FormItem>
            </div>
            <div className="col-lg-4">
              <FormItem label="Postal Code">
                {getFieldDecorator('postalCode', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your postal Code!',
                    },
                  ],
                })(<Input type="number" disabled />)}
              </FormItem>
            </div>

            <div className="col-lg-4">
              <FormItem label="Country">
                <Select value={user.countryCode} style={{ maxWidth: 220 }} disabled>
                  <Option value="en">EN</Option>
                  <Option value="ru">RU</Option>
                </Select>
              </FormItem>
            </div>
          </div>

          <Button type="primary" disabled>
            Update Information
          </Button>
        </div>
      </Form>
    )
  }
}

export default withRouter(BasicProfile)
