/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/no-array-index-key */
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
import axios from 'axios'

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
  Progress,
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
      transcriptionFilesEn: [],
      transcriptionFilesRu: [],
      summaryFiles: [],
      summaryFilesEn: [],
      summaryFilesRu: [],
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
      percentage: 0,
      transFileInfo: null,
      transArrayEn: [],
      transArrayRu: [],
      summArrayEn: [],
      summArrayRu: [],
      paginationCurrentPage: '',
      fileList: [],
    }
  }

  componentDidMount() {
    const { router, dispatch } = this.props
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

    dispatch({
      type: 'kirtan/RESET_STORE',
    })

    dispatch({
      type: 'video/RESET_STORE',
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
      } else {
        editorStateTranscriptionEn = EditorState.createEmpty()
      }

      if (htmlSummaryEn && htmlSummaryEn.length > 0) {
        const cbEn = htmlToDraft(htmlSummaryEn)
        if (cbEn) {
          const csEn = ContentState.createFromBlockArray(cbEn.contentBlocks)
          editorStateSummaryEn = EditorState.createWithContent(csEn)
        }
      } else {
        editorStateSummaryEn = EditorState.createEmpty()
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
      } else {
        editorStateTranscriptionRu = EditorState.createEmpty()
      }

      if (htmlSummaryRu && htmlSummaryRu.length > 0) {
        const cbRu = htmlToDraft(htmlSummaryRu)
        if (cbRu) {
          const csRu = ContentState.createFromBlockArray(cbRu.contentBlocks)
          editorStateSummaryRu = EditorState.createWithContent(csRu)
        }
      } else {
        editorStateSummaryRu = EditorState.createEmpty()
      }

      const transcriptionFilesEn = lecture.editLecture.en.transcription.attachment_link
      const transcriptionFilesRu = lecture.editLecture.ru.transcription.attachment_link

      const transArrayEn = []
      let tempObjectEn = {}
      const transArrayRu = []
      let tempObjectRu = {}

      for (let i = 0; i < transcriptionFilesEn.length; i += 1) {
        tempObjectEn = {
          fileName: transcriptionFilesEn[i],
          percentage: 'zeroPercent',
        }
        transArrayEn.push(tempObjectEn)
      }
      for (let i = 0; i < transcriptionFilesRu.length; i += 1) {
        tempObjectRu = {
          fileName: transcriptionFilesRu[i],
          percentage: 'zeroPercent',
        }
        transArrayRu.push(tempObjectRu)
      }

      const summaryFilesEn = lecture.editLecture.en.summary.attachment_link
      const summaryFilesRu = lecture.editLecture.ru.summary.attachment_link

      const summArrayEn = []
      let tempObjectEnSumm = {}
      const summArrayRu = []
      let tempObjectRuSumm = {}

      for (let i = 0; i < summaryFilesEn.length; i += 1) {
        tempObjectEnSumm = {
          fileName: summaryFilesEn[i],
          percentage: 'zeroPercent',
        }
        summArrayEn.push(tempObjectEnSumm)
      }
      for (let i = 0; i < summaryFilesRu.length; i += 1) {
        tempObjectRuSumm = {
          fileName: summaryFilesRu[i],
          percentage: 'zeroPercent',
        }
        summArrayRu.push(tempObjectRuSumm)
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
          transcriptionFilesEn,
          transcriptionFilesRu,
          summaryFilesEn,
          summaryFilesRu,
          transcribe: lecture.editLecture.transcribe_required,
          transArrayEn,
          transArrayRu,
          summArrayEn,
          summArrayRu,
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
      transcriptionFilesEn: [],
      transcriptionFilesRu: [],
      summaryFilesEn: [],
      summaryFilesRu: [],
    })
  }

  handleFormBody = param => {
    // e.preventDefault()
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
      transArrayEn,
      transArrayRu,
      summArrayEn,
      summArrayRu,
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

    const transcriptionFilesEn = []
    for (let i = 0; i < transArrayEn.length; i += 1) {
      transcriptionFilesEn.push(transArrayEn[i].fileName)
    }
    const transcriptionFilesRu = []
    for (let i = 0; i < transArrayRu.length; i += 1) {
      transcriptionFilesRu.push(transArrayRu[i].fileName)
    }

    const summaryFilesEn = []
    for (let i = 0; i < summArrayEn.length; i += 1) {
      summaryFilesEn.push(summArrayEn[i].fileName)
    }
    const summaryFilesRu = []
    for (let i = 0; i < summArrayRu.length; i += 1) {
      summaryFilesRu.push(summArrayRu[i].fileName)
    }

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

    if (audioLink === '') {
      notification.error({
        message: 'Error',
        description: 'You must upload an audio.',
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
          attachment_link: summaryFilesEn,
          attachment_name: '',
          text: editorSummaryEn,
        },
        transcription: {
          attachment_name: '',
          attachment_link: transcriptionFilesEn,
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
          attachment_link: summaryFilesRu,
          attachment_name: '',
          text: editorSummaryRu,
        },
        transcription: {
          attachment_name: '',
          attachment_link: transcriptionFilesRu,
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
      if (param === 'submit') {
        this.scrollToTopPage()
      }
    } else {
      dispatch({
        type: 'lecture/CREATE_LECTURE',
        body,
      })
      if (param === 'submit') {
        this.scrollToTopPage()
        this.handleStateReset()
      }
    }
  }

  handleStateReset = () => {
    this.setState({
      date: new Date(),
      // publishDate: new Date(),
      audioLink: '',
      transcriptionFiles: [],
      transcriptionFilesEn: [],
      transcriptionFilesRu: [],
      summaryFiles: [],
      summaryFilesEn: [],
      summaryFilesRu: [],
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
      percentage: 0,
      transFileInfo: null,
      transArrayEn: [],
      transArrayRu: [],
      summArrayEn: [],
      summArrayRu: [],
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

  onEditorStateChange: Function = editorState => {
    this.setState({
      editorState,
    })
  }

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

  dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  handleFileChange = info => {
    if (info.file.status === 'uploading') {
      this.setState(
        {
          fileList: info.fileList,
          audioUploading: true,
          uploading: false,
          percentage: 0,
        },
        () => {
          this.uploads3(info)
        },
      )
    }
  }

  handleSummaryFileChange = info => {
    if (info.file.status === 'uploading') {
      this.setState(
        {
          fileList: info.fileList,
          summaryUploading: true,
          transcriptionUploading: false,
          audioUploading: false,
          uploading: false,
        },
        () => {
          this.uploads3(info)
        },
      )
    }
  }

  handleTranscriptionFileChange = info => {
    if (info.file.status === 'uploading') {
      this.setState(
        {
          fileList: info.fileList,
          transcriptionUploading: true,
          summaryUploading: false,
          audioUploading: false,
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
    const {
      transArrayEn,
      transArrayRu,
      language,
      summArrayEn,
      summArrayRu,
      transcriptionUploading,
      summaryUploading,
      uploading,
    } = this.state

    axios({
      method: 'GET',
      url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
    })
      .then(response => {
        const { data } = response
        const temp = data.presignedUrl.toString()
        const finalUrl = temp.substr(0, temp.lastIndexOf('?'))

        if (language) {
          if (transcriptionUploading && !uploading) {
            for (let i = 0; i < transArrayEn.length; i += 1) {
              if (transArrayEn[i].fileName === finalUrl) {
                notification.warning({
                  message: 'error',
                  description: `You can't upload file with the same name.`,
                })
                this.setState({
                  fileList: [],
                })
                return
              }
            }
          }

          if (summaryUploading && !uploading) {
            for (let i = 0; i < summArrayEn.length; i += 1) {
              if (summArrayEn[i].fileName === finalUrl) {
                notification.warning({
                  message: 'error',
                  description: `You can't upload file with the same name.`,
                })
                this.setState({
                  fileList: [],
                })
                return
              }
            }
          }
        } else {
          if (transcriptionUploading && !uploading) {
            for (let i = 0; i < transArrayRu.length; i += 1) {
              if (transArrayRu[i].fileName === finalUrl) {
                notification.warning({
                  message: 'error',
                  description: `You can't upload file with the same name.`,
                })
                this.setState({
                  fileList: [],
                })
                return
              }
            }
          }

          if (summaryUploading && !uploading) {
            for (let i = 0; i < summArrayRu.length; i += 1) {
              if (summArrayRu[i].fileName === finalUrl) {
                notification.warning({
                  message: 'error',
                  description: `You can't upload file with the same name.`,
                })
                this.setState({
                  fileList: [],
                })
                return
              }
            }
          }
        }

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
        this.setState({ percentage: percentCompleted })
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
    const {
      transcriptionFiles,
      transcriptionFilesEn,
      transcriptionFilesRu,
      language,
      summaryFiles,
      summaryFilesEn,
      summaryFilesRu,
      audioUploading,
      transcriptionUploading,
      summaryUploading,
      transArrayEn,
      transArrayRu,
      summArrayEn,
      summArrayRu,
      percentage,
    } = this.state

    if (audioUploading) {
      this.setState(
        {
          audioLink: finalUrl,
          transcriptionUploading: false,
          summaryUploading: false,
          audioUploading: true,
          percentage: percentCompleted,
          fileList: [],
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
    } else if (transcriptionUploading) {
      const array = [...transcriptionFiles]
      const arrayEn = [...transcriptionFilesEn]
      const arrayRu = [...transcriptionFilesRu]
      const transEnTemp = [...transArrayEn]
      const transRuTemp = [...transArrayRu]

      if (language) {
        arrayEn.push(finalUrl)

        const objIndex = transEnTemp.findIndex(obj => obj.fileName === finalUrl)

        if (objIndex > -1) {
          transEnTemp[objIndex].percentage = percentCompleted
        } else {
          const tempObjectEn = {
            fileName: finalUrl,
            percentage: percentCompleted,
          }
          transEnTemp.push(tempObjectEn)
        }

        const tempFileList = [...fileList]

        const result = tempFileList.every((val, index, arr) => {
          if (val.percent === 100) {
            return true
          }
          return false
        })

        if (result) {
          notification.success({
            message: 'Success',
            description: `${fileList.length} file(s) have been uploaded successfully`,
          })
          this.setState({
            fileList: [],
          })
        }
      } else {
        arrayRu.push(finalUrl)

        const objIndex = transRuTemp.findIndex(obj => obj.fileName === finalUrl)

        if (objIndex > -1) {
          transRuTemp[objIndex].percentage = percentCompleted
        } else {
          const tempObjectRu = {
            fileName: finalUrl,
            percentage: percentCompleted,
          }
          transRuTemp.push(tempObjectRu)
        }

        const tempFileList = [...fileList]

        const result = tempFileList.every((val, index, arr) => {
          if (val.percent === 100) {
            return true
          }
          return false
        })

        if (result) {
          notification.success({
            message: 'Success',
            description: `${fileList.length} file(s) have been uploaded successfully`,
          })
          this.setState({
            fileList: [],
          })
        }
      }
      array.push(finalUrl)

      this.setState({
        transcriptionFiles: array,
        transcriptionFilesEn: arrayEn,
        transcriptionFilesRu: arrayRu,
        transcriptionUploading: true,
        summaryUploading: false,
        audioUploading: false,
        transArrayEn: transEnTemp,
        transArrayRu: transRuTemp,
      })
    } else if (summaryUploading) {
      const newArray = [...summaryFiles]
      const newArrayEn = [...summaryFilesEn]
      const newArrayRu = [...summaryFilesRu]
      const summEnTemp = [...summArrayEn]
      const summRuTemp = [...summArrayRu]

      if (language) {
        newArrayEn.push(finalUrl)

        const objIndex = summEnTemp.findIndex(obj => obj.fileName === finalUrl)

        if (objIndex > -1) {
          summEnTemp[objIndex].percentage = percentCompleted
        } else {
          const tempObjectEnSumm = {
            fileName: finalUrl,
            percentage: percentCompleted,
          }
          summEnTemp.push(tempObjectEnSumm)
        }

        const tempFileList = [...fileList]

        const result = tempFileList.every((val, index, arr) => {
          if (val.percent === 100) {
            return true
          }
          return false
        })

        if (result) {
          notification.success({
            message: 'Success',
            description: `${fileList.length} file(s) have been uploaded successfully`,
          })
          this.setState({
            fileList: [],
          })
        }
      } else {
        newArrayRu.push(finalUrl)

        const objIndex = summRuTemp.findIndex(obj => obj.fileName === finalUrl)

        if (objIndex > -1) {
          summRuTemp[objIndex].percentage = percentCompleted
        } else {
          const tempObjectRuSumm = {
            fileName: finalUrl,
            percentage: percentCompleted,
          }
          summRuTemp.push(tempObjectRuSumm)
        }

        const tempFileList = [...fileList]

        const result = tempFileList.every((val, index, arr) => {
          if (val.percent === 100) {
            return true
          }
          return false
        })

        if (result) {
          notification.success({
            message: 'Success',
            description: `${fileList.length} file(s) have been uploaded successfully`,
          })
          this.setState({
            fileList: [],
          })
        }
      }
      newArray.push(finalUrl)

      this.setState({
        summaryFiles: newArray,
        summaryFilesEn: newArrayEn,
        summaryFilesRu: newArrayRu,
        transcriptionUploading: false,
        summaryUploading: true,
        audioUploading: false,
        summArrayEn: summEnTemp,
        summArrayRu: summRuTemp,
      })
    }
  }

  deleteFile = (item, type) => {
    document.getElementById(item).style.pointerEvents = 'none'
    document.getElementById(item).style.opacity = '0.4'

    const fileName = item.substr(item.lastIndexOf('.com/') + 5)

    const tempFileName = fileName.split('/').pop(-1)

    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        notification.success({
          message: 'File Deleted',
          description: `${tempFileName} has been successfully deleted`,
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
    const {
      transcriptionFiles,
      summaryFiles,
      summaryFilesEn,
      summaryFilesRu,
      transcriptionFilesEn,
      transcriptionFilesRu,
      language,
      transArrayEn,
      transArrayRu,
      summArrayEn,
      summArrayRu,
    } = this.state
    if (type === 'audio') {
      this.setState({ audioLink: '' })
    }
    if (type === 'transcription') {
      if (language) {
        for (let i = 0; i < transcriptionFilesEn.length; i += 1) {
          if (transcriptionFilesEn[i] === item) {
            transcriptionFilesEn.splice(i, 1)
            break
          }
        }
        for (let i = 0; i < transArrayEn.length; i += 1) {
          if (transArrayEn[i].fileName === item) {
            transArrayEn.splice(i, 1)
            break
          }
        }
        this.setState({
          transcriptionFilesEn,
          transArrayEn,
        })
      } else {
        for (let i = 0; i < transcriptionFilesRu.length; i += 1) {
          if (transcriptionFilesRu[i] === item) {
            transcriptionFilesRu.splice(i, 1)
            break
          }
        }

        for (let i = 0; i < transArrayRu.length; i += 1) {
          if (transArrayRu[i].fileName === item) {
            transArrayRu.splice(i, 1)
            break
          }
        }
        this.setState({
          transcriptionFilesRu,
          transArrayRu,
        })
      }
    }
    if (type === 'summary') {
      if (language) {
        for (let i = 0; i < summaryFilesEn.length; i += 1) {
          if (summaryFilesEn[i] === item) {
            summaryFilesEn.splice(i, 1)
            break
          }
        }
        for (let i = 0; i < summArrayEn.length; i += 1) {
          if (summArrayEn[i].fileName === item) {
            summArrayEn.splice(i, 1)
            break
          }
        }
        this.setState({
          summaryFilesEn,
          summArrayEn,
        })
      } else {
        for (let i = 0; i < summaryFilesRu.length; i += 1) {
          if (summaryFilesRu[i] === item) {
            summaryFilesRu.splice(i, 1)
            break
          }
        }
        for (let i = 0; i < summArrayRu.length; i += 1) {
          if (summArrayRu[i].fileName === item) {
            summArrayRu.splice(i, 1)
            break
          }
        }
        this.setState({
          summaryFilesRu,
          summArrayRu,
        })
      }
    }
  }

  beforeUploadAudio = file => {
    // this.setState({ percentage: 0 })
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
      transcriptionFilesEn: [],
      transcriptionFilesRu: [],
      summaryFiles: [],
      summaryFilesEn: [],
      summaryFilesRu: [],
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
      transcriptionFilesEn,
      transcriptionFilesRu,
      summaryFiles,
      summaryFilesEn,
      summaryFilesRu,
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
      transcriptionUploading,
      percentage,
      transArrayEn,
      transArrayRu,
      summArrayEn,
      summArrayRu,
      paginationCurrentPage,
    } = this.state
    const dateFormat = 'YYYY/MM/DD'

    let customStyleTrans = {}
    let customStyleSumm = {}

    if (transArrayEn.length > 5 || transArrayRu.length > 5) {
      customStyleTrans = { overflowY: 'auto', height: '250px' }
    }
    if (summArrayEn.length > 5 || summArrayRu.length > 5) {
      customStyleSumm = { overflowY: 'auto', height: '250px' }
    }

    const linkState = {
      paginationCurrentPage,
    }

    return (
      <React.Fragment>
        <BackNavigation link="/lecture/list" title="Lecture List" linkState={linkState} />
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            paddingTop: '20px',
            margin: '20px 0px',
          }}
        >
          <Switch
            disabled={switchDisabled}
            defaultChecked
            checkedChildren={language ? 'en' : 'ru'}
            unCheckedChildren={language ? 'en' : 'ru'}
            onChange={this.handleLanguage}
            className="toggle"
            style={{ width: '100px', float: 'right', margin: '0px 10px 10px 0px' }}
          />
          {editinglecture && editinglecture.en && editinglecture.ru ? (
            <div style={{ paddingTop: '0px', paddingLeft: '15px', fontSize: '1.2rem' }}>
              <div>
                <strong>Title :</strong>
                &nbsp;&nbsp;
                <span>{language ? editinglecture.en.title : editinglecture.ru.title}</span>
              </div>
            </div>
          ) : (
            <br />
          )}
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
                              <div className="invalidFeedback">
                                {formElements.title.errorMessage}
                              </div>
                            ) : null}
                          </FormItem>
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
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
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
                          <FormItem label="Date">
                            {form.getFieldDecorator('date', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Date is required',
                                },
                              ],
                              initialValue: editinglecture
                                ? moment(new Date(editinglecture.created_date), dateFormat)
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
                              initialValue: editinglecture
                                ? editinglecture.translation_required
                                : '',
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
                          <FormItem label={language ? 'Location' : 'Location'}>
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
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label={language ? 'Event' : 'Event'}>
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
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label={language ? 'Topic' : 'Topic'}>
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Topic"
                              optionFilterProp="children"
                              value={language ? topicEn : topicRu}
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
                            </Select>
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
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Artist"
                              // onChange={this.handleSelectTranslation}
                              optionFilterProp="children"
                              value={language ? translationEn : translationRu}
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
                            </Select>
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem>
                            <Checkbox checked={transcribe} onChange={this.handleTranscribe}>
                              &nbsp; Need Transcribe ?
                            </Checkbox>
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label={language ? 'Body' : 'Body'}>
                            {form.getFieldDecorator('content', {
                              initialValue: editorState || '',
                            })(
                              <div className={styles.editor}>
                                <Editor
                                  wrapperClassName="demo-wrapper"
                                  editorClassName="demo-editor"
                                  editorState={editorState}
                                  onEditorStateChange={this.onEditorStateChange}
                                />
                                ,
                              </div>,
                            )}
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
                                          this.deleteFile(audioLink, 'audio')
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
                            wrapperClassName="demo-wrapper"
                            editorClassName="demo-editor"
                            editorState={language ? editorStateSummaryEn : editorStateSummaryRu}
                            onEditorStateChange={this.onEditorChangeStateSummary}
                          />
                        </div>
                      </FormItem>
                    </div>
                    <div className="form-group" style={customStyleSumm}>
                      <FormItem label="Attachment">
                        <ul>
                          {language
                            ? summArrayEn.length > 0 &&
                              summArrayEn.map((item, index) => {
                                return (
                                  <li className="filesList" key={index}>
                                    <div className="fileDisplay">
                                      <div className="uploadedFileName">
                                        {item.fileName
                                          .split('/')
                                          .pop(-1)
                                          .substring(0, 30)}
                                      </div>
                                      <div
                                        className="deleteIcon"
                                        key={item.fileName}
                                        id={item.fileName}
                                      >
                                        <i
                                          className="fa fa-trash closeIcon"
                                          onClick={() => {
                                            this.deleteFile(item.fileName, 'summary')
                                          }}
                                        />
                                      </div>
                                      <div className="progressBar">
                                        {item.percentage !== 'zeroPercent' ? (
                                          <Progress percent={item.percentage} />
                                        ) : null}
                                      </div>
                                    </div>
                                  </li>
                                )
                              })
                            : summArrayRu.length > 0 &&
                              summArrayRu.map((item, index) => {
                                return (
                                  <li className="filesList" key={index}>
                                    <div className="fileDisplay">
                                      <div className="uploadedFileName">
                                        {item.fileName
                                          .split('/')
                                          .pop(-1)
                                          .substring(0, 30)}
                                      </div>
                                      <div
                                        className="deleteIcon"
                                        key={item.fileName}
                                        id={item.fileName}
                                      >
                                        <i
                                          className="fa fa-trash closeIcon"
                                          onClick={() => {
                                            this.deleteFile(item.fileName, 'summary')
                                          }}
                                        />
                                      </div>
                                      <div className="progressBar">
                                        {item.percentage !== 'zeroPercent' ? (
                                          <Progress percent={item.percentage} />
                                        ) : null}
                                      </div>
                                    </div>
                                  </li>
                                )
                              })}
                        </ul>
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem>
                        {form.getFieldDecorator('Files1')(
                          <Dragger
                            beforeUpload={this.beforeUpload}
                            showUploadList={false}
                            multiple
                            fileList={this.state.fileList}
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
                          wrapperClassName="demo-wrapper"
                          editorClassName="demo-editor"
                          editorState={
                            language ? editorStateTranscriptionEn : editorStateTranscriptionRu
                          }
                          onEditorStateChange={this.onEditorChangeStateTranscription}
                        />
                      </div>
                    </FormItem>
                  </div>
                  <div className="form-group" style={customStyleTrans}>
                    <FormItem label="Attachment">
                      <ul>
                        {language
                          ? transArrayEn.length > 0 &&
                            transArrayEn.map((item, index) => {
                              return (
                                <li className="filesList" key={index}>
                                  <div className="fileDisplay">
                                    <div className="uploadedFileName">
                                      {item.fileName
                                        .split('/')
                                        .pop(-1)
                                        .substring(0, 30)}
                                    </div>
                                    <div
                                      className="deleteIcon"
                                      key={item.fileName}
                                      id={item.fileName}
                                    >
                                      <i
                                        className="fa fa-trash closeIcon"
                                        onClick={() => {
                                          this.deleteFile(item.fileName, 'transcription')
                                        }}
                                      />
                                    </div>
                                    <div className="progressBar">
                                      {item.percentage !== 'zeroPercent' ? (
                                        <Progress percent={item.percentage} />
                                      ) : null}
                                    </div>
                                  </div>
                                </li>
                              )
                            })
                          : transArrayRu.length > 0 &&
                            transArrayRu.map((item, index) => {
                              return (
                                <li className="filesList" key={index}>
                                  <div className="fileDisplay">
                                    <div className="uploadedFileName">
                                      {item.fileName
                                        .split('/')
                                        .pop(-1)
                                        .substring(0, 30)}
                                    </div>
                                    <div
                                      className="deleteIcon"
                                      key={item.fileName}
                                      id={item.fileName}
                                    >
                                      <i
                                        className="fa fa-trash closeIcon"
                                        onClick={() => {
                                          this.deleteFile(item.fileName, 'transcription')
                                        }}
                                      />
                                    </div>
                                    <div className="progressBar">
                                      {item.percentage !== 'zeroPercent' ? (
                                        <Progress percent={item.percentage} />
                                      ) : null}
                                    </div>
                                  </div>
                                </li>
                              )
                            })}
                      </ul>
                    </FormItem>
                  </div>
                  {/* <Progress percent={percentage} /> */}
                  <div className="form-group">
                    <FormItem>
                      {/* {form.getFieldDecorator('Files2')( */}
                      <Dragger
                        fileList={this.state.fileList}
                        beforeUpload={this.beforeUpload}
                        showUploadList={false}
                        customRequest={this.dummyRequest}
                        multiple
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
                      </Dragger>
                    </FormItem>
                  </div>
                </div>
              </section>
            </TabPane>
            <TabPane tab="Audit" key="4">
              <section className="card">
                <div className="card-body">
                  {/* <AuditTimeline
                    audit={editinglecture.audit ? editinglecture.audit : lecture.lectureAudit}
                  /> */}
                  <AuditTimeline audit={editinglecture.audit && editinglecture.audit} />
                </div>
              </section>
            </TabPane>
          </Tabs>
        </div>
        <div className={styles.submit}>
          <span className="mr-3">
            <Button
              type="primary"
              // onClick={this.handleFormBody}
              onClick={() => this.handleFormBody('submit')}
            >
              Save and Post
            </Button>
          </span>
          <Button type="danger" onClick={this.handleStateReset}>
            Discard
          </Button>
        </div>
      </React.Fragment>
    )
  }
}

export default AddLecture
