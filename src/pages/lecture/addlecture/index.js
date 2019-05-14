/* eslint-disable eqeqeq */
/* eslint-disable func-names */
/* eslint-disable one-var */
/* eslint-disable react/no-unused-state */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
import React from 'react'
import { Editor } from 'react-draft-wysiwyg'

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './index.css'
import {
  Form,
  Input,
  Checkbox,
  Button,
  Select,
  Upload,
  Switch,
  Icon,
  notification,
  Tabs,
  DatePicker,
} from 'antd'
import { connect } from 'react-redux'
import $ from 'jquery'
import { EditorState, convertToRaw, ContentState, convertFromHTML, convertFromRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import { formInputElements } from '../../../utils/addLectureInput'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import BackNavigation from '../../../common/BackNavigation/index'
import { uuidv4 } from '../../../services/custom'
import styles from './style.module.scss'
import serverAddress from '../../../services/config'
import { checkValidation } from '../../../utils/checkValidation'

const { TabPane } = Tabs
const { Option } = Select
const FormItem = Form.Item
const { Dragger } = Upload

@Form.create()
@connect(({ lecture, router }) => ({ lecture, router }))
class AddLecture extends React.Component {
  constructor(props) {
    super(props)

    // console.log('props from constructor ====>', props)

    // const transcriptionText =
    //   props.lecture.editLecture.en.transcription.text &&
    //   props.lecture.editLecture.en.transcription.text

    this.state = {
      date: new Date(),
      // publishDate: new Date(),
      audioLink: '',
      transcriptionFiles: [],
      summaryFiles: [],
      editorState: EditorState.createEmpty(),
      editorStateSummaryEn: EditorState.createEmpty(),
      editorStateSummaryRu: EditorState.createEmpty(),
      editorStateTranscriptionEn: EditorState.createEmpty(),
      editorStateTranscriptionRu: EditorState.createEmpty(),
      editinglecture: '',
      editedBody: '',
      translation: '',
      language: true,
      uploading: true,
      audioUploading: false,
      transcriptionUploading: false,
      summaryUploading: false,
      translationRequired: false,
      titleEn: '',
      titleRu: '',
      locationEn: '',
      locationRu: '',
      eventEn: '',
      eventRu: '',
      topicEn: '',
      topicRu: '',
      translationEn: '',
      translationRu: '',
      switchDisabled: true,
      formElements: formInputElements,
      transcribe: false,
    }
  }

  componentDidMount() {
    // console.log(this.props)
    const { router, dispatch } = this.props
    const { location } = router
    const { state } = location

    if (state !== undefined) {
      const { id, language } = state
      const uuid = id
      setTimeout(
        this.setState({
          language,
        }),
        0,
      )
      if (uuid !== undefined) {
        const body = {
          uuid,
        }

        dispatch({
          type: 'lecture/GET_LECTURE_BY_ID',
          payload: body,
        })
      }
    }
    dispatch({
      type: 'lecture/GET_TOPICS',
    })
    dispatch({
      type: 'lecture/GET_EVENTS',
    })
    dispatch({
      type: 'lecture/GET_LOCATIONS',
    })
    dispatch({
      type: 'lecture/GET_TRANSLATIONS',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { uploading } = this.state
    if (nextProps.lecture.editLecture !== '' && uploading) {
      const { lecture } = nextProps
      const { language } = this.state

      let editorStateTranscriptionEn = ''
      let editorStateTranscriptionRu = ''
      let editorStateSummaryEn = ''
      let editorStateSummaryRu = ''

      const htmlTranscriptionEn = lecture.editLecture
        ? lecture.editLecture.en.transcription.text
        : ''
      const htmlSummaryEn = lecture.editLecture
        ? lecture.editLecture.en.summary.text
        : EditorState.createEmpty()

      const titleEn = lecture.editLecture ? lecture.editLecture.en.title : ''
      const titleRu = lecture.editLecture ? lecture.editLecture.ru.title : ''

      const locationEn = lecture.editLecture ? lecture.editLecture.en.location : ''
      const locationRu = lecture.editLecture ? lecture.editLecture.ru.location : ''

      const eventEn = lecture.editLecture ? lecture.editLecture.en.event : ''
      const eventRu = lecture.editLecture ? lecture.editLecture.ru.event : ''

      const topicEn = lecture.editLecture ? lecture.editLecture.en.topic : ''
      const topicRu = lecture.editLecture ? lecture.editLecture.ru.topic : ''

      const translationEn = lecture.editLecture ? lecture.editLecture.en.translation : ''
      const translationRu = lecture.editLecture ? lecture.editLecture.ru.translation : ''

      if (htmlTranscriptionEn && htmlTranscriptionEn.length > 0) {
        const contentBlockEn = htmlToDraft(htmlTranscriptionEn)
        if (contentBlockEn) {
          const contentStateEn = ContentState.createFromBlockArray(contentBlockEn.contentBlocks)
          editorStateTranscriptionEn = EditorState.createWithContent(contentStateEn)
        }
      }

      if (htmlSummaryEn && htmlSummaryEn.length > 0) {
        const cbEn = htmlToDraft(htmlSummaryEn)
        if (cbEn) {
          const csEn = ContentState.createFromBlockArray(cbEn.contentBlocks)
          editorStateSummaryEn = EditorState.createWithContent(csEn)
        }
      }

      const htmlTranscriptionRu = lecture.editLecture
        ? lecture.editLecture.ru.transcription.text
        : ''
      const htmlSummaryRu = lecture.editLecture
        ? lecture.editLecture.ru.summary.text
        : EditorState.createEmpty()

      if (htmlTranscriptionRu && htmlTranscriptionRu.length > 0) {
        const contentBlockRu = htmlToDraft(htmlTranscriptionRu)
        if (contentBlockRu) {
          const contentStateRu = ContentState.createFromBlockArray(contentBlockRu.contentBlocks)
          editorStateTranscriptionRu = EditorState.createWithContent(contentStateRu)
        }
      }

      if (htmlSummaryRu && htmlSummaryRu.length > 0) {
        const cbRu = htmlToDraft(htmlSummaryRu)
        if (cbRu) {
          const csRu = ContentState.createFromBlockArray(cbRu.contentBlocks)
          editorStateSummaryRu = EditorState.createWithContent(csRu)
        }
      }

      this.setState(
        {
          editinglecture: lecture.editLecture,
          audioLink: lecture.editLecture.audio_link,
          summaryFiles: lecture.editLecture.ru.summary.attachment_link,
          transcriptionFiles: lecture.editLecture.en.transcription.attachment_link,
          translationRequired: lecture.editLecture.translation_required,
          translation: lecture.editLecture.translation ? lecture.editLecture.translation : '',
          editorStateTranscriptionEn,
          editorStateTranscriptionRu,
          editorStateSummaryEn,
          editorStateSummaryRu,
          titleEn,
          titleRu,
          locationEn,
          locationRu,
          topicEn,
          topicRu,
          eventEn,
          eventRu,
          translationEn,
          translationRu,
          transcribe: lecture.editLecture.transcribe_required,
        },
        () => {
          if (!this.onFieldValueChange()) {
            this.setState({ switchDisabled: false })
          }
        },
      )
    }
    if (nextProps.lecture.isLectureCreated) {
      this.handleReset()
    }
  }

  componentWillUnmount() {
    this.handleReset()
    this.setState({
      date: new Date(),
      // publishDate: new Date(),
      audioLink: '',
      transcriptionFiles: [],
      summaryFiles: [],
      editorState: EditorState.createEmpty(),
      editorStateSummaryEn: EditorState.createEmpty(),
      editorStateSummaryRu: EditorState.createEmpty(),
      editorStateTranscriptionEn: EditorState.createEmpty(),
      editorStateTranscriptionRu: EditorState.createEmpty(),
      editinglecture: '',
      editedBody: '',
      translation: '',
      language: true,
      uploading: true,
      audioUploading: false,
      transcriptionUploading: false,
      summaryUploading: false,
      translationRequired: false,
    })
  }

  handleFormBody = e => {
    e.preventDefault()
    const { form, dispatch, router, english } = this.props
    const {
      audioLink,
      editorState,
      editorStateTranscriptionEn,
      editorStateTranscriptionRu,
      editorStateSummaryEn,
      editorStateSummaryRu,
      editinglecture,
      transcriptionFiles,
      summaryFiles,
      translationRequired,
      translation,
      language,
      titleEn,
      titleRu,
      locationEn,
      locationRu,
      eventEn,
      eventRu,
      topicEn,
      topicRu,
      translationEn,
      translationRu,
      transcribe,
    } = this.state
    const { location } = router
    const { state } = location

    let uuid = ''
    if (state !== undefined) {
      const { id } = state
      uuid = id
    }
    // const title = form.getFieldValue('title')
    const date = form.getFieldValue('date')
    const publishDate = form.getFieldValue('publish_date')
    const tag = form.getFieldValue('tag')
    // const language = form.getFieldValue('language')
    const bodylecture = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    const author = form.getFieldValue('author')
    // const locationlecture = form.getFieldValue('location')
    // const event = form.getFieldValue('event')
    // const topic = form.getFieldValue('topic')
    const part = form.getFieldValue('part')
    const chapter = form.getFieldValue('chapter')
    const verse = form.getFieldValue('verse')

    let editorTranscriptionEn = null
    let editorTranscriptionRu = null
    let editorSummaryEn = null
    let editorSummaryRu = null

    editorTranscriptionEn = draftToHtml(
      convertToRaw(editorStateTranscriptionEn.getCurrentContent()),
    )
    editorTranscriptionRu = draftToHtml(
      convertToRaw(editorStateTranscriptionRu.getCurrentContent()),
    )

    editorSummaryEn = draftToHtml(convertToRaw(editorStateSummaryEn.getCurrentContent()))
    editorSummaryRu = draftToHtml(convertToRaw(editorStateSummaryRu.getCurrentContent()))

    let body = {}

    if (
      titleEn === '' ||
      locationEn === '' ||
      eventEn === '' ||
      topicEn === '' ||
      translationEn === ''
    ) {
      notification.error({
        message: 'Error',
        description: 'Please fill all the fields',
      })

      return
    }

    body = {
      uuid: uuid || uuidv4(),
      part,
      verse,
      chapter,
      author,
      tags: tag,
      created_date: date,
      published_date: publishDate,
      audio_link: audioLink,
      translation_required: translationRequired,
      transcribe_required: transcribe,
      counters: {
        ru_summary_view: 0,
        ru_transcription_view: 0,
        en_summary_view: 0,
        en_transcription_view: 0,
        video_page_view: 0,
        downloads: 0,
        audio_play_count: 0,
        audio_page_view: 0,
      },
      en: {
        location: locationEn,
        topic: topicEn,
        event: eventEn,
        title: titleEn,
        translation: translationEn,
        summary: {
          attachment_link: '',
          attachment_name: '',
          text: editorSummaryEn,
        },
        transcription: {
          attachment_name: '',
          attachment_link: transcriptionFiles,
          text: editorTranscriptionEn,
        },
      },
      ru: {
        location: locationRu,
        topic: topicRu,
        event: eventRu,
        title: titleRu,
        translation: translationRu,
        summary: {
          attachment_link: summaryFiles,
          attachment_name: '',
          text: editorSummaryRu,
        },
        transcription: {
          attachment_name: '',
          attachment_link: '',
          text: editorTranscriptionRu,
        },
      },
    }

    if (editinglecture !== '') {
      body.audit = editinglecture.audit

      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'lecture/UPDATE_LECTURE',
        payload,
      })
      this.scrollToTopPage()
    } else {
      dispatch({
        type: 'lecture/CREATE_LECTURE',
        body,
      })
      this.scrollToTopPage()
    }
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

  onEditorStateChange: Function = editorState => {
    this.setState({
      editorState,
    })
  }

  // onEditorChangeStateSummary: Function = editorStateSummary => {
  //   this.setState({
  //     editorStateSummary,
  //   })
  // }

  onEditorChangeStateSummary = summary => {
    const { language } = this.state

    if (language) {
      this.setState({
        editorStateSummaryEn: summary,
      })
    }

    if (!language) {
      this.setState({
        editorStateSummaryRu: summary,
      })
    }
  }

  // onEditorChangeStateTranscription: Function = editorStateTranscription => {
  //   this.setState({
  //     editorStateTranscription,
  //   })
  // }

  onEditorChangeStateTranscription = transcription => {
    const { language } = this.state

    if (language) {
      this.setState({
        editorStateTranscriptionEn: transcription,
      })
    }

    if (!language) {
      this.setState({
        editorStateTranscriptionRu: transcription,
      })
    }
  }

  // getBase64 = (img, callback) => {
  //   const reader = new FileReader()
  //   reader.addEventListener('load', () => callback(reader.result))
  //   reader.readAsDataURL(img)
  // }

  handleFileChange = info => {
    this.setState(
      {
        audioUploading: true,
        uploading: false,
      },
      () => {
        this.handleUploading(info)
      },
    )
  }

  handleSummaryFileChange = info => {
    this.setState(
      {
        summaryUploading: true,
        uploading: false,
      },
      () => {
        this.handleUploading(info)
      },
    )
  }

  handleTranscriptionFileChange = info => {
    this.setState(
      {
        transcriptionUploading: true,
        uploading: false,
      },
      () => {
        this.handleUploading(info)
      },
    )
  }

  handleUploading = info => {
    if (info.file.status === 'uploading') {
      notification.success({
        message: 'Uploading Started',
        description: 'File uploading is started',
      })
    }
    if (info.file.status === 'done') {
      this.uploads3(info.file)
    }
  }

  uploads3 = file => {
    const fileName = file.name
    const fileType = file.type
    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
      success: data => {
        const temp = data.presignedUrl.toString()
        const finalUrl = temp.substr(0, temp.lastIndexOf('?'))
        this.setUploadedFiles(finalUrl)
        this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, file)
      },
      error() {
        notification.error({
          message: 'Error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  uploadFileToS3UsingPresignedUrl = (presignedUrl, file) => {
    $.ajax({
      type: 'PUT',
      url: presignedUrl,
      data: file.originFileObj,
      headers: {
        'Content-Type': file.type,
        reportProgress: true,
      },
      processData: false,
      success: data => {
        notification.success({
          message: 'Success',
          description: 'file has been uploaded successfully',
        })
      },
      error() {
        notification.warning({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  setUploadedFiles = finalUrl => {
    const {
      transcriptionFiles,
      summaryFiles,
      audioUploading,
      transcriptionUploading,
      summaryUploading,
    } = this.state
    if (audioUploading) {
      this.setState({
        audioLink: finalUrl,
        transcriptionUploading: false,
        summaryUploading: false,
        audioUploading: false,
      })
    } else if (transcriptionUploading) {
      const array = [...transcriptionFiles]
      array.push(finalUrl)
      this.setState({
        transcriptionFiles: array,
        transcriptionUploading: false,
        summaryUploading: false,
        audioUploading: false,
      })
    } else if (summaryUploading) {
      const newArray = [...summaryFiles]
      newArray.push(finalUrl)
      this.setState({
        summaryFiles: newArray,
        transcriptionUploading: false,
        summaryUploading: false,
        audioUploading: false,
      })
    }
  }

  dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  deleteFile = (item, type) => {
    const fileName = item.substr(item.lastIndexOf('.com/') + 5)
    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        notification.success({
          message: 'File Deleted',
          description: 'File has been successfully deleted',
        })
        this.handelDeleteSetFiles(item, type)
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  handelDeleteSetFiles = (item, type) => {
    const { transcriptionFiles, summaryFiles } = this.state
    if (type === 'audio') {
      this.setState({ audioLink: '' })
    }
    if (type === 'transcription') {
      for (let i = 0; i < transcriptionFiles.length; i += 1) {
        if (transcriptionFiles[i] === item) {
          transcriptionFiles.splice(i, 1)
          break
        }
      }
      this.setState({
        transcriptionFiles,
      })
    }
    if (type === 'summary') {
      for (let i = 0; i < summaryFiles.length; i += 1) {
        if (summaryFiles[i] === item) {
          summaryFiles.splice(i, 1)
          break
        }
      }
      this.setState({
        summaryFiles,
      })
    }
  }

  beforeUploadAudio = file => {
    const isJPG = file.type === 'audio/mp3'
    if (!isJPG) {
      notification.error({
        message: 'error',
        description: 'You can only upload MP3 file!',
      })
    }
    return isJPG
  }

  beforeUpload = file => {
    const isJPG = file.type === 'application/pdf'
    if (!isJPG) {
      notification.error({
        message: 'error',
        description: 'You can only upload Pdf file!',
      })
    }
    return isJPG
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      editinglecture: '',
      audioLink: '',
      editorState: EditorState.createEmpty(),
      editorStateSummaryEn: EditorState.createEmpty(),
      editorStateSummaryRu: EditorState.createEmpty(),
      editorStateTranscriptionEn: EditorState.createEmpty(),
      editorStateTranscriptionRu: EditorState.createEmpty(),
      transcriptionUploading: false,
      summaryUploading: false,
      audioUploading: false,
      transcriptionFiles: [],
      summaryFiles: [],
      language: true,
      translation: '',
      translationRequired: false,
    })
  }

  onChange = (date, dateString) => {
    console.log(date, dateString)
    this.setState({
      date: dateString,
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  handleTranscribe = event => {
    setTimeout(() => {
      this.setState({
        transcribe: event.target.checked,
      })
    }, 0)
  }

  handleSelectTranslation = translation => {
    this.setState({ translation })
  }

  handleLanguage = () => {
    const { language } = this.state

    this.setState({ language: !language })
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

  handleTopicChange = topic => {
    this.setState(
      {
        topicEn: topic.title_en,
        topicRu: topic.title_ru,
      },
      () => this.onFieldValueChange(),
    )
  }

  handleTranslationChange = translation => {
    this.setState(
      {
        translationEn: translation.title_en,
        translationRu: translation.title_ru,
      },
      () => this.onFieldValueChange(),
    )
  }

  onFieldValueChange = () => {
    const {
      titleEn,
      locationEn,
      eventEn,
      topicEn,
      translationEn,
      switchDisabled,
      formElements,
    } = this.state

    if (titleEn !== '' && locationEn !== '' && eventEn !== '' && topicEn !== '') {
      this.setState({ switchDisabled: false })
      return false
    }

    this.setState({ switchDisabled: true })
    return true
  }

  render() {
    const { form, english, lecture } = this.props
    const { topics, events, locations, translations } = lecture

    const {
      editinglecture,
      editorState,
      language,
      audioLink,
      transcriptionFiles,
      summaryFiles,
      translationRequired,
      editorStateTranscriptionEn,
      editorStateTranscriptionRu,
      editorStateSummaryEn,
      editorStateSummaryRu,
      titleEn,
      titleRu,
      locationEn,
      locationRu,
      topicEn,
      topicRu,
      eventEn,
      eventRu,
      translationEn,
      translationRu,
      switchDisabled,
      formElements,
      transcribe,
    } = this.state
    const dateFormat = 'YYYY/MM/DD'

    return (
      <React.Fragment>
        <BackNavigation link="/lecture/list" title="Lecture List" />
        <Switch
          disabled={switchDisabled}
          defaultChecked
          checkedChildren={language ? 'en' : 'ru'}
          unCheckedChildren={language ? 'en' : 'ru'}
          onChange={this.handleLanguage}
          className="toggle"
          style={{ width: '100px', marginLeft: '10px' }}
        />
        {editinglecture && editinglecture.en && editinglecture.ru ? (
          <div style={{ paddingTop: '10px' }}>
            <div>
              <strong>Title :</strong>
              &nbsp;&nbsp;
              <span>{language ? editinglecture.en.title : editinglecture.ru.title}</span>
            </div>
          </div>
        ) : null}

        <Tabs defaultActiveKey="1">
          <TabPane tab="Lecture" key="1">
            <div>
              <Helmet title="Add Blog Post" />
              <section className="card">
                <div className="card-body">
                  <div className={styles.addPost}>
                    <Form className="mt-3">
                      <div className="form-group">
                        <FormItem label={language ? 'Title' : 'Title'}>
                          <Input
                            onChange={this.handleTitleChange}
                            value={language ? titleEn : titleRu}
                            placeholder="lecture title"
                            name="title"
                          />
                          {!formElements.title.valid &&
                          formElements.title.validation &&
                          formElements.title.touched ? (
                            <div className="invalidFeedback">{formElements.title.errorMessage}</div>
                          ) : null}
                        </FormItem>

                        {/* <FormItem label={language ? 'Title' : 'Title'}>
                          {form.getFieldDecorator('title', {
                            rules: [
                              {
                                required: true,
                                message: 'Title is required',
                              },
                            ],
                            initialValue: language ? titleEn : titleRu,
                          })(
                            <Input
                              placeholder="lecture title"
                              onChange={this.handleTitleChange}
                            />,
                          )}
                        </FormItem> */}

                        {/* <FormItem label={language ? 'Title' : 'Title'}>
                          {form.getFieldDecorator('title', {
                            initialValue:
                              editinglecture && editinglecture.en && editinglecture.ru
                                ? language
                                  ? editinglecture.en.title
                                  : editinglecture.ru.title
                                : '',
                          })(<Input placeholder="lecture title" />)}
                        </FormItem> */}
                      </div>
                      <div className="form-group">
                        <FormItem label="Author">
                          {form.getFieldDecorator('author', {
                            rules: [
                              {
                                required: true,
                                message: 'Author is required',
                              },
                            ],
                            initialValue: editinglecture ? editinglecture.author : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Author"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              <Option value="Niranjana Swami">Niranjana Swami</Option>
                              <Option value="other">Other</Option>
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Language">
                          {form.getFieldDecorator('language', {
                            rules: [
                              {
                                required: true,
                                message: 'Language is required',
                              },
                            ],
                            initialValue: editinglecture
                              ? editinglecture.language
                              : 'Select a Language',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select a Language"
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
                        <FormItem label="Date">
                          {form.getFieldDecorator('date', {
                            rules: [
                              {
                                required: true,
                                message: 'Date is required',
                              },
                            ],
                            initialValue: editinglecture
                              ? moment(editinglecture.created_date, dateFormat)
                              : moment(new Date(), dateFormat),
                          })(<DatePicker onChange={this.onChange} />)}
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
                              editinglecture && editinglecture.published_date
                                ? moment(editinglecture.published_date, dateFormat)
                                : moment(new Date(), dateFormat),
                          })(<DatePicker disabled />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem>
                          {form.getFieldDecorator('translationRequired', {
                            rules: [
                              {
                                required: true,
                                message: 'Need Translation is required',
                              },
                            ],
                            initialValue: editinglecture ? editinglecture.translation_required : '',
                          })(
                            <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                              &nbsp; Need Translation ?
                            </Checkbox>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Location' : 'Location'}>
                          {form.getFieldDecorator('location', {
                            rules: [
                              {
                                required: true,
                                message: 'Location is required',
                              },
                            ],
                            // initialValue:
                            //   editinglecture && editinglecture.en && editinglecture.ru
                            //     ? language
                            //       ? editinglecture.en.location
                            //       : editinglecture.ru.location
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
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Event' : 'Event'}>
                          {form.getFieldDecorator('event', {
                            rules: [
                              {
                                required: true,
                                message: 'Event is required',
                              },
                            ],
                            // initialValue:
                            //   editinglecture && editinglecture.en && editinglecture.ru
                            //     ? language
                            //       ? editinglecture.en.event
                            //       : editinglecture.ru.event
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
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Topic' : 'Topic'}>
                          {form.getFieldDecorator('topic', {
                            rules: [
                              {
                                required: true,
                                message: 'Topic is required',
                              },
                            ],
                            // initialValue:
                            //   editinglecture && editinglecture.en && editinglecture.ru
                            //     ? language
                            //       ? editinglecture.en.topic
                            //       : editinglecture.ru.topic
                            //     : '',
                            initialValue: language ? topicEn : topicRu,
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Topic"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              {topics && topics.length > 0
                                ? topics.map(item => {
                                    return (
                                      <Option
                                        onClick={() => {
                                          this.handleTopicChange(item)
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
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Part / Canto">
                          {form.getFieldDecorator('part', {
                            initialValue: editinglecture ? editinglecture.part : '',
                          })(<Input type="Number" placeholder="part/songs" />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Chapter">
                          {form.getFieldDecorator('chapter', {
                            initialValue: editinglecture ? editinglecture.chapter : '',
                          })(<Input type="Number" placeholder="Chapter" />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Verse">
                          {form.getFieldDecorator('verse', {
                            initialValue: editinglecture ? editinglecture.verse : '',
                          })(<Input type="Number" placeholder="Verse/Text" />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Translation">
                          {form.getFieldDecorator('translation', {
                            rules: [
                              {
                                required: true,
                                message: 'Translation is required',
                              },
                            ],
                            // initialValue:
                            //   editinglecture && editinglecture.en && editinglecture.ru
                            //     ? language
                            //       ? editinglecture.en.translation
                            //       : editinglecture.ru.translation
                            //     : '',
                            initialValue: language ? translationEn : translationRu,
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Artist"
                              // onChange={this.handleSelectTranslation}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              {translations && translations.length > 0
                                ? translations.map(item => {
                                    return (
                                      <Option
                                        onClick={() => {
                                          this.handleTranslationChange(item)
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
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem>
                          <Checkbox checked={transcribe} onChange={this.handleTranscribe}>
                            &nbsp; Need Transcribe ?
                          </Checkbox>

                          {/* {form.getFieldDecorator('transcribe', {
                            rules: [
                              {
                                required: true,
                                message: 'Need Transcribe is required',
                              },
                            ],
                            initialValue: editinglecture ? editinglecture.translation_required : '',
                          })(
                            <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                              &nbsp; Need Translation ?
                            </Checkbox>,
                          )} */}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Body' : 'Body'}>
                          {form.getFieldDecorator('content', {
                            initialValue: editorState || '',
                          })(
                            <div className={styles.editor}>
                              <Editor
                                editorState={editorState}
                                onEditorStateChange={this.onEditorStateChange}
                              />
                            </div>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Attachment">
                          {audioLink ? (
                            <ul>
                              <li className="filesList">
                                {audioLink}
                                &nbsp;&nbsp;
                                <i
                                  className="fa fa-close closeIcon"
                                  onClick={() => {
                                    this.deleteFile(audioLink, 'audio')
                                  }}
                                />
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
                              customRequest={this.dummyRequest}
                              onChange={this.handleFileChange}
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
                    </Form>
                  </div>
                </div>
              </section>
            </div>
          </TabPane>
          <TabPane tab="Summary" key="2">
            <section className="card">
              <div className="card-body">
                <Form className="mt-3">
                  <div className="form-group">
                    <FormItem label={language ? 'Summary' : 'Summary'}>
                      <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                        <Editor
                          editorState={language ? editorStateSummaryEn : editorStateSummaryRu}
                          onEditorStateChange={this.onEditorChangeStateSummary}
                        />
                      </div>
                      {/* {form.getFieldDecorator('summary', {
                        initialValue: editorStateSummary,
                      })(
                        <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                          <Editor
                            editorState={editorStateSummary}
                            onEditorStateChange={this.onEditorChangeStateSummary}
                          />
                        </div>,
                      )} */}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Attachment">
                      <ul>
                        {summaryFiles && summaryFiles.length > 0
                          ? summaryFiles.map(item => {
                              if (item !== '') {
                                return (
                                  <li className="filesList">
                                    {item} &nbsp;&nbsp;
                                    <i
                                      className="fa fa-close closeIcon"
                                      onClick={() => {
                                        this.deleteFile(item, 'summary')
                                      }}
                                    />
                                  </li>
                                )
                              }
                            })
                          : null}
                      </ul>
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem>
                      {form.getFieldDecorator('Files1')(
                        <Dragger
                          beforeUpload={this.beforeUpload}
                          showUploadList={false}
                          customRequest={this.dummyRequest}
                          onChange={this.handleSummaryFileChange}
                        >
                          <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                          </p>
                          <p className="ant-upload-text">
                            Click or drag file to this area to upload
                          </p>
                          <p className="ant-upload-hint">
                            Support for a single or bulk upload. Strictly prohibit from uploading
                            company data or other band files
                          </p>
                        </Dragger>,
                      )}
                    </FormItem>
                  </div>
                </Form>
              </div>
            </section>
          </TabPane>
          <TabPane tab="Transcription" key="3">
            <section className="card">
              <div className="card-body">
                &nbsp;
                <div className="form-group">
                  <FormItem label={language ? 'Transcription' : 'Transcription'}>
                    <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                      <Editor
                        editorState={
                          language ? editorStateTranscriptionEn : editorStateTranscriptionRu
                        }
                        onEditorStateChange={this.onEditorChangeStateTranscription}
                      />
                    </div>

                    {/* {form.getFieldDecorator('transcription', {
                      initialValue: editinglecture
                        ? language
                          ? editorStateTranscriptionEn
                          : editorStateTranscriptionRu
                        : '',
                    })(
                      <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                        <Editor
                          editorState={
                            language ? editorStateTranscriptionEn : editorStateTranscriptionRu
                          }
                          onEditorStateChange={this.onEditorChangeStateTranscription}
                        />
                      </div>,
                    )} */}
                  </FormItem>
                </div>
                <div className="form-group">
                  <FormItem label="Attachment">
                    <ul>
                      {transcriptionFiles && transcriptionFiles.length > 0
                        ? transcriptionFiles.map(item => {
                            if (item !== '') {
                              return (
                                <li className="filesList">
                                  {item} &nbsp;&nbsp;
                                  <i
                                    className="fa fa-close closeIcon"
                                    onClick={() => {
                                      this.deleteFile(item, 'transcription')
                                    }}
                                  />
                                </li>
                              )
                            }
                          })
                        : null}
                    </ul>
                  </FormItem>
                </div>
                <div className="form-group">
                  <FormItem>
                    {form.getFieldDecorator('Files2')(
                      <Dragger
                        beforeUpload={this.beforeUpload}
                        showUploadList={false}
                        customRequest={this.dummyRequest}
                        onChange={this.handleTranscriptionFileChange}
                      >
                        <p className="ant-upload-drag-icon">
                          <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                          Support for a single or bulk upload. Strictly prohibit from uploading
                          company data or other band files
                        </p>
                      </Dragger>,
                    )}
                  </FormItem>
                </div>
              </div>
            </section>
          </TabPane>
          <TabPane tab="Audit" key="4">
            <section className="card">
              <div className="card-body">
                <AuditTimeline
                  audit={editinglecture.audit ? editinglecture.audit : lecture.lectureAudit}
                />
              </div>
            </section>
          </TabPane>
        </Tabs>
        <div className={styles.submit}>
          <span className="mr-3">
            <Button type="primary" onClick={this.handleFormBody}>
              Save and Post
            </Button>
          </span>
          <Button type="danger" onClick={this.handleReset}>
            Discard
          </Button>
        </div>
      </React.Fragment>
    )
  }
}

export default AddLecture
