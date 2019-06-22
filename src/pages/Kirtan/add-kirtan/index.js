/* eslint-disable react/destructuring-assignment */
/* eslint-disable eqeqeq */
/* eslint-disable func-names */
/* eslint-disable one-var */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import {
  Switch,
  Form,
  Button,
  Input,
  Icon,
  Select,
  DatePicker,
  Checkbox,
  Tabs,
  Upload,
  notification,
  Progress,
} from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Editor } from 'react-draft-wysiwyg'
import axios from 'axios'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import $ from 'jquery'
import moment from 'moment'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import BackNavigation from '../../../common/BackNavigation/index'
import { uuidv4 } from '../../../services/custom'
import styles from './style.module.scss'
import serverAddress from '../../../services/config'
import { formInputElements } from '../../../utils/addKirtanInput'
import { checkValidation } from '../../../utils/checkValidation'
import './index.css'

const FormItem = Form.Item
const { TabPane } = Tabs
const { Option } = Select
const { Dragger } = Upload

@Form.create()
@connect(({ kirtan, lecture, router }) => ({ kirtan, lecture, router }))
class AddKirtan extends React.Component {
  state = {
    language: true,
    audioLink: '',
    createDate: new Date(),
    publishDate: new Date(),
    translationRequired: false,
    editingKirtan: '',
    editorState: EditorState.createEmpty(),
    titleEn: '',
    titleRu: '',
    eventEn: '',
    eventRu: '',
    locationEn: '',
    locationRu: '',
    switchDisabled: true,
    formElements: formInputElements,
    bodyContentEn: '',
    bodyContentRu: '',
    percentage: 0,
    paginationCurrentPage: '',
    uploading: true,
    fileList: [],
    audioDuration: '',
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const { state } = location
    if (state !== undefined) {
      const { language, currentPage } = state
      setTimeout(
        this.setState({
          language,
          paginationCurrentPage: currentPage,
        }),
        0,
      )
      const { id } = state

      const uuid = id
      if (uuid !== undefined) {
        const body = {
          uuid,
        }
        dispatch({
          type: 'kirtan/GET_KIRTAN_BY_ID',
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

    dispatch({
      type: 'video/RESET_STORE',
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.kirtan.isKirtanCreated) {
      this.handleReset()
    }

    const { uploading } = this.state

    if (nextProps.kirtan.editKirtan !== '' && uploading) {
      const { kirtan } = nextProps
      const { editKirtan } = kirtan
      const { language } = this.state
      this.handleUpdateBody(language, editKirtan)

      const titleEn = editKirtan ? editKirtan.en.title : ''
      const titleRu = editKirtan ? editKirtan.ru.title : ''

      const locationEn = editKirtan ? editKirtan.en.location : ''
      const locationRu = editKirtan ? editKirtan.ru.location : ''

      const eventEn = editKirtan ? editKirtan.en.event : ''
      const eventRu = editKirtan ? editKirtan.ru.event : ''

      let bodyContentEn = ''
      let bodyContentRu = ''

      const htmlBodyEn = editKirtan ? editKirtan.en.body : ''

      const htmlBodyRu = editKirtan ? editKirtan.ru.body : ''

      if (htmlBodyEn && htmlBodyEn.length > 0) {
        const contentBlockEn = htmlToDraft(htmlBodyEn)
        if (contentBlockEn) {
          const contentStateEn = ContentState.createFromBlockArray(contentBlockEn.contentBlocks)
          bodyContentEn = EditorState.createWithContent(contentStateEn)
        }
      }

      if (htmlBodyRu && htmlBodyRu.length > 0) {
        const contentBlockRu = htmlToDraft(htmlBodyRu)
        if (contentBlockRu) {
          const contentStateRu = ContentState.createFromBlockArray(contentBlockRu.contentBlocks)
          bodyContentRu = EditorState.createWithContent(contentStateRu)
        }
      }

      this.setState(
        {
          editingKirtan: editKirtan,
          audioLink: editKirtan.audio_link,
          createDate: editKirtan ? editKirtan.created_date_time : '',
          publishDate: editKirtan && editKirtan.published_date ? editKirtan.published_date : '',
          translationRequired: editKirtan ? editKirtan.translation_required : false,
          titleEn,
          titleRu,
          locationEn,
          locationRu,
          eventEn,
          eventRu,
          bodyContentEn,
          bodyContentRu,
          audioDuration: editKirtan.duration,
        },
        () => {
          if (!this.onFieldValueChange()) {
            this.setState({ switchDisabled: false })
          }
        },
      )
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
  }

  componentWillUnmount() {
    this.handleReset()
    this.setState({
      language: true,
      audioLink: '',
      createDate: new Date(),
      publishDate: new Date(),
      translationRequired: false,
      editingKirtan: '',
      editorState: EditorState.createEmpty(),
      titleEn: '',
      titleRu: '',
      eventEn: '',
      eventRu: '',
      locationEn: '',
      locationRu: '',
      switchDisabled: true,
      formElements: formInputElements,
      bodyContentEn: EditorState.createEmpty(),
      bodyContentRu: EditorState.createEmpty(),
      percentage: 0,
      uploading: false,
    })
  }

  handleUpdateBody = (language, editKirtan) => {
    const html = editKirtan ? (language ? editKirtan.en.body : editKirtan.ru.body) : ''
    let editorState = ''
    if (html && html.length > 0) {
      const contentBlock = htmlToDraft(html)
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
        editorState = EditorState.createWithContent(contentState)
      }
      this.setState({
        editorState,
        uploading: false,
      })
    }
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
        uploading: false,
      })
    }, 0)
  }

  handleCreateDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        createDate: dateString,
        uploading: false,
      })
    }, 0)
  }

  handlePublishDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        publishDate: dateString,
        uploading: false,
      })
    }, 0)
  }

  onEditorStateChange: Function = editorState => {
    const { language } = this.state

    if (language) {
      this.setState({
        bodyContentEn: editorState,
        uploading: false,
      })
    }

    if (!language) {
      this.setState({
        bodyContentRu: editorState,
        uploading: false,
      })
    }
  }

  getAudioFileDuration = file => {
    return new Promise(resolve => {
      const objectURL = URL.createObjectURL(file)
      const mySound = new Audio([objectURL])
      mySound.addEventListener(
        'canplaythrough',
        () => {
          URL.revokeObjectURL(objectURL)
          resolve({
            file,
            duration: mySound.duration,
          })
        },
        false,
      )
    })
  }

  handleUploading = info => {
    this.getAudioFileDuration(info.file.originFileObj)
      .then(response => {
        let second = parseInt('00', 10)
        let minute = parseInt('00', 10)
        let hour = parseInt('00', 10)
        let totalDuration = `${hour}:${minute}:${second}`
        const totalSecond = parseInt(response.duration, 10)
        if (totalSecond < 60) {
          second = totalSecond
          totalDuration = `0${hour}:0${minute}:${second}`
        }
        if (totalSecond >= 60) {
          minute = totalSecond / 60
          minute = parseInt(minute, 10)
          minute = minute.toString().length > 1 ? minute : `0${minute}`
          second = totalSecond % 60
          second = parseInt(second, 10)
          second = second.toString().length > 1 ? second : `0${second}`
          totalDuration = `${hour}:${minute}:${second}`
        }

        if (totalSecond >= 3600) {
          minute = totalSecond / 60
          const tempMinute = parseInt(minute, 10)

          minute = tempMinute % 60
          minute = parseInt(minute, 10)
          minute = minute.toString().length > 1 ? minute : `0${minute}`
          hour = parseInt(tempMinute / 60, 10)
          hour = parseInt(hour, 10)
          hour = hour.toString().length > 1 ? hour : `0${hour}`
          second = totalSecond % 60
          second = parseInt(second, 10)
          second = second.toString().length > 1 ? second : `0${second}`
          totalDuration = `${hour}:${minute}:${second}`
        }

        this.setState({
          audioDuration: totalDuration,
        })
      })
      .catch(err => {
        console.log(err)
      })

    if (info.file.status === 'uploading') {
      this.setState(
        {
          fileList: info.fileList,
          percentage: 0,
          uploading: false,
        },
        () => {
          this.uploads3(info)
        },
      )
    }
  }

  uploads3 = info => {
    const fileName = info.file.name
    const fileType = info.file.type

    axios({
      method: 'GET',
      url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
    })
      .then(response => {
        const { data } = response
        const temp = data.presignedUrl.toString()
        const finalUrl = temp.substr(0, temp.lastIndexOf('?'))
        this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, info, finalUrl)
      })
      .catch(error => {
        notification.error({
          message: 'error',
          description: `Some error occured. Please check your internet connection`,
        })
      })
  }

  uploadFileToS3UsingPresignedUrl = (presignedUrl, info, finalUrl) => {
    const { fileList } = this.state

    axios({
      method: 'PUT',
      url: presignedUrl,
      data: info.file.originFileObj,
      headers: {
        'Content-Type': info.file.type,
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100)

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < fileList.length; i++) {
          if (fileList[i].name === finalUrl.split('/').pop(-1))
            fileList[i].percent = percentCompleted
        }

        this.setUploadedFiles(finalUrl, percentCompleted, fileList)
      },
    })
      .then(response => {
        // console.log(response)
      })
      .catch(err => {
        notification.warning({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      })
  }

  setUploadedFiles = (finalUrl, percentCompleted, fileList) => {
    this.setState(
      {
        audioLink: finalUrl,
        percentage: percentCompleted,
      },
      () => {
        if (this.state.percentage === 100) {
          notification.success({
            message: 'Success',
            description: 'File has been uploaded successfully',
          })
        }
      },
    )
  }

  deleteFile = item => {
    document.getElementById(item).style.pointerEvents = 'none'
    document.getElementById(item).style.opacity = '0.4'

    const fileName = item.substr(item.lastIndexOf('.com/') + 5)

    const tempFileName = fileName.split('/').pop(-1)

    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        // console.info(data)
        notification.success({
          message: 'File Deleted',
          description: `${tempFileName} has been successfully deleted`,
        })
        this.handelDeleteSetFiles()
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  beforeUploadAudio = file => {
    this.setState({ percentage: 0, uploading: false })
    const isJPG = file.type === 'audio/mp3'
    if (!isJPG) {
      notification.error({
        message: 'error',
        description: 'You can only upload MP3 file!',
      })
    }
    return isJPG
  }

  handelDeleteSetFiles = () => {
    this.setState({ audioLink: '' })
  }

  dummyRequest = ({ file, onSuccess }) => {
    // console.info(file)
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  handleSubmitForm = () => {
    const { form, dispatch, router } = this.props
    const { location } = router
    const { state } = location

    let uuid = ''
    if (state !== undefined) {
      const { id } = state
      uuid = id
    }
    const {
      audioLink,
      createDate,
      publishDate,
      translationRequired,
      editingKirtan,
      titleEn,
      titleRu,
      eventEn,
      eventRu,
      locationEn,
      locationRu,
      bodyContentEn,
      bodyContentRu,
      audioDuration,
    } = this.state

    const type = form.getFieldValue('type')
    const artist = form.getFieldValue('artist')
    const kirtanLanguage = form.getFieldValue('language')

    let editorbodyContentEn = null
    let editorbodyContentRu = null

    if (bodyContentEn)
      editorbodyContentEn = draftToHtml(convertToRaw(bodyContentEn.getCurrentContent()))

    if (bodyContentRu)
      editorbodyContentRu = draftToHtml(convertToRaw(bodyContentRu.getCurrentContent()))

    if (titleEn === '' || locationEn === '' || eventEn === '') {
      notification.error({
        message: 'Error',
        description: 'Please fill all the fields',
      })

      return
    }

    if (audioLink === '') {
      notification.error({
        message: 'Error',
        description: 'You must upload an audio.',
      })

      return
    }

    const body = {
      uuid: uuid || uuidv4(),
      created_date_time: createDate,
      published_date: publishDate,
      language: kirtanLanguage,
      audio_link: audioLink,
      translation_required: translationRequired,
      duration: audioDuration,
      artist,
      type,
      en: {
        title: titleEn,
        event: eventEn,
        topic: '',
        location: locationEn,
        body: editorbodyContentEn,
      },
      ru: {
        title: titleRu,
        event: eventRu,
        topic: '',
        location: locationRu,
        body: editorbodyContentRu,
      },
    }

    if (editingKirtan !== '' && uuid) {
      body.audit = editingKirtan.audit
      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'kirtan/UPDATE_KIRTAN',
        payload,
      })
      this.scrollToTopPage()
    } else {
      dispatch({
        type: 'kirtan/CREATE_KIRTAN',
        payload: body,
      })
      this.scrollToTopPage()
      this.handleStateReset()
    }
  }

  handleStateReset = () => {
    this.setState({
      language: true,
      audioLink: '',
      createDate: new Date(),
      publishDate: new Date(),
      translationRequired: false,
      editingKirtan: '',
      editorState: EditorState.createEmpty(),
      titleEn: '',
      titleRu: '',
      eventEn: '',
      eventRu: '',
      locationEn: '',
      locationRu: '',
      switchDisabled: true,
      formElements: formInputElements,
      bodyContentEn: EditorState.createEmpty(),
      bodyContentRu: EditorState.createEmpty(),
      percentage: 0,
      paginationCurrentPage: '',
      uploading: true,
    })
  }

  scrollToTopPage = () => {
    const scrollDuration = 500
    const scrollStep = -window.scrollY / (scrollDuration / 15),
      scrollInterval = setInterval(function() {
        if (window.scrollY != 0) {
          window.scrollBy(0, scrollStep)
        } else clearInterval(scrollInterval)
      }, 10)
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      language: true,
      audioLink: '',
      createDate: new Date(),
      publishDate: new Date(),
      translationRequired: false,
      editingKirtan: '',
      editorState: EditorState.createEmpty(),
      titleEn: '',
      titleRu: '',
      eventEn: '',
      eventRu: '',
      locationEn: '',
      locationRu: '',
      switchDisabled: true,
      formElements: formInputElements,
      bodyContentEn: EditorState.createEmpty(),
      bodyContentRu: EditorState.createEmpty(),
      percentage: 0,
      uploading: true,
    })
  }

  handleLanguage = () => {
    const { language, editingKirtan } = this.state
    if (editingKirtan !== '') {
      this.handleUpdateBody(!language, editingKirtan)
    }
    this.setState({
      language: !language,
      uploading: false,
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
    const { form, lecture, kirtan } = this.props
    const { events, locations } = lecture
    const {
      language,
      audioLink,
      translationRequired,
      editorState,
      editingKirtan,
      switchDisabled,
      titleEn,
      titleRu,
      eventEn,
      eventRu,
      locationEn,
      locationRu,
      formElements,
      bodyContentEn,
      bodyContentRu,
      percentage,
      paginationCurrentPage,
      audioDuration,
    } = this.state
    const dateFormat = 'YYYY/MM/DD'

    const linkState = {
      paginationCurrentPage,
    }

    return (
      <React.Fragment>
        <div>
          <BackNavigation link="/kirtan/list" title="Kirtan List" linkState={linkState} />
          {editingKirtan && editingKirtan.en && editingKirtan.ru ? (
            <div style={{ paddingTop: '10px' }}>
              <div>
                <strong>Title :</strong>
                &nbsp;&nbsp;
                <span>{language ? editingKirtan.en.title : editingKirtan.ru.title}</span>
              </div>
            </div>
          ) : null}
          <Helmet title="Add Kirtan" />
          <Tabs defaultActiveKey="1">
            <TabPane tab="Kirtan" key="1">
              <section className="card">
                <div className="card-header mb-2">
                  <div className="utils__title">
                    <strong>Kirtan Add/Edit</strong>
                    <Switch
                      disabled={switchDisabled}
                      defaultChecked
                      checkedChildren={language ? 'en' : 'ru'}
                      unCheckedChildren={language ? 'en' : 'ru'}
                      onChange={this.handleLanguage}
                      className="toggle"
                      style={{ width: '100px', float: 'right', margin: '0px 10px 10px 0px' }}
                    />
                  </div>
                </div>
                <div className="card-body">
                  <div className={styles.addPost}>
                    <Form className="mt-3">
                      <div className="form-group">
                        <FormItem label={language ? 'Title' : 'Title'}>
                          <Input
                            onChange={this.handleTitleChange}
                            value={language ? titleEn : titleRu}
                            placeholder="Kirtan title"
                            name="title"
                          />
                          {!formElements.title.valid &&
                          formElements.title.validation &&
                          formElements.title.touched ? (
                            <div className="invalidFeedback">{formElements.title.errorMessage}</div>
                          ) : null}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Language">
                          {form.getFieldDecorator('language', {
                            initialValue: editingKirtan ? editingKirtan.language : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select language"
                              onChange={this.handleKirtanLanguage}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
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
                            initialValue: editingKirtan ? editingKirtan.type : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Type"
                              optionFilterProp="children"
                              onChange={this.handleSelectType}
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              <Option value="Kirtan">Kirtan</Option>
                              <Option value="Bhajan">Bhajan</Option>
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Artist">
                          {form.getFieldDecorator('artist', {
                            initialValue: editingKirtan ? editingKirtan.artist : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Artist"
                              onChange={this.handleSelectArtist}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              <Option value="Aditi Dukhaha Prabhu">Aditi Dukhaha Prabhu</Option>
                              <Option value="Amala Harinama Dasa"> Amala Harinama Dasa</Option>
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Date">
                          {form.getFieldDecorator('create_date', {
                            rules: [
                              {
                                required: true,
                                message: 'Create Date is required',
                              },
                            ],
                            initialValue:
                              editingKirtan && editingKirtan.created_date_time
                                ? moment(editingKirtan.created_date_time, dateFormat)
                                : moment(new Date(), dateFormat),
                          })(<DatePicker onChange={this.handleCreateDate} />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Publish Date">
                          {form.getFieldDecorator('publish_date', {
                            rules: [
                              {
                                required: true,
                                message: 'Publish Date is required',
                              },
                            ],
                            initialValue:
                              editingKirtan && editingKirtan.published_date
                                ? moment(editingKirtan.published_date, dateFormat)
                                : moment(new Date(), dateFormat),
                          })(<DatePicker onChange={this.handlePublishDate} disabled />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem>
                          {form.getFieldDecorator('translation', {
                            rules: [
                              {
                                required: true,
                                message: 'Need Translation is required',
                              },
                            ],
                            initialValue: editingKirtan ? editingKirtan.translation_required : '',
                          })(
                            <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                              &nbsp; Need Translation ?
                            </Checkbox>,
                          )}
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
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Body' : 'Body'}>
                          <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                            <Editor
                              wrapperClassName="demo-wrapper"
                              editorClassName="demo-editor"
                              editorState={language ? bodyContentEn : bodyContentRu}
                              onEditorStateChange={this.onEditorStateChange}
                            />
                          </div>
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Audio Duration' : 'Audio Duration'}>
                          <Input
                            disabled
                            value={this.state.audioDuration}
                            placeholder="Audio Duration"
                            name="audioDuration"
                          />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Attachment">
                          {audioLink ? (
                            <ul>
                              <li className="filesList">
                                <div className="fileDisplay">
                                  <div className="uploadedFileName">
                                    {audioLink
                                      .split('/')
                                      .pop(-1)
                                      .substring(0, 30)}
                                  </div>
                                  <div className="deleteIcon" key={audioLink} id={audioLink}>
                                    <i
                                      className="fa fa-trash closeIcon"
                                      onClick={() => {
                                        this.deleteFile(audioLink)
                                      }}
                                    />
                                  </div>
                                  <div className="progressBar">
                                    {percentage !== 0 ? <Progress percent={percentage} /> : null}
                                  </div>
                                </div>
                              </li>
                            </ul>
                          ) : (
                            ''
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem>
                          {form.getFieldDecorator('Files')(
                            <Dragger
                              beforeUpload={this.beforeUploadAudio}
                              multiple={false}
                              showUploadList={false}
                              fileList={this.state.fileList}
                              customRequest={this.dummyRequest}
                              onChange={this.handleUploading}
                            >
                              <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                              </p>
                              <p className="ant-upload-text">
                                Click or drag file to this area to upload
                              </p>
                              <p className="ant-upload-hint">
                                Support for a single or bulk upload. Strictly prohibit from
                                uploading company data or other band files
                              </p>
                            </Dragger>,
                          )}
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
                          <Button type="danger" onClick={this.handleStateReset}>
                            Discard
                          </Button>
                        </div>
                      </FormItem>
                    </Form>
                  </div>
                </div>
              </section>
            </TabPane>
            <TabPane tab="Audit" key="2">
              <section className="card">
                <div className="card-body">
                  <AuditTimeline
                    // audit={editingKirtan.audit ? editingKirtan.audit : kirtan.kirtanAudit}
                    audit={editingKirtan.audit && editingKirtan.audit}
                  />
                </div>
              </section>
            </TabPane>
          </Tabs>
        </div>
      </React.Fragment>
    )
  }
}

export default AddKirtan
