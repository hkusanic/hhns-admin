/* eslint-disable no-underscore-dangle */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React from 'react'
import { Switch, Form, Button, Input, Select, DatePicker, Checkbox, AutoComplete, Tabs } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import moment from 'moment'
import { uuidv4 } from '../../../services/custom'
import BackNavigation from '../../../common/BackNavigation/index'
import styles from './style.module.scss'

const FormItem = Form.Item
const { TabPane } = Tabs
const { Option } = Select

@Form.create()
@connect(({ video, lecture }) => ({ video, lecture }))
class AddVideo extends React.Component {
  state = {
    autoCompleteDataSource: '',
    language: true,
    event: '',
    location: '',
    type: '',
    videoReference: '',
    videoUrlFields: [],
    videoUrl: [],
    showReference: false,
    tempUrl: '',
    editingvideo: '',
    translationRequired: true,
  }

  componentDidMount() {
    const { location, dispatch } = this.props
    const uuid = location.state
    if (uuid !== undefined) {
      const body = {
        uuid,
      }
      dispatch({
        type: 'video/GET_VIDEO_BY_ID',
        payload: body,
      })
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
      const ar = []
      if (video.editVideo.urls && video.editVideo.urls.length > 0) {
        for (let i = 1; i < video.editVideo.urls.length; i = +1) {
          ar.push(
            <Input
              key={i}
              onChange={e => this.handleUrlValueChange(e)}
              placeholder="Youtube Url"
              value={video.editVideo.urls[i]}
            />,
          )
        }
      }
      this.setState({
        editingvideo: video.editVideo,
        type: video.editVideo.type,
        videoUrl: video.editVideo.urls || [],
        videoUrlFields: ar,
        showReference: video.editVideo.type !== 'other',
        translationRequired: video.editVideo.translation_required,
      })
    }
    if (nextProps.video.isVideoCreated) {
      this.handleReset()
    }
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  handleSelectEvent = event => {
    this.setState({
      event,
    })
  }

  handleSelectLocation = location => {
    this.setState({
      location,
    })
  }

  handleSelectType = type => {
    // this.setState({autoCompleteDataSource: []});
    if (type !== 'other') {
      this.setState({ showReference: true, type })
    } else {
      this.setState({ showReference: false, type })
    }
  }

  handleVideoReferenceSelect = reference => {
    this.setState({
      videoReference: reference,
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

  handleAddVideoUrl = () => {
    const { videoUrlFields, tempUrl, videoUrl } = this.state
    const ar = videoUrlFields
    let len = ar.length
    const arUrls = videoUrl
    if (tempUrl !== '') arUrls.push(tempUrl)

    ar.push(
      <Input key={++len} onChange={e => this.handleUrlValueChange(e)} placeholder="Youtube Url" />,
    )
    this.setState({ videoUrlFields: ar, videoUrl: arUrls, tempUrl: '' })
  }

  handleUrlValueChange = e => {
    this.setState({ tempUrl: e.target.value })
  }

  handleSubmitForm = () => {
    const { form, dispatch } = this.props
    const uuid = this.props.location.state
    const {
      language,
      event,
      location,
      type,
      videoReference,
      videoUrl,
      editingvideo,
      translationRequired,
    } = this.state
    const titleVideo = form.getFieldValue('title')
    const author = form.getFieldValue('author')
    const videoLanguage = form.getFieldValue('language')
    const date = form.getFieldValue('date')
    const publishDate = form.getFieldValue('publish_date')

    form.validateFields(['title', 'create_date', 'youtube'], (err, values) => {
      console.info(values)
      if (editingvideo !== '') {
        videoUrl.splice(0, 1)
      }
      videoUrl.push(form.getFieldValue('youtube'))
      if (this.state.tempUrl !== '') videoUrl.push(this.state.tempUrl)
      if (!err) {
        const body = {
          uuid: uuid || uuidv4(),
          date,
          published_date: publishDate,
          language: videoLanguage,
          reference: videoReference,
          translation_required: translationRequired,
          type,
          author,
          urls: videoUrl,
          en: {
            title: language ? titleVideo : editingvideo ? editingvideo.en.title : '',
            event: language ? event : editingvideo ? editingvideo.en.event : '',
            location: language ? location : editingvideo ? editingvideo.en.location : '',
          },
          ru: {
            title: language ? (editingvideo ? editingvideo.ru.title : '') : titleVideo,
            event: language ? (editingvideo ? editingvideo.ru.event : '') : event,
            location: language ? (editingvideo ? editingvideo.ru.location : '') : location,
          },
        }
        if (editingvideo !== '') {
          const payload = {
            body,
            uuid,
          }
          dispatch({
            type: 'video/UPDATE_VIDEO',
            payload,
          })
        } else {
          dispatch({
            type: 'video/CREATE_VIDEO',
            payload: body,
          })
        }
      }
    })
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
      event: '',
      location: '',
      type: '',
      videoReference: '',
      videoUrl: [],
      videoUrlFields: [],
      tempUrl: [],
      showReference: false,
      editingvideo: '',
    })
  }

  render() {
    const { form, lecture } = this.props
    const { events, locations } = lecture
    const { language, translationRequired } = this.state
    const dateFormat = 'YYYY/MM/DD'

    const { editingvideo } = this.state
    return (
      <React.Fragment>
        <div>
          <BackNavigation link="/video/list" title="Video List" />
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
                            {form.getFieldDecorator('title', {
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
                            })(<Input placeholder="Video Title" />)}
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
                              initialValue: editingvideo ? editingvideo.type : '',
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Type"
                                optionFilterProp="children"
                                onChange={this.handleSelectType}
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
                        {this.state.showReference ? (
                          <div className="form-group">
                            <FormItem label="Reference">
                              {form.getFieldDecorator('reference')(
                                <AutoComplete
                                  id="product-edit-colors"
                                  dataSource={this.state.autoCompleteDataSource}
                                  style={{ width: '100%' }}
                                  placeholder="Reference"
                                  optionFilterProp="children"
                                  onSelect={this.handleVideoReferenceSelect}
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
                                ? moment(editingvideo.date, dateFormat)
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
                            {form.getFieldDecorator('event', {
                              initialValue:
                                editingvideo && (editingvideo.en || editingvideo.ru)
                                  ? language
                                    ? editingvideo.en.event
                                    : editingvideo.ru.event
                                  : '',
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Event"
                                optionFilterProp="children"
                                onChange={this.handleSelectEvent}
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {events && events.length > 0
                                  ? events.map(item => {
                                      return (
                                        <Option key={item._id} value={item.title}>
                                          {item.title}
                                        </Option>
                                      )
                                    })
                                  : null}
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Location">
                            {form.getFieldDecorator('location', {
                              initialValue:
                                editingvideo && (editingvideo.en || editingvideo.ru)
                                  ? language
                                    ? editingvideo.en.location
                                    : editingvideo.ru.location
                                  : '',
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Location"
                                optionFilterProp="children"
                                onChange={this.handleSelectLocation}
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {locations && locations.length > 0
                                  ? locations.map(item => {
                                      return (
                                        <Option key={item._id} value={item.title}>
                                          {item.title}
                                        </Option>
                                      )
                                    })
                                  : null}
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Youtube">
                            {form.getFieldDecorator('youtube', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Url is required',
                                },
                              ],
                              initialValue:
                                editingvideo && editingvideo.urls ? editingvideo.urls[0] : '',
                            })(<Input placeholder="Youtube Url" />)}
                          </FormItem>
                          {this.state.videoUrlFields.map(input => {
                            return input
                          })}
                          <FormItem>
                            <div className={styles.submit}>
                              <span className="mr-3">
                                <Button
                                  type="default"
                                  icon="plus-circle"
                                  onClick={this.handleAddVideoUrl}
                                  htmlType="submit"
                                >
                                  Add Another Item
                                </Button>
                              </span>
                            </div>
                          </FormItem>
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
                            <Button type="danger" onClick={this.handleReset}>
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
                <div className="card-body">Audit</div>
              </section>
            </TabPane>
          </Tabs>
        </div>
      </React.Fragment>
    )
  }
}
export default AddVideo
