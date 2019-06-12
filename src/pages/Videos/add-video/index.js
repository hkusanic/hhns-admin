/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable func-names */
/* eslint-disable one-var */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable no-underscore-dangle */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React from 'react'
import {
  Switch,
  Form,
  Button,
  Icon,
  Input,
  Select,
  DatePicker,
  Checkbox,
  AutoComplete,
  Tabs,
  notification,
} from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import moment from 'moment'
import { uuidv4 } from '../../../services/custom'
import BackNavigation from '../../../common/BackNavigation/index'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import styles from './style.module.scss'
import { formInputElements } from '../../../utils/addVideoInput'
import { checkValidation } from '../../../utils/checkValidation'
import './index.css'

const FormItem = Form.Item
const { TabPane } = Tabs
const { Option } = Select
let id = 0
let initialize = true
@Form.create()
@connect(({ video, lecture, router }) => ({ video, lecture, router }))
class AddVideo extends React.Component {
  state = {
    autoCompleteDataSource: '',
    language: true,
    editingvideo: '',
    translationRequired: true,
    nextUrls: [],
    arKeys: [],
    titleEn: '',
    titleRu: '',
    locationEn: '',
    locationRu: '',
    eventEn: '',
    eventRu: '',
    switchDisabled: true,
    formElements: formInputElements,
    paginationCurrentPage: '',
  }

  componentDidMount() {
    initialize = true
    const { dispatch, router } = this.props
    const { location } = router
    const { state } = location
    if (state !== undefined) {
      const { language, currentPage, uuid } = state
      setTimeout(
        this.setState({
          language,
          paginationCurrentPage: currentPage,
        }),
        0,
      )

      if (uuid !== undefined) {
        const body = {
          uuid,
        }
        dispatch({
          type: 'video/GET_VIDEO_BY_ID',
          payload: body,
        })
      }
    }
    dispatch({
      type: 'lecture/GET_EVENTS',
    })
    dispatch({
      type: 'lecture/GET_LOCATIONS',
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.video.editVideo !== '') {
      const { video } = nextProps
      let ar = []
      if (video.editVideo && video.editVideo.urls && video.editVideo.urls.length > 0) {
        ar = video.editVideo.urls
      }

      const titleEn = video.editVideo ? video.editVideo.en.title : ''
      const titleRu = video.editVideo ? video.editVideo.ru.title : ''

      const locationEn = video.editVideo ? video.editVideo.en.location : ''
      const locationRu = video.editVideo ? video.editVideo.ru.location : ''

      const eventEn = video.editVideo ? video.editVideo.en.event : ''
      const eventRu = video.editVideo ? video.editVideo.ru.event : ''

      this.setState(
        {
          editingvideo: video.editVideo,
          translationRequired: video.editVideo ? video.editVideo.translation_required : true,
          nextUrls: ar,
          titleEn,
          titleRu,
          locationEn,
          locationRu,
          eventEn,
          eventRu,
        },
        () => {
          if (!this.onFieldValueChange()) {
            this.setState({ switchDisabled: false })
          }
        },
      )
      if (initialize) {
        const arKeys = []
        video.editVideo.urls.map((k, index) => {
          arKeys.push(index)
        })
        this.setState({ arKeys })
        id = arKeys.length - 1
        initialize = false
      }
    }
    if (nextProps.video.isVideoCreated) {
      this.handleReset()
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
  }

  componentWillUnmount() {
    this.handleReset()
    this.setState({
      autoCompleteDataSource: '',
      language: true,
      editingvideo: '',
      translationRequired: true,
      nextUrls: [],
      arKeys: [],
    })
  }

  remove = k => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    if (keys.length === 1) {
      return
    }
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    })
  }

  add = () => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    const nextKeys = keys.concat(++id)
    form.setFieldsValue({
      keys: nextKeys,
    })
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  handleVideoReferenceSearch = reference => {
    const { form, dispatch } = this.props
    const type = form.getFieldValue('type')
    const body = {
      type,
      parameter: reference,
    }
    dispatch({
      type: 'video/GET_SUGGESTION',
      payload: body,
    })
    const ar = []
    if (this.props.video.suggestions) {
      if (this.state.language) {
        this.props.video.suggestions.map(a => {
          ar.push(a.en.title)
        })
      } else {
        this.props.video.suggestions.map(a => {
          ar.push(a.ru.title)
        })
      }
      this.setState({ autoCompleteDataSource: ar })
    }
  }

  handleSubmitForm = () => {
    const { form, dispatch, router } = this.props
    // const uuid = this.props.location.state
    const { location } = router
    const { state } = location

    // let uuid = ''
    // if (state !== undefined) {
    //   const { id } = state
    //   uuid = id
    // }

    const uuid = this.props.video.editVideo.uuid

    const {
      translationRequired,
      editingvideo,
      titleEn,
      locationEn,
      eventEn,
      titleRu,
      locationRu,
      eventRu,
    } = this.state
    // const titleVideo = form.getFieldValue('title')
    const author = form.getFieldValue('author')
    const videoLanguage = form.getFieldValue('language')
    const date = form.getFieldValue('date')
    const publishDate = form.getFieldValue('publish_date')
    // const event = form.getFieldValue('event')
    // const location = form.getFieldValue('location')
    const type = form.getFieldValue('type')
    const videoReference = form.getFieldValue('reference')

    if (titleEn === '' || locationEn === '' || eventEn === '') {
      notification.error({
        message: 'Error',
        description: 'Please fill all the fields',
      })

      return
    }

    // form.validateFields(['title', 'create_date'], (err, values) => {
    // console.info(values)
    const dynamicFieldValues = []
    const keys = form.getFieldValue('keys')

    keys.map((k, index) => {
      console.info(index)
      const val = form.getFieldValue(`url-[${k}]`)
      dynamicFieldValues.push(val)
    })

    // if (!err) {
    const body = {
      uuid: uuid || uuidv4(),
      date,
      published_date: publishDate,
      language: videoLanguage,
      reference: videoReference,
      translation_required: translationRequired,
      type,
      author,
      urls: dynamicFieldValues,
      en: {
        title: titleEn,
        event: eventEn,
        location: locationEn,
      },
      ru: {
        title: titleRu,
        event: eventRu,
        location: locationRu,
      },
    }

    if (editingvideo !== '') {
      body.audit = editingvideo.audit
      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'video/UPDATE_VIDEO',
        payload,
      })
      this.scrollToTopPage()
    } else {
      dispatch({
        type: 'video/CREATE_VIDEO',
        body,
      })
      this.scrollToTopPage()
      this.handleStateReset()
    }
    // }
    // })
  }

  handleStateReset = () => {
    this.setState({
      autoCompleteDataSource: '',
      language: true,
      editingvideo: '',
      translationRequired: true,
      nextUrls: [],
      arKeys: [],
      titleEn: '',
      titleRu: '',
      locationEn: '',
      locationRu: '',
      eventEn: '',
      eventRu: '',
      switchDisabled: true,
      formElements: formInputElements,
      paginationCurrentPage: '',
    })
  }

  scrollToTopPage = () => {
    // $('html, body').animate({ scrollTop: 0 }, 'fast')
    // return false

    const scrollDuration = 500
    const scrollStep = -window.scrollY / (scrollDuration / 15),
      scrollInterval = setInterval(function() {
        if (window.scrollY != 0) {
          window.scrollBy(0, scrollStep)
        } else clearInterval(scrollInterval)
      }, 10)
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      language: true,
      editingvideo: '',
    })
  }

  handleTitleChange = event => {
    const { language, formElements } = this.state

    const updatedFormElements = {
      ...formElements,
      [event.target.name]: {
        ...formElements[event.target.name],
        value: event.target.value,
        touched: true,
        valid: checkValidation(event.target.value, formElements[event.target.name].validation),
      },
    }

    this.setState({ formElements: updatedFormElements })

    if (language) {
      this.setState(
        {
          titleEn: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }

    if (!language) {
      this.setState(
        {
          titleRu: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }
  }

  handleTitleChange = event => {
    const { language, formElements } = this.state

    const updatedFormElements = {
      ...formElements,
      [event.target.name]: {
        ...formElements[event.target.name],
        value: event.target.value,
        touched: true,
        valid: checkValidation(event.target.value, formElements[event.target.name].validation),
      },
    }

    this.setState({ formElements: updatedFormElements })

    if (language) {
      this.setState(
        {
          titleEn: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }

    if (!language) {
      this.setState(
        {
          titleRu: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }
  }

  handleLocationChange = location => {
    this.setState(
      {
        locationEn: location.title_en,
        locationRu: location.title_ru,
      },
      () => this.onFieldValueChange(),
    )
  }

  handleEventChange = event => {
    this.setState(
      {
        eventEn: event.title_en,
        eventRu: event.title_ru,
      },
      () => this.onFieldValueChange(),
    )
  }

  onFieldValueChange = () => {
    const { titleEn, locationEn, eventEn } = this.state

    if (titleEn !== '' && locationEn !== '' && eventEn !== '') {
      this.setState({ switchDisabled: false })
      return false
    }

    this.setState({ switchDisabled: true })
    return true
  }

  render() {
    const { form, lecture, video } = this.props
    const { events, locations } = lecture
    const {
      language,
      translationRequired,
      titleEn,
      titleRu,
      locationEn,
      locationRu,
      eventEn,
      eventRu,
      switchDisabled,
      editingvideo,
      formElements,
      paginationCurrentPage,
    } = this.state
    const dateFormat = 'YYYY/MM/DD'
    const { getFieldDecorator, getFieldValue } = this.props.form

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    }
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    }

    getFieldDecorator('keys', {
      rules: [
        {
          required: true,
          message: 'Url is required',
        },
      ],
      initialValue: this.state.arKeys.length > 0 ? this.state.arKeys : [0],
    })
    const keys = getFieldValue('keys')
    const formItems = keys.map((k, index) => (
      <Form.Item
        {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
        label={index === 0 ? 'Youtube Url' : ''}
        required
        key={k}
      >
        {getFieldDecorator(`url-[${k}]`, {
          validateTrigger: ['onChange', 'onBlur'],
          rules: [
            {
              required: true,
              whitespace: true,
              message: 'Please input url or delete this field.',
            },
          ],
          initialValue: this.state.nextUrls[k] ? this.state.nextUrls[k] : '',
        })(<Input placeholder="Url" style={{ width: '60%', marginRight: 8 }} />)}
        {keys.length > 1 ? (
          <Icon
            className="dynamic-delete-button"
            type="minus-circle-o"
            onClick={() => this.remove(k)}
          />
        ) : null}
      </Form.Item>
    ))

    const linkState = {
      paginationCurrentPage,
    }

    return (
      <React.Fragment>
        <div>
          <BackNavigation link="/video/list" title="Video List" linkState={linkState} />
          {editingvideo && editingvideo.en && editingvideo.ru ? (
            <div style={{ paddingTop: '10px' }}>
              <div>
                <strong>Title :</strong>
                &nbsp;&nbsp;
                <span>{language ? editingvideo.en.title : editingvideo.ru.title}</span>
              </div>
            </div>
          ) : null}
          <Helmet title="Add Video" />
          <Tabs defaultActiveKey="1">
            <TabPane tab="Video" key="1">
              <section className="card">
                <div className="card-header mb-2">
                  <div className="utils__title">
                    <strong>Video Add/Edit</strong>
                    <Switch
                      disabled={switchDisabled}
                      defaultChecked
                      checkedChildren={language ? 'en' : 'ru'}
                      unCheckedChildren={language ? 'en' : 'ru'}
                      onChange={this.handleLanguage}
                      className="toggle"
                      style={{ width: '100px', marginLeft: '10px' }}
                    />
                  </div>
                  <div className="card-body">
                    <div className={styles.addPost}>
                      <Form className="mt-3">
                        <div className="form-group">
                          <FormItem label={language ? 'Title' : 'Title'}>
                            <Input
                              onChange={this.handleTitleChange}
                              value={language ? titleEn : titleRu}
                              placeholder="video title"
                              name="title"
                            />
                            {!formElements.title.valid &&
                            formElements.title.validation &&
                            formElements.title.touched ? (
                              <div className="invalidFeedback">
                                {formElements.title.errorMessage}
                              </div>
                            ) : null}
                            {/* {form.getFieldDecorator('title', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Title is required',
                                },
                              ],
                              initialValue:
                                editingvideo && (editingvideo.en || editingvideo.ru)
                                  ? language
                                    ? editingvideo.en.title
                                    : editingvideo.ru.title
                                  : '',
                            })(<Input placeholder="Video Title" />)} */}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Author">
                            {form.getFieldDecorator('author', {
                              initialValue:
                                editingvideo && (editingvideo.en || editingvideo.ru)
                                  ? editingvideo.author
                                  : '',
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Author"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                <Option value="Niranjana Swami">Niranjana Swami</Option>
                                <Option value="Other">Other</Option>
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Language">
                            {form.getFieldDecorator('language', {
                              initialValue: editingvideo ? editingvideo.language : '',
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select language"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                <Option value="english">English</Option>
                                <Option value="russian">Russian</Option>
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Type">
                            {form.getFieldDecorator('type', {
                              initialValue: editingvideo ? editingvideo.type : null,
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Type"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                <Option value="kirtan">Kirtan</Option>
                                <Option value="lecture">Lecture</Option>
                                <Option value="other">Other</Option>
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        {form.getFieldValue('type') === 'kirtan' ||
                        form.getFieldValue('type') === 'lecture' ? (
                          <div className="form-group">
                            <FormItem label="Reference">
                              {form.getFieldDecorator('reference', {
                                rules: [
                                  {
                                    required: form.getFieldValue('type') === 'lecture',
                                    message: 'Reference is required',
                                  },
                                ],
                                initialValue: editingvideo.reference
                                  ? editingvideo.reference
                                  : null,
                              })(
                                <AutoComplete
                                  id="product-edit-colors"
                                  dataSource={this.state.autoCompleteDataSource}
                                  style={{ width: '100%' }}
                                  placeholder="Reference"
                                  optionFilterProp="children"
                                  onSearch={this.handleVideoReferenceSearch}
                                />,
                              )}
                            </FormItem>
                          </div>
                        ) : (
                          ''
                        )}
                        <div className="form-group">
                          <FormItem>
                            {form.getFieldDecorator('translation', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Need Translation is required',
                                },
                              ],
                              initialValue: editingvideo ? editingvideo.translation_required : '',
                            })(
                              <Checkbox
                                checked={translationRequired}
                                onChange={this.handleCheckbox}
                              >
                                &nbsp; Need Translation ?
                              </Checkbox>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Date">
                            {form.getFieldDecorator('date', {
                              initialValue: editingvideo
                                ? moment(new Date(editingvideo.date), dateFormat)
                                : moment(new Date(), dateFormat),
                            })(<DatePicker />)}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Publish Date">
                            {form.getFieldDecorator('publish_date', {
                              initialValue: editingvideo
                                ? moment(editingvideo.published_date, dateFormat)
                                : moment(new Date(), dateFormat),
                            })(<DatePicker disabled />)}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Event">
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Event"
                              optionFilterProp="children"
                              value={language ? eventEn : eventRu}
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              {events && events.length > 0
                                ? events.map(item => {
                                    return (
                                      <Option
                                        onClick={() => {
                                          this.handleEventChange(item)
                                        }}
                                        key={item._id}
                                        value={language ? item.title_en : item.title_ru}
                                      >
                                        {language ? item.title_en : item.title_ru}
                                      </Option>
                                    )
                                  })
                                : null}
                            </Select>

                            {/* {form.getFieldDecorator('event', {
                              // initialValue:
                              //   editingvideo && (editingvideo.en || editingvideo.ru)
                              //     ? language
                              //       ? editingvideo.en.event
                              //       : editingvideo.ru.event
                              //     : '',
                              initialValue: language ? eventEn : eventRu,
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Event"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {events && events.length > 0
                                  ? events.map(item => {
                                      return (
                                        <Option
                                          onClick={() => {
                                            this.handleEventChange(item)
                                          }}
                                          key={item._id}
                                          value={language ? item.title_en : item.title_ru}
                                        >
                                          {language ? item.title_en : item.title_ru}
                                        </Option>
                                      )
                                    })
                                  : null}
                              </Select>,
                            )} */}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Location">
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Location"
                              optionFilterProp="children"
                              value={language ? locationEn : locationRu}
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              {locations && locations.length > 0
                                ? locations.map(item => {
                                    return (
                                      <Option
                                        onClick={() => {
                                          this.handleLocationChange(item)
                                        }}
                                        key={item._id}
                                        value={language ? item.title_en : item.title_ru}
                                      >
                                        {language ? item.title_en : item.title_ru}
                                      </Option>
                                    )
                                  })
                                : null}
                            </Select>

                            {/* {form.getFieldDecorator('location', {
                              // initialValue:
                              //   editingvideo && (editingvideo.en || editingvideo.ru)
                              //     ? language
                              //       ? editingvideo.en.location
                              //       : editingvideo.ru.location
                              //     : '',
                              initialValue: language ? locationEn : locationRu,
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Location"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {locations && locations.length > 0
                                  ? locations.map(item => {
                                      return (
                                        <Option
                                          onClick={() => {
                                            this.handleLocationChange(item)
                                          }}
                                          key={item._id}
                                          value={language ? item.title_en : item.title_ru}
                                        >
                                          {language ? item.title_en : item.title_ru}
                                        </Option>
                                      )
                                    })
                                  : null}
                              </Select>,
                            )} */}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          {formItems}
                          <Form.Item {...formItemLayoutWithOutLabel}>
                            <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
                              <Icon type="plus" /> Add field
                            </Button>
                          </Form.Item>
                        </div>
                        <FormItem>
                          <div className={styles.submit}>
                            <span className="mr-3">
                              <Button
                                type="primary"
                                htmlType="submit"
                                onClick={this.handleSubmitForm}
                              >
                                Save and Post
                              </Button>
                            </span>
                            <Button type="danger" onClick={this.handleStateReset}>
                              Discard
                            </Button>
                          </div>
                        </FormItem>
                      </Form>
                    </div>
                  </div>
                </div>
              </section>
            </TabPane>
            <TabPane tab="Audit" key="2">
              <section className="card">
                <div className="card-body">
                  {/* <AuditTimeline
                    audit={
                      editingvideo && editingvideo.audit ? editingvideo.audit : video.videoAudit
                    }
                  /> */}
                  <AuditTimeline audit={editingvideo && editingvideo.audit && editingvideo.audit} />
                </div>
              </section>
            </TabPane>
          </Tabs>
        </div>
      </React.Fragment>
    )
  }
}
export default AddVideo
